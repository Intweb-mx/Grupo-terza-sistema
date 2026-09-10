import { NextResponse } from 'next/server'
import { listarContratos, crearContrato, type CrearContratoInput } from '@/lib/server/contratos'

export async function GET() {
  try {
    const contratos = await listarContratos()
    return NextResponse.json(contratos)
  } catch {
    return NextResponse.json({ error: 'Error al listar contratos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as CrearContratoInput
  try {
    const contrato = await crearContrato(body)
    return NextResponse.json(contrato, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No autorizado o datos inválidos' }, { status: 403 })
  }
}
