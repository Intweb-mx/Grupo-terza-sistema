import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { ROLES_VER_CONTABILIDAD } from '@/lib/utils/roles'
import { EstadoProyecto } from '@/components/contabilidad/EstadoProyecto'

export default async function EstadoProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')
  if (!ROLES_VER_CONTABILIDAD.includes(usuario.rol)) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Estado financiero del proyecto</h1>
      <EstadoProyecto proyectoId={id} />
    </div>
  )
}
