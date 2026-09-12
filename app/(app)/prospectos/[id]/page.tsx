import { notFound } from 'next/navigation'
import { listarProspectos, listarInteracciones } from '@/lib/server/prospectos'
import { ETIQUETA_ETAPA } from '@/components/crm/constantes'
import { Badge } from '@/components/ui/badge'
import { InteraccionForm } from '@/components/crm/InteraccionForm'
import { InteraccionesTimeline } from '@/components/crm/InteraccionesTimeline'
import { VolverLink } from '@/components/shell/VolverLink'

export default async function ProspectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // No existe todavía un GET /api/prospectos/:id — se busca dentro del
  // listado (ya filtrado por RLS a lo que el usuario puede ver).
  const [prospectos, interacciones] = await Promise.all([
    listarProspectos(),
    listarInteracciones(id),
  ])
  const prospecto = prospectos.find((p) => p.id === id)
  if (!prospecto) notFound()

  return (
    <div className="max-w-2xl space-y-8">
      <VolverLink href="/prospectos" label="Volver a prospectos" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{prospecto.nombre}</h1>
        <p className="text-sm text-muted-foreground">
          {[prospecto.telefono, prospecto.interes].filter(Boolean).join(' · ') ||
            'Sin datos adicionales'}
        </p>
        <Badge variant="secondary" className="mt-2 font-normal">
          {ETIQUETA_ETAPA[prospecto.etapa ?? 'nuevo']}
        </Badge>
      </div>

      <div>
        <h2 className="mb-3 font-medium">Historial de interacciones</h2>
        <InteraccionesTimeline interacciones={interacciones} />
      </div>

      <div>
        <h2 className="mb-3 font-medium">Nueva interacción</h2>
        <InteraccionForm prospectoId={prospecto.id} />
      </div>
    </div>
  )
}
