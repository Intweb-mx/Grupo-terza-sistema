// Fondo ambiental fijo detrás del contenido: degradado azulado muy suave +
// manchas de color desenfocadas (le dan textura a los paneles de vidrio
// para que el esmerilado se note).
export function BackgroundMesh() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-transparent to-blue-50/40" />
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute top-1/4 -right-32 h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />
    </div>
  )
}
