const formateador = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export function formatearCentavos(centavos: number): string {
  return formateador.format(centavos / 100)
}
