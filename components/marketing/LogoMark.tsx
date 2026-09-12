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

// Cámara lenta: piezas grandes y muy espaciadas en el tiempo para que la
// entrada desde el borde se alcance a leer antes de que la siguiente
// arranque.
const DELAY_MS = [
  0, 120, 240, 360, 480, 620, // anillos + detalle
  800, 920, // techos
  1100, 1220, 1340, 1460, 1580, 1700, // torres
  1950, // viga final
]

// Dirección de entrada por pieza: los anillos dorados/gris "giran" hasta
// encajar (como un engrane armándose). El azul (piezas 3 y 4, los dos
// anillos navy) cae desde arriba hasta su posición normal, sin girar de
// más. El monograma entra volando desde el borde de pantalla más cercano
// a su posición real, girando en el trayecto — techos desde arriba,
// torres izquierdas/derechas desde su lado, viga final desde abajo (la
// base que amarra todo al final).
const VARIANTE: Array<'anillo' | 'arriba' | 'abajo' | 'izquierda' | 'derecha'> = [
  'anillo', 'anillo', 'anillo', 'arriba', 'arriba', 'anillo',
  'arriba', 'arriba',
  'izquierda', 'izquierda', 'izquierda', 'derecha', 'derecha', 'derecha',
  'abajo',
]

export const LogoMark: FC<Props> = ({ idPrefix, animated = false, className }) => {
  const piece = (index: number) =>
    animated
      ? {
          className: `logo-piece logo-piece--${VARIANTE[index]}`,
          style: { animationDelay: `${DELAY_MS[index]}ms` },
        }
      : {}

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
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#07101a" floodOpacity=".18" />
        </filter>
        {/* Filtro "goo": difumina y luego recontrasta para redondear los
            vértices agudos del monograma sin rediseñar el trazado — look
            más fluido/orgánico en vez del borde geométrico duro. */}
        <filter id={`${idPrefix}-goo`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
          />
        </filter>
      </defs>

      <g filter={`url(#${idPrefix}-shadow)`}>
        <circle cx="600" cy="600" r="505" fill={`url(#${idPrefix}-gold)`} {...piece(0)} />
        <circle cx="600" cy="600" r="472" fill="#69717a" {...piece(1)} />
        <circle cx="600" cy="600" r="451" fill={`url(#${idPrefix}-gold)`} {...piece(2)} />
        <circle cx="600" cy="600" r="421" fill="#0b2339" {...piece(3)} />
        <circle cx="600" cy="600" r="397" fill={`url(#${idPrefix}-navy)`} {...piece(4)} />
        <circle
          cx="600"
          cy="600"
          r="405"
          fill="none"
          stroke="#9fd0e2"
          strokeOpacity=".15"
          strokeWidth="5"
          {...piece(5)}
        />
      </g>

      <g fill={`url(#${idPrefix}-mark)`} filter={`url(#${idPrefix}-goo)`}>
        {/* Techo superior */}
        <path d="M600 285 410 438v82l190-148 190 148v-82z" {...piece(6)} />
        {/* Techo medio */}
        <path d="M600 404 410 557v82l190-148 190 148v-82z" {...piece(7)} />
        {/* Torres inferiores / monograma arquitectónico */}
        <path d="M410 620 456 584v170l-46 37z" {...piece(8)} />
        <path d="M475 570 520 535v179l-45 36z" {...piece(9)} />
        <path d="M540 512 585 477v179l-45 36z" {...piece(10)} />
        <path d="M615 477 660 512v179l-45-36z" {...piece(11)} />
        <path d="M680 535 725 570v180l-45-36z" {...piece(12)} />
        <path d="M744 584 790 620v171l-46-37z" {...piece(13)} />
        {/* Vigas que unen el símbolo */}
        <path d="M600 522 398 684v82l202-162 202 162v-82z" {...piece(14)} />
      </g>
    </svg>
  )
}
