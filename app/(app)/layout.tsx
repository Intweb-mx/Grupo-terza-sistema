import { redirect } from 'next/navigation'
import { getUsuarioActual } from '@/lib/server/auth'
import { Sidebar } from '@/components/shell/Sidebar'
import { MobileNav } from '@/components/shell/MobileNav'
import { BackgroundMesh } from '@/components/shell/BackgroundMesh'
import { PageTransition } from '@/components/shell/PageTransition'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <BackgroundMesh />

      <Sidebar rol={usuario.rol} nombre={usuario.nombre} />
      <div className="flex flex-1 flex-col">
        <MobileNav rol={usuario.rol} nombre={usuario.nombre} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
