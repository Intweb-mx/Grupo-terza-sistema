import { NextResponse } from 'next/server'
import { listarClientes, crearCliente, type CrearClienteInput } from '@/lib/server/clientes'

export async function GET() {
  try {
    const clientes = await listarClientes()
    return NextResponse.json(clientes)
  } catch {
    return NextResponse.json({ error: 'Error al listar clientes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as CrearClienteInput
  try {
    const cliente = await crearCliente(body)
    return NextResponse.json(cliente, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No autorizado o datos inválidos' }, { status: 403 })
  }
}
