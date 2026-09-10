'use client'

import { useState } from 'react'
import { MovimientosListado } from './MovimientosListado'
import { MovimientoForm } from './MovimientoForm'

export function ContabilidadPanel({ puedeGestionar }: { puedeGestionar: boolean }) {
  const [recargar, setRecargar] = useState(0)

  return (
    <div className="space-y-4">
      {puedeGestionar && (
        <div className="flex justify-end">
          <MovimientoForm onGuardado={() => setRecargar((n) => n + 1)} />
        </div>
      )}
      <MovimientosListado recargar={recargar} />
    </div>
  )
}
