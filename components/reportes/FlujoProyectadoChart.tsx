'use client'

import { useId, useState } from 'react'
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

// Tabla fija en vez de toLocaleDateString: el formato "short month" de
// Intl/Date depende de los datos ICU del motor JS, que pueden diferir
// entre el servidor (Node) y el navegador — eso rompía la hidratación.
const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function etiquetaMes(mes: string) {
  const [anio, m] = mes.split('-')
  return `${MESES_CORTOS[Number(m) - 1]} ${anio.slice(2)}`
}

const ANCHO = 640
const ALTO = 180
const PAD_X = 8
const PAD_Y = 12

export function FlujoProyectadoChart({ filas }: { filas: FilaFlujo[] }) {
  const [verTabla, setVerTabla] = useState(false)
  const gradientId = useId()

  if (filas.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin cobros proyectados a futuro.</p>
  }

  const max = Math.max(...filas.map((f) => f.ingresos_esperados), 1)
  const total = filas.reduce((s, f) => s + f.ingresos_esperados, 0)

  const puntos = filas.map((f, i) => {
    const x =
      filas.length === 1
        ? ANCHO / 2
        : PAD_X + (i / (filas.length - 1)) * (ANCHO - PAD_X * 2)
    const y = ALTO - PAD_Y - (f.ingresos_esperados / max) * (ALTO - PAD_Y * 2)
    return { x, y, f }
  })

  const lineaPath = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${lineaPath} L${puntos[puntos.length - 1].x},${ALTO} L${puntos[0].x},${ALTO} Z`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Cobro esperado por mes (próximas cuotas pendientes) · línea proyectada
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
        <div className="space-y-2">
          <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-40 w-full overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* líneas de cuadrícula suaves */}
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line
                key={f}
                x1={0}
                x2={ANCHO}
                y1={PAD_Y + (ALTO - PAD_Y * 2) * f}
                y2={PAD_Y + (ALTO - PAD_Y * 2) * f}
                stroke="var(--border)"
                strokeWidth={1}
              />
            ))}

            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={lineaPath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="6 5"
            />
            {puntos.map((p) => (
              <circle key={p.f.mes} cx={p.x} cy={p.y} r={3.5} fill="var(--primary)">
                <title>
                  {etiquetaMes(p.f.mes)}: {formatearCentavos(p.f.ingresos_esperados)}
                </title>
              </circle>
            ))}
          </svg>

          <div className="flex justify-between text-[10px] text-muted-foreground">
            {filas.map((f) => (
              <span key={f.mes}>{etiquetaMes(f.mes)}</span>
            ))}
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
            Cobro total proyectado en los próximos {filas.length} meses:{' '}
            <span className="font-semibold">{formatearCentavos(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
