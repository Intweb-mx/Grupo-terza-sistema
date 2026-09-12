'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ETAPAS, ETIQUETA_ETAPA, FUENTES } from './constantes'

const TODAS = 'todas'

const ACENTO_ETAPA: Record<string, { punto: string; borde: string }> = {
  nuevo: { punto: 'bg-blue-500', borde: 'hover:border-blue-300' },
  contactado: { punto: 'bg-sky-500', borde: 'hover:border-sky-300' },
  interesado: { punto: 'bg-violet-500', borde: 'hover:border-violet-300' },
  negociacion: { punto: 'bg-orange-500', borde: 'hover:border-orange-300' },
  cerrado: { punto: 'bg-emerald-500', borde: 'hover:border-emerald-300' },
  perdido: { punto: 'bg-red-400', borde: 'hover:border-red-300' },
}

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
  const fuenteActual = useSearchParams().get('fuente') ?? TODAS
  const [arrastrando, setArrastrando] = useState<string | null>(null)
  const [moviendo, setMoviendo] = useState<string | null>(null)

  // El filtro de fuente no viene en la fila del prospecto (GET /api/prospectos
  // ya lo permite como query param) — se refetchea el listado al cambiarlo.
  function cambiarFuente(valor: string) {
    router.push(valor === TODAS ? '/prospectos' : `/prospectos?fuente=${valor}`)
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
        <div className="flex flex-wrap gap-2">
          {ETAPAS.map((etapa) => (
            <Badge key={etapa} variant="secondary" className="font-normal">
              {ETIQUETA_ETAPA[etapa]}: {porEtapa.get(etapa)?.length ?? 0}
            </Badge>
          ))}
        </div>

        <Select value={fuenteActual} onValueChange={cambiarFuente}>
          <SelectTrigger size="sm" className="ml-auto w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todas las fuentes</SelectItem>
            {FUENTES.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-3 lg:grid-cols-6">
        {ETAPAS.map((etapa) => {
          const acento = ACENTO_ETAPA[etapa]
          const prospectosEtapa = porEtapa.get(etapa) ?? []
          return (
            <div
              key={etapa}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => soltarEn(etapa)}
              className="min-h-[220px] rounded-[18px] border border-gray-200/70 bg-white p-3"
            >
              <div className="mb-3 flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${acento.punto}`} />
                <p className="text-xs font-semibold text-foreground">{ETIQUETA_ETAPA[etapa]}</p>
                <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {prospectosEtapa.length}
                </span>
              </div>

              {prospectosEtapa.length === 0 ? (
                <p className="px-1 text-center text-[11px] leading-snug text-muted-foreground">
                  Arrastra aquí los prospectos {etapa === 'nuevo' ? '' : `en ${ETIQUETA_ETAPA[etapa].toLowerCase()}`}.
                </p>
              ) : (
                <div className="space-y-2">
                  {prospectosEtapa.map((p) => (
                    <Link
                      key={p.id}
                      href={`/prospectos/${p.id}`}
                      draggable
                      onDragStart={() => setArrastrando(p.id)}
                      className={`block rounded-xl border border-gray-200/70 bg-white p-2.5 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-200 hover:shadow-[0_4px_12px_-4px_rgba(15,23,42,0.15)] ${acento.borde} ${
                        moviendo === p.id ? 'opacity-50' : ''
                      }`}
                    >
                      <p className="font-medium">{p.nombre}</p>
                      {p.interes && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {p.interes}
                        </p>
                      )}
                      {p.telefono && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="size-3" />
                          {p.telefono}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
