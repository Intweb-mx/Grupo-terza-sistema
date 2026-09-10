import { NextResponse } from 'next/server'
import { obtenerCarteraVencida, NoAutorizadoError } from '@/lib/server/reportes'

export async function GET() {
  try {
    const cartera = await obtenerCarteraVencida()
    return NextResponse.json(cartera)
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Error al calcular cartera vencida' }, { status: 500 })
  }
}
