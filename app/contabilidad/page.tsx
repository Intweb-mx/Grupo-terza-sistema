import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { ROLES_VER_CONTABILIDAD, ROLES_GESTION_CONTABILIDAD } from '@/lib/utils/roles'
import { ContabilidadPanel } from '@/components/contabilidad/ContabilidadPanel'

export default async function ContabilidadPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')
  if (!ROLES_VER_CONTABILIDAD.includes(usuario.rol)) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Contabilidad</h1>
        <p className="text-sm text-gray-500">
          Movimientos del negocio. Sin proyecto asignado, se toman como gasto/ingreso fijo del
          negocio.
        </p>
      </div>

      <ContabilidadPanel puedeGestionar={ROLES_GESTION_CONTABILIDAD.includes(usuario.rol)} />
    </div>
  )
}
