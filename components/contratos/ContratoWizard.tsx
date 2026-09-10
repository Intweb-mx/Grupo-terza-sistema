'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { formatearCentavos } from '@/lib/utils/moneda'

type Cliente = { id: string; nombre: string; apellidos: string }
type Propiedad = { id: string; titulo: string; ciudad: string; precio: number }

const TIPOS_CONTRATO = ['compraventa', 'arrendamiento', 'renta_temporal'] as const

const PASOS = ['Cliente', 'Propiedad', 'Términos', 'Confirmar'] as const

export function ContratoWizard({
  clientes,
  propiedades,
  clienteIdInicial,
}: {
  clientes: Cliente[]
  propiedades: Propiedad[]
  clienteIdInicial?: string
}) {
  const router = useRouter()
  const [paso, setPaso] = useState(0)

  const [clienteId, setClienteId] = useState(clienteIdInicial ?? '')
  const [propiedadId, setPropiedadId] = useState('')
  const [tipo, setTipo] = useState<(typeof TIPOS_CONTRATO)[number]>('compraventa')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10))
  const [montoTotal, setMontoTotal] = useState('')
  const [enganche, setEnganche] = useState('')
  const [plazoMeses, setPlazoMeses] = useState('')
  const [notas, setNotas] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const cliente = clientes.find((c) => c.id === clienteId)
  const propiedad = propiedades.find((p) => p.id === propiedadId)

  const puedeAvanzar = useMemo(() => {
    if (paso === 0) return Boolean(clienteId)
    if (paso === 1) return Boolean(propiedadId)
    if (paso === 2) {
      if (!fechaInicio || !montoTotal) return false
      if (tipo === 'compraventa' && !plazoMeses) return false
      return true
    }
    return true
  }, [paso, clienteId, propiedadId, fechaInicio, montoTotal, tipo, plazoMeses])

  async function confirmar() {
    setError(null)
    setGuardando(true)

    const payload = {
      tipo,
      cliente_id: clienteId,
      propiedad_id: propiedadId,
      fecha_inicio: fechaInicio,
      monto_total: Math.round(Number(montoTotal) * 100),
      enganche: enganche ? Math.round(Number(enganche) * 100) : undefined,
      plazo_meses: plazoMeses ? Number(plazoMeses) : undefined,
      notas: notas || undefined,
    }

    try {
      const res = await fetch('/api/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        setError('No se pudo crear el contrato')
        setGuardando(false)
        return
      }

      router.push(`/clientes/${clienteId}`)
      router.refresh()
    } catch {
      setError('No se pudo crear el contrato')
      setGuardando(false)
    }
  }

  function handleSubmitPaso(event: FormEvent) {
    event.preventDefault()
    if (paso < PASOS.length - 1) {
      setPaso((p) => p + 1)
    } else {
      confirmar()
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <ol className="flex gap-2 text-xs text-gray-500">
        {PASOS.map((label, i) => (
          <li
            key={label}
            className={`rounded px-2 py-1 ${i === paso ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmitPaso} className="space-y-4">
        {paso === 0 && (
          <div className="space-y-1">
            <label htmlFor="cliente" className="text-sm font-medium">
              Cliente
            </label>
            <select
              id="cliente"
              required
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full rounded border px-3 py-2"
            >
              <option value="">Elegí un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellidos}
                </option>
              ))}
            </select>
          </div>
        )}

        {paso === 1 && (
          <div className="space-y-1">
            <label htmlFor="propiedad" className="text-sm font-medium">
              Propiedad disponible
            </label>
            <select
              id="propiedad"
              required
              value={propiedadId}
              onChange={(e) => setPropiedadId(e.target.value)}
              className="w-full rounded border px-3 py-2"
            >
              <option value="">Elegí una propiedad</option>
              {propiedades.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo} — {p.ciudad} ({formatearCentavos(p.precio)})
                </option>
              ))}
            </select>
            {propiedades.length === 0 && (
              <p className="text-xs text-amber-600">No hay propiedades disponibles.</p>
            )}
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="tipo" className="text-sm font-medium">
                Tipo de contrato
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as (typeof TIPOS_CONTRATO)[number])}
                className="w-full rounded border px-3 py-2"
              >
                {TIPOS_CONTRATO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="fecha_inicio" className="text-sm font-medium">
                  Fecha de inicio
                </label>
                <input
                  id="fecha_inicio"
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="plazo_meses" className="text-sm font-medium">
                  Plazo (meses)
                  {tipo === 'compraventa' && (
                    <span className="ml-1 font-normal text-gray-400">
                      requerido para generar el calendario
                    </span>
                  )}
                </label>
                <input
                  id="plazo_meses"
                  type="number"
                  min="0"
                  required={tipo === 'compraventa'}
                  value={plazoMeses}
                  onChange={(e) => setPlazoMeses(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="monto_total" className="text-sm font-medium">
                  Monto total (MXN)
                </label>
                <input
                  id="monto_total"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={montoTotal}
                  onChange={(e) => setMontoTotal(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="enganche" className="text-sm font-medium">
                  Enganche (MXN)
                </label>
                <input
                  id="enganche"
                  type="number"
                  step="0.01"
                  min="0"
                  value={enganche}
                  onChange={(e) => setEnganche(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
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
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-2 rounded border p-4 text-sm">
            <p>
              <span className="text-gray-500">Cliente:</span> {cliente?.nombre} {cliente?.apellidos}
            </p>
            <p>
              <span className="text-gray-500">Propiedad:</span> {propiedad?.titulo}
            </p>
            <p>
              <span className="text-gray-500">Tipo:</span> {tipo}
            </p>
            <p>
              <span className="text-gray-500">Inicio:</span> {fechaInicio}
              {plazoMeses ? ` · ${plazoMeses} meses` : ''}
            </p>
            <p>
              <span className="text-gray-500">Monto:</span>{' '}
              {formatearCentavos(Math.round(Number(montoTotal || '0') * 100))}
              {enganche ? ` (enganche ${formatearCentavos(Math.round(Number(enganche) * 100))})` : ''}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          {paso > 0 && (
            <button
              type="button"
              onClick={() => setPaso((p) => p - 1)}
              className="rounded border px-4 py-2 text-sm"
            >
              Atrás
            </button>
          )}
          <button
            type="submit"
            disabled={!puedeAvanzar || guardando}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {paso < PASOS.length - 1
              ? 'Siguiente'
              : guardando
                ? 'Creando…'
                : 'Crear contrato'}
          </button>
        </div>
      </form>
    </div>
  )
}
