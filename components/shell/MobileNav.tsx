'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { SignOutButton } from './SignOutButton'
import { NAV_POR_ROL } from './nav-config'

export function MobileNav({ rol, nombre }: { rol: string; nombre: string }) {
  const pathname = usePathname()
  const nav = NAV_POR_ROL[rol] ?? []
  const actual = nav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  return (
    <div className="m-3 flex items-center justify-between rounded-[20px] border border-white/60 bg-white/65 px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl backdrop-saturate-150 md:hidden">
      <div>
        <p className="text-sm font-semibold">{actual?.label ?? 'Grupo Terza'}</p>
        <p className="text-xs text-muted-foreground">{nombre}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <div className="px-1 py-1">
            <SignOutButton />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
