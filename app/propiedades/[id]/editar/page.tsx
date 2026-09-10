import { notFound, redirect } from 'next/navigation'
import { obtenerPropiedad } from '@/lib/server/propiedades'
import { getUsuarioActual } from '@/lib/server/auth'
import { PropiedadForm } from '@/components/propiedades/PropiedadForm'
import { ROLES_CON_PERMISO_ESCRITURA } from '@/components/propiedades/constantes'

export default async function EditarPropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')
  if (!ROLES_CON_PERMISO_ESCRITURA.includes(usuario.rol)) redirect(`/propiedades/${id}`)

  const propiedad = await obtenerPropiedad(id).catch(() => null)
  if (!propiedad) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Editar propiedad</h1>
      <PropiedadForm
        propiedadId={propiedad.id}
        valoresIniciales={{
          titulo: propiedad.titulo,
          tipo: propiedad.tipo,
          precio: (propiedad.precio / 100).toString(),
          superficie_m2: propiedad.superficie_m2?.toString() ?? '',
          ciudad: propiedad.ciudad,
          descripcion: propiedad.descripcion ?? '',
        }}
      />
    </div>
  )
}
