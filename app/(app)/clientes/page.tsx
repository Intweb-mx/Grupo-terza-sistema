import Link from 'next/link'
import { redirect } from 'next/navigation'
import { listarClientes } from '@/lib/server/clientes'
import { getUsuarioActual } from '@/lib/server/auth'
import { ClientesListado } from '@/components/cartera/ClientesListado'
import { ROLES_GESTION_COMERCIAL } from '@/lib/utils/roles'

export default async function ClientesPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  const clientes = await listarClientes()
  const puedeEditar = ROLES_GESTION_COMERCIAL.includes(usuario.rol)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        {puedeEditar && (
          <Link href="/clientes/nuevo" className="rounded bg-black px-3 py-1.5 text-sm text-white">
            Nuevo cliente
          </Link>
        )}
      </div>

      <ClientesListado clientes={clientes} />
    </div>
  )
}
