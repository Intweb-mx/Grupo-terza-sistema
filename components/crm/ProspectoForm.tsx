'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
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
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <input
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="interes" className="text-sm font-medium">
          Interés
        </label>
        <input
          id="interes"
          value={interes}
          onChange={(e) => setInteres(e.target.value)}
          placeholder="Ej. casa en CDMX, 2-3 recámaras"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="fuente" className="text-sm font-medium">
          Fuente
        </label>
        <select
          id="fuente"
          value={fuente}
          onChange={(e) => setFuente(e.target.value as (typeof FUENTES)[number])}
          className="w-full rounded border px-3 py-2"
        >
          {FUENTES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {guardando ? 'Guardando…' : 'Crear prospecto'}
      </button>
    </form>
  )
}
