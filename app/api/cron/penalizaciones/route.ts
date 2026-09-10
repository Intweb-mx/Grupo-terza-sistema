import { NextResponse } from 'next/server'
import { marcarPenalizacionesDelDia } from '@/lib/server/cobranza'

// Disparado diario por un scheduler externo (Vercel Cron / GitHub Action),
// nunca por un usuario — por eso valida un secreto en vez de sesión/rol.
export async function POST(request: Request) {
  const secreto = request.headers.get('x-cron-secret')
  if (!secreto || secreto !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const resultado = await marcarPenalizacionesDelDia()
    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({ error: 'Error al aplicar penalizaciones' }, { status: 500 })
  }
}
