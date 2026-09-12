import { ChevronRight } from 'lucide-react'
import { ETIQUETA_ETAPA } from '@/components/crm/constantes'

const ETAPAS_EMBUDO = ['nuevo', 'contactado', 'interesado', 'negociacion', 'cerrado'] as const

export function EmbudoChart({ conteoPorEtapa }: { conteoPorEtapa: Record<string, number> }) {
  const perdidos = conteoPorEtapa.perdido ?? 0
  const total = ETAPAS_EMBUDO.reduce((s, e) => s + (conteoPorEtapa[e] ?? 0), 0) + perdidos

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">Sin prospectos todavía.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-stretch">
        {ETAPAS_EMBUDO.map((etapa, i) => {
          const conteo = conteoPorEtapa[etapa] ?? 0
          const esFinal = etapa === 'cerrado'
          return (
            <div key={etapa} className="flex flex-1 items-center">
              <div
                className={`flex w-full flex-col items-center gap-1 rounded-xl border px-2 py-3 ${
                  esFinal
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-blue-100 bg-blue-50/60'
                }`}
              >
                <span
                  className={`text-2xl font-bold tracking-tight ${
                    esFinal ? 'text-emerald-700' : 'text-primary'
                  }`}
                >
                  {conteo}
                </span>
                <span className="text-center text-[11px] leading-tight text-muted-foreground">
                  {ETIQUETA_ETAPA[etapa]}
                </span>
              </div>
              {i < ETAPAS_EMBUDO.length - 1 && (
                <ChevronRight className="mx-0.5 size-4 shrink-0 text-border" />
              )}
            </div>
          )
        })}
      </div>

      {perdidos > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-orange-500" />
            Perdidos
          </span>
          <span className="font-medium">{perdidos}</span>
        </div>
      )}
    </div>
  )
}
