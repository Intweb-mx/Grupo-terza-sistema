import { NextResponse } from 'next/server'
import { registrarPago, type RegistrarPagoInput } from '@/lib/server/cobranza'

export async function POST(request: Request) {
  const body = (await request.json()) as RegistrarPagoInput
  try {
    const pago = await registrarPago(body)
    return NextResponse.json(pago, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo registrar el pago' }, { status: 400 })
  }
}
