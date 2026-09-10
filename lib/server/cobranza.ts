import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcularReestructura } from '@/lib/server/amortizacion'
import { getUsuarioActual } from '@/lib/server/auth'

const PENALIZACION_MONTO = 30000 // $300 MXN en centavos
const DIAS_PARA_PENALIZAR = 3

export class NoAutorizadoError extends Error {}

export type RegistrarPagoInput = {
  cliente_id: string
  monto: number // centavos
  fecha: string // YYYY-MM-DD
  referencia?: string
  metodo_pago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta'
}

// Aplica el pago a la cuota pendiente/vencida más antigua del contrato de
// compraventa del cliente. No maneja pagos parciales sobre una misma cuota
// (si el monto no cubre el total, se registra el pago pero la cuota sigue
// pendiente) — eso queda pendiente de definir si hace falta más adelante.
export async function registrarPago(input: RegistrarPagoInput) {
  const supabase = await createServerSupabaseClient()

  const { data: contrato, error: errorContrato } = await supabase
    .from('contratos')
    .select('id, propiedad_id')
    .eq('cliente_id', input.cliente_id)
    .eq('tipo', 'compraventa')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (errorContrato) throw errorContrato
  if (!contrato) throw new Error('El cliente no tiene un contrato de compraventa activo')

  const { data: cuota, error: errorCuota } = await supabase
    .from('amortizaciones')
    .select('id, total')
    .eq('contrato_id', contrato.id)
    .in('estado', ['pendiente', 'vencido'])
    .order('fecha_corte', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (errorCuota) throw errorCuota

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: pago, error: errorPago } = await supabase
    .from('pagos')
    .insert({
      cliente_id: input.cliente_id,
      contrato_id: contrato.id,
      amortizacion_id: cuota?.id ?? null,
      monto: input.monto,
      fecha: input.fecha,
      referencia: input.referencia,
      metodo_pago: input.metodo_pago,
      registrado_por: user?.id,
    })
    .select('id, created_at')
    .single()
  if (errorPago) throw errorPago

  if (cuota && input.monto >= cuota.total) {
    const { error: errorUpdate } = await supabase
      .from('amortizaciones')
      .update({ estado: 'pagado', fecha_pago_real: input.fecha })
      .eq('id', cuota.id)
    if (errorUpdate) throw errorUpdate
  }

  // Regla: "movimiento de ingreso se registra al recibir un pago" (fase 8).
  // Si la propiedad no tiene proyecto asignado, el ingreso queda sin
  // proyecto (proyecto_id null) — no rompe el pago por eso.
  //
  // Usa el cliente admin: quien registra el pago puede ser un asesor, que
  // no tiene permiso de escritura sobre movimientos_contables (solo
  // dueño/administrador/contador). Es el mismo patrón del bug que ya
  // apareció con el trigger de disponibilidad de propiedades (fase 4) — acá
  // se evita desde el diseño en vez de descubrirlo probando.
  const admin = createAdminClient()

  const { data: propiedad } = await supabase
    .from('propiedades')
    .select('proyecto_id')
    .eq('id', contrato.propiedad_id)
    .single()

  const { error: errorMovimiento } = await admin.from('movimientos_contables').insert({
    proyecto_id: propiedad?.proyecto_id ?? null,
    tipo: 'ingreso',
    categoria: 'cobranza',
    descripcion: `Pago de cliente ${input.cliente_id}`,
    monto: input.monto,
    fecha: input.fecha,
    referencia: input.referencia,
  })
  if (errorMovimiento) throw errorMovimiento

  const { data: pendientes, error: errorSaldo } = await supabase
    .from('amortizaciones')
    .select('total')
    .eq('contrato_id', contrato.id)
    .neq('estado', 'pagado')
  if (errorSaldo) throw errorSaldo

  const saldoRestante = pendientes.reduce((suma, fila) => suma + fila.total, 0)

  return { id: pago.id, saldo_restante: saldoRestante, created_at: pago.created_at }
}

// Corre como proceso de sistema (cron), sin sesión de usuario — usa el
// cliente admin para saltar la RLS de "penalizaciones" (dueño/administrador
// únicamente). Idempotente: el índice único en amortizacion_id evita que
// una segunda corrida del cron duplique la penalización.
export async function marcarPenalizacionesDelDia(hoy: string = new Date().toISOString().slice(0, 10)) {
  const admin = createAdminClient()

  const fechaLimite = new Date(`${hoy}T00:00:00Z`)
  fechaLimite.setUTCDate(fechaLimite.getUTCDate() - DIAS_PARA_PENALIZAR)
  const fechaCorteObjetivo = fechaLimite.toISOString().slice(0, 10)

  const { data: cuotasVencidas, error } = await admin
    .from('amortizaciones')
    .select('id, capital, interes, total')
    .eq('fecha_corte', fechaCorteObjetivo)
    .in('estado', ['pendiente', 'vencido'])
  if (error) throw error

  let aplicadas = 0
  for (const cuota of cuotasVencidas) {
    const { error: errorInsert } = await admin.from('penalizaciones').insert({
      amortizacion_id: cuota.id,
      monto: PENALIZACION_MONTO,
      fecha_aplicacion: hoy,
    })
    // El índice único hace que un duplicado falle — se ignora, es esperado
    // si el cron ya corrió hoy.
    if (errorInsert) {
      if (errorInsert.code === '23505') continue
      throw errorInsert
    }

    const { error: errorUpdate } = await admin
      .from('amortizaciones')
      .update({
        estado: 'vencido',
        penalizacion: PENALIZACION_MONTO,
        total: cuota.capital + cuota.interes + PENALIZACION_MONTO,
      })
      .eq('id', cuota.id)
    if (errorUpdate) throw errorUpdate

    aplicadas++
  }

  return { revisadas: cuotasVencidas.length, penalizaciones_aplicadas: aplicadas }
}

const ROLES_QUE_REESTRUCTURAN = ['dueno', 'administrador'] as const

// Regla de negocio: reestructura solo procede "al vencer el plazo con saldo
// insoluto" (CLAUDE.md) — no es una herramienta para renegociar en cualquier
// momento. Se valida que la última cuota original ya haya vencido.
export async function reestructurarContrato(clienteId: string) {
  const solicitante = await getUsuarioActual()
  if (!solicitante || !ROLES_QUE_REESTRUCTURAN.includes(solicitante.rol as 'dueno' | 'administrador')) {
    throw new NoAutorizadoError('Solo dueño o administrador pueden reestructurar')
  }

  const supabase = await createServerSupabaseClient()

  const { data: contrato, error: errorContrato } = await supabase
    .from('contratos')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('tipo', 'compraventa')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (errorContrato) throw errorContrato
  if (!contrato) throw new Error('El cliente no tiene un contrato de compraventa')

  const { data: cuotas, error: errorCuotas } = await supabase
    .from('amortizaciones')
    .select('id, numero_pago, fecha_corte, capital, estado')
    .eq('contrato_id', contrato.id)
    .order('numero_pago', { ascending: true })
  if (errorCuotas) throw errorCuotas
  if (cuotas.length === 0) throw new Error('El contrato no tiene calendario de amortización')

  const ultimaCuota = cuotas[cuotas.length - 1]
  const hoy = new Date().toISOString().slice(0, 10)
  if (ultimaCuota.fecha_corte >= hoy) {
    throw new Error('El plazo del contrato todavía no vence — no se puede reestructurar')
  }

  const cuotasInsolutas = cuotas.filter((c) => c.estado !== 'pagado')
  const saldoInsoluto = cuotasInsolutas.reduce((suma, c) => suma + c.capital, 0)
  if (saldoInsoluto <= 0) {
    throw new Error('El contrato no tiene saldo insoluto — no hace falta reestructurar')
  }

  const nuevoCalendario = calcularReestructura(saldoInsoluto, cuotasInsolutas.length, new Date())
  const numeroBase = ultimaCuota.numero_pago

  const { error: errorMarcar } = await supabase
    .from('amortizaciones')
    .update({ estado: 'reestructurado' })
    .in(
      'id',
      cuotasInsolutas.map((c) => c.id)
    )
  if (errorMarcar) throw errorMarcar

  const { error: errorInsertar } = await supabase.from('amortizaciones').insert(
    nuevoCalendario.map((fila) => ({
      ...fila,
      numero_pago: numeroBase + fila.numero_pago,
      contrato_id: contrato.id,
    }))
  )
  if (errorInsertar) throw errorInsertar

  return {
    nuevo_calendario: nuevoCalendario,
    fecha_aplicacion: hoy,
    interes_aplicado: '3% mensual sobre saldo insoluto',
    cuotas_generadas: nuevoCalendario.length,
  }
}
