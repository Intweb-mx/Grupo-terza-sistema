import { NextResponse } from 'next/server'
import { listarPropiedades, crearPropiedad, type CrearPropiedadInput } from '@/lib/server/propiedades'

export async function GET() {
  try {
    const propiedades = await listarPropiedades()
    return NextResponse.json(propiedades)
  } catch {
    return NextResponse.json({ error: 'Error al listar propiedades' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as CrearPropiedadInput
  try {
    const propiedad = await crearPropiedad(body)
    return NextResponse.json(propiedad, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No autorizado o datos inválidos' }, { status: 403 })
  }
}
