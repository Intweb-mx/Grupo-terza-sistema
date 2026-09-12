'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Check, FileText, Home, Tag, Users, Wallet } from 'lucide-react'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_18rem]">
      <Card>
        <CardContent className="space-y-6">
          <ol className="flex items-center">
            {PASOS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200',
                      i === paso
                        ? 'bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(37,99,235,0.15)]'
                        : i < paso
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {i < paso ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      i === paso ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < PASOS.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-px flex-1 transition-colors duration-200',
                      i < paso ? 'bg-primary/40' : 'bg-border'
                    )}
                  />
                )}
              </li>
            ))}
          </ol>

          <form onSubmit={handleSubmitPaso} className="space-y-4">
          {paso === 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger id="cliente" className="w-full">
                  <SelectValue placeholder="Elegí un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre} {c.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="propiedad">Propiedad disponible</Label>
              <Select value={propiedadId} onValueChange={setPropiedadId}>
                <SelectTrigger id="propiedad" className="w-full">
                  <SelectValue placeholder="Elegí una propiedad" />
                </SelectTrigger>
                <SelectContent>
                  {propiedades.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.titulo} — {p.ciudad} ({formatearCentavos(p.precio)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {propiedades.length === 0 && (
                <p className="text-xs text-amber-600">No hay propiedades disponibles.</p>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tipo">Tipo de contrato</Label>
                <Select
                  value={tipo}
                  onValueChange={(v) => setTipo(v as (typeof TIPOS_CONTRATO)[number])}
                >
                  <SelectTrigger id="tipo" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CONTRATO.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="plazo_meses">
                    Plazo (meses)
                    {tipo === 'compraventa' && (
                      <span className="font-normal text-muted-foreground"> · requerido</span>
                    )}
                  </Label>
                  <Input
                    id="plazo_meses"
                    type="number"
                    min="0"
                    required={tipo === 'compraventa'}
                    value={plazoMeses}
                    onChange={(e) => setPlazoMeses(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="monto_total">Monto total (MXN)</Label>
                  <Input
                    id="monto_total"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={montoTotal}
                    onChange={(e) => setMontoTotal(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="enganche">Enganche (MXN)</Label>
                  <Input
                    id="enganche"
                    type="number"
                    step="0.01"
                    min="0"
                    value={enganche}
                    onChange={(e) => setEnganche(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  rows={3}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Cliente:</span> {cliente?.nombre}{' '}
                {cliente?.apellidos}
              </p>
              <p>
                <span className="text-muted-foreground">Propiedad:</span> {propiedad?.titulo}
              </p>
              <p>
                <span className="text-muted-foreground">Tipo:</span> {tipo}
              </p>
              <p>
                <span className="text-muted-foreground">Inicio:</span> {fechaInicio}
                {plazoMeses ? ` · ${plazoMeses} meses` : ''}
              </p>
              <p>
                <span className="text-muted-foreground">Monto:</span>{' '}
                {formatearCentavos(Math.round(Number(montoTotal || '0') * 100))}
                {enganche
                  ? ` (enganche ${formatearCentavos(Math.round(Number(enganche) * 100))})`
                  : ''}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {paso > 0 && (
              <Button type="button" variant="outline" onClick={() => setPaso((p) => p - 1)}>
                Atrás
              </Button>
            )}
            <Button type="submit" disabled={!puedeAvanzar || guardando}>
              {paso < PASOS.length - 1 ? 'Siguiente' : guardando ? 'Creando…' : 'Crear contrato'}
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Resumen del contrato</p>
              <p className="text-xs text-muted-foreground">Se completará conforme avances.</p>
            </div>
          </div>

          <ul className="divide-y divide-border text-sm">
            <li className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-3.5" /> Cliente
              </span>
              <span className="font-medium">
                {cliente ? `${cliente.nombre} ${cliente.apellidos}` : '—'}
              </span>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Home className="size-3.5" /> Propiedad
              </span>
              <span className="max-w-[9rem] truncate text-right font-medium">
                {propiedad?.titulo ?? '—'}
              </span>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Tag className="size-3.5" /> Tipo
              </span>
              <span className="font-medium capitalize">{tipo.replace('_', ' ')}</span>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="size-3.5" /> Total
              </span>
              <span className="font-medium">
                {montoTotal ? formatearCentavos(Math.round(Number(montoTotal) * 100)) : '—'}
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
