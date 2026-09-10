import { NextResponse } from 'next/server'
import { obtenerKpis, NoAutorizadoError } from '@/lib/server/reportes'

export async function GET() {
  try {
    const kpis = await obtenerKpis()
    return NextResponse.json(kpis)
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Error al calcular KPIs' }, { status: 500 })
  }
}
