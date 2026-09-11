'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function ReestructurarBoton({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{
    cuotas_generadas: number
    interes_aplicado: string
  } | null>(null)
  const [procesando, setProcesando] = useState(false)

  function abrir() {
    setError(null)
    setResultado(null)
    setAbierto(true)
  }

  function cerrar() {
    setAbierto(false)
    if (resultado) router.refresh()
  }

  async function confirmar() {
    setError(null)
    setProcesando(true)

    const res = await fetch(`/api/clientes/${clienteId}/reestructura`, { method: 'POST' })
    const data = await res.json().catch(() => null)

    setProcesando(false)

    if (!res.ok) {
      setError(data?.error ?? 'No se pudo reestructurar')
      return
    }

    setResultado(data)
  }

  return (
    <Dialog open={abierto} onOpenChange={(v) => (v ? abrir() : cerrar())}>
      <DialogTrigger asChild>
        <Button variant="outline">Reestructurar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reestructurar adeudo</DialogTitle>
        </DialogHeader>

        {!resultado && (
          <p className="text-sm text-muted-foreground">
            Genera un nuevo calendario con interés del 3% mensual sobre el saldo insoluto. Solo
            procede si el plazo original ya venció. Esta acción no se puede deshacer.
          </p>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resultado && (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertDescription>
              Nuevo calendario generado: {resultado.cuotas_generadas} cuotas,{' '}
              {resultado.interes_aplicado}.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={cerrar}>
            {resultado ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!resultado && (
            <Button onClick={confirmar} disabled={procesando}>
              {procesando ? 'Procesando…' : 'Confirmar reestructura'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
