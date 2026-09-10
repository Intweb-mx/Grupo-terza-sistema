import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generarCalendario } from '@/lib/server/amortizacion'

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

  // Solo compraventa genera calendario de amortización: es un esquema de
  // financiamiento (capital + interés). Arrendamiento/renta_temporal son
  // rentas periódicas, sin esa estructura.
  if (input.tipo === 'compraventa' && input.plazo_meses) {
    const calendario = generarCalendario({
      monto_total: input.monto_total,
      enganche: input.enganche ?? 0,
      plazo_meses: input.plazo_meses,
      fecha_inicio: input.fecha_inicio,
    })

    const { error: errorAmortizacion } = await supabase.from('amortizaciones').insert(
      calendario.map((fila) => ({ ...fila, contrato_id: data.id }))
    )
    if (errorAmortizacion) throw errorAmortizacion
  }

  return data
}
