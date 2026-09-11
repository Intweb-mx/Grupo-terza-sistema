'use client'

import { useState } from 'react'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type FilaFlujo = {
  mes: string // YYYY-MM
  ingresos_esperados: number
  egresos_esperados: number
  saldo_proyectado: number
}

function etiquetaMes(mes: string) {
  const [anio, m] = mes.split('-')
  const fecha = new Date(Number(anio), Number(m) - 1, 1)
  return fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
}

export function FlujoProyectadoChart({ filas }: { filas: FilaFlujo[] }) {
  const [verTabla, setVerTabla] = useState(false)

  if (filas.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin cobros proyectados a futuro.</p>
  }

  const max = Math.max(...filas.map((f) => f.ingresos_esperados))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Cobro esperado por mes (próximas cuotas pendientes)
        </p>
        <Button variant="ghost" size="sm" onClick={() => setVerTabla((v) => !v)}>
          {verTabla ? 'Ver gráfica' : 'Ver tabla'}
        </Button>
      </div>

      {verTabla ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mes</TableHead>
              <TableHead>Ingresos esperados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((f) => (
              <TableRow key={f.mes}>
                <TableCell>{etiquetaMes(f.mes)}</TableCell>
                <TableCell>{formatearCentavos(f.ingresos_esperados)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex h-40 gap-2">
          {filas.map((f) => (
            <div key={f.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div
                title={`${etiquetaMes(f.mes)}: ${formatearCentavos(f.ingresos_esperados)}`}
                className="w-full rounded-t bg-primary"
                style={{
                  height: `${max > 0 ? Math.max(4, (f.ingresos_esperados / max) * 100) : 0}%`,
                }}
              />
              <span className="text-[10px] text-muted-foreground">{etiquetaMes(f.mes)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
