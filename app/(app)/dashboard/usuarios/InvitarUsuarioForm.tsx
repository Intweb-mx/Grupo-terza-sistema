'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Check, ShieldCheck, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ROLES = ['dueno', 'socio', 'administrador', 'asesor', 'contador'] as const

const DESCRIPCION_ROL: Record<(typeof ROLES)[number], string> = {
  dueno: 'Acceso completo a todos los módulos del negocio.',
  socio: 'Ve contabilidad y reparto de utilidades por proyecto.',
  administrador: 'Gestiona propiedades, clientes, contratos y cobranza.',
  asesor: 'Gestiona prospectos, clientes y propiedades.',
  contador: 'Gestiona contabilidad, CFDI y cobranza.',
}

export function InvitarUsuarioForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState<(typeof ROLES)[number]>('asesor')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setEnviando(true)

    const res = await fetch('/api/usuarios/invitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, rol }),
    })

    setEnviando(false)

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'No se pudo invitar al usuario')
      return
    }

    toast.success(`Invitación enviada a ${email}`)
    setNombre('')
    setEmail('')
    setRol('asesor')
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_18rem]">
      <Card>
        <CardContent>
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserPlus className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Invitar a una persona</p>
            <p className="text-xs text-muted-foreground">Recibirá un correo para crear su contraseña.</p>
          </div>
        </div>
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

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rol">Rol</Label>
            <Select value={rol} onValueChange={(v) => setRol(v as (typeof ROLES)[number])}>
              <SelectTrigger id="rol" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
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

          <Button type="submit" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Invitar'}
          </Button>
        </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <p className="text-sm font-semibold">Acceso seguro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Un equipo más fuerte empieza con accesos bien definidos.
            </p>
          </div>
          <ul className="space-y-2 text-left text-xs">
            {[
              'Cada persona usa su propia cuenta',
              'El rol define qué información puede ver',
              'Puedes cambiar permisos más adelante',
            ].map((texto) => (
              <li key={texto} className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Check className="size-2.5" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-primary/5 p-3 text-left text-xs">
            <span className="font-semibold text-primary capitalize">{rol}</span>{' '}
            <span className="text-muted-foreground">· {DESCRIPCION_ROL[rol]}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
