import { redirect } from 'next/navigation'
import {
  obtenerSaldoPortal,
  obtenerAmortizacionPortal,
  obtenerPagosPortal,
  NoAutorizadoError,
} from '@/lib/server/portal'
import { CalendarioAmortizacion } from '@/components/cartera/CalendarioAmortizacion'
import { PagosHistorial } from '@/components/portal/PagosHistorial'

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
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className="text-xl font-semibold">Tu cuenta</h1>

      <section>
        <h2 className="mb-2 font-medium">Calendario de pagos</h2>
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
        <h2 className="mb-2 font-medium">Historial de pagos</h2>
        <PagosHistorial pagos={pagos} />
      </section>

      <p className="text-xs text-amber-600">
        Descarga de estado de cuenta en PDF: pendiente — el backend todavía no eligió librería
        para generarlo (GET /api/portal/estado-cuenta).
      </p>
    </div>
  )
}
