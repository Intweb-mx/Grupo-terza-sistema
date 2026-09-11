// Hero de landing: emblema de la marca animándose de fondo a pantalla
// completa, navbar en píldoras flotantes, titular gigante escalonado,
// bloques de estadísticas con divisores diagonales. Layout basado en la
// referencia "securify" (skill saas-video-hero), adaptado a Grupo Terza.

import type { FC } from 'react'
import Link from 'next/link'
import { LogoMark } from './LogoMark'

type Stat = { value: string; label: string; align: 'left' | 'right' }

const config = {
  brand: 'terza',
  ctaLabel: 'iniciar sesión',
  ctaHref: '/login',
  headline: ['controla', 'tu', 'cartera'] as [string, string, string],
  description:
    'propiedades, contratos y cobranza en un solo sistema, sin hojas de cálculo',
  // Cifras ilustrativas — reemplazar por métricas reales del negocio.
  statTopRight: { value: '+120', label: 'propiedades activas', align: 'right' } as Stat,
  statBottomLeft: { value: '+98%', label: 'cobranza al día', align: 'left' } as Stat,
  statBottomRight: { value: '+40', label: 'asesores conectados', align: 'right' } as Stat,
}

const Navbar: FC = () => (
  <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-4 px-6 pt-6 md:px-10">
    <div className="flex items-center gap-2 rounded-full bg-neutral-900/90 py-3 pl-4 pr-6 backdrop-blur">
      <LogoMark idPrefix="nav" className="h-6 w-6" />
      <span className="text-sm font-normal tracking-tight text-white">{config.brand}</span>
    </div>

    <Link
      href={config.ctaHref}
      className="rounded-full bg-white px-8 py-4 text-base font-medium text-black transition-colors hover:bg-neutral-200"
    >
      {config.ctaLabel}
    </Link>
  </nav>
)

const DiagonalDivider: FC<{ rotate: '20' | '-20' }> = ({ rotate }) => (
  <div
    className={`hidden h-px w-24 bg-white/40 md:block ${
      rotate === '20' ? 'rotate-[20deg]' : 'rotate-[-20deg]'
    }`}
  />
)

export const HeroSection: FC = () => {
  return (
    <section className="hero-font relative h-screen w-full overflow-hidden bg-black">
      <Navbar />

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center">
        <LogoMark idPrefix="hero" animated className="h-[34vmin] w-[34vmin]" />

        <h1 className="hero-title text-[11vw] font-medium text-white md:text-[5.5vw]">
          {config.headline.join(' ')}
        </h1>

        <p className="max-w-md text-[15px] leading-snug text-white/80">
          {config.description}
        </p>

        {/* estadística: arriba a la derecha */}
        <div className="absolute right-6 top-[14%] md:right-24">
          <div className="flex items-center justify-end gap-3">
            <DiagonalDivider rotate="20" />
            <span className="text-4xl font-medium tracking-tight text-white md:text-5xl">
              {config.statTopRight.value}
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-white/70 md:text-sm">
            {config.statTopRight.label}
          </p>
        </div>

        {/* estadística: abajo a la izquierda */}
        <div className="absolute bottom-20 left-6 md:bottom-24 md:left-20">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-medium tracking-tight text-white md:text-5xl">
              {config.statBottomLeft.value}
            </span>
            <DiagonalDivider rotate="-20" />
          </div>
          <p className="mt-1 text-xs text-white/70 md:text-sm">{config.statBottomLeft.label}</p>
        </div>

        {/* estadística: abajo a la derecha */}
        <div className="absolute bottom-16 right-6 md:bottom-20 md:right-20">
          <div className="flex items-center gap-3">
            <DiagonalDivider rotate="-20" />
            <span className="text-4xl font-medium tracking-tight text-white md:text-5xl">
              {config.statBottomRight.value}
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-white/70 md:text-sm">
            {config.statBottomRight.label}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black" />
    </section>
  )
}

export default HeroSection
