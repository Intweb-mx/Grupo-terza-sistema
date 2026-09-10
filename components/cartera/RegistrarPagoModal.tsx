'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const METODOS_PAGO = ['efectivo', 'transferencia', 'cheque', 'tarjeta'] as const

export function RegistrarPagoModal({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [referencia, setReferencia] = useState('')
  const [metodoPago, setMetodoPago] = useState<(typeof METODOS_PAGO)[number]>('transferencia')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function abrir() {
    setError(null)
    dialogRef.current?.showModal()
  }

  function cerrar() {
    dialogRef.current?.close()
  }

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
    cerrar()
    router.refresh()
  }

  return (
    <>
      <button type="button" onClick={abrir} className="rounded bg-black px-3 py-1.5 text-sm text-white">
        Registrar pago
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-sm rounded-lg border p-6 backdrop:bg-black/40"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold">Registrar pago</h2>

          <div className="space-y-1">
            <label htmlFor="monto" className="text-sm font-medium">
              Monto (MXN)
            </label>
            <input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="fecha" className="text-sm font-medium">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="metodo_pago" className="text-sm font-medium">
              Método de pago
            </label>
            <select
              id="metodo_pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as (typeof METODOS_PAGO)[number])}
              className="w-full rounded border px-3 py-2"
            >
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="referencia" className="text-sm font-medium">
              Referencia
            </label>
            <input
              id="referencia"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={cerrar} className="rounded border px-4 py-2 text-sm">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {guardando ? 'Guardando…' : 'Registrar'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
