import { NextResponse } from 'next/server'
import { actualizarEtapa, type Etapa } from '@/lib/server/prospectos'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { etapa } = (await request.json()) as { etapa: Etapa }
  try {
    const resultado = await actualizarEtapa(id, etapa)
    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({ error: 'No autorizado o dato inválido' }, { status: 403 })
  }
}
