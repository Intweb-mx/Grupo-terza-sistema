'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

const TIPOS = ['llamada', 'visita', 'whatsapp', 'email', 'reunion'] as const

export function InteraccionForm({ prospectoId }: { prospectoId: string }) {
  const router = useRouter()
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>('llamada')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mensajeOk, setMensajeOk] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMensajeOk(false)
    setGuardando(true)

    const res = await fetch(`/api/prospectos/${prospectoId}/interaccion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, notas: notas || undefined }),
    })

    setGuardando(false)

    if (!res.ok) {
      setError('No se pudo guardar la interacción')
      return
    }

    setNotas('')
    setMensajeOk(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="tipo" className="text-sm font-medium">
            Tipo
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as (typeof TIPOS)[number])}
            className="w-full rounded border px-3 py-2"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="notas" className="text-sm font-medium">
          Notas
        </label>
        <textarea
          id="notas"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {mensajeOk && <p className="text-sm text-green-700">Interacción registrada.</p>}

      <button
        type="submit"
        disabled={guardando}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {guardando ? 'Guardando…' : 'Registrar interacción'}
      </button>
    </form>
  )
}
