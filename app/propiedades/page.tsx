import Link from 'next/link'
import { redirect } from 'next/navigation'
import { listarPropiedades } from '@/lib/server/propiedades'
import { getUsuarioActual } from '@/lib/server/auth'
import { PropiedadesListado } from '@/components/propiedades/PropiedadesListado'
import { ROLES_CON_PERMISO_ESCRITURA } from '@/components/propiedades/constantes'

export default async function PropiedadesPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  const propiedades = await listarPropiedades()
  const puedeEditar = ROLES_CON_PERMISO_ESCRITURA.includes(usuario.rol)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Propiedades</h1>
        {puedeEditar && (
          <Link
            href="/propiedades/nueva"
            className="rounded bg-black px-3 py-1.5 text-sm text-white"
          >
            Nueva propiedad
          </Link>
        )}
      </div>

      <PropiedadesListado propiedades={propiedades ?? []} />
    </div>
  )
}
