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
  }[] = [
    {
      etiqueta: 'Propiedades disponibles',
      valor: kpis.propiedades_disponibles,
      format: (n) => String(n),
      icono: Home,
    },
    {
      etiqueta: 'Propiedades vendidas',
      valor: kpis.propiedades_vendidas,
      format: (n) => String(n),
      icono: Building2,
    },
    {
      etiqueta: 'Ingresos del mes',
      valor: kpis.ingresos_mes_actual,
      format: formatearCentavos,
      icono: TrendingUp,
    },
    {
      etiqueta: 'Cartera vencida',
      valor: kpis.monto_cartera_vencida,
      format: formatearCentavos,
      icono: AlertTriangle,
      nota: `${kpis.clientes_en_mora} cliente${kpis.clientes_en_mora === 1 ? '' : 's'} en mora`,
      alerta: kpis.clientes_en_mora > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tarjetas.map((t, i) => (
        <Card key={t.etiqueta} style={{ animationDelay: `${i * 80}ms` }}>
          <CardContent className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t.etiqueta}</p>
              <p className={`mt-1 text-2xl font-semibold ${t.alerta ? 'text-destructive' : ''}`}>
                <CountUp value={t.valor} format={t.format} />
              </p>
              {t.nota && <p className="mt-0.5 text-xs text-muted-foreground">{t.nota}</p>}
            </div>
            <t.icono
              className={`size-5 ${t.alerta ? 'text-destructive' : 'text-muted-foreground'}`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
