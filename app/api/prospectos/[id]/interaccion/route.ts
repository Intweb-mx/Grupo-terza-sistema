import { NextResponse } from 'next/server'
import { agregarInteraccion, type AgregarInteraccionInput } from '@/lib/server/prospectos'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await request.json()) as AgregarInteraccionInput
  try {
    const interaccion = await agregarInteraccion(id, body)
    return NextResponse.json(interaccion, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No autorizado o datos inválidos' }, { status: 403 })
  }
}
