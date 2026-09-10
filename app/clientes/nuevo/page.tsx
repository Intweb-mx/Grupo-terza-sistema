import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { ClienteForm } from '@/components/cartera/ClienteForm'
import { ROLES_GESTION_COMERCIAL } from '@/lib/utils/roles'

export default async function NuevoClientePage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')
  if (!ROLES_GESTION_COMERCIAL.includes(usuario.rol)) redirect('/clientes')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nuevo cliente</h1>
      <ClienteForm />
    </div>
  )
}
