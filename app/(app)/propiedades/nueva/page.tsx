import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { PropiedadForm } from '@/components/propiedades/PropiedadForm'
import { ROLES_CON_PERMISO_ESCRITURA } from '@/components/propiedades/constantes'
import { VolverLink } from '@/components/shell/VolverLink'

export default async function NuevaPropiedadPage() {
  const usuario = await getUsuarioActual()
  if (!usuario || !ROLES_CON_PERMISO_ESCRITURA.includes(usuario.rol)) redirect('/propiedades')

  return (
    <div className="space-y-6">
      <VolverLink href="/propiedades" label="Volver a propiedades" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva propiedad</h1>
        <p className="text-sm text-muted-foreground">Dar de alta un inmueble en el catálogo</p>
      </div>
      <PropiedadForm />
    </div>
  )
}
