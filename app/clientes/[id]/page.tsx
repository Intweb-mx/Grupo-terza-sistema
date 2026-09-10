import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { obtenerCliente, obtenerAmortizacion, obtenerSaldo } from '@/lib/server/clientes'
import { listarPropiedades } from '@/lib/server/propiedades'
import { getUsuarioActual } from '@/lib/server/auth'
import { formatearCentavos } from '@/lib/utils/moneda'
import { ROLES_GESTION_COMERCIAL } from '@/lib/utils/roles'
import { CalendarioAmortizacion } from '@/components/cartera/CalendarioAmortizacion'

const COLOR_POR_ESTADO_CONTRATO: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-700 border-gray-300',
  activo: 'bg-green-100 text-green-800 border-green-300',
  vencido: 'bg-red-100 text-red-800 border-red-300',
  cancelado: 'bg-gray-100 text-gray-500 border-gray-300',
  liquidado: 'bg-blue-100 text-blue-800 border-blue-300',
}

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  const [cliente, propiedades, cuotas, saldo] = await Promise.all([
    obtenerCliente(id).catch(() => null),
    listarPropiedades(),
    obtenerAmortizacion(id),
    obtenerSaldo(id),
  ])
  if (!cliente) notFound()

  const puedeEditar = ROLES_GESTION_COMERCIAL.includes(usuario.rol)
  const tituloPropiedad = (propiedadId: string) =>
    propiedades.find((p) => p.id === propiedadId)?.titulo ?? propiedadId

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {cliente.nombre} {cliente.apellidos}
        </h1>
        <p className="text-sm text-gray-500">
          {[cliente.email, cliente.telefono, cliente.ciudad].filter(Boolean).join(' · ') ||
            'Sin datos de contacto'}
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Contratos</h2>
          {puedeEditar && (
            <Link
              href={`/contratos/nuevo?cliente_id=${cliente.id}`}
              className="rounded border px-3 py-1.5 text-sm"
            >
              Nuevo contrato
            </Link>
          )}
        </div>

        {cliente.contratos.length === 0 ? (
          <p className="text-sm text-gray-500">Sin contratos todavía.</p>
        ) : (
          <div className="divide-y rounded border">
            {cliente.contratos.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {c.tipo} · {tituloPropiedad(c.propiedad_id)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.fecha_inicio}
                    {c.fecha_fin ? ` → ${c.fecha_fin}` : ''} · {formatearCentavos(c.monto_total)}
                  </p>
                </div>
                <span
                  className={`rounded border px-2 py-0.5 text-xs ${
                    COLOR_POR_ESTADO_CONTRATO[c.estado ?? ''] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {c.estado ?? 'sin estado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-medium">Calendario de amortización</h2>
        <CalendarioAmortizacion cuotas={cuotas} saldo={saldo} />
      </div>
    </div>
  )
}
