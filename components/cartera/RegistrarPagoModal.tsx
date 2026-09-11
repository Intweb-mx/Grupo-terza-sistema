'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
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

const METODOS_PAGO = ['efectivo', 'transferencia', 'cheque', 'tarjeta'] as const

export function RegistrarPagoModal({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)

  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [referencia, setReferencia] = useState('')
  const [metodoPago, setMetodoPago] = useState<(typeof METODOS_PAGO)[number]>('transferencia')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setGuardando(true)

    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_id: clienteId,
        monto: Math.round(Number(monto) * 100),
        fecha,
        referencia: referencia || undefined,
        metodo_pago: metodoPago,
      }),
    })

    setGuardando(false)

    if (!res.ok) {
      setError('No se pudo registrar el pago')
      return
    }

    setMonto('')
    setReferencia('')
    setAbierto(false)
    toast.success('Pago registrado')
    router.refresh()
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button onClick={() => setError(null)}>Registrar pago</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
          </DialogHeader>

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
            <Label htmlFor="metodo_pago">Método de pago</Label>
            <Select
              value={metodoPago}
              onValueChange={(v) => setMetodoPago(v as (typeof METODOS_PAGO)[number])}
            >
              <SelectTrigger id="metodo_pago" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METODOS_PAGO.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
