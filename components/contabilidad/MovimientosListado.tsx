'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { formatearCentavos } from '@/lib/utils/moneda'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Movimiento = {
  id: string
  proyecto_id: string | null
  tipo: 'ingreso' | 'egreso'
  categoria: string
  descripcion: string | null
  monto: number
  fecha: string
  referencia: string | null
  cfdi_uuid: string | null
  cfdi_estado: string | null
}

type Proyecto = { id: string; nombre: string }

const TODOS = 'todos'

export function MovimientosListado({
  recargar,
  proyectos,
}: {
  recargar: number
  proyectos: Proyecto[]
}) {
  const [proyectoId, setProyectoId] = useState(TODOS)
  const [movimientos, setMovimientos] = useState<Movimiento[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const nombreProyecto = (id: string) => proyectos.find((p) => p.id === id)?.nombre ?? id.slice(0, 8)

  const cargar = useCallback(async () => {
    const url =
      proyectoId === TODOS
        ? '/api/contabilidad/movimientos'
        : `/api/contabilidad/movimientos?proyecto_id=${proyectoId}`
    const res = await fetch(url)
    if (!res.ok) {
      setError('No se pudieron cargar los movimientos')
      return
    }
    setError(null)
    setMovimientos(await res.json())
  }, [proyectoId])

  useEffect(() => {
    // Fetch-on-mount simple: sin librería de data-fetching en el proyecto
    // todavía, el setState async dentro de cargar() es seguro acá.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [cargar, recargar])

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Proyecto</label>
        <Select value={proyectoId} onValueChange={setProyectoId}>
          <SelectTrigger size="sm" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los proyectos</SelectItem>
            {proyectos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {movimientos === null ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : movimientos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin movimientos todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>CFDI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.fecha}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        m.tipo === 'ingreso'
                          ? 'border-green-300 bg-green-100 text-green-800'
                          : 'border-red-300 bg-red-100 text-red-800'
                      }
                    >
                      {m.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.categoria}</TableCell>
                  <TableCell>{m.descripcion ?? '—'}</TableCell>
                  <TableCell className="font-medium">{formatearCentavos(m.monto)}</TableCell>
                  <TableCell>
                    {m.proyecto_id ? (
                      <Link
                        href={`/contabilidad/proyectos/${m.proyecto_id}`}
                        className="text-primary hover:underline"
                      >
                        {nombreProyecto(m.proyecto_id)}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{m.cfdi_estado ?? 'sin timbrar'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
