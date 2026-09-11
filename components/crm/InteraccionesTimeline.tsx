import { Phone, MapPin, MessageCircle, Mail, Users } from 'lucide-react'

type Interaccion = {
  id: string
  tipo: string
  notas: string | null
  created_at: string | null
}

const ICONO_POR_TIPO: Record<string, typeof Phone> = {
  llamada: Phone,
  visita: MapPin,
  whatsapp: MessageCircle,
  email: Mail,
  reunion: Users,
}

export function InteraccionesTimeline({ interacciones }: { interacciones: Interaccion[] }) {
  if (interacciones.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin interacciones todavía.</p>
  }

  return (
    <ol className="space-y-4 border-l pl-4">
      {interacciones.map((i) => {
        const Icono = ICONO_POR_TIPO[i.tipo] ?? MessageCircle
        return (
          <li key={i.id} className="relative">
            <span className="absolute top-0.5 -left-[21px] flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icono className="size-2.5" />
            </span>
            <p className="text-sm font-medium capitalize">{i.tipo}</p>
            {i.notas && <p className="text-sm text-muted-foreground">{i.notas}</p>}
            <p className="text-xs text-muted-foreground">
              {i.created_at ? new Date(i.created_at).toLocaleString('es-MX') : ''}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
