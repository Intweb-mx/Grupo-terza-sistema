import { NextResponse } from 'next/server'
import { obtenerSaldoPortal, NoAutorizadoError } from '@/lib/server/portal'

export async function GET() {
  try {
    const saldo = await obtenerSaldoPortal()
    return NextResponse.json(saldo)
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Error al obtener el saldo' }, { status: 500 })
  }
}
