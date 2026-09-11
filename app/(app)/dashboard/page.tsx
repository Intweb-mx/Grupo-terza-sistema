import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getUsuarioActual } from '@/lib/server/auth'
import { obtenerKpis, obtenerCarteraVencida, obtenerFlujoProyectado } from '@/lib/server/reportes'
import { listarProspectos } from '@/lib/server/prospectos'
import { listarProyectos } from '@/lib/server/contabilidad'
import { KpiCards } from '@/components/reportes/KpiCards'
import { FlujoProyectadoChart } from '@/components/reportes/FlujoProyectadoChart'
import { CarteraVencidaTabla } from '@/components/reportes/CarteraVencidaTabla'
import { EmbudoChart } from '@/components/reportes/EmbudoChart'
import { Card, CardContent } from '@/components/ui/card'

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
    const [kpis, carteraVencida, flujo, prospectos, proyectos] = await Promise.all([
      obtenerKpis(),
      obtenerCarteraVencida(),
      obtenerFlujoProyectado(),
      listarProspectos(),
      listarProyectos(),
    ])

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panel ejecutivo</h1>
          <p className="text-sm text-muted-foreground">Vista general del negocio</p>
        </div>

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

        <section>
          <h2 className="mb-2 font-medium">Proyección económica por proyecto</h2>
          {proyectos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin proyectos registrados.</p>
          ) : (
            <div className="space-y-2">
              {proyectos.map((p) => (
                <Link key={p.id} href={`/contabilidad/proyectos/${p.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{p.nombre}</p>
                        {p.descripcion && (
                          <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                        )}
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  if (usuario.rol === 'asesor') {
    const prospectos = await listarProspectos()
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mi panel</h1>
          <p className="text-sm text-muted-foreground">{usuario.nombre}</p>
        </div>
        <section>
          <h2 className="mb-2 font-medium">Mi embudo</h2>
          <EmbudoChart conteoPorEtapa={contarPorEtapa(prospectos)} />
        </section>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Panel</h1>
    </div>
  )
}
