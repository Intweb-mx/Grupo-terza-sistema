import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, FileText } from 'lucide-react'
import { obtenerPropiedad } from '@/lib/server/propiedades'
import { getUsuarioActual } from '@/lib/server/auth'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { COLOR_POR_ESTADO, ROLES_CON_PERMISO_ESCRITURA } from '@/components/propiedades/constantes'

export default async function PropiedadDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  const propiedad = await obtenerPropiedad(id).catch(() => null)
  if (!propiedad) notFound()

  const puedeEditar = ROLES_CON_PERMISO_ESCRITURA.includes(usuario?.rol ?? '')

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{propiedad.titulo}</h1>
          <p className="text-sm text-muted-foreground">
            {propiedad.tipo} · {propiedad.ciudad}
            {propiedad.superficie_m2 ? ` · ${propiedad.superficie_m2} m²` : ''}
            {propiedad.lote_id ? ` · Lote ${propiedad.lote_id}` : ''}
          </p>
        </div>
        {puedeEditar && (
          <Button variant="outline" asChild>
            <Link href={`/propiedades/${propiedad.id}/editar`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={COLOR_POR_ESTADO[propiedad.estado_disponibilidad ?? ''] ?? ''}
        >
          {propiedad.estado_disponibilidad ?? 'sin estado'}
        </Badge>
        <span className="text-lg font-semibold">{formatearCentavos(propiedad.precio)}</span>
      </div>

      {propiedad.descripcion && (
        <p className="text-sm text-foreground/90">{propiedad.descripcion}</p>
      )}

      {propiedad.imagen_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={propiedad.imagen_url}
          alt={propiedad.titulo}
          className="w-full rounded-lg border object-cover"
        />
      )}

      {propiedad.galeria && propiedad.galeria.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {propiedad.galeria.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-square w-full rounded-lg border object-cover"
            />
          ))}
        </div>
      )}

      <Card>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4" />
          Contratos activos: {propiedad.contratos_activos}
        </CardContent>
      </Card>
    </div>
  )
}
