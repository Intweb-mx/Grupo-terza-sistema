// Integración con el PAC (Facturama, SW Sapien, Diverza...) — nunca generar
// XML de CFDI directamente, siempre a través del proveedor timbrador
// configurado (CLAUDE.md). Sin proveedor elegido todavía: estas funciones
// tienen la forma final pero lanzan NoConfiguradoError hasta que se elija
// uno y se agreguen sus credenciales (nunca como service_role — un cliente
// HTTP nuevo, con sus propias env vars, cuando se conecte).

export class NoConfiguradoError extends Error {}

const MOTIVOS_SAT_VALIDOS = ['01', '02', '03', '04'] as const
type MotivoSat = (typeof MOTIVOS_SAT_VALIDOS)[number]

export type DatosFiscales = {
  rfc: string
  razon_social: string
  uso_cfdi: string
  regimen_fiscal: string
}

// Envía el movimiento contable al PAC para timbrado y guarda el UUID
// resultante. El UUID es inmutable a nivel DB (trigger en la migración 008)
// — ni un bug de esta función podría sobreescribirlo después.
export async function emitirCfdi(_movimientoId: string, _datosFiscales: DatosFiscales) {
  throw new NoConfiguradoError(
    'No hay PAC configurado todavía. Elegir proveedor (Facturama/SW Sapien/Diverza) y agregar sus credenciales antes de timbrar.'
  )

  // Forma que va a tener una vez conectado un PAC real:
  //
  // const supabase = await createServerSupabaseClient()
  // const respuestaPac = await clientePac.timbrar({ movimientoId, ..._datosFiscales })
  // const { error } = await supabase
  //   .from('movimientos_contables')
  //   .update({ cfdi_uuid: respuestaPac.uuid, cfdi_estado: 'vigente' })
  //   .eq('id', movimientoId)
  // if (error) throw error
  // return { uuid: respuestaPac.uuid }
}

export async function cancelarCfdi(movimientoId: string, motivo: MotivoSat) {
  if (!MOTIVOS_SAT_VALIDOS.includes(motivo)) {
    throw new Error(
      'Motivo de cancelación SAT inválido — debe ser 01, 02, 03 o 04'
    )
  }

  throw new NoConfiguradoError(
    'No hay PAC configurado todavía. Elegir proveedor y agregar sus credenciales antes de cancelar un CFDI.'
  )

  // Forma que va a tener una vez conectado un PAC real:
  //
  // const supabase = await createServerSupabaseClient()
  // await clientePac.cancelar({ movimientoId, motivo })
  // const { error } = await supabase
  //   .from('movimientos_contables')
  //   .update({ cfdi_estado: 'cancelado', cfdi_motivo_cancelacion: motivo })
  //   .eq('id', movimientoId)
  // if (error) throw error
}
