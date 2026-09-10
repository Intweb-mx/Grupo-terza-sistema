import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listarPropiedades } from '@/lib/server/propiedades'
import { getUsuarioActual } from '@/lib/server/auth'
import { Button } from '@/components/ui/button'
import { PropiedadesListado } from '@/components/propiedades/PropiedadesListado'
import { ROLES_CON_PERMISO_ESCRITURA } from '@/components/propiedades/constantes'

export default async function PropiedadesPage() {
  const usuario = await getUsuarioActual()
  const propiedades = await listarPropiedades()
  const puedeEditar = ROLES_CON_PERMISO_ESCRITURA.includes(usuario?.rol ?? '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Propiedades</h1>
          <p className="text-sm text-muted-foreground">Catálogo de inmuebles del negocio</p>
        </div>
        {puedeEditar && (
          <Button asChild>
            <Link href="/propiedades/nueva">
              <Plus className="size-4" />
              Nueva propiedad
            </Link>
          </Button>
        )}
      </div>

      <PropiedadesListado propiedades={propiedades ?? []} />
    </div>
  )
}
