'use client'

import { usePathname } from 'next/navigation'

// Remonta el contenido en cada cambio de ruta (key={pathname}) para que la
// animación de entrada (definida en globals.css, .page-enter) se repita en
// cada navegación — sin librería de transiciones, solo CSS + una key.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
