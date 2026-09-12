import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function VolverLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5 transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5" />
      {label}
    </Link>
  )
}
