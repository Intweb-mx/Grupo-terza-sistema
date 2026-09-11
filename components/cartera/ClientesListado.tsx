'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Cliente = {
  id: string
  nombre: string
  apellidos: string
  saldo_pendiente: number | null
  proxima_fecha_corte: string | null
  estado_pago: string | null
}

export function ClientesListado({ clientes }: { clientes: Cliente[] }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter((c) => `${c.nombre} ${c.apellidos}`.toLowerCase().includes(q))
  }, [clientes, busqueda])

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre…"
          className="pl-8"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay clientes con esa búsqueda.</p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado de cuenta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell className="p-0">
                    <Link href={`/clientes/${c.id}`} className="block px-4 py-3 font-medium">
                      {c.nombre} {c.apellidos}
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link href={`/clientes/${c.id}`} className="flex px-4 py-3">
                      {c.estado_pago ? (
                        <Badge variant="outline">{c.estado_pago}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Ver detalle</span>
                      )}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
