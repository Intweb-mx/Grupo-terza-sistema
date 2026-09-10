'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export function ReestructurarBoton({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{
    cuotas_generadas: number
    interes_aplicado: string
  } | null>(null)
  const [procesando, setProcesando] = useState(false)

  function abrir() {
    setError(null)
    setResultado(null)
    dialogRef.current?.showModal()
  }

  function cerrar() {
    dialogRef.current?.close()
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
    <>
      <button type="button" onClick={abrir} className="rounded border px-3 py-1.5 text-sm">
        Reestructurar
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-sm rounded-lg border p-6 backdrop:bg-black/40"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Reestructurar adeudo</h2>

          {!resultado && (
            <p className="text-sm text-gray-600">
              Genera un nuevo calendario con interés del 3% mensual sobre el saldo insoluto.
              Solo procede si el plazo original ya venció. Esta acción no se puede deshacer.
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {resultado && (
            <p className="text-sm text-green-700">
              Nuevo calendario generado: {resultado.cuotas_generadas} cuotas,{' '}
              {resultado.interes_aplicado}.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={cerrar} className="rounded border px-4 py-2 text-sm">
              {resultado ? 'Cerrar' : 'Cancelar'}
            </button>
            {!resultado && (
              <button
                type="button"
                onClick={confirmar}
                disabled={procesando}
                className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {procesando ? 'Procesando…' : 'Confirmar reestructura'}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
