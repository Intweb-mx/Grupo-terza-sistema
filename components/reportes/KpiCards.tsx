import { formatearCentavos } from '@/lib/utils/moneda'

type Kpis = {
  propiedades_disponibles: number
  propiedades_vendidas: number
  ingresos_mes_actual: number
  clientes_en_mora: number
  monto_cartera_vencida: number
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const tarjetas = [
    { etiqueta: 'Propiedades disponibles', valor: kpis.propiedades_disponibles },
    { etiqueta: 'Propiedades vendidas', valor: kpis.propiedades_vendidas },
    { etiqueta: 'Ingresos del mes', valor: formatearCentavos(kpis.ingresos_mes_actual) },
    {
      etiqueta: 'Cartera vencida',
      valor: formatearCentavos(kpis.monto_cartera_vencida),
      nota: `${kpis.clientes_en_mora} cliente${kpis.clientes_en_mora === 1 ? '' : 's'} en mora`,
      alerta: kpis.clientes_en_mora > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tarjetas.map((t) => (
        <div key={t.etiqueta} className="rounded border p-4">
          <p className="text-xs text-gray-500">{t.etiqueta}</p>
          <p className={`mt-1 text-2xl font-semibold ${t.alerta ? 'text-red-700' : ''}`}>
            {t.valor}
          </p>
          {t.nota && <p className="mt-0.5 text-xs text-gray-400">{t.nota}</p>}
        </div>
      ))}
    </div>
  )
}
