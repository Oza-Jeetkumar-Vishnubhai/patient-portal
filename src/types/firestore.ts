/**
 * Shapes for documents that exist only for the patient portal / cross-org
 * lookup, plus the org profile doc. Field list for OrgInfo is a best-effort
 * guess (not in dardibook's FormTypes.ts) — every field but `name` is
 * optional so the UI degrades gracefully if a field turns out missing.
 */

export interface PatientIndexEntry {
  orgId: string
  patientId: string
}

export interface PatientIndexDoc {
  // Optional: this is a Firestore-authored doc cast at the read boundary,
  // not a compiler-verified shape, so a missing field is a real possibility.
  organisations?: PatientIndexEntry[]
}

export interface FamilyMember {
  phone: string
  name: string | null
  addedAt: number
}

export interface OrgInfo {
  name: string
  address?: string
  city?: string
  state?: string
  phone?: string
  email?: string
  logoUrl?: string
}
