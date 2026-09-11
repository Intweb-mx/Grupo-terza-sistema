'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'

export function ClienteForm() {
  const router = useRouter()
  const [valores, setValores] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rfc: '',
    direccion: '',
    ciudad: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function actualizar<K extends keyof typeof valores>(campo: K, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setGuardando(true)

    const payload = {
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      email: valores.email || undefined,
      telefono: valores.telefono || undefined,
      rfc: valores.rfc || undefined,
      direccion: valores.direccion || undefined,
      ciudad: valores.ciudad || undefined,
    }

    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('No se pudo guardar el cliente')
      setGuardando(false)
      return
    }

    const { id } = await res.json()
    router.push(`/clientes/${id}`)
    router.refresh()
  }

  return (
    <Card className="max-w-lg">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                required
                value={valores.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                required
                value={valores.apellidos}
                onChange={(e) => actualizar('apellidos', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={valores.email}
                onChange={(e) => actualizar('email', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={valores.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                value={valores.rfc}
                onChange={(e) => actualizar('rfc', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={valores.ciudad}
                onChange={(e) => actualizar('ciudad', e.target.value)}
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

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Crear cliente'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
