export const TIPOS_PROPIEDAD = [
  'casa',
  'departamento',
  'local',
  'oficina',
  'terreno',
] as const

export const ESTADOS_DISPONIBILIDAD = [
  'disponible',
  'reservado',
  'vendido',
  'rentado',
] as const

export const COLOR_POR_ESTADO: Record<string, string> = {
  disponible: 'bg-green-100 text-green-800 border-green-300',
  reservado: 'bg-amber-100 text-amber-800 border-amber-300',
  vendido: 'bg-red-100 text-red-800 border-red-300',
  rentado: 'bg-blue-100 text-blue-800 border-blue-300',
}

export const ROLES_CON_PERMISO_ESCRITURA = ['dueno', 'administrador']
