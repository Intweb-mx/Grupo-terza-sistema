'use client'

import { useState, type FormEvent } from 'react'

const ROLES = ['dueno', 'socio', 'administrador', 'asesor', 'contador'] as const

export function InvitarUsuarioForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState<(typeof ROLES)[number]>('asesor')
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMensaje(null)
    setEnviando(true)

    const res = await fetch('/api/usuarios/invitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, rol }),
    })

    setEnviando(false)

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setMensaje({ tipo: 'error', texto: data?.error ?? 'No se pudo invitar al usuario' })
      return
    }

    setMensaje({ tipo: 'ok', texto: `Invitación enviada a ${email}` })
    setNombre('')
    setEmail('')
    setRol('asesor')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-1">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="rol" className="text-sm font-medium">
          Rol
        </label>
        <select
          id="rol"
          value={rol}
          onChange={(e) => setRol(e.target.value as (typeof ROLES)[number])}
          className="w-full rounded border px-3 py-2"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {mensaje && (
        <p className={`text-sm ${mensaje.tipo === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {enviando ? 'Enviando…' : 'Invitar'}
      </button>
    </form>
  )
}
