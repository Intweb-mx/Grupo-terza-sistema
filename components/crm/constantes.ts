export const ETAPAS = [
  'nuevo',
  'contactado',
  'interesado',
  'negociacion',
  'cerrado',
  'perdido',
] as const

export const FUENTES = [
  'referido',
  'facebook',
  'instagram',
  'tiktok',
  'portal',
  'directo',
  'otro',
] as const

export const ETIQUETA_ETAPA: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  interesado: 'Interesado',
  negociacion: 'Negociación',
  cerrado: 'Cerrado',
  perdido: 'Perdido',
}
