import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { listarClientes } from '@/lib/server/clientes'
import { listarPropiedades } from '@/lib/server/propiedades'
import { ContratoWizard } from '@/components/contratos/ContratoWizard'
import { ROLES_GESTION_COMERCIAL } from '@/lib/utils/roles'
import { VolverLink } from '@/components/shell/VolverLink'

export default async function NuevoContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string }>
}) {
  const usuario = await getUsuarioActual()
  if (!usuario || !ROLES_GESTION_COMERCIAL.includes(usuario.rol)) redirect('/clientes')

  const { cliente_id } = await searchParams
  const [clientes, propiedades] = await Promise.all([listarClientes(), listarPropiedades()])
  const propiedadesDisponibles = propiedades.filter((p) => p.estado_disponibilidad === 'disponible')

  return (
    <div className="space-y-6">
      <VolverLink
        href={cliente_id ? `/clientes/${cliente_id}` : '/dashboard'}
        label={cliente_id ? 'Volver al cliente' : 'Volver al panel'}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo contrato</h1>
        <p className="text-sm text-muted-foreground">Compraventa, arrendamiento o renta temporal</p>
      </div>
      <ContratoWizard
        clientes={clientes}
        propiedades={propiedadesDisponibles}
        clienteIdInicial={cliente_id}
      />
    </div>
  )
}
