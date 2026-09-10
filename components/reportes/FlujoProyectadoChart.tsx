'use client'

import { useState } from 'react'
import { formatearCentavos } from '@/lib/utils/moneda'

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
    return <p className="text-sm text-gray-500">Sin cobros proyectados a futuro.</p>
  }

  const max = Math.max(...filas.map((f) => f.ingresos_esperados))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Cobro esperado por mes (próximas cuotas pendientes)</p>
        <button
          type="button"
          onClick={() => setVerTabla((v) => !v)}
          className="text-xs text-blue-600 hover:underline"
        >
          {verTabla ? 'Ver gráfica' : 'Ver tabla'}
        </button>
      </div>

      {verTabla ? (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-1">Mes</th>
              <th className="py-1">Ingresos esperados</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filas.map((f) => (
              <tr key={f.mes}>
                <td className="py-1">{etiquetaMes(f.mes)}</td>
                <td className="py-1">{formatearCentavos(f.ingresos_esperados)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex h-40 gap-2">
          {filas.map((f) => (
            <div key={f.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div
                title={`${etiquetaMes(f.mes)}: ${formatearCentavos(f.ingresos_esperados)}`}
                className="w-full rounded-t bg-blue-500"
                style={{
                  height: `${max > 0 ? Math.max(4, (f.ingresos_esperados / max) * 100) : 0}%`,
                }}
              />
              <span className="text-[10px] text-gray-500">{etiquetaMes(f.mes)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
