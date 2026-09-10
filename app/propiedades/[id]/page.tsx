import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { obtenerPropiedad } from '@/lib/server/propiedades'
import { getUsuarioActual } from '@/lib/server/auth'
import { formatearCentavos } from '@/lib/utils/moneda'
import { COLOR_POR_ESTADO, ROLES_CON_PERMISO_ESCRITURA } from '@/components/propiedades/constantes'

export default async function PropiedadDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  const propiedad = await obtenerPropiedad(id).catch(() => null)
  if (!propiedad) notFound()

  const puedeEditar = ROLES_CON_PERMISO_ESCRITURA.includes(usuario.rol)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{propiedad.titulo}</h1>
          <p className="text-sm text-gray-500">
            {propiedad.tipo} · {propiedad.ciudad}
            {propiedad.superficie_m2 ? ` · ${propiedad.superficie_m2} m²` : ''}
            {propiedad.lote_id ? ` · Lote ${propiedad.lote_id}` : ''}
          </p>
        </div>
        {puedeEditar && (
          <Link
            href={`/propiedades/${propiedad.id}/editar`}
            className="rounded border px-3 py-1.5 text-sm"
          >
            Editar
          </Link>
        )}
      </div>

      <span
        className={`inline-block rounded border px-2 py-0.5 text-xs ${
          COLOR_POR_ESTADO[propiedad.estado_disponibilidad ?? ''] ?? 'bg-gray-100 text-gray-700'
        }`}
      >
        {propiedad.estado_disponibilidad ?? 'sin estado'}
      </span>

      <p className="text-lg font-semibold">{formatearCentavos(propiedad.precio)}</p>

      {propiedad.descripcion && <p className="text-sm">{propiedad.descripcion}</p>}

      {propiedad.imagen_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={propiedad.imagen_url}
          alt={propiedad.titulo}
          className="w-full rounded object-cover"
        />
      )}

      {propiedad.galeria && propiedad.galeria.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {propiedad.galeria.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="aspect-square w-full rounded object-cover" />
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        Contratos activos: {propiedad.contratos_activos}
      </p>
    </div>
  )
}
