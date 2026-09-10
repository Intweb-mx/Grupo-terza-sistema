// Motor de cálculo del calendario de amortización quincenal.
// Reglas (CLAUDE.md):
// - Cortes: día 1 y 16 de cada mes
// - Capital = (monto_total - enganche) / plazo_quincenas, en centavos
// - Reestructura: 3% mensual (1.5% quincenal) sobre saldo insoluto
// - Todo en centavos (integer), nunca float

export type AmortizacionRow = {
  numero_pago: number
  fecha_corte: string // YYYY-MM-DD
  capital: number
  interes: number
  penalizacion: number
  total: number
}

const fechaISO = (fecha: Date) => fecha.toISOString().slice(0, 10)

// Retorna el próximo día 1 o 16 (en UTC) a partir de la fecha dada, inclusive.
export function calcularFechaCorte(fecha: Date): Date {
  const year = fecha.getUTCFullYear()
  const month = fecha.getUTCMonth()
  const day = fecha.getUTCDate()

  if (day <= 1) return new Date(Date.UTC(year, month, 1))
  if (day <= 16) return new Date(Date.UTC(year, month, 16))
  return new Date(Date.UTC(year, month + 1, 1))
}

function siguienteCorte(corteActual: Date): Date {
  const diaSiguiente = new Date(corteActual)
  diaSiguiente.setUTCDate(diaSiguiente.getUTCDate() + 1)
  return calcularFechaCorte(diaSiguiente)
}

export type ContratoParaCalendario = {
  monto_total: number // centavos
  enganche: number | null // centavos
  plazo_meses: number
  fecha_inicio: string // YYYY-MM-DD
}

// Genera el calendario completo de cuotas quincenales. El monto financiado
// se divide en partes iguales (redondeadas hacia abajo); la última cuota
// absorbe el remanente de centavos para que la suma cierre exacta contra
// (monto_total - enganche), sin depender de que la división sea exacta.
export function generarCalendario(contrato: ContratoParaCalendario): AmortizacionRow[] {
  const totalQuincenas = contrato.plazo_meses * 2
  if (totalQuincenas <= 0) {
    throw new Error('plazo_meses debe ser mayor a 0 para generar el calendario')
  }

  const montoFinanciado = contrato.monto_total - (contrato.enganche ?? 0)
  const capitalBase = Math.floor(montoFinanciado / totalQuincenas)

  const filas: AmortizacionRow[] = []
  let acumulado = 0
  let fechaCorte = calcularFechaCorte(new Date(`${contrato.fecha_inicio}T00:00:00Z`))

  for (let numero = 1; numero <= totalQuincenas; numero++) {
    const esUltima = numero === totalQuincenas
    const capital = esUltima ? montoFinanciado - acumulado : capitalBase
    acumulado += capital

    filas.push({
      numero_pago: numero,
      fecha_corte: fechaISO(fechaCorte),
      capital,
      interes: 0,
      penalizacion: 0,
      total: capital,
    })

    fechaCorte = siguienteCorte(fechaCorte)
  }

  return filas
}

const TASA_QUINCENAL_REESTRUCTURA = 0.015 // 3% mensual / 2

// Nuevo calendario tras reestructura: interés sobre saldo insoluto
// (declinante, no sobre el monto original). La aplicación de esto sobre
// un contrato real (marcar cuotas viejas como 'reestructurado', insertar
// estas filas) es responsabilidad de fase 6 — acá solo el cálculo.
export function calcularReestructura(
  saldoInsoluto: number, // centavos
  cuotasRestantes: number,
  fechaInicio: Date = new Date()
): AmortizacionRow[] {
  if (cuotasRestantes <= 0) {
    throw new Error('cuotasRestantes debe ser mayor a 0')
  }

  const capitalBase = Math.floor(saldoInsoluto / cuotasRestantes)
  const filas: AmortizacionRow[] = []
  let saldoRestante = saldoInsoluto
  let fechaCorte = calcularFechaCorte(fechaInicio)

  for (let numero = 1; numero <= cuotasRestantes; numero++) {
    const esUltima = numero === cuotasRestantes
    const capital = esUltima ? saldoRestante : capitalBase
    const interes = Math.round(saldoRestante * TASA_QUINCENAL_REESTRUCTURA)
    saldoRestante -= capital

    filas.push({
      numero_pago: numero,
      fecha_corte: fechaISO(fechaCorte),
      capital,
      interes,
      penalizacion: 0,
      total: capital + interes,
    })

    fechaCorte = siguienteCorte(fechaCorte)
  }

  return filas
}
