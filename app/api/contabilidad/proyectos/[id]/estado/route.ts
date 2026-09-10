import { NextResponse } from 'next/server'
import { obtenerEstadoProyecto } from '@/lib/server/contabilidad'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const estado = await obtenerEstadoProyecto(id)
    return NextResponse.json(estado)
  } catch {
    return NextResponse.json({ error: 'Error al calcular el estado del proyecto' }, { status: 500 })
  }
}
