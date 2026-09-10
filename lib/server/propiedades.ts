import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function listarPropiedades() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('propiedades')
    .select('id, titulo, precio, superficie_m2, tipo, ciudad, estado_disponibilidad, imagen_url')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function obtenerPropiedad(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('propiedades')
    .select('id, titulo, precio, superficie_m2, tipo, ciudad, estado_disponibilidad, imagen_url, descripcion, galeria, lote_id')
    .eq('id', id)
    .single()
  if (error) throw error

  // contratos_activos queda en 0 hasta fase 4 (tabla contratos todavía no existe)
  return { ...data, contratos_activos: 0 }
}

export type CrearPropiedadInput = {
  titulo: string
  precio: number
  superficie_m2?: number
  tipo: string
  direccion?: string
  ciudad: string
  descripcion?: string
}

export async function crearPropiedad(input: CrearPropiedadInput) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('propiedades')
    .insert(input)
    .select('id, created_at')
    .single()
  if (error) throw error
  return data
}

export async function actualizarPropiedad(id: string, cambios: Record<string, unknown>) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('propiedades')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('updated_at')
    .single()
  if (error) throw error
  return data
}
