import { createServerSupabaseClient } from '@/lib/supabase/server'

// Regla de negocio #4: la utilidad se calcula sobre contabilidad separada
// por proyecto. Los gastos fijos del negocio (movimientos tipo 'egreso' sin
// proyecto asignado — renta de oficina, nómina administrativa, etc.) se
// reparten entre proyectos activos en proporción a lo que cada uno factura,
// no en partes iguales ni sobre ingresos totales del negocio.
export async function obtenerEstadoProyecto(proyectoId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: movimientosProyecto, error } = await supabase
    .from('movimientos_contables')
    .select('tipo, monto')
    .eq('proyecto_id', proyectoId)
  if (error) throw error

  const ingresos = movimientosProyecto
    .filter((m) => m.tipo === 'ingreso')
    .reduce((suma, m) => suma + m.monto, 0)
  const gastosVariables = movimientosProyecto
    .filter((m) => m.tipo === 'egreso')
    .reduce((suma, m) => suma + m.monto, 0)

  const { data: gastosFijosNegocio, error: errorFijos } = await supabase
    .from('movimientos_contables')
    .select('monto')
    .eq('tipo', 'egreso')
    .is('proyecto_id', null)
  if (errorFijos) throw errorFijos
  const totalGastosFijos = gastosFijosNegocio.reduce((suma, m) => suma + m.monto, 0)

  const { data: ingresosNegocio, error: errorIngresos } = await supabase
    .from('movimientos_contables')
    .select('monto')
    .eq('tipo', 'ingreso')
    .not('proyecto_id', 'is', null)
  if (errorIngresos) throw errorIngresos
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
