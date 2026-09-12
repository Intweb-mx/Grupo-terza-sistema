'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef, useState } from 'react'
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
  const navRef = useRef<HTMLElement>(null)
  const [indicador, setIndicador] = useState<{ top: number; height: number } | null>(null)

  // Pill que se desliza al cambiar de sección — medido vía DOM contra el
  // link activo en vez de calcularlo por índice, para no depender del
  // orden ni del alto exacto de cada item.
  useLayoutEffect(() => {
    const contenedor = navRef.current
    const activo = contenedor?.querySelector<HTMLElement>('[data-active="true"]')
    if (!contenedor || !activo) {
      setIndicador(null)
      return
    }
    setIndicador({ top: activo.offsetTop, height: activo.offsetHeight })
  }, [pathname, nav.length])

  return (
    <aside className="hidden shrink-0 p-3 md:block">
      <div className="flex h-[calc(100vh-1.5rem)] w-60 flex-col rounded-[20px] border border-white/60 bg-white/65 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center gap-2 border-b border-white/50 px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30">
            T
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Grupo Terza</p>
            <p className="text-[11px] text-muted-foreground">Bienes raíces con futuro</p>
          </div>
        </div>

        <nav ref={navRef} className="relative flex-1 space-y-0.5 p-3">
          {indicador && (
            <div
              aria-hidden
              className="absolute inset-x-3 rounded-xl bg-primary shadow-[0_0_0_1px_rgba(37,99,235,0.35),0_6px_18px_-4px_rgba(37,99,235,0.55)] transition-[top,height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{ top: indicador.top, height: indicador.height }}
            />
          )}
          {nav.map((item) => {
            const activo = esActivo(pathname, item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={activo}
                className={cn(
                  'group relative z-10 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200',
                  activo
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:bg-white/50 hover:text-foreground hover:backdrop-blur-md'
                )}
              >
                <Icon className="size-4 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-110" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/50 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium">{nombre}</p>
            <Badge variant="secondary" className="mt-1 font-normal">
              {ETIQUETA_ROL[rol] ?? rol}
            </Badge>
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}
