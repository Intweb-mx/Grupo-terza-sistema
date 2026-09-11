import { ProspectoForm } from '@/components/crm/ProspectoForm'

export default function NuevoProspectoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo prospecto</h1>
        <p className="text-sm text-muted-foreground">Captación de lead</p>
      </div>
      <ProspectoForm />
    </div>
  )
}
