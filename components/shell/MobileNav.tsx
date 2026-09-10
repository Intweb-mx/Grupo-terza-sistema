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
import type { NavItem } from './nav-config'

export function MobileNav({ nav, nombre }: { nav: NavItem[]; nombre: string }) {
  const pathname = usePathname()
  const actual = nav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )

  return (
    <div className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
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
