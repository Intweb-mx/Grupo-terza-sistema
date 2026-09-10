'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CompletarRegistroPage() {
  const router = useRouter()
  const [listo, setListo] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    // El link de invitación de Supabase deja la sesión en la URL;
    // el cliente browser la procesa al cargar.
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('El link de invitación no es válido o ya expiró')
      }
      setListo(true)
    })
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }

    setGuardando(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setGuardando(false)

    if (updateError) {
      setError('No se pudo guardar la contraseña')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (!listo) {
    return <main className="flex flex-1 items-center justify-center p-6">Cargando…</main>
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Completar registro</h1>
        <p className="text-sm text-gray-500">Elegí una contraseña para tu cuenta.</p>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Nueva contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmar" className="text-sm font-medium">
            Confirmar contraseña
          </label>
          <input
            id="confirmar"
            type="password"
            required
            minLength={8}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={guardando}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar y entrar'}
        </button>
      </form>
    </main>
  )
}
