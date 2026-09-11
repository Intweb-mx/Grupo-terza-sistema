// Emblema real de Grupo Terza (SVG provisto por el usuario). Un solo
// componente sirve para dos usos:
//   - navbar: chico, estático (idPrefix distinto para no chocar ids de
//     gradiente/filtro con la versión animada que vive en la misma página)
//   - hero: grande, con animación de "construcción" pieza por pieza
//     (respeta prefers-reduced-motion: sin preferencia => se anima;
//     con preferencia de menos movimiento => aparece armado de una vez)

import type { FC } from 'react'

type Props = {
  idPrefix: string
  animated?: boolean
  className?: string
}

// Delay en ms por pieza, en orden de "construcción": anillos exteriores
// hacia el centro, luego el monograma (techos, torres de izquierda a
// derecha, viga final que amarra todo).
const DELAY_MS = [
  0, 90, 180, 270, 360, 420, 480, // anillos + detalle
  620, 720, // techos
  840, 930, 1020, 1110, 1200, 1290, // torres
  1430, // viga final
]

export const LogoMark: FC<Props> = ({ idPrefix, animated = false, className }) => {
  const piece = (index: number) =>
    animated ? { className: 'logo-piece', style: { animationDelay: `${DELAY_MS[index]}ms` } } : {}

  return (
    <svg viewBox="0 0 1200 1200" role="img" aria-labelledby={`${idPrefix}-title`} className={className}>
      <title id={`${idPrefix}-title`}>Grupo Terza</title>
      <defs>
        <linearGradient id={`${idPrefix}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7e5c19" />
          <stop offset=".22" stopColor="#e3bd63" />
          <stop offset=".5" stopColor="#b4862b" />
          <stop offset=".76" stopColor="#f6d985" />
          <stop offset="1" stopColor="#8a641e" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-navy`} x1="0" y1="0" x2=".8" y2="1">
          <stop stopColor="#294961" />
          <stop offset=".52" stopColor="#102d45" />
          <stop offset="1" stopColor="#071e33" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-mark`} x1="0" y1="0" x2="1" y2=".85">
          <stop stopColor="#e3e5e2" />
          <stop offset=".48" stopColor="#b7b4b2" />
          <stop offset=".75" stopColor="#f1bda8" />
          <stop offset="1" stopColor="#f5d4c2" />
        </linearGradient>
        <filter id={`${idPrefix}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="15" floodColor="#07101a" floodOpacity=".32" />
        </filter>
      </defs>

      <g filter={`url(#${idPrefix}-shadow)`}>
        <circle cx="600" cy="600" r="505" fill={`url(#${idPrefix}-gold)`} {...piece(0)} />
        <circle cx="600" cy="600" r="472" fill="#69717a" {...piece(1)} />
        <circle cx="600" cy="600" r="451" fill={`url(#${idPrefix}-gold)`} {...piece(2)} />
        <circle cx="600" cy="600" r="421" fill="#0b2339" {...piece(3)} />
        <circle cx="600" cy="600" r="397" fill={`url(#${idPrefix}-navy)`} {...piece(4)} />
        <ellipse cx="510" cy="390" rx="255" ry="145" fill="#6d8090" opacity=".12" {...piece(5)} />
        <circle
          cx="600"
          cy="600"
          r="405"
          fill="none"
          stroke="#9fd0e2"
          strokeOpacity=".15"
          strokeWidth="5"
          {...piece(6)}
        />
      </g>

      <g fill={`url(#${idPrefix}-mark)`}>
        {/* Techo superior */}
        <path d="M600 285 410 438v82l190-148 190 148v-82z" {...piece(7)} />
        {/* Techo medio */}
        <path d="M600 404 410 557v82l190-148 190 148v-82z" {...piece(8)} />
        {/* Torres inferiores / monograma arquitectónico */}
        <path d="M410 620 456 584v170l-46 37z" {...piece(9)} />
        <path d="M475 570 520 535v179l-45 36z" {...piece(10)} />
        <path d="M540 512 585 477v179l-45 36z" {...piece(11)} />
        <path d="M615 477 660 512v179l-45-36z" {...piece(12)} />
        <path d="M680 535 725 570v180l-45-36z" {...piece(13)} />
        <path d="M744 584 790 620v171l-46-37z" {...piece(14)} />
        {/* Vigas que unen el símbolo */}
        <path d="M600 522 398 684v82l202-162 202 162v-82z" {...piece(15)} />
      </g>
    </svg>
  )
}
