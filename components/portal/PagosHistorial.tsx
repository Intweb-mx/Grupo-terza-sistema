import { CircleCheck } from 'lucide-react'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Card, CardContent } from '@/components/ui/card'

type Pago = {
  id: string
  monto: number
  fecha: string
  referencia: string | null
  metodo_pago: string | null
}

export function PagosHistorial({ pagos }: { pagos: Pago[] }) {
  if (pagos.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay pagos registrados.</p>
  }

  return (
    <Card className="gap-0 divide-y py-0">
      {pagos.map((p) => (
        <CardContent key={p.id} className="flex items-center gap-3 py-3">
          <CircleCheck className="size-4 shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-medium">{formatearCentavos(p.monto)}</p>
            <p className="text-xs text-muted-foreground">
              {p.fecha} · {p.metodo_pago ?? 'sin método'}
              {p.referencia ? ` · ${p.referencia}` : ''}
            </p>
          </div>
        </CardContent>
      ))}
    </Card>
  )
}
