import { ETIQUETA_ETAPA } from '@/components/crm/constantes'

const ETAPAS_EMBUDO = ['nuevo', 'contactado', 'interesado', 'negociacion', 'cerrado'] as const
const COLOR_POR_ETAPA: Record<string, string> = {
  nuevo: 'bg-blue-200',
  contactado: 'bg-blue-300',
  interesado: 'bg-blue-400',
  negociacion: 'bg-blue-500',
  cerrado: 'bg-blue-600',
}

export function EmbudoChart({ conteoPorEtapa }: { conteoPorEtapa: Record<string, number> }) {
  const max = Math.max(1, ...ETAPAS_EMBUDO.map((e) => conteoPorEtapa[e] ?? 0))
  const perdidos = conteoPorEtapa.perdido ?? 0
  const total = ETAPAS_EMBUDO.reduce((s, e) => s + (conteoPorEtapa[e] ?? 0), 0) + perdidos

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">Sin prospectos todavía.</p>
  }

  return (
    <div className="space-y-2">
      {ETAPAS_EMBUDO.map((etapa) => {
        const conteo = conteoPorEtapa[etapa] ?? 0
        return (
          <div key={etapa} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">
              {ETIQUETA_ETAPA[etapa]}
            </span>
            <div
              title={`${ETIQUETA_ETAPA[etapa]}: ${conteo}`}
              className={`h-6 rounded-r ${COLOR_POR_ETAPA[etapa]}`}
              style={{ width: `${Math.max(4, (conteo / max) * 100)}%` }}
            />
            <span className="text-xs text-muted-foreground">{conteo}</span>
          </div>
        )
      })}

      <div className="mt-3 flex items-center gap-3 border-t pt-2">
        <span className="w-24 shrink-0 text-xs text-muted-foreground">Perdidos</span>
        <div
          title={`Perdidos: ${perdidos}`}
          className="h-6 rounded-r bg-muted"
          style={{ width: `${Math.max(4, (perdidos / max) * 100)}%` }}
        />
        <span className="text-xs text-muted-foreground">{perdidos}</span>
      </div>
    </div>
  )
}
