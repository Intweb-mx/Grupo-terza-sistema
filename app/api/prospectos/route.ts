import { NextResponse } from 'next/server'
import { listarProspectos, crearProspecto, type CrearProspectoInput } from '@/lib/server/prospectos'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  try {
    const prospectos = await listarProspectos({
      asesor_id: searchParams.get('asesor_id') ?? undefined,
      etapa: searchParams.get('etapa') ?? undefined,
      fuente: searchParams.get('fuente') ?? undefined,
    })
    return NextResponse.json(prospectos)
  } catch {
    return NextResponse.json({ error: 'Error al listar prospectos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as CrearProspectoInput
  try {
    const prospecto = await crearProspecto(body)
    return NextResponse.json(prospecto, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No autorizado o datos inválidos' }, { status: 403 })
  }
}
