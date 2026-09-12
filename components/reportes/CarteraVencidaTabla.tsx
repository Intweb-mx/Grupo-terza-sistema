import Link from 'next/link'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type FilaCartera = {
  cliente_id: string
  nombre: string
  dias_atraso: number
  monto_vencido: number
  penalizacion_aplicada: number
}

export function CarteraVencidaTabla({ filas }: { filas: FilaCartera[] }) {
  if (filas.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin cartera vencida — todos al corriente.</p>
  }

  return (
    <div className="overflow-x-auto rounded-[20px] border border-gray-200/70 bg-card">
      <Table className="min-w-[560px]">
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Días de atraso</TableHead>
            <TableHead>Monto vencido</TableHead>
            <TableHead>Penalización</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((f) => (
            <TableRow key={f.cliente_id}>
              <TableCell>
                <Link href={`/clientes/${f.cliente_id}`} className="text-primary hover:underline">
                  {f.nombre}
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    f.dias_atraso > 3
                      ? 'border-orange-300 bg-orange-100 text-orange-800'
                      : 'border-amber-300 bg-amber-100 text-amber-800'
                  }
                >
                  {f.dias_atraso} días
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{formatearCentavos(f.monto_vencido)}</TableCell>
              <TableCell>{formatearCentavos(f.penalizacion_aplicada)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
