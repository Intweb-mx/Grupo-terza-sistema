import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus } from 'lucide-react'
import { obtenerCliente, obtenerAmortizacion, obtenerSaldo } from '@/lib/server/clientes'
import { listarPropiedades } from '@/lib/server/propiedades'
import { getUsuarioActual } from '@/lib/server/auth'
import { formatearCentavos } from '@/lib/utils/moneda'
import { ROLES_GESTION_COMERCIAL, ROLES_GESTION_PAGOS, ROLES_REESTRUCTURA } from '@/lib/utils/roles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarioAmortizacion } from '@/components/cartera/CalendarioAmortizacion'
import { RegistrarPagoModal } from '@/components/cartera/RegistrarPagoModal'
import { ReestructurarBoton } from '@/components/cartera/ReestructurarBoton'
import { InvitarPortalBoton } from '@/components/cartera/InvitarPortalBoton'

const COLOR_POR_ESTADO_CONTRATO: Record<string, string> = {
  borrador: 'bg-muted text-muted-foreground border-border',
  activo: 'bg-green-100 text-green-800 border-green-300',
  vencido: 'bg-red-100 text-red-800 border-red-300',
  cancelado: 'bg-muted text-muted-foreground border-border',
  liquidado: 'bg-blue-100 text-blue-800 border-blue-300',
}

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()

  const [cliente, propiedades, cuotas, saldo] = await Promise.all([
    obtenerCliente(id).catch(() => null),
    listarPropiedades(),
    obtenerAmortizacion(id),
    obtenerSaldo(id),
  ])
  if (!cliente) notFound()

  const puedeEditar = ROLES_GESTION_COMERCIAL.includes(usuario?.rol ?? '')
  const puedeRegistrarPago = ROLES_GESTION_PAGOS.includes(usuario?.rol ?? '')
  const puedeReestructurar = ROLES_REESTRUCTURA.includes(usuario?.rol ?? '')
  const tituloPropiedad = (propiedadId: string) =>
    propiedades.find((p) => p.id === propiedadId)?.titulo ?? propiedadId

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {cliente.nombre} {cliente.apellidos}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[cliente.email, cliente.telefono, cliente.ciudad].filter(Boolean).join(' · ') ||
              'Sin datos de contacto'}
          </p>
        </div>
        {puedeReestructurar && cliente.email && <InvitarPortalBoton clienteId={cliente.id} />}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Contratos</h2>
          {puedeEditar && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/contratos/nuevo?cliente_id=${cliente.id}`}>
                <Plus className="size-4" />
                Nuevo contrato
              </Link>
            </Button>
          )}
        </div>

        {cliente.contratos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin contratos todavía.</p>
        ) : (
          <div className="space-y-2">
            {cliente.contratos.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {c.tipo} · {tituloPropiedad(c.propiedad_id)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.fecha_inicio}
                      {c.fecha_fin ? ` → ${c.fecha_fin}` : ''} · {formatearCentavos(c.monto_total)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={COLOR_POR_ESTADO_CONTRATO[c.estado ?? ''] ?? ''}
                  >
                    {c.estado ?? 'sin estado'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Calendario de amortización</h2>
          <div className="flex gap-2">
            {puedeReestructurar && cuotas.length > 0 && (
              <ReestructurarBoton clienteId={cliente.id} />
            )}
            {puedeRegistrarPago && cuotas.length > 0 && (
              <RegistrarPagoModal clienteId={cliente.id} />
            )}
          </div>
        </div>
        <CalendarioAmortizacion cuotas={cuotas} saldo={saldo} />
      </div>
    </div>
  )
}
