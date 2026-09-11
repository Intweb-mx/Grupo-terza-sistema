import { notFound, redirect } from 'next/navigation'
import { listarProspectos } from '@/lib/server/prospectos'
import { getUsuarioActual } from '@/lib/server/auth'
import { ETIQUETA_ETAPA } from '@/components/crm/constantes'
import { InteraccionForm } from '@/components/crm/InteraccionForm'

export default async function ProspectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  // No existe todavía un GET /api/prospectos/:id — se busca dentro del
  // listado (ya filtrado por RLS a lo que el usuario puede ver).
  const prospectos = await listarProspectos()
  const prospecto = prospectos.find((p) => p.id === id)
  if (!prospecto) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{prospecto.nombre}</h1>
        <p className="text-sm text-gray-500">
          {[prospecto.telefono, prospecto.interes].filter(Boolean).join(' · ') || 'Sin datos adicionales'}
        </p>
        <span className="mt-2 inline-block rounded border bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
          {ETIQUETA_ETAPA[prospecto.etapa ?? 'nuevo']}
        </span>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Última interacción:{' '}
          {prospecto.ultima_interaccion
            ? new Date(prospecto.ultima_interaccion).toLocaleString('es-MX')
            : 'sin interacciones todavía'}
        </p>
        <p className="mt-1 text-xs text-amber-600">
          El historial completo de interacciones todavía no se puede listar — falta un endpoint
          de lectura en el backend (GET /api/prospectos/:id/interacciones).
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Nueva interacción</h2>
        <InteraccionForm prospectoId={prospecto.id} />
      </div>
    </div>
  )
}
