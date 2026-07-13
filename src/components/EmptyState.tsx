import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="island-shell flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--chip-bg)] text-[var(--sea-ink-soft)]">
        <Icon className="size-5" />
      </span>
      <h3 className="m-0 text-base font-semibold text-[var(--sea-ink)]">{title}</h3>
      {description && (
        <p className="m-0 max-w-sm text-sm text-[var(--sea-ink-soft)]">{description}</p>
      )}
      {action}
    </div>
  )
}
