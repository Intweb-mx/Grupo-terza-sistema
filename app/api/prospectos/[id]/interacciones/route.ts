import { NextResponse } from 'next/server'
import { listarInteracciones } from '@/lib/server/prospectos'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const interacciones = await listarInteracciones(id)
    return NextResponse.json(interacciones)
  } catch {
    return NextResponse.json({ error: 'Error al listar interacciones' }, { status: 500 })
  }
}
