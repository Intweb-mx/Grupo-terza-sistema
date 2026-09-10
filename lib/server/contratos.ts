import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function listarContratos() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('contratos')
    .select('id, tipo, cliente_id, propiedad_id, fecha_inicio, fecha_fin, estado, monto_total')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export type CrearContratoInput = {
  tipo: 'compraventa' | 'arrendamiento' | 'renta_temporal'
  cliente_id: string
  propiedad_id: string
  fecha_inicio: string
  monto_total: number
  plazo_meses?: number
  enganche?: number
  notas?: string
}

export async function crearContrato(input: CrearContratoInput) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('contratos')
    .insert(input)
    .select('id, created_at')
    .single()
  if (error) throw error
  return data
}
