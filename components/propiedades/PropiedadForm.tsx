'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { TIPOS_PROPIEDAD } from './constantes'

type PropiedadFormValues = {
  titulo: string
  tipo: string
  precio: string
  superficie_m2: string
  direccion: string
  ciudad: string
  descripcion: string
}

const VALORES_VACIOS: PropiedadFormValues = {
  titulo: '',
  tipo: TIPOS_PROPIEDAD[0],
  precio: '',
  superficie_m2: '',
  direccion: '',
  ciudad: '',
  descripcion: '',
}

export function PropiedadForm({
  propiedadId,
  valoresIniciales,
}: {
  propiedadId?: string
  valoresIniciales?: Partial<PropiedadFormValues>
}) {
  const router = useRouter()
  const [valores, setValores] = useState<PropiedadFormValues>({
    ...VALORES_VACIOS,
    ...valoresIniciales,
  })
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const esEdicion = Boolean(propiedadId)

  function actualizar<K extends keyof PropiedadFormValues>(campo: K, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setGuardando(true)

    const payload = {
      titulo: valores.titulo,
      tipo: valores.tipo,
      precio: Math.round(Number(valores.precio) * 100),
      superficie_m2: valores.superficie_m2 ? Number(valores.superficie_m2) : undefined,
      direccion: valores.direccion || undefined,
      ciudad: valores.ciudad,
      descripcion: valores.descripcion || undefined,
    }

    try {
      const res = await fetch(
        esEdicion ? `/api/propiedades/${propiedadId}` : '/api/propiedades',
        {
          method: esEdicion ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        setError('No se pudo guardar la propiedad')
        setGuardando(false)
        return
      }

      if (esEdicion) {
        router.push(`/propiedades/${propiedadId}`)
      } else {
        const { id } = await res.json()
        router.push(`/propiedades/${id}`)
      }
      router.refresh()
    } catch {
      setError('No se pudo guardar la propiedad')
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-1">
        <label htmlFor="titulo" className="text-sm font-medium">
          Título
        </label>
        <input
          id="titulo"
          required
          value={valores.titulo}
          onChange={(e) => actualizar('titulo', e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="tipo" className="text-sm font-medium">
            Tipo
          </label>
          <select
            id="tipo"
            value={valores.tipo}
            onChange={(e) => actualizar('tipo', e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            {TIPOS_PROPIEDAD.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="ciudad" className="text-sm font-medium">
            Ciudad
          </label>
          <input
            id="ciudad"
            required
            value={valores.ciudad}
            onChange={(e) => actualizar('ciudad', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="precio" className="text-sm font-medium">
            Precio (MXN)
          </label>
          <input
            id="precio"
            type="number"
            step="0.01"
            min="0"
            required
            value={valores.precio}
            onChange={(e) => actualizar('precio', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="superficie_m2" className="text-sm font-medium">
            Superficie (m²)
          </label>
          <input
            id="superficie_m2"
            type="number"
            step="0.01"
            min="0"
            value={valores.superficie_m2}
            onChange={(e) => actualizar('superficie_m2', e.target.value)}
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

      <div className="space-y-1">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={4}
          value={valores.descripcion}
          onChange={(e) => actualizar('descripcion', e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear propiedad'}
      </button>
    </form>
  )
}
