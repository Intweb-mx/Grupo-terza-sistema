'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatearCentavos } from '@/lib/utils/moneda'
import { COLOR_POR_ESTADO, ESTADOS_DISPONIBILIDAD, TIPOS_PROPIEDAD } from './constantes'

type Propiedad = {
  id: string
  titulo: string
  precio: number
  superficie_m2: number | null
  tipo: string
  ciudad: string
  estado_disponibilidad: string | null
  imagen_url: string | null
  lote_id?: string | null
}

export function PropiedadesListado({ propiedades }: { propiedades: Propiedad[] }) {
  const [vista, setVista] = useState<'lista' | 'mapa'>('lista')
  const [tipo, setTipo] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [estado, setEstado] = useState('')
  const [precioMax, setPrecioMax] = useState('')

  const filtradas = useMemo(() => {
    return propiedades.filter((p) => {
      if (tipo && p.tipo !== tipo) return false
      if (estado && p.estado_disponibilidad !== estado) return false
      if (ciudad && !p.ciudad.toLowerCase().includes(ciudad.toLowerCase())) return false
      if (precioMax && p.precio > Number(precioMax) * 100) return false
      return true
    })
  }, [propiedades, tipo, ciudad, estado, precioMax])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="">Todos</option>
            {TIPOS_PROPIEDAD.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">Ciudad</label>
          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
            placeholder="Ciudad"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">Disponibilidad</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="">Todas</option>
            {ESTADOS_DISPONIBILIDAD.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">Precio máximo (MXN)</label>
          <input
            type="number"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
            placeholder="Sin límite"
          />
        </div>

        <div className="ml-auto flex gap-1 rounded border p-1 text-sm">
          <button
            type="button"
            onClick={() => setVista('lista')}
            className={`rounded px-2 py-1 ${vista === 'lista' ? 'bg-gray-900 text-white' : ''}`}
          >
            Lista
          </button>
          <button
            type="button"
            onClick={() => setVista('mapa')}
            className={`rounded px-2 py-1 ${vista === 'mapa' ? 'bg-gray-900 text-white' : ''}`}
          >
            Mapa de lotes
          </button>
        </div>
      </div>

      {filtradas.length === 0 && (
        <p className="text-sm text-gray-500">No hay propiedades con esos filtros.</p>
      )}

      {vista === 'lista' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((p) => (
            <Link
              key={p.id}
              href={`/propiedades/${p.id}`}
              className="block rounded border p-4 hover:border-gray-400"
            >
              {p.imagen_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imagen_url}
                  alt={p.titulo}
                  className="mb-3 h-36 w-full rounded object-cover"
                />
              )}
              <p className="font-medium">{p.titulo}</p>
              <p className="text-sm text-gray-500">
                {p.tipo} · {p.ciudad}
                {p.superficie_m2 ? ` · ${p.superficie_m2} m²` : ''}
              </p>
              <p className="mt-1 font-semibold">{formatearCentavos(p.precio)}</p>
              <span
                className={`mt-2 inline-block rounded border px-2 py-0.5 text-xs ${
                  COLOR_POR_ESTADO[p.estado_disponibilidad ?? ''] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {p.estado_disponibilidad ?? 'sin estado'}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {filtradas.map((p) => (
            <Link
              key={p.id}
              href={`/propiedades/${p.id}`}
              title={`${p.titulo} — ${p.estado_disponibilidad ?? 'sin estado'}`}
              className={`flex aspect-square flex-col items-center justify-center rounded border p-1 text-center text-[10px] leading-tight ${
                COLOR_POR_ESTADO[p.estado_disponibilidad ?? ''] ?? 'bg-gray-100 text-gray-700'
              }`}
            >
              {p.lote_id ?? p.titulo.slice(0, 8)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
