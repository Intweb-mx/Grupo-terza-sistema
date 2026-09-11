'use client'

import { useEffect, useState } from 'react'
import { formatearCentavos } from '@/lib/utils/moneda'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Reparto = {
  utilidad_neta: number
  reparto: {
    socio_id: string
    nombre: string
    porcentaje_participacion: number
    monto_correspondiente: number
  }[]
}

export function RepartoSocios({ proyectoId }: { proyectoId: string }) {
  const [datos, setDatos] = useState<Reparto | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/contabilidad/proyectos/${proyectoId}/reparto`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setDatos)
      .catch(() => setError('No se pudo calcular el reparto'))
  }, [proyectoId])

  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (!datos) return <p className="text-sm text-muted-foreground">Cargando…</p>

  if (datos.reparto.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay socios registrados.</p>
  }

  return (
    <div className="max-w-sm overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Socio</TableHead>
            <TableHead>%</TableHead>
            <TableHead>Corresponde</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datos.reparto.map((r) => (
            <TableRow key={r.socio_id}>
              <TableCell>{r.nombre}</TableCell>
              <TableCell>{r.porcentaje_participacion}%</TableCell>
              <TableCell className="font-medium">
                {formatearCentavos(r.monto_correspondiente)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
