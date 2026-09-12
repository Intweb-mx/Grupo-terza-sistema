import { ProspectoForm } from '@/components/crm/ProspectoForm'
import { VolverLink } from '@/components/shell/VolverLink'

export default function NuevoProspectoPage() {
  return (
    <div className="space-y-6">
      <VolverLink href="/prospectos" label="Volver a prospectos" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo prospecto</h1>
        <p className="text-sm text-muted-foreground">Captación de lead</p>
      </div>
      <ProspectoForm />
    </div>
  )
}
