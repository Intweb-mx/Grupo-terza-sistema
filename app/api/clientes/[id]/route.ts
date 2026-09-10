import { NextResponse } from 'next/server'
import { obtenerCliente } from '@/lib/server/clientes'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const cliente = await obtenerCliente(id)
    return NextResponse.json(cliente)
  } catch {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }
}
