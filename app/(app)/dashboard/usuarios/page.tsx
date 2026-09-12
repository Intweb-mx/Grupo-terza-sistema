import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { InvitarUsuarioForm } from './InvitarUsuarioForm'
import { VolverLink } from '@/components/shell/VolverLink'

const ROLES_CON_PERMISO = ['dueno', 'administrador']

export default async function UsuariosPage() {
  const usuario = await getUsuarioActual()
  if (!usuario || !ROLES_CON_PERMISO.includes(usuario.rol)) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <VolverLink href="/dashboard" label="Volver al panel" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          No hay registro público. Invitá a alguien y recibe un correo para fijar su contraseña.
        </p>
      </div>
      <InvitarUsuarioForm />
    </div>
  )
}
