import Link from 'next/link'
import { redirect } from 'next/navigation'
import { listarProspectos } from '@/lib/server/prospectos'
import { getUsuarioActual } from '@/lib/server/auth'
import { KanbanProspectos } from '@/components/crm/KanbanProspectos'

export default async function ProspectosPage({
  searchParams,
}: {
  searchParams: Promise<{ fuente?: string }>
}) {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  const { fuente } = await searchParams
  const prospectos = await listarProspectos({ fuente })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">CRM · Prospectos</h1>
          <p className="text-sm text-gray-500">Arrastrá una tarjeta para cambiar su etapa.</p>
        </div>
        <Link href="/prospectos/nuevo" className="rounded bg-black px-3 py-1.5 text-sm text-white">
          Nuevo prospecto
        </Link>
      </div>

      <KanbanProspectos prospectos={prospectos} />
    </div>
  )
}
