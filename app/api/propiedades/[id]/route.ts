import { NextResponse } from 'next/server'
import { obtenerPropiedad, actualizarPropiedad } from '@/lib/server/propiedades'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const propiedad = await obtenerPropiedad(id)
    return NextResponse.json(propiedad)
  } catch {
    return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cambios = await request.json()
  try {
    const resultado = await actualizarPropiedad(id, cambios)
    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({ error: 'No autorizado o datos inválidos' }, { status: 403 })
  }
}
