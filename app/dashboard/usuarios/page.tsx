import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { InvitarUsuarioForm } from './InvitarUsuarioForm'

const ROLES_CON_PERMISO = ['dueno', 'administrador']

export default async function UsuariosPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')
  if (!ROLES_CON_PERMISO.includes(usuario.rol)) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <p className="text-sm text-gray-500">
          No hay registro público. Invitá a alguien y recibe un correo para fijar su contraseña.
        </p>
      </div>
      <InvitarUsuarioForm />
    </div>
  )
}
