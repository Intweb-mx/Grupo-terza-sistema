'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { SignOutButton } from './SignOutButton'
import { NAV_POR_ROL } from './nav-config'

const ETIQUETA_ROL: Record<string, string> = {
  dueno: 'Dueño',
  socio: 'Socio',
  administrador: 'Administrador',
  asesor: 'Asesor',
  contador: 'Contador',
}

function esActivo(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar({
  nombre,
  rol,
}: {
  nombre: string
  rol: string
}) {
  const pathname = usePathname()
  const nav = NAV_POR_ROL[rol] ?? []

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          T
        </div>
        <span className="text-sm font-semibold tracking-tight">Grupo Terza</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map((item) => {
          const activo = esActivo(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activo
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-medium">{nombre}</p>
          <Badge variant="secondary" className="mt-1 font-normal">
            {ETIQUETA_ROL[rol] ?? rol}
          </Badge>
        </div>
        <SignOutButton />
      </div>
    </aside>
  )
}
