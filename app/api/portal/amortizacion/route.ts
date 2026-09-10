import { NextResponse } from 'next/server'
import { obtenerAmortizacionPortal, NoAutorizadoError } from '@/lib/server/portal'

export async function GET() {
  try {
    const amortizacion = await obtenerAmortizacionPortal()
    return NextResponse.json(amortizacion)
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Error al obtener la amortización' }, { status: 500 })
  }
}
