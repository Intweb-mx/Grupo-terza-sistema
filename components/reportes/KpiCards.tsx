'use client'

import { Building2, Home, TrendingUp, AlertTriangle, type LucideIcon } from 'lucide-react'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Card, CardContent } from '@/components/ui/card'
import { CountUp } from './CountUp'

type Kpis = {
  propiedades_disponibles: number
  propiedades_vendidas: number
  ingresos_mes_actual: number
  clientes_en_mora: number
  monto_cartera_vencida: number
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const tarjetas: {
    etiqueta: string
    valor: number
    format: (n: number) => string
    icono: LucideIcon
    nota?: string
    alerta?: boolean
    chip: string
  }[] = [
    {
      etiqueta: 'Propiedades disponibles',
      valor: kpis.propiedades_disponibles,
      format: (n) => String(n),
      icono: Home,
      chip: 'bg-primary/10 text-primary',
    },
    {
      etiqueta: 'Propiedades vendidas',
      valor: kpis.propiedades_vendidas,
      format: (n) => String(n),
      icono: Building2,
      chip: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      etiqueta: 'Ingresos del mes',
      valor: kpis.ingresos_mes_actual,
      format: formatearCentavos,
      icono: TrendingUp,
      chip: 'bg-sky-500/10 text-sky-600',
    },
    {
      etiqueta: 'Cartera vencida',
      valor: kpis.monto_cartera_vencida,
      format: formatearCentavos,
      icono: AlertTriangle,
      nota: `${kpis.clientes_en_mora} cliente${kpis.clientes_en_mora === 1 ? '' : 's'} en mora`,
      alerta: kpis.clientes_en_mora > 0,
      chip: 'bg-orange-500/10 text-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tarjetas.map((t, i) => (
        <Card key={t.etiqueta} style={{ animationDelay: `${i * 80}ms` }}>
          <CardContent className="space-y-3">
            <div
              className={`flex size-9 items-center justify-center rounded-lg ${
                t.alerta ? 'bg-orange-500/10 text-orange-600' : t.chip
              }`}
            >
              <t.icono className="size-4" />
            </div>
            <div>
              <p className={`text-3xl font-bold tracking-tight ${t.alerta ? 'text-orange-600' : ''}`}>
                <CountUp value={t.valor} format={t.format} />
              </p>
              <p className="text-xs text-muted-foreground">{t.etiqueta}</p>
              {t.nota && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-orange-500" />
                  {t.nota}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
