import {
  LayoutDashboard,
  Building2,
  Wallet,
  FileSignature,
  Users2,
  Landmark,
  UserCog,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = { href: string; label: string; icon: LucideIcon }

export const NAV_POR_ROL: Record<string, NavItem[]> = {
  dueno: [
    { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/propiedades', label: 'Propiedades', icon: Building2 },
    { href: '/clientes', label: 'Cartera', icon: Wallet },
    { href: '/contratos/nuevo', label: 'Nuevo contrato', icon: FileSignature },
    { href: '/prospectos', label: 'CRM', icon: Users2 },
    { href: '/contabilidad', label: 'Contabilidad', icon: Landmark },
    { href: '/dashboard/usuarios', label: 'Usuarios', icon: UserCog },
  ],
  socio: [
    { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/contabilidad', label: 'Contabilidad', icon: Landmark },
  ],
  administrador: [
    { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/propiedades', label: 'Propiedades', icon: Building2 },
    { href: '/clientes', label: 'Cartera', icon: Wallet },
    { href: '/contratos/nuevo', label: 'Nuevo contrato', icon: FileSignature },
    { href: '/prospectos', label: 'CRM', icon: Users2 },
    { href: '/contabilidad', label: 'Contabilidad', icon: Landmark },
    { href: '/dashboard/usuarios', label: 'Usuarios', icon: UserCog },
  ],
  asesor: [
    { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/clientes', label: 'Cartera', icon: Wallet },
    { href: '/contratos/nuevo', label: 'Nuevo contrato', icon: FileSignature },
    { href: '/prospectos', label: 'CRM', icon: Users2 },
  ],
  contador: [
    { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/contabilidad', label: 'Contabilidad', icon: Landmark },
  ],
}
