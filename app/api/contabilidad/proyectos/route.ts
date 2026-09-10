import { NextResponse } from 'next/server'
import { listarProyectos } from '@/lib/server/contabilidad'

export async function GET() {
  try {
    const proyectos = await listarProyectos()
    return NextResponse.json(proyectos)
  } catch {
    return NextResponse.json({ error: 'Error al listar proyectos' }, { status: 500 })
  }
}
