'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getUsuarioActual() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
  return data
}
