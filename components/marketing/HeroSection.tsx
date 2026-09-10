// Hero de landing: video de fondo a pantalla completa, navbar en píldoras
// flotantes, titular gigante escalonado, bloques de estadísticas con
// divisores diagonales. Basado en la referencia "securify" (skill
// saas-video-hero) — layout fijo, contenido adaptado a Grupo Terza.

import type { FC } from 'react'
import Link from 'next/link'

type NavLink = { label: string; href: string }
type Stat = { value: string; label: string; align: 'left' | 'right' }

const config = {
  brand: 'terza',
  // Placeholder genérico (video de la skill) — reemplazar por metraje propio
  // de propiedades/desarrollos cuando haya uno disponible.
  videoSrc:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4',
  navLinks: [
    { label: 'propiedades', href: '#propiedades' },
    { label: 'cartera', href: '#cartera' },
    { label: 'contratos', href: '#contratos' },
    { label: 'contacto', href: '#contacto' },
  ] satisfies NavLink[],
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

const Logo: FC = () => (
  <svg viewBox="0 0 256 256" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#ffffff"
      d="M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z
         M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z
         M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z
         M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z"
    />
  </svg>
)

const Navbar: FC = () => (
  <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-4 px-6 pt-6 md:px-10">
    <div className="flex items-center gap-2 rounded-full bg-neutral-900/90 py-3 pl-4 pr-6 backdrop-blur">
      <Logo />
      <span className="text-sm font-normal tracking-tight text-white">{config.brand}</span>
    </div>

    <div className="hidden items-center gap-1 rounded-full bg-neutral-900/90 px-3 py-2 backdrop-blur md:flex">
      {config.navLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="rounded-full px-5 py-2 text-sm text-neutral-300 transition-colors hover:text-white"
        >
          {link.label}
        </a>
      ))}
    </div>

    <Link
      href={config.ctaHref}
      className="rounded-full bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
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
  const [word1, word2, word3] = config.headline

  return (
    <section className="hero-font relative h-screen w-full overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={config.videoSrc}
        autoPlay
        loop
        muted
        playsInline
      />

      <Navbar />

      <div className="relative h-full w-full">
        <h1 className="hero-title absolute left-4 top-[18%] text-[14vw] font-medium text-white md:left-10 md:text-[13vw]">
          {word1}
        </h1>
        <h1 className="hero-title absolute right-4 top-[38%] text-[14vw] font-medium text-white md:right-10 md:text-[13vw]">
          {word2}
        </h1>
        <h1 className="hero-title absolute left-[18%] top-[58%] text-[14vw] font-medium text-white md:left-[28%] md:text-[13vw]">
          {word3}
        </h1>

        <p className="absolute left-6 top-[46%] max-w-[240px] text-[15px] leading-snug text-white/90 md:left-10">
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
