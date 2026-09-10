import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { registrarMovimiento, type RegistrarMovimientoInput } from '@/lib/server/contabilidad'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const proyectoId = searchParams.get('proyecto_id')

  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from('movimientos_contables')
    .select('id, proyecto_id, tipo, categoria, descripcion, monto, fecha, referencia, cfdi_uuid, cfdi_estado')
    .order('fecha', { ascending: false })
  if (proyectoId) query = query.eq('proyecto_id', proyectoId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Error al listar movimientos' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegistrarMovimientoInput
  try {
    const movimiento = await registrarMovimiento(body)
    return NextResponse.json(movimiento, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No autorizado o datos inválidos' }, { status: 403 })
  }
}
