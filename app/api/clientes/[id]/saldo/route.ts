import { NextResponse } from 'next/server'
import { obtenerSaldo } from '@/lib/server/clientes'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const saldo = await obtenerSaldo(id)
    return NextResponse.json(saldo)
  } catch {
    return NextResponse.json({ error: 'Error al obtener el saldo' }, { status: 500 })
  }
}
