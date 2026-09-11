import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { ClienteForm } from '@/components/cartera/ClienteForm'
import { ROLES_GESTION_COMERCIAL } from '@/lib/utils/roles'

export default async function NuevoClientePage() {
  const usuario = await getUsuarioActual()
  if (!usuario || !ROLES_GESTION_COMERCIAL.includes(usuario.rol)) redirect('/clientes')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo cliente</h1>
        <p className="text-sm text-muted-foreground">Alta de comprador o arrendatario</p>
      </div>
      <ClienteForm />
    </div>
  )
}
