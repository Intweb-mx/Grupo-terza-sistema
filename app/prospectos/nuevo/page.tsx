import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { ProspectoForm } from '@/components/crm/ProspectoForm'

export default async function NuevoProspectoPage() {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nuevo prospecto</h1>
      <ProspectoForm />
    </div>
  )
}
