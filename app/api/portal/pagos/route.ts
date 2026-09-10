import { NextResponse } from 'next/server'
import { obtenerPagosPortal, NoAutorizadoError } from '@/lib/server/portal'

export async function GET() {
  try {
    const pagos = await obtenerPagosPortal()
    return NextResponse.json(pagos)
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Error al obtener el historial de pagos' }, { status: 500 })
  }
}
