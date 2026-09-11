'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FUENTES } from './constantes'

export function ProspectoForm() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [interes, setInteres] = useState('')
  const [fuente, setFuente] = useState<(typeof FUENTES)[number]>('directo')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setGuardando(true)

    const res = await fetch('/api/prospectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        telefono: telefono || undefined,
        email: email || undefined,
        interes: interes || undefined,
        fuente,
      }),
    })

    setGuardando(false)

    if (!res.ok) {
      setError('No se pudo guardar el prospecto')
      return
    }

    router.push('/prospectos')
    router.refresh()
  }

  return (
    <Card className="max-w-lg">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interes">Interés</Label>
            <Input
              id="interes"
              value={interes}
              onChange={(e) => setInteres(e.target.value)}
              placeholder="Ej. casa en CDMX, 2-3 recámaras"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fuente">Fuente</Label>
            <Select value={fuente} onValueChange={(v) => setFuente(v as (typeof FUENTES)[number])}>
              <SelectTrigger id="fuente" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUENTES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Crear prospecto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
