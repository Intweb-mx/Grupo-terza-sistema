import { formatearCentavos } from '@/lib/utils/moneda'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  pendiente: 'bg-muted text-muted-foreground border-border',
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
    return <p className="text-sm text-muted-foreground">Sin calendario de amortización.</p>
  }

  const totalPagado = cuotas
    .filter((c) => c.estado === 'pagado')
    .reduce((suma, c) => suma + c.total, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total pagado</p>
            <p className="text-lg font-semibold">{formatearCentavos(totalPagado)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Saldo pendiente</p>
            <p className="text-lg font-semibold">{formatearCentavos(saldo.saldo_pendiente)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Próxima fecha de corte</p>
            <p className="text-lg font-semibold">{saldo.proxima_fecha_corte ?? '—'}</p>
            {saldo.dias_atraso > 0 && (
              <Badge
                variant="outline"
                className={`mt-1 ${
                  saldo.dias_atraso > 3
                    ? 'border-red-300 bg-red-100 text-red-800'
                    : 'border-amber-300 bg-amber-100 text-amber-800'
                }`}
              >
                {saldo.dias_atraso} días de atraso
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Corte</TableHead>
              <TableHead>Capital</TableHead>
              <TableHead>Interés</TableHead>
              <TableHead>Penalización</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago real</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cuotas.map((c) => (
              <TableRow key={c.numero_pago}>
                <TableCell>{c.numero_pago}</TableCell>
                <TableCell>{c.fecha_corte}</TableCell>
                <TableCell>{formatearCentavos(c.capital)}</TableCell>
                <TableCell>{formatearCentavos(c.interes)}</TableCell>
                <TableCell>{formatearCentavos(c.penalizacion)}</TableCell>
                <TableCell className="font-medium">{formatearCentavos(c.total)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={COLOR_POR_ESTADO_CUOTA[c.estado ?? ''] ?? ''}
                  >
                    {c.estado ?? 'sin estado'}
                  </Badge>
                </TableCell>
                <TableCell>{c.fecha_pago_real ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
