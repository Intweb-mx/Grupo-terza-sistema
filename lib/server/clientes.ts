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
