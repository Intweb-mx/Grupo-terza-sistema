'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
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

function iniciales(nombre: string, apellidos: string) {
  return `${nombre[0] ?? ''}${apellidos[0] ?? ''}`.toUpperCase()
}

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
        <div className="overflow-hidden rounded-[20px] border border-gray-200/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado de cuenta</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell className="p-0">
                    <Link href={`/clientes/${c.id}`} className="flex items-center gap-3 px-4 py-4">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {iniciales(c.nombre, c.apellidos)}
                      </span>
                      <span className="font-medium">
                        {c.nombre} {c.apellidos}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link href={`/clientes/${c.id}`} className="flex items-center px-4 py-4">
                      {c.estado_pago ? (
                        <Badge
                          variant="outline"
                          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          {c.estado_pago}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin datos de cobranza aún</span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="p-0">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="flex items-center justify-end px-4 py-4"
                    >
                      <ChevronRight className="size-4 text-muted-foreground" />
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
