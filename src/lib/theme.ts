/**
 * Single JS-side source of truth for theme colors. Every value is a
 * `var(--token)` reference into src/styles.css — to re-theme the app, edit
 * the `:root` / `.dark` blocks there; nothing in component code needs to
 * change.
 */
export const theme = {
  ink: 'var(--sea-ink)',
  inkSoft: 'var(--sea-ink-soft)',
  lagoon: 'var(--lagoon)',
  lagoonDeep: 'var(--lagoon-deep)',
  palm: 'var(--palm)',
  sand: 'var(--sand)',
  foam: 'var(--foam)',
  surface: 'var(--surface)',
  surfaceStrong: 'var(--surface-strong)',
  line: 'var(--line)',
} as const

export type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

/** Maps dardibook's payment_status values to a status-pill visual variant. */
export function paymentStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'Paid':
      return 'success'
    case 'Unpaid':
      return 'danger'
    case 'Refunded':
      return 'warning'
    case 'Not Required':
    default:
      return 'neutral'
  }
}
