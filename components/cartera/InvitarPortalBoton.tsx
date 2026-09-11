'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InvitarPortalBoton({ clienteId }: { clienteId: string }) {
  const [enviando, setEnviando] = useState(false)

  async function invitar() {
    setEnviando(true)

    const res = await fetch(`/api/clientes/${clienteId}/invitar`, { method: 'POST' })
    const data = await res.json().catch(() => null)

    setEnviando(false)

    if (!res.ok) {
      toast.error(data?.error ?? 'No se pudo invitar al cliente')
      return
    }

    toast.success(`Invitación enviada a ${data.email}`)
  }

  return (
    <Button variant="outline" onClick={invitar} disabled={enviando}>
      <UserPlus className="size-4" />
      {enviando ? 'Enviando…' : 'Invitar al portal'}
    </Button>
  )
}
