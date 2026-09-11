'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function SignOutButton({ redirectTo = '/login' }: { redirectTo?: string }) {
  const router = useRouter()
  const [saliendo, setSaliendo] = useState(false)

  async function handleClick() {
    setSaliendo(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={saliendo}
      className="w-full justify-start gap-2 text-muted-foreground"
    >
      <LogOut className="size-4" />
      {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
    </Button>
  )
}
