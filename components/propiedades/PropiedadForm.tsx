'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { TIPOS_PROPIEDAD } from './constantes'

type PropiedadFormValues = {
  titulo: string
  tipo: string
  precio: string
  superficie_m2: string
  direccion: string
  ciudad: string
  descripcion: string
  imagen_url: string
}

const VALORES_VACIOS: PropiedadFormValues = {
  titulo: '',
  tipo: TIPOS_PROPIEDAD[0],
  precio: '',
  superficie_m2: '',
  direccion: '',
  ciudad: '',
  descripcion: '',
  imagen_url: '',
}

export function PropiedadForm({
  propiedadId,
  valoresIniciales,
}: {
  propiedadId?: string
  valoresIniciales?: Partial<PropiedadFormValues>
}) {
  const router = useRouter()
  const [valores, setValores] = useState<PropiedadFormValues>({
    ...VALORES_VACIOS,
    ...valoresIniciales,
  })
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const esEdicion = Boolean(propiedadId)

  function actualizar<K extends keyof PropiedadFormValues>(campo: K, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setGuardando(true)

    // imagen_url no es parte del contrato de creación (POST /api/propiedades)
    // — se manda solo en el PUT, que ya acepta cualquier campo por diseño.
    // Al crear, primero se da de alta y después se setea la imagen en un
    // segundo PUT, en vez de tocar el contrato de creación.
    const payloadBase = {
      titulo: valores.titulo,
      tipo: valores.tipo,
      precio: Math.round(Number(valores.precio) * 100),
      superficie_m2: valores.superficie_m2 ? Number(valores.superficie_m2) : undefined,
      direccion: valores.direccion || undefined,
      ciudad: valores.ciudad,
      descripcion: valores.descripcion || undefined,
    }

    try {
      if (esEdicion) {
        const res = await fetch(`/api/propiedades/${propiedadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payloadBase, imagen_url: valores.imagen_url || undefined }),
        })
        if (!res.ok) {
          setError('No se pudo guardar la propiedad')
          setGuardando(false)
          return
        }
        router.push(`/propiedades/${propiedadId}`)
        router.refresh()
        return
      }

      const res = await fetch('/api/propiedades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBase),
      })
      if (!res.ok) {
        setError('No se pudo guardar la propiedad')
        setGuardando(false)
        return
      }
      const { id } = await res.json()

      if (valores.imagen_url) {
        await fetch(`/api/propiedades/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagen_url: valores.imagen_url }),
        })
      }

      router.push(`/propiedades/${id}`)
      router.refresh()
    } catch {
      setError('No se pudo guardar la propiedad')
      setGuardando(false)
    }
  }

  return (
    <Card className="max-w-lg">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              required
              value={valores.titulo}
              onChange={(e) => actualizar('titulo', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={valores.tipo} onValueChange={(v) => actualizar('tipo', v)}>
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PROPIEDAD.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                required
                value={valores.ciudad}
                onChange={(e) => actualizar('ciudad', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="precio">Precio (MXN)</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                required
                value={valores.precio}
                onChange={(e) => actualizar('precio', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="superficie_m2">Superficie (m²)</Label>
              <Input
                id="superficie_m2"
                type="number"
                step="0.01"
                min="0"
                value={valores.superficie_m2}
                onChange={(e) => actualizar('superficie_m2', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={valores.direccion}
              onChange={(e) => actualizar('direccion', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imagen_url">
              URL de imagen
              <span className="font-normal text-muted-foreground"> · opcional</span>
            </Label>
            <Input
              id="imagen_url"
              type="url"
              placeholder="https://…"
              value={valores.imagen_url}
              onChange={(e) => actualizar('imagen_url', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              rows={4}
              value={valores.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear propiedad'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
