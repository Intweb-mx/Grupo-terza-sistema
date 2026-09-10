import { NextResponse } from 'next/server'
import { invitarClienteAlPortal, NoAutorizadoError } from '@/lib/server/clientes'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const resultado = await invitarClienteAlPortal(id)
    return NextResponse.json(resultado, { status: 201 })
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    const mensaje = error instanceof Error ? error.message : 'No se pudo invitar al cliente'
    return NextResponse.json({ error: mensaje }, { status: 400 })
  }
}
