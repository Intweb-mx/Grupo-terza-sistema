import { NextResponse } from 'next/server'
import { getUsuarioActual } from '@/lib/server/auth'

export async function GET() {
  const usuario = await getUsuarioActual()
  if (!usuario) return NextResponse.json(null)
  const { id, nombre, email, rol, activo } = usuario
  return NextResponse.json({ id, nombre, email, rol, activo })
}
