import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(timestampMs: number): string {
  return format(new Date(timestampMs), 'd MMM yyyy')
}

export function formatDateTime(timestampMs: number): string {
  return format(new Date(timestampMs), 'd MMM yyyy, h:mm a')
}

export function formatRelative(timestampMs: number): string {
  return formatDistanceToNow(new Date(timestampMs), { addSuffix: true })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Latest timestamp in a dardibook `number[]` date array, or null if empty. */
export function latestTimestamp(dates: number[] | undefined): number | null {
  if (!dates || dates.length === 0) return null
  return Math.max(...dates)
}
