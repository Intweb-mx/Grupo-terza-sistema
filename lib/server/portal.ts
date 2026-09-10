import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export class NoAutorizadoError extends Error {}

// Resuelve "quién soy" dentro del portal: solo funciona si la sesión actual
// tiene una fila en clientes con user_id = auth.uid() (policy "Cliente ve
// su propio registro"). Un usuario interno (personal) que entre por error
// a estas rutas no tiene fila en clientes con su user_id, así que esto
// lanza NoAutorizadoError igual que un desconocido.
async function obtenerClienteAutenticado() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new NoAutorizadoError('No autenticado')

  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (error || !cliente) throw new NoAutorizadoError('No es una cuenta de portal de cliente')

  return cliente.id
}

// A partir de acá se usa el cliente admin: ya se comprobó arriba, con RLS
// normal, que la sesión es dueña de este cliente_id específico — no hace
// falta duplicar esa lógica de "es mío" en policies de amortizaciones/pagos
// aparte de las que ya existen para personal interno.
export async function obtenerSaldoPortal() {
  const clienteId = await obtenerClienteAutenticado()
  const admin = createAdminClient()

  const { data: contrato } = await admin
    .from('contratos')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('tipo', 'compraventa')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!contrato) {
    return { saldo_pendiente: 0, dias_atraso: 0, proxima_fecha: null }
  }

  const { data: cuotas, error } = await admin
    .from('amortizaciones')
    .select('fecha_corte, total')
    .eq('contrato_id', contrato.id)
    .in('estado', ['pendiente', 'vencido'])
    .order('fecha_corte', { ascending: true })
  if (error) throw error

  const saldoPendiente = cuotas.reduce((suma, c) => suma + c.total, 0)
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
    proxima_fecha: proximaCuota?.fecha_corte ?? null,
  }
}

export async function obtenerAmortizacionPortal() {
  const clienteId = await obtenerClienteAutenticado()
  const admin = createAdminClient()

  const { data: contrato } = await admin
    .from('contratos')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('tipo', 'compraventa')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!contrato) return []

  const { data, error } = await admin
    .from('amortizaciones')
    .select('numero_pago, fecha_corte, capital, interes, penalizacion, total, estado, fecha_pago_real')
    .eq('contrato_id', contrato.id)
    .order('numero_pago', { ascending: true })
  if (error) throw error
  return data
}

export async function obtenerPagosPortal() {
  const clienteId = await obtenerClienteAutenticado()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('pagos')
    .select('id, monto, fecha, referencia, metodo_pago')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
  if (error) throw error
  return data
}
