import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listarClientes } from '@/lib/server/clientes'
import { getUsuarioActual } from '@/lib/server/auth'
import { Button } from '@/components/ui/button'
import { ClientesListado } from '@/components/cartera/ClientesListado'
import { ROLES_GESTION_COMERCIAL } from '@/lib/utils/roles'

export default async function ClientesPage() {
  const usuario = await getUsuarioActual()
  const clientes = await listarClientes()
  const puedeEditar = ROLES_GESTION_COMERCIAL.includes(usuario?.rol ?? '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cartera de clientes</h1>
          <p className="text-sm text-muted-foreground">Compradores y arrendatarios</p>
        </div>
        {puedeEditar && (
          <Button asChild>
            <Link href="/clientes/nuevo">
              <Plus className="size-4" />
              Nuevo cliente
            </Link>
          </Button>
        )}
      </div>

      <ClientesListado clientes={clientes} />
    </div>
  )
}
