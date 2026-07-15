export function phoneInitials(phone: string | null | undefined) {
  if (!phone) return 'P'
  const digits = phone.replace(/\D/g, '')
  return digits.slice(-2) || 'P'
}

/** First letter of a family member's name, or null if unnamed (caller should fall back to a generic user icon). */
export function nameInitials(name: string | null | undefined): string | null {
  const trimmed = name?.trim()
  return trimmed ? trimmed[0].toUpperCase() : null
}
