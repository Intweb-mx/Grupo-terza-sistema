import { createServerSupabaseClient } from '@/lib/supabase/server'

// saldo_pendiente, proxima_fecha_corte y estado_pago quedan en null hasta
// que exista la tabla amortizaciones (fase 5). Se completan ahí.
export async function listarClientes() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nombre, apellidos')
    .order('created_at', { ascending: false })
  if (error) throw error

  return data.map((cliente) => ({
    ...cliente,
    lote_id: null,
    propiedad_id: null,
    saldo_pendiente: null,
    proxima_fecha_corte: null,
    estado_pago: null,
  }))
}

export async function obtenerCliente(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error

  const { data: contratos, error: errorContratos } = await supabase
    .from('contratos')
    .select('id, tipo, propiedad_id, fecha_inicio, fecha_fin, monto_total, estado')
    .eq('cliente_id', id)
    .order('created_at', { ascending: false })
  if (errorContratos) throw errorContratos

  return { ...cliente, contratos }
}

// El calendario vive por contrato, no por cliente — se toma el contrato de
// compraventa más reciente del cliente (normalmente hay uno solo).
async function contratoConAmortizacion(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  clienteId: string
) {
  const { data, error } = await supabase
    .from('contratos')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('tipo', 'compraventa')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function obtenerAmortizacion(clienteId: string) {
  const supabase = await createServerSupabaseClient()
  const contrato = await contratoConAmortizacion(supabase, clienteId)
  if (!contrato) return []

  const { data, error } = await supabase
    .from('amortizaciones')
    .select('numero_pago, fecha_corte, capital, interes, penalizacion, total, estado, fecha_pago_real')
    .eq('contrato_id', contrato.id)
    .order('numero_pago', { ascending: true })
  if (error) throw error
  return data
}

export async function obtenerSaldo(clienteId: string) {
  const supabase = await createServerSupabaseClient()
  const contrato = await contratoConAmortizacion(supabase, clienteId)
  if (!contrato) {
    return { saldo_pendiente: 0, dias_atraso: 0, penalizacion_aplicada: 0, proxima_fecha_corte: null }
  }

  // 'reestructurado' queda fuera: son cuotas viejas ya reemplazadas por un
  // calendario nuevo tras una reestructura — contarlas duplicaría el saldo.
  const { data: cuotas, error } = await supabase
    .from('amortizaciones')
    .select('fecha_corte, total, estado, penalizacion')
    .eq('contrato_id', contrato.id)
    .in('estado', ['pendiente', 'vencido'])
    .order('fecha_corte', { ascending: true })
  if (error) throw error

  const saldoPendiente = cuotas.reduce((suma, cuota) => suma + cuota.total, 0)
  const penalizacionAplicada = cuotas.reduce((suma, cuota) => suma + cuota.penalizacion, 0)
  const proximaCuota = cuotas[0] ?? null

  let diasAtraso = 0
  if (proximaCuota) {
    const hoy = new Date(new Date().toISOString().slice(0, 10))
    const corte = new Date(proximaCuota.fecha_corte)
    diasAtraso = Math.max(0, Math.round((hoy.getTime() - corte.getTime()) / 86_400_000))
  }

  return {
    saldo_pendiente: saldoPendiente,
    dias_atraso: diasAtraso,
    penalizacion_aplicada: penalizacionAplicada,
    proxima_fecha_corte: proximaCuota?.fecha_corte ?? null,
  }
}

export type CrearClienteInput = {
  nombre: string
  apellidos: string
  email?: string
  telefono?: string
  rfc?: string
  direccion?: string
  ciudad?: string
}

export async function crearCliente(input: CrearClienteInput) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('clientes')
    .insert(input)
    .select('id, created_at')
    .single()
  if (error) throw error
  return data
}
