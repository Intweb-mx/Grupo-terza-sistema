import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { listarClientes } from '@/lib/server/clientes'
import { listarPropiedades } from '@/lib/server/propiedades'
import { ContratoWizard } from '@/components/contratos/ContratoWizard'
import { ROLES_GESTION_COMERCIAL } from '@/lib/utils/roles'

export default async function NuevoContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string }>
}) {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')
  if (!ROLES_GESTION_COMERCIAL.includes(usuario.rol)) redirect('/clientes')

  const { cliente_id } = await searchParams
  const [clientes, propiedades] = await Promise.all([listarClientes(), listarPropiedades()])
  const propiedadesDisponibles = propiedades.filter((p) => p.estado_disponibilidad === 'disponible')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nuevo contrato</h1>
      <ContratoWizard
        clientes={clientes}
        propiedades={propiedadesDisponibles}
        clienteIdInicial={cliente_id}
      />
    </div>
  )
}
