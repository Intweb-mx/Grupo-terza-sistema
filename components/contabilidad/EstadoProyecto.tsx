'use client'

import { useEffect, useState } from 'react'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Card, CardContent } from '@/components/ui/card'

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

  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (!estado) return <p className="text-sm text-muted-foreground">Cargando…</p>

  const filas: [string, number][] = [
    ['Ingresos', estado.ingresos],
    ['Gastos variables', -estado.gastos_variables],
    ['Utilidad bruta', estado.utilidad_bruta],
    ['Gastos fijos (prorrateados)', -estado.gastos_fijos],
    ['Utilidad neta', estado.utilidad_neta],
  ]

  return (
    <Card className="max-w-sm py-0">
      <CardContent className="divide-y px-0">
        {filas.map(([label, monto]) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-medium ${monto < 0 ? 'text-destructive' : ''}`}>
              {formatearCentavos(monto)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
