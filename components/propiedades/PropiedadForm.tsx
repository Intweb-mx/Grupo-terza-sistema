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
}

const VALORES_VACIOS: PropiedadFormValues = {
  titulo: '',
  tipo: TIPOS_PROPIEDAD[0],
  precio: '',
  superficie_m2: '',
  direccion: '',
  ciudad: '',
  descripcion: '',
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

    const payload = {
      titulo: valores.titulo,
      tipo: valores.tipo,
      precio: Math.round(Number(valores.precio) * 100),
      superficie_m2: valores.superficie_m2 ? Number(valores.superficie_m2) : undefined,
      direccion: valores.direccion || undefined,
      ciudad: valores.ciudad,
      descripcion: valores.descripcion || undefined,
    }

    try {
      const res = await fetch(
        esEdicion ? `/api/propiedades/${propiedadId}` : '/api/propiedades',
        {
          method: esEdicion ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        setError('No se pudo guardar la propiedad')
        setGuardando(false)
        return
      }

      if (esEdicion) {
        router.push(`/propiedades/${propiedadId}`)
      } else {
        const { id } = await res.json()
        router.push(`/propiedades/${id}`)
      }
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
