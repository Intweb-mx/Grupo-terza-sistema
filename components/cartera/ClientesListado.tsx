'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

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
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre…"
        className="w-full max-w-sm rounded border px-3 py-2 text-sm"
      />

      {filtrados.length === 0 && (
        <p className="text-sm text-gray-500">No hay clientes con esa búsqueda.</p>
      )}

      <div className="divide-y rounded border">
        {filtrados.map((c) => (
          <Link
            key={c.id}
            href={`/clientes/${c.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          >
            <span className="font-medium">
              {c.nombre} {c.apellidos}
            </span>
            <span className="text-xs text-gray-400">
              {c.saldo_pendiente === null ? 'Cartera: fase 5' : c.estado_pago}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
