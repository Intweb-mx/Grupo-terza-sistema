'use client'

import { useState } from 'react'
import { MovimientosListado } from './MovimientosListado'
import { MovimientoForm } from './MovimientoForm'

type Proyecto = { id: string; nombre: string }

export function ContabilidadPanel({
  puedeGestionar,
  proyectos,
}: {
  puedeGestionar: boolean
  proyectos: Proyecto[]
}) {
  const [recargar, setRecargar] = useState(0)

  return (
    <div className="space-y-4">
      {puedeGestionar && (
        <div className="flex justify-end">
          <MovimientoForm proyectos={proyectos} onGuardado={() => setRecargar((n) => n + 1)} />
        </div>
      )}
      <MovimientosListado recargar={recargar} proyectos={proyectos} />
    </div>
  )
}
