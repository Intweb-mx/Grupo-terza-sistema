import { notFound, redirect } from 'next/navigation'
import { obtenerPropiedad } from '@/lib/server/propiedades'
import { getUsuarioActual } from '@/lib/server/auth'
import { PropiedadForm } from '@/components/propiedades/PropiedadForm'
import { ROLES_CON_PERMISO_ESCRITURA } from '@/components/propiedades/constantes'
import { VolverLink } from '@/components/shell/VolverLink'

export default async function EditarPropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  if (!usuario || !ROLES_CON_PERMISO_ESCRITURA.includes(usuario.rol)) redirect(`/propiedades/${id}`)

  const propiedad = await obtenerPropiedad(id).catch(() => null)
  if (!propiedad) notFound()

  return (
    <div className="space-y-6">
      <VolverLink href={`/propiedades/${id}`} label="Volver a la propiedad" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar propiedad</h1>
        <p className="text-sm text-muted-foreground">{propiedad.titulo}</p>
      </div>
      <PropiedadForm
        propiedadId={propiedad.id}
        valoresIniciales={{
          titulo: propiedad.titulo,
          tipo: propiedad.tipo,
          precio: (propiedad.precio / 100).toString(),
          superficie_m2: propiedad.superficie_m2?.toString() ?? '',
          ciudad: propiedad.ciudad,
          descripcion: propiedad.descripcion ?? '',
          imagen_url: propiedad.imagen_url ?? '',
        }}
      />
    </div>
  )
}
