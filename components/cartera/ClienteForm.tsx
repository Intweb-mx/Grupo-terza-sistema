'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export function ClienteForm() {
  const router = useRouter()
  const [valores, setValores] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rfc: '',
    direccion: '',
    ciudad: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function actualizar<K extends keyof typeof valores>(campo: K, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setGuardando(true)

    const payload = {
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      email: valores.email || undefined,
      telefono: valores.telefono || undefined,
      rfc: valores.rfc || undefined,
      direccion: valores.direccion || undefined,
      ciudad: valores.ciudad || undefined,
    }

    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('No se pudo guardar el cliente')
      setGuardando(false)
      return
    }

    const { id } = await res.json()
    router.push(`/clientes/${id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="nombre" className="text-sm font-medium">
            Nombre
          </label>
          <input
            id="nombre"
            required
            value={valores.nombre}
            onChange={(e) => actualizar('nombre', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="apellidos" className="text-sm font-medium">
            Apellidos
          </label>
          <input
            id="apellidos"
            required
            value={valores.apellidos}
            onChange={(e) => actualizar('apellidos', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Correo
          </label>
          <input
            id="email"
            type="email"
            value={valores.email}
            onChange={(e) => actualizar('email', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <input
            id="telefono"
            value={valores.telefono}
            onChange={(e) => actualizar('telefono', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="rfc" className="text-sm font-medium">
            RFC
          </label>
          <input
            id="rfc"
            value={valores.rfc}
            onChange={(e) => actualizar('rfc', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="ciudad" className="text-sm font-medium">
            Ciudad
          </label>
          <input
            id="ciudad"
            value={valores.ciudad}
            onChange={(e) => actualizar('ciudad', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="direccion" className="text-sm font-medium">
          Dirección
        </label>
        <input
          id="direccion"
          value={valores.direccion}
          onChange={(e) => actualizar('direccion', e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {guardando ? 'Guardando…' : 'Crear cliente'}
      </button>
    </form>
  )
}
