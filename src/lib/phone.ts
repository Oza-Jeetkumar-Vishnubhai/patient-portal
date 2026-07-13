/** Normalizes any phone input to the bare national number used as the
 * patientIndex document id (e.g. "+91 98243 35930" -> "9824335930"). */
export function normalizePhoneForIndex(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly
}
