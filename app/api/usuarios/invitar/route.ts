import { NextResponse } from 'next/server'
import { invitarUsuario, NoAutorizadoError, type InvitarUsuarioInput } from '@/lib/server/usuarios'

export async function POST(request: Request) {
  const body = (await request.json()) as InvitarUsuarioInput
  try {
    const usuario = await invitarUsuario(body)
    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'No se pudo invitar al usuario' }, { status: 400 })
  }
}
