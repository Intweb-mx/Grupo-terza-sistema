import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { PropiedadForm } from '@/components/propiedades/PropiedadForm'
import { ROLES_CON_PERMISO_ESCRITURA } from '@/components/propiedades/constantes'

export default async function NuevaPropiedadPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')
  if (!ROLES_CON_PERMISO_ESCRITURA.includes(usuario.rol)) redirect('/propiedades')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nueva propiedad</h1>
      <PropiedadForm />
    </div>
  )
}
