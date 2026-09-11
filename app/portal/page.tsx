import { redirect } from 'next/navigation'
import {
  obtenerSaldoPortal,
  obtenerAmortizacionPortal,
  obtenerPagosPortal,
  NoAutorizadoError,
} from '@/lib/server/portal'
import { CalendarioAmortizacion } from '@/components/cartera/CalendarioAmortizacion'
import { PagosHistorial } from '@/components/portal/PagosHistorial'
import { SignOutButton } from '@/components/shell/SignOutButton'
import { BackgroundMesh } from '@/components/shell/BackgroundMesh'

export default async function PortalPage() {
  let saldo, cuotas, pagos

  try {
    ;[saldo, cuotas, pagos] = await Promise.all([
      obtenerSaldoPortal(),
      obtenerAmortizacionPortal(),
      obtenerPagosPortal(),
    ])
  } catch (error) {
    if (error instanceof NoAutorizadoError) redirect('/portal/login')
    throw error
  }

  const penalizacionAplicada = cuotas
    .filter((c) => c.estado !== 'pagado')
    .reduce((suma, c) => suma + c.penalizacion, 0)

  return (
    <div className="relative min-h-screen bg-muted/40">
      <BackgroundMesh />

      <header className="m-3 flex items-center justify-between rounded-2xl border border-white/60 bg-white/65 px-6 py-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30">
            T
          </div>
          <span className="text-sm font-semibold tracking-tight">Grupo Terza · Portal</span>
        </div>
        <SignOutButton redirectTo="/portal/login" />
      </header>

      <div className="mx-auto max-w-3xl space-y-8 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tu cuenta</h1>

        <section>
          <h2 className="mb-3 font-medium">Calendario de pagos</h2>
          <CalendarioAmortizacion
            cuotas={cuotas}
            saldo={{
              saldo_pendiente: saldo.saldo_pendiente,
              dias_atraso: saldo.dias_atraso,
              penalizacion_aplicada: penalizacionAplicada,
              proxima_fecha_corte: saldo.proxima_fecha,
            }}
          />
        </section>

        <section>
          <h2 className="mb-3 font-medium">Historial de pagos</h2>
          <PagosHistorial pagos={pagos} />
        </section>

        <p className="text-xs text-amber-600">
          Descarga de estado de cuenta en PDF: pendiente — el backend todavía no eligió librería
          para generarlo (GET /api/portal/estado-cuenta).
        </p>
      </div>
    </div>
  )
}
