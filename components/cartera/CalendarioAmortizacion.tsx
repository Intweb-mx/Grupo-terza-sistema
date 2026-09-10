import { formatearCentavos } from '@/lib/utils/moneda'

type CuotaAmortizacion = {
  numero_pago: number
  fecha_corte: string
  capital: number
  interes: number
  penalizacion: number
  total: number
  estado: string | null
  fecha_pago_real: string | null
}

type Saldo = {
  saldo_pendiente: number
  dias_atraso: number
  penalizacion_aplicada: number
  proxima_fecha_corte: string | null
}

const COLOR_POR_ESTADO_CUOTA: Record<string, string> = {
  pendiente: 'bg-gray-100 text-gray-700 border-gray-300',
  pagado: 'bg-green-100 text-green-800 border-green-300',
  vencido: 'bg-red-100 text-red-800 border-red-300',
  reestructurado: 'bg-amber-100 text-amber-800 border-amber-300',
}

export function CalendarioAmortizacion({
  cuotas,
  saldo,
}: {
  cuotas: CuotaAmortizacion[]
  saldo: Saldo
}) {
  if (cuotas.length === 0) {
    return <p className="text-sm text-gray-500">Sin calendario de amortización.</p>
  }

  const totalPagado = cuotas
    .filter((c) => c.estado === 'pagado')
    .reduce((suma, c) => suma + c.total, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 rounded border p-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Total pagado</p>
          <p className="font-semibold">{formatearCentavos(totalPagado)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Saldo pendiente</p>
          <p className="font-semibold">{formatearCentavos(saldo.saldo_pendiente)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Próxima fecha de corte</p>
          <p className="font-semibold">{saldo.proxima_fecha_corte ?? '—'}</p>
          {saldo.dias_atraso > 0 && (
            <p className="text-xs text-red-600">{saldo.dias_atraso} días de atraso</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Corte</th>
              <th className="px-3 py-2">Capital</th>
              <th className="px-3 py-2">Interés</th>
              <th className="px-3 py-2">Penalización</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Pago real</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cuotas.map((c) => (
              <tr key={c.numero_pago}>
                <td className="px-3 py-2">{c.numero_pago}</td>
                <td className="px-3 py-2">{c.fecha_corte}</td>
                <td className="px-3 py-2">{formatearCentavos(c.capital)}</td>
                <td className="px-3 py-2">{formatearCentavos(c.interes)}</td>
                <td className="px-3 py-2">{formatearCentavos(c.penalizacion)}</td>
                <td className="px-3 py-2 font-medium">{formatearCentavos(c.total)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded border px-2 py-0.5 text-xs ${
                      COLOR_POR_ESTADO_CUOTA[c.estado ?? ''] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {c.estado ?? 'sin estado'}
                  </span>
                </td>
                <td className="px-3 py-2">{c.fecha_pago_real ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
