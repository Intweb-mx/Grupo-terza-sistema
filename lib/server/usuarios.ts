import { createAdminClient } from '@/lib/supabase/admin'
import { getUsuarioActual } from '@/lib/server/auth'

const ROLES_QUE_INVITAN = ['dueno', 'administrador'] as const

export type InvitarUsuarioInput = {
  nombre: string
  email: string
  rol: 'dueno' | 'socio' | 'administrador' | 'asesor' | 'contador'
}

export class NoAutorizadoError extends Error {}

export async function invitarUsuario(input: InvitarUsuarioInput) {
  const solicitante = await getUsuarioActual()
  if (!solicitante || !ROLES_QUE_INVITAN.includes(solicitante.rol as 'dueno' | 'administrador')) {
    throw new NoAutorizadoError('Solo dueño o administrador pueden invitar usuarios')
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    data: { nombre: input.nombre, rol: input.rol },
  })
  if (error) throw error

  return { id: data.user.id, email: data.user.email, invitado_en: data.user.created_at }
}
