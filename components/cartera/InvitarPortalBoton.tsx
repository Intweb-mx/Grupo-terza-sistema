'use client'

import { useState } from 'react'

export function InvitarPortalBoton({ clienteId }: { clienteId: string }) {
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function invitar() {
    setMensaje(null)
    setEnviando(true)

    const res = await fetch(`/api/clientes/${clienteId}/invitar`, { method: 'POST' })
    const data = await res.json().catch(() => null)

    setEnviando(false)

    if (!res.ok) {
      setMensaje({ tipo: 'error', texto: data?.error ?? 'No se pudo invitar al cliente' })
      return
    }

    setMensaje({ tipo: 'ok', texto: `Invitación enviada a ${data.email}` })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={invitar}
        disabled={enviando}
        className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {enviando ? 'Enviando…' : 'Invitar al portal'}
      </button>
      {mensaje && (
        <span className={`text-xs ${mensaje.tipo === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
          {mensaje.texto}
        </span>
      )}
    </div>
  )
}
