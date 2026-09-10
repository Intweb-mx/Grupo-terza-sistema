import { getUsuarioActual } from '@/lib/server/auth'
import { obtenerKpis, obtenerCarteraVencida, obtenerFlujoProyectado } from '@/lib/server/reportes'
import { listarProspectos } from '@/lib/server/prospectos'
import { KpiCards } from '@/components/reportes/KpiCards'
import { FlujoProyectadoChart } from '@/components/reportes/FlujoProyectadoChart'
import { CarteraVencidaTabla } from '@/components/reportes/CarteraVencidaTabla'
import { EmbudoChart } from '@/components/reportes/EmbudoChart'

const ROLES_PANEL_EJECUTIVO = ['dueno', 'administrador', 'contador']

function contarPorEtapa(prospectos: { etapa: string | null }[]) {
  const conteo: Record<string, number> = {}
  for (const p of prospectos) {
    const etapa = p.etapa ?? 'nuevo'
    conteo[etapa] = (conteo[etapa] ?? 0) + 1
  }
  return conteo
}

export default async function DashboardPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) return null // proxy.ts ya protege /dashboard, esto no debería pasar

  if (ROLES_PANEL_EJECUTIVO.includes(usuario.rol)) {
    const [kpis, carteraVencida, flujo, prospectos] = await Promise.all([
      obtenerKpis(),
      obtenerCarteraVencida(),
      obtenerFlujoProyectado(),
      listarProspectos(),
    ])

    return (
      <div className="space-y-8">
        <h1 className="text-xl font-semibold">Panel ejecutivo</h1>

        <KpiCards kpis={kpis} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-2 font-medium">Flujo proyectado</h2>
            <FlujoProyectadoChart filas={flujo} />
          </section>
          <section>
            <h2 className="mb-2 font-medium">Embudo de ventas (todos los asesores)</h2>
            <EmbudoChart conteoPorEtapa={contarPorEtapa(prospectos)} />
          </section>
        </div>

        <section>
          <h2 className="mb-2 font-medium">Cartera vencida</h2>
          <CarteraVencidaTabla filas={carteraVencida} />
        </section>

        <p className="text-xs text-amber-600">
          Proyección económica por proyecto con participación por socio: pendiente — no existe
          todavía un endpoint de lectura para la tabla socios ni el cálculo de reparto.
        </p>
      </div>
    )
  }

  if (usuario.rol === 'asesor') {
    const prospectos = await listarProspectos()
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Mi panel</h1>
        <section>
          <h2 className="mb-2 font-medium">Mi embudo</h2>
          <EmbudoChart conteoPorEtapa={contarPorEtapa(prospectos)} />
        </section>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Panel</h1>
    </div>
  )
}
