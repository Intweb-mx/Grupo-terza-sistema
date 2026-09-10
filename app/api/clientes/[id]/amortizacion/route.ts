import { NextResponse } from 'next/server'
import { obtenerAmortizacion } from '@/lib/server/clientes'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const amortizacion = await obtenerAmortizacion(id)
    return NextResponse.json(amortizacion)
  } catch {
    return NextResponse.json({ error: 'Error al obtener la amortización' }, { status: 500 })
  }
}
