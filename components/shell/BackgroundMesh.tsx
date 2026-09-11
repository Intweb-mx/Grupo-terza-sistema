// Manchas de color desenfocadas, fijas detrás del contenido. Le da textura
// al fondo para que los paneles de vidrio (Card, Sidebar, popovers,
// backdrop-blur en general) tengan algo que esmerilar — sobre un fondo
// plano el efecto no se nota.
export function BackgroundMesh() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute top-1/4 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
    </div>
  )
}
