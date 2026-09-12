import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { ROLES_VER_CONTABILIDAD } from '@/lib/utils/roles'
import { EstadoProyecto } from '@/components/contabilidad/EstadoProyecto'
import { RepartoSocios } from '@/components/contabilidad/RepartoSocios'
import { VolverLink } from '@/components/shell/VolverLink'

export default async function EstadoProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  if (!usuario || !ROLES_VER_CONTABILIDAD.includes(usuario.rol)) redirect('/dashboard')

  return (
    <div className="space-y-8">
      <VolverLink href="/contabilidad" label="Volver a contabilidad" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estado financiero del proyecto</h1>
        <p className="text-sm text-muted-foreground">
          Ingresos, gastos y utilidad calculados sobre contabilidad separada
        </p>
      </div>

      <div>
        <h2 className="mb-3 font-medium">Utilidad</h2>
        <EstadoProyecto proyectoId={id} />
      </div>

      <div>
        <h2 className="mb-3 font-medium">Reparto por socio</h2>
        <RepartoSocios proyectoId={id} />
      </div>
    </div>
  )
}
