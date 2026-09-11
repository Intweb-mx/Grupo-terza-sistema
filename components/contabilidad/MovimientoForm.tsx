'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Proyecto = { id: string; nombre: string }

const SIN_PROYECTO = 'sin_proyecto'

export function MovimientoForm({
  onGuardado,
  proyectos,
}: {
  onGuardado: () => void
  proyectos: Proyecto[]
}) {
  const [abierto, setAbierto] = useState(false)

  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [referencia, setReferencia] = useState('')
  const [proyectoId, setProyectoId] = useState(SIN_PROYECTO)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setGuardando(true)

    const res = await fetch('/api/contabilidad/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: proyectoId === SIN_PROYECTO ? undefined : proyectoId,
        tipo,
        categoria,
        descripcion: descripcion || undefined,
        monto: Math.round(Number(monto) * 100),
        fecha,
        referencia: referencia || undefined,
      }),
    })

    setGuardando(false)

    if (!res.ok) {
      setError('No se pudo registrar el movimiento')
      return
    }

    setCategoria('')
    setDescripcion('')
    setMonto('')
    setReferencia('')
    setProyectoId(SIN_PROYECTO)
    setAbierto(false)
    toast.success('Movimiento registrado')
    onGuardado()
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button onClick={() => setError(null)}>Nuevo movimiento</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Nuevo movimiento</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as 'ingreso' | 'egreso')}>
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingreso">Ingreso</SelectItem>
                <SelectItem value="egreso">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoría</Label>
            <Input
              id="categoria"
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej. renta oficina, cobranza"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monto">Monto (MXN)</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proyecto_id">
              Proyecto
              <span className="font-normal text-muted-foreground">
                {' '}
                · dejar en blanco para gasto fijo del negocio
              </span>
            </Label>
            <Select value={proyectoId} onValueChange={setProyectoId}>
              <SelectTrigger id="proyecto_id" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_PROYECTO}>Sin proyecto</SelectItem>
                {proyectos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="referencia">Referencia</Label>
            <Input
              id="referencia"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
