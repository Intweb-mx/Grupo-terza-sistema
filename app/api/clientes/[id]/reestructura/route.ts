import { NextResponse } from 'next/server'
import { reestructurarContrato, NoAutorizadoError } from '@/lib/server/cobranza'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const resultado = await reestructurarContrato(id)
    return NextResponse.json(resultado)
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    const mensaje = error instanceof Error ? error.message : 'No se pudo reestructurar'
    return NextResponse.json({ error: mensaje }, { status: 400 })
  }
}
