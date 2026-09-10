'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ETAPAS, ETIQUETA_ETAPA, FUENTES } from './constantes'

type Prospecto = {
  id: string
  nombre: string
  telefono: string | null
  etapa: string | null
  asesor_id: string | null
  interes: string | null
  ultima_interaccion: string | null
}

export function KanbanProspectos({ prospectos }: { prospectos: Prospecto[] }) {
  const router = useRouter()
  const [fuente, setFuente] = useState('')
  const [arrastrando, setArrastrando] = useState<string | null>(null)
  const [moviendo, setMoviendo] = useState<string | null>(null)

  // El filtro de fuente no viene en la fila del prospecto (GET /api/prospectos
  // ya lo permite como query param) — se refetchea el listado al cambiarlo.
  async function cambiarFuente(valor: string) {
    setFuente(valor)
    const url = valor ? `/prospectos?fuente=${valor}` : '/prospectos'
    router.push(url)
  }

  async function soltarEn(etapa: string) {
    if (!arrastrando) return
    const prospectoId = arrastrando
    setArrastrando(null)

    const prospecto = prospectos.find((p) => p.id === prospectoId)
    if (!prospecto || prospecto.etapa === etapa) return

    setMoviendo(prospectoId)
    const res = await fetch(`/api/prospectos/${prospectoId}/etapa`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etapa }),
    })
    setMoviendo(null)

    if (res.ok) router.refresh()
  }

  const porEtapa = useMemo(() => {
    const mapa = new Map<string, Prospecto[]>()
    for (const etapa of ETAPAS) mapa.set(etapa, [])
    for (const p of prospectos) {
      const lista = mapa.get(p.etapa ?? 'nuevo')
      if (lista) lista.push(p)
    }
    return mapa
  }, [prospectos])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-4 text-sm text-gray-600">
          {ETAPAS.map((etapa) => (
            <span key={etapa}>
              {ETIQUETA_ETAPA[etapa]}: <strong>{porEtapa.get(etapa)?.length ?? 0}</strong>
            </span>
          ))}
        </div>

        <select
          value={fuente}
          onChange={(e) => cambiarFuente(e.target.value)}
          className="ml-auto rounded border px-2 py-1 text-sm"
        >
          <option value="">Todas las fuentes</option>
          {FUENTES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-3 lg:grid-cols-6">
        {ETAPAS.map((etapa) => (
          <div
            key={etapa}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => soltarEn(etapa)}
            className="min-h-[200px] rounded border bg-gray-50 p-2"
          >
            <p className="mb-2 text-xs font-medium text-gray-500">{ETIQUETA_ETAPA[etapa]}</p>
            <div className="space-y-2">
              {(porEtapa.get(etapa) ?? []).map((p) => (
                <a
                  key={p.id}
                  href={`/prospectos/${p.id}`}
                  draggable
                  onDragStart={() => setArrastrando(p.id)}
                  className={`block rounded border bg-white p-2 text-sm shadow-sm hover:border-gray-400 ${
                    moviendo === p.id ? 'opacity-50' : ''
                  }`}
                >
                  <p className="font-medium">{p.nombre}</p>
                  {p.interes && <p className="text-xs text-gray-500">{p.interes}</p>}
                  {p.telefono && <p className="text-xs text-gray-400">{p.telefono}</p>}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
