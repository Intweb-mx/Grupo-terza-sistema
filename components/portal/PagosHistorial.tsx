import { formatearCentavos } from '@/lib/utils/moneda'

type Pago = {
  id: string
  monto: number
  fecha: string
  referencia: string | null
  metodo_pago: string | null
}

export function PagosHistorial({ pagos }: { pagos: Pago[] }) {
  if (pagos.length === 0) {
    return <p className="text-sm text-gray-500">Todavía no hay pagos registrados.</p>
  }

  return (
    <div className="divide-y rounded border">
      {pagos.map((p) => (
        <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <div>
            <p className="font-medium">{formatearCentavos(p.monto)}</p>
            <p className="text-xs text-gray-500">
              {p.fecha} · {p.metodo_pago ?? 'sin método'}
              {p.referencia ? ` · ${p.referencia}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
