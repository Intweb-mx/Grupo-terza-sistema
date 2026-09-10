import Link from 'next/link'
import { formatearCentavos } from '@/lib/utils/moneda'

type FilaCartera = {
  cliente_id: string
  nombre: string
  dias_atraso: number
  monto_vencido: number
  penalizacion_aplicada: number
}

export function CarteraVencidaTabla({ filas }: { filas: FilaCartera[] }) {
  if (filas.length === 0) {
    return <p className="text-sm text-gray-500">Sin cartera vencida — todos al corriente.</p>
  }

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-gray-50 text-left text-xs text-gray-500">
          <tr>
            <th className="px-3 py-2">Cliente</th>
            <th className="px-3 py-2">Días de atraso</th>
            <th className="px-3 py-2">Monto vencido</th>
            <th className="px-3 py-2">Penalización</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filas.map((f) => (
            <tr key={f.cliente_id}>
              <td className="px-3 py-2">
                <Link href={`/clientes/${f.cliente_id}`} className="text-blue-600 hover:underline">
                  {f.nombre}
                </Link>
              </td>
              <td className="px-3 py-2">
                <span
                  className={`rounded border px-2 py-0.5 text-xs ${
                    f.dias_atraso > 3
                      ? 'border-red-300 bg-red-100 text-red-800'
                      : 'border-amber-300 bg-amber-100 text-amber-800'
                  }`}
                >
                  {f.dias_atraso} días
                </span>
              </td>
              <td className="px-3 py-2 font-medium">{formatearCentavos(f.monto_vencido)}</td>
              <td className="px-3 py-2">{formatearCentavos(f.penalizacion_aplicada)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
