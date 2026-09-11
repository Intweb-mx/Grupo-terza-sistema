import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listarProspectos } from '@/lib/server/prospectos'
import { Button } from '@/components/ui/button'
import { KanbanProspectos } from '@/components/crm/KanbanProspectos'

export default async function ProspectosPage({
  searchParams,
}: {
  searchParams: Promise<{ fuente?: string }>
}) {
  const { fuente } = await searchParams
  const prospectos = await listarProspectos({ fuente })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CRM · Prospectos</h1>
          <p className="text-sm text-muted-foreground">
            Arrastrá una tarjeta para cambiar su etapa
          </p>
        </div>
        <Button asChild>
          <Link href="/prospectos/nuevo">
            <Plus className="size-4" />
            Nuevo prospecto
          </Link>
        </Button>
      </div>

      <KanbanProspectos prospectos={prospectos} />
    </div>
  )
}
