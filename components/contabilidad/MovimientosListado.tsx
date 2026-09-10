'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { formatearCentavos } from '@/lib/utils/moneda'

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

export function MovimientosListado({ recargar }: { recargar: number }) {
  const [proyectoId, setProyectoId] = useState('')
  const [movimientos, setMovimientos] = useState<Movimiento[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    const url = proyectoId
      ? `/api/contabilidad/movimientos?proyecto_id=${proyectoId}`
      : '/api/contabilidad/movimientos'
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
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Filtrar por ID de proyecto
          </label>
          <input
            value={proyectoId}
            onChange={(e) => setProyectoId(e.target.value)}
            placeholder="Todos los proyectos"
            className="rounded border px-2 py-1 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {movimientos === null ? (
        <p className="text-sm text-gray-500">Cargando…</p>
      ) : movimientos.length === 0 ? (
        <p className="text-sm text-gray-500">Sin movimientos todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Descripción</th>
                <th className="px-3 py-2">Monto</th>
                <th className="px-3 py-2">Proyecto</th>
                <th className="px-3 py-2">CFDI</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td className="px-3 py-2">{m.fecha}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        m.tipo === 'ingreso' ? 'text-green-700' : 'text-red-700'
                      }
                    >
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-3 py-2">{m.categoria}</td>
                  <td className="px-3 py-2">{m.descripcion ?? '—'}</td>
                  <td className="px-3 py-2 font-medium">{formatearCentavos(m.monto)}</td>
                  <td className="px-3 py-2">
                    {m.proyecto_id ? (
                      <Link
                        href={`/contabilidad/proyectos/${m.proyecto_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {m.proyecto_id.slice(0, 8)}…
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2">{m.cfdi_estado ?? 'sin timbrar'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
