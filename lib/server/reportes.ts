import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUsuarioActual } from '@/lib/server/auth'

export class NoAutorizadoError extends Error {}

const ROLES_PANEL_EJECUTIVO = ['dueno', 'administrador', 'contador'] as const

// El panel ejecutivo (KPIs, cartera vencida, flujo) es información de
// negocio completa, no del embudo propio de un asesor — se restringe a
// roles de dirección/contabilidad aunque la RLS de las tablas de abajo
// sea más permisiva.
async function exigirRolEjecutivo() {
  const usuario = await getUsuarioActual()
  if (!usuario || !ROLES_PANEL_EJECUTIVO.includes(usuario.rol as (typeof ROLES_PANEL_EJECUTIVO)[number])) {
    throw new NoAutorizadoError('Reportes ejecutivos: solo dueño, administrador o contador')
  }
}

export async function obtenerKpis() {
  await exigirRolEjecutivo()
  const supabase = await createServerSupabaseClient()

  const inicioMes = new Date()
  inicioMes.setUTCDate(1)
  const inicioMesIso = inicioMes.toISOString().slice(0, 10)
  const hoy = new Date().toISOString().slice(0, 10)

  // Cuatro queries independientes — antes corrían una tras otra (4
  // round-trips), acá van en paralelo (1 round-trip de latencia).
  const [
    { count: propiedadesDisponibles },
    { count: propiedadesVendidas },
    { data: ingresosMes },
    { data: vencidas },
  ] = await Promise.all([
    supabase
      .from('propiedades')
      .select('*', { count: 'exact', head: true })
      .eq('estado_disponibilidad', 'disponible'),
    supabase
      .from('propiedades')
      .select('*', { count: 'exact', head: true })
      .eq('estado_disponibilidad', 'vendido'),
    supabase.from('movimientos_contables').select('monto').eq('tipo', 'ingreso').gte('fecha', inicioMesIso),
    supabase
      .from('amortizaciones')
      .select('total, contrato_id')
      .in('estado', ['pendiente', 'vencido'])
      .lt('fecha_corte', hoy),
  ])

  const ingresosMesActual = (ingresosMes ?? []).reduce((suma, m) => suma + m.monto, 0)
  const montoCarteraVencida = (vencidas ?? []).reduce((suma, a) => suma + a.total, 0)
  const clientesEnMora = new Set((vencidas ?? []).map((a) => a.contrato_id)).size

  return {
    propiedades_disponibles: propiedadesDisponibles ?? 0,
    propiedades_vendidas: propiedadesVendidas ?? 0,
    ingresos_mes_actual: ingresosMesActual,
    clientes_en_mora: clientesEnMora,
    monto_cartera_vencida: montoCarteraVencida,
  }
}

export async function obtenerCarteraVencida() {
  await exigirRolEjecutivo()
  const supabase = await createServerSupabaseClient()

  const hoy = new Date().toISOString().slice(0, 10)
  const { data: cuotas, error } = await supabase
    .from('amortizaciones')
    .select('fecha_corte, total, penalizacion, contratos!inner(cliente_id, clientes!inner(id, nombre, apellidos))')
    .in('estado', ['pendiente', 'vencido'])
    .lt('fecha_corte', hoy)
  if (error) throw error

  type Fila = {
    fecha_corte: string
    total: number
    penalizacion: number
    contratos: { cliente_id: string; clientes: { id: string; nombre: string; apellidos: string } }
  }

  const porCliente = new Map<
    string,
    { nombre: string; monto_vencido: number; penalizacion_aplicada: number; fechaMasVieja: string }
  >()

  for (const fila of cuotas as unknown as Fila[]) {
    const cliente = fila.contratos.clientes
    const existente = porCliente.get(cliente.id)
    if (existente) {
      existente.monto_vencido += fila.total
      existente.penalizacion_aplicada += fila.penalizacion
      if (fila.fecha_corte < existente.fechaMasVieja) existente.fechaMasVieja = fila.fecha_corte
    } else {
      porCliente.set(cliente.id, {
        nombre: `${cliente.nombre} ${cliente.apellidos}`,
        monto_vencido: fila.total,
        penalizacion_aplicada: fila.penalizacion,
        fechaMasVieja: fila.fecha_corte,
      })
    }
  }

  const hoyDate = new Date(`${hoy}T00:00:00Z`)
  return Array.from(porCliente.entries())
    .map(([cliente_id, datos]) => ({
      cliente_id,
      nombre: datos.nombre,
      dias_atraso: Math.round(
        (hoyDate.getTime() - new Date(`${datos.fechaMasVieja}T00:00:00Z`).getTime()) / 86_400_000
      ),
      monto_vencido: datos.monto_vencido,
      penalizacion_aplicada: datos.penalizacion_aplicada,
    }))
    .sort((a, b) => b.dias_atraso - a.dias_atraso)
}

// Proyección mensual de flujo, próximos 12 meses. egresos_esperados queda en
// 0: no existe todavía una tabla de presupuesto/gastos futuros, solo el
// histórico de movimientos_contables ya ocurridos — no hay de dónde
// proyectar egresos futuros sin inventar el dato.
export async function obtenerFlujoProyectado() {
  await exigirRolEjecutivo()
  const supabase = await createServerSupabaseClient()

  const hoy = new Date().toISOString().slice(0, 10)
  const { data: cuotas, error } = await supabase
    .from('amortizaciones')
    .select('fecha_corte, total')
    .in('estado', ['pendiente', 'vencido'])
    .gte('fecha_corte', hoy)
  if (error) throw error

  const porMes = new Map<string, number>()
  for (const cuota of cuotas) {
    const mes = cuota.fecha_corte.slice(0, 7) // YYYY-MM
    porMes.set(mes, (porMes.get(mes) ?? 0) + cuota.total)
  }

  return Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 12)
    .map(([mes, ingresos_esperados]) => ({
      mes,
      ingresos_esperados,
      egresos_esperados: 0,
      saldo_proyectado: ingresos_esperados,
    }))
}
