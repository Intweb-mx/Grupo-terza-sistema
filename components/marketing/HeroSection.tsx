// Hero de landing: emblema de la marca animándose de fondo a pantalla
// completa, navbar en píldoras flotantes, titular gigante escalonado,
// bloques de estadísticas con divisores diagonales. Layout basado en la
// referencia "securify" (skill saas-video-hero), adaptado a Grupo Terza.

import type { FC } from 'react'
import Link from 'next/link'
import { LogoMark } from './LogoMark'

const config = {
  brand: 'terza',
  ctaLabel: 'iniciar sesión',
  ctaHref: '/login',
  headline: 'GRUPO TERZA',
  description:
    'propiedades, contratos y cobranza en un solo sistema, sin hojas de cálculo',
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

export const HeroSection: FC = () => {
  return (
    <section className="hero-font relative h-screen w-full overflow-hidden bg-black">
      <Navbar />

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-8 px-6 text-center">
        <LogoMark idPrefix="hero" animated className="h-[42vmin] w-[42vmin]" />

        <h1 className="hero-title text-[11vw] font-medium text-white md:text-[5.5vw]">
          {config.headline}
        </h1>

        <p className="max-w-md text-[15px] leading-snug text-white/80">
          {config.description}
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black" />
    </section>
  )
}

export default HeroSection
