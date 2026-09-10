import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUsuarioActual } from '@/lib/server/auth'

const NAV_POR_ROL: Record<string, { href: string; label: string }[]> = {
  dueno: [
    { href: '/dashboard', label: 'Panel' },
    { href: '/propiedades', label: 'Propiedades' },
    { href: '/clientes', label: 'Cartera' },
    { href: '/contratos', label: 'Contratos' },
    { href: '/prospectos', label: 'CRM' },
    { href: '/contabilidad', label: 'Contabilidad' },
    { href: '/dashboard/usuarios', label: 'Usuarios' },
  ],
  socio: [
    { href: '/dashboard', label: 'Panel' },
    { href: '/contabilidad', label: 'Contabilidad' },
  ],
  administrador: [
    { href: '/dashboard', label: 'Panel' },
    { href: '/propiedades', label: 'Propiedades' },
    { href: '/clientes', label: 'Cartera' },
    { href: '/contratos', label: 'Contratos' },
    { href: '/prospectos', label: 'CRM' },
    { href: '/dashboard/usuarios', label: 'Usuarios' },
  ],
  asesor: [
    { href: '/dashboard', label: 'Panel' },
    { href: '/prospectos', label: 'CRM' },
  ],
  contador: [
    { href: '/dashboard', label: 'Panel' },
    { href: '/contabilidad', label: 'Contabilidad' },
  ],
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await getUsuarioActual()
  if (!usuario) redirect('/login')

  const nav = NAV_POR_ROL[usuario.rol] ?? []

  return (
    <div className="flex flex-1">
      <aside className="w-56 border-r p-4">
        <p className="mb-4 text-sm text-gray-500">
          {usuario.nombre} · {usuario.rol}
        </p>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-2 py-1 text-sm hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
