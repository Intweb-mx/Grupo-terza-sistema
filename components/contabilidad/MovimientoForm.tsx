'use client'

import { useRef, useState, type FormEvent } from 'react'

export function MovimientoForm({ onGuardado }: { onGuardado: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [referencia, setReferencia] = useState('')
  const [proyectoId, setProyectoId] = useState('')
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

    const res = await fetch('/api/contabilidad/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: proyectoId || undefined,
        tipo,
        categoria,
        descripcion: descripcion || undefined,
        monto: Math.round(Number(monto) * 100),
        fecha,
        referencia: referencia || undefined,
      }),
    })

    setGuardando(false)

    if (!res.ok) {
      setError('No se pudo registrar el movimiento')
      return
    }

    setCategoria('')
    setDescripcion('')
    setMonto('')
    setReferencia('')
    setProyectoId('')
    cerrar()
    onGuardado()
  }

  return (
    <>
      <button type="button" onClick={abrir} className="rounded bg-black px-3 py-1.5 text-sm text-white">
        Nuevo movimiento
      </button>

      <dialog ref={dialogRef} className="w-full max-w-sm rounded-lg border p-6 backdrop:bg-black/40">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold">Nuevo movimiento</h2>

          <div className="space-y-1">
            <label htmlFor="tipo" className="text-sm font-medium">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'ingreso' | 'egreso')}
              className="w-full rounded border px-3 py-2"
            >
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="categoria" className="text-sm font-medium">
              Categoría
            </label>
            <input
              id="categoria"
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej. renta oficina, cobranza"
              className="w-full rounded border px-3 py-2"
            />
          </div>

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
            <label htmlFor="proyecto_id" className="text-sm font-medium">
              ID de proyecto
              <span className="ml-1 font-normal text-gray-400">
                opcional — dejar vacío para gasto fijo del negocio
              </span>
            </label>
            <input
              id="proyecto_id"
              value={proyectoId}
              onChange={(e) => setProyectoId(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="descripcion" className="text-sm font-medium">
              Descripción
            </label>
            <input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
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
