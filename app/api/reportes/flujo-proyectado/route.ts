import { NextResponse } from 'next/server'
import { obtenerFlujoProyectado, NoAutorizadoError } from '@/lib/server/reportes'

export async function GET() {
  try {
    const flujo = await obtenerFlujoProyectado()
    return NextResponse.json(flujo)
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Error al calcular flujo proyectado' }, { status: 500 })
  }
}
