import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { Sidebar } from '@/components/shell/Sidebar'
import { MobileNav } from '@/components/shell/MobileNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <Sidebar rol={usuario.rol} nombre={usuario.nombre} />
      <div className="flex flex-1 flex-col">
        <MobileNav rol={usuario.rol} nombre={usuario.nombre} />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
