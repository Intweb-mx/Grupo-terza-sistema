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
        {ETAPAS.map((etapa) => (
          <div
            key={etapa}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => soltarEn(etapa)}
            className="min-h-[200px] rounded-lg border bg-muted/40 p-2"
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {ETIQUETA_ETAPA[etapa]}
            </p>
            <div className="space-y-2">
              {(porEtapa.get(etapa) ?? []).map((p) => (
                <Link
                  key={p.id}
                  href={`/prospectos/${p.id}`}
                  draggable
                  onDragStart={() => setArrastrando(p.id)}
                  className={`block rounded-lg border bg-card p-2.5 text-sm shadow-xs transition-colors hover:border-primary/40 ${
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
          </div>
        ))}
      </div>
    </div>
  )
}
