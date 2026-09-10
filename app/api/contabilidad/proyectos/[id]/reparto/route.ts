import { NextResponse } from 'next/server'
import { obtenerRepartoUtilidades } from '@/lib/server/contabilidad'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const reparto = await obtenerRepartoUtilidades(id)
    return NextResponse.json(reparto)
  } catch {
    return NextResponse.json({ error: 'Error al calcular el reparto' }, { status: 500 })
  }
}
