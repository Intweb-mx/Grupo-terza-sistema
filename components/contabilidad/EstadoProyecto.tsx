'use client'

import { useEffect, useState } from 'react'
import { formatearCentavos } from '@/lib/utils/moneda'

type Estado = {
  ingresos: number
  gastos_fijos: number
  gastos_variables: number
  utilidad_bruta: number
  utilidad_neta: number
}

export function EstadoProyecto({ proyectoId }: { proyectoId: string }) {
  const [estado, setEstado] = useState<Estado | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/contabilidad/proyectos/${proyectoId}/estado`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setEstado)
      .catch(() => setError('No se pudo calcular el estado del proyecto'))
  }, [proyectoId])

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!estado) return <p className="text-sm text-gray-500">Cargando…</p>

  const filas: [string, number][] = [
    ['Ingresos', estado.ingresos],
    ['Gastos variables', -estado.gastos_variables],
    ['Utilidad bruta', estado.utilidad_bruta],
    ['Gastos fijos (prorrateados)', -estado.gastos_fijos],
    ['Utilidad neta', estado.utilidad_neta],
  ]

  return (
    <div className="max-w-sm divide-y rounded border">
      {filas.map(([label, monto]) => (
        <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-gray-600">{label}</span>
          <span className={`font-medium ${monto < 0 ? 'text-red-700' : ''}`}>
            {formatearCentavos(monto)}
          </span>
        </div>
      ))}
    </div>
  )
}
