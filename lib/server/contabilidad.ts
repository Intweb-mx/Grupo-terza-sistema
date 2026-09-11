import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function listarProyectos() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('proyectos')
    .select('id, nombre, descripcion, activo')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

// Regla de negocio #4: la utilidad se calcula sobre contabilidad separada
// por proyecto. Los gastos fijos del negocio (movimientos tipo 'egreso' sin
// proyecto asignado — renta de oficina, nómina administrativa, etc.) se
// reparten entre proyectos activos en proporción a lo que cada uno factura,
// no en partes iguales ni sobre ingresos totales del negocio.
export async function obtenerEstadoProyecto(proyectoId: string) {
  const supabase = await createServerSupabaseClient()

  // Las tres queries son independientes entre sí — corrían en secuencia
  // (3 round-trips) sin necesidad; en paralelo es 1 round-trip de latencia.
  const [
    { data: movimientosProyecto, error },
    { data: gastosFijosNegocio, error: errorFijos },
    { data: ingresosNegocio, error: errorIngresos },
  ] = await Promise.all([
    supabase.from('movimientos_contables').select('tipo, monto').eq('proyecto_id', proyectoId),
    supabase.from('movimientos_contables').select('monto').eq('tipo', 'egreso').is('proyecto_id', null),
    supabase
      .from('movimientos_contables')
      .select('monto')
      .eq('tipo', 'ingreso')
      .not('proyecto_id', 'is', null),
  ])
  if (error) throw error
  if (errorFijos) throw errorFijos
  if (errorIngresos) throw errorIngresos

  const ingresos = movimientosProyecto
    .filter((m) => m.tipo === 'ingreso')
    .reduce((suma, m) => suma + m.monto, 0)
  const gastosVariables = movimientosProyecto
    .filter((m) => m.tipo === 'egreso')
    .reduce((suma, m) => suma + m.monto, 0)
  const totalGastosFijos = gastosFijosNegocio.reduce((suma, m) => suma + m.monto, 0)
  const totalIngresosNegocio = ingresosNegocio.reduce((suma, m) => suma + m.monto, 0)

  const proporcion = totalIngresosNegocio > 0 ? ingresos / totalIngresosNegocio : 0
  const gastosFijos = Math.round(totalGastosFijos * proporcion)

  const utilidadBruta = ingresos - gastosVariables
  const utilidadNeta = utilidadBruta - gastosFijos

  return {
    ingresos,
    gastos_fijos: gastosFijos,
    gastos_variables: gastosVariables,
    utilidad_bruta: utilidadBruta,
    utilidad_neta: utilidadNeta,
  }
}

// Reparto de utilidades por socio, sobre la utilidad_neta de ESE proyecto
// (regla de negocio #4 — no sobre ingresos totales del negocio). Cada socio
// recibe su porcentaje_participacion de esa utilidad.
export async function obtenerRepartoUtilidades(proyectoId: string) {
  const supabase = await createServerSupabaseClient()

  // obtenerEstadoProyecto no depende de socios ni viceversa.
  const [estado, { data: socios, error }] = await Promise.all([
    obtenerEstadoProyecto(proyectoId),
    supabase.from('socios').select('id, nombre, porcentaje_participacion'),
  ])
  if (error) throw error

  const reparto = socios.map((socio) => ({
    socio_id: socio.id,
    nombre: socio.nombre,
    porcentaje_participacion: socio.porcentaje_participacion,
    monto_correspondiente: Math.round((estado.utilidad_neta * socio.porcentaje_participacion) / 100),
  }))

  return { utilidad_neta: estado.utilidad_neta, reparto }
}

export type RegistrarMovimientoInput = {
  proyecto_id?: string | null
  tipo: 'ingreso' | 'egreso'
  categoria: string
  descripcion?: string
  monto: number // centavos
  fecha: string // YYYY-MM-DD
  referencia?: string
}

export async function registrarMovimiento(input: RegistrarMovimientoInput) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('movimientos_contables')
    .insert(input)
    .select('id, created_at')
    .single()
  if (error) throw error
  return data
}
