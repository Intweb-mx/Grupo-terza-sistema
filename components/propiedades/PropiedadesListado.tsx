'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, MapPin } from 'lucide-react'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const TODOS = 'todos'

export function PropiedadesListado({ propiedades }: { propiedades: Propiedad[] }) {
  const [vista, setVista] = useState<'lista' | 'mapa'>('lista')
  const [tipo, setTipo] = useState(TODOS)
  const [ciudad, setCiudad] = useState('')
  const [estado, setEstado] = useState(TODOS)
  const [precioMax, setPrecioMax] = useState('')

  const filtradas = useMemo(() => {
    return propiedades.filter((p) => {
      if (tipo !== TODOS && p.tipo !== tipo) return false
      if (estado !== TODOS && p.estado_disponibilidad !== estado) return false
      if (ciudad && !p.ciudad.toLowerCase().includes(ciudad.toLowerCase())) return false
      if (precioMax && p.precio > Number(precioMax) * 100) return false
      return true
    })
  }, [propiedades, tipo, ciudad, estado, precioMax])

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-end gap-4 p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              {TIPOS_PROPIEDAD.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Ciudad</Label>
          <Input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ciudad"
            className="h-8 w-40"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Disponibilidad</Label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {ESTADOS_DISPONIBILIDAD.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Precio máximo (MXN)</Label>
          <Input
            type="number"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            placeholder="Sin límite"
            className="h-8 w-36"
          />
        </div>

        <Tabs
          value={vista}
          onValueChange={(v) => setVista(v as 'lista' | 'mapa')}
          className="ml-auto"
        >
          <TabsList>
            <TabsTrigger value="lista" className="gap-1.5">
              <LayoutGrid className="size-3.5" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="mapa" className="gap-1.5">
              <MapPin className="size-3.5" />
              Mapa
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      {filtradas.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay propiedades con esos filtros.</p>
      )}

      {vista === 'lista' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((p) => (
            <Link key={p.id} href={`/propiedades/${p.id}`}>
              <Card className="gap-3 overflow-hidden py-0 transition-shadow hover:shadow-md">
                <div className="aspect-video w-full bg-muted">
                  {p.imagen_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagen_url}
                      alt={p.titulo}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-2 px-4 pb-4">
                  <p className="font-medium">{p.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.tipo} · {p.ciudad}
                    {p.superficie_m2 ? ` · ${p.superficie_m2} m²` : ''}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{formatearCentavos(p.precio)}</span>
                    <Badge
                      variant="outline"
                      className={COLOR_POR_ESTADO[p.estado_disponibilidad ?? ''] ?? ''}
                    >
                      {p.estado_disponibilidad ?? 'sin estado'}
                    </Badge>
                  </div>
                </div>
              </Card>
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
              className={`flex aspect-square flex-col items-center justify-center rounded-lg border p-1 text-center text-[10px] leading-tight transition-transform hover:scale-105 ${
                COLOR_POR_ESTADO[p.estado_disponibilidad ?? ''] ?? 'bg-muted text-muted-foreground'
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
