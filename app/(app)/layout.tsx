import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { NAV_POR_ROL } from '@/components/shell/nav-config'
import { Sidebar } from '@/components/shell/Sidebar'
import { MobileNav } from '@/components/shell/MobileNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  const nav = NAV_POR_ROL[usuario.rol] ?? []

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <Sidebar nav={nav} nombre={usuario.nombre} rol={usuario.rol} />
      <div className="flex flex-1 flex-col">
        <MobileNav nav={nav} nombre={usuario.nombre} />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
