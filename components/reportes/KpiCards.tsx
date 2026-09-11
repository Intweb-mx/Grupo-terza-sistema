import { Building2, Home, TrendingUp, AlertTriangle, type LucideIcon } from 'lucide-react'
import { formatearCentavos } from '@/lib/utils/moneda'
import { Card, CardContent } from '@/components/ui/card'

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
    valor: string | number
    icono: LucideIcon
    nota?: string
    alerta?: boolean
  }[] = [
    { etiqueta: 'Propiedades disponibles', valor: kpis.propiedades_disponibles, icono: Home },
    { etiqueta: 'Propiedades vendidas', valor: kpis.propiedades_vendidas, icono: Building2 },
    {
      etiqueta: 'Ingresos del mes',
      valor: formatearCentavos(kpis.ingresos_mes_actual),
      icono: TrendingUp,
    },
    {
      etiqueta: 'Cartera vencida',
      valor: formatearCentavos(kpis.monto_cartera_vencida),
      icono: AlertTriangle,
      nota: `${kpis.clientes_en_mora} cliente${kpis.clientes_en_mora === 1 ? '' : 's'} en mora`,
      alerta: kpis.clientes_en_mora > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tarjetas.map((t) => (
        <Card key={t.etiqueta}>
          <CardContent className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t.etiqueta}</p>
              <p className={`mt-1 text-2xl font-semibold ${t.alerta ? 'text-destructive' : ''}`}>
                {t.valor}
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
