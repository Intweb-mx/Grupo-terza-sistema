import { createServerSupabaseClient } from '@/lib/supabase/server'

export type FiltrosProspectos = {
  asesor_id?: string
  etapa?: string
  fuente?: string
}

export async function listarProspectos(filtros: FiltrosProspectos = {}) {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('prospectos')
    .select('id, nombre, telefono, etapa, asesor_id, interes')
    .order('created_at', { ascending: false })

  if (filtros.asesor_id) query = query.eq('asesor_id', filtros.asesor_id)
  if (filtros.etapa) query = query.eq('etapa', filtros.etapa)
  if (filtros.fuente) query = query.eq('fuente', filtros.fuente)

  const { data: prospectos, error } = await query
  if (error) throw error
  if (prospectos.length === 0) return []

  const { data: interacciones, error: errorInteracciones } = await supabase
    .from('interacciones')
    .select('prospecto_id, created_at')
    .in(
      'prospecto_id',
      prospectos.map((p) => p.id)
    )
    .order('created_at', { ascending: false })
  if (errorInteracciones) throw errorInteracciones

  const ultimaPorProspecto = new Map<string, string>()
  for (const interaccion of interacciones) {
    if (!ultimaPorProspecto.has(interaccion.prospecto_id) && interaccion.created_at) {
      ultimaPorProspecto.set(interaccion.prospecto_id, interaccion.created_at)
    }
  }

  return prospectos.map((p) => ({
    ...p,
    ultima_interaccion: ultimaPorProspecto.get(p.id) ?? null,
  }))
}

export type CrearProspectoInput = {
  nombre: string
  telefono?: string
  email?: string
  interes?: string
  asesor_id?: string
  fuente?: 'referido' | 'facebook' | 'instagram' | 'tiktok' | 'portal' | 'directo' | 'otro'
}

// Un asesor solo puede crear prospectos asignados a sí mismo — si manda
// otro asesor_id (o ninguno), se ignora y se fuerza al suyo. Dueño/admin sí
// pueden asignar el lead a cualquier asesor.
export async function crearProspecto(input: CrearProspectoInput) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: solicitante } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  const puedeAsignar = solicitante?.rol === 'dueno' || solicitante?.rol === 'administrador'

  const { data, error } = await supabase
    .from('prospectos')
    .insert({
      ...input,
      asesor_id: puedeAsignar && input.asesor_id ? input.asesor_id : user.id,
    })
    .select('id, created_at')
    .single()
  if (error) throw error
  return data
}

export type AgregarInteraccionInput = {
  tipo: 'llamada' | 'visita' | 'whatsapp' | 'email' | 'reunion'
  notas?: string
}

export async function agregarInteraccion(prospectoId: string, input: AgregarInteraccionInput) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('interacciones')
    .insert({
      prospecto_id: prospectoId,
      tipo: input.tipo,
      notas: input.notas,
      realizado_por: user?.id,
    })
    .select('id, created_at')
    .single()
  if (error) throw error
  return data
}

export type Etapa = 'nuevo' | 'contactado' | 'interesado' | 'negociacion' | 'cerrado' | 'perdido'

export async function actualizarEtapa(prospectoId: string, etapa: Etapa) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('prospectos')
    .update({ etapa, updated_at: new Date().toISOString() })
    .eq('id', prospectoId)
    .select('updated_at')
    .single()
  if (error) throw error
  return data
}
