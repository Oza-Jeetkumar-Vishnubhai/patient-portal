import { doc, getDoc } from 'firebase/firestore'
import { db } from '#/lib/firebase'
import { normalizePhoneForIndex } from '#/lib/phone'
import type { PatientIndexDoc, PatientIndexEntry } from '#/types'

/** Looks up every {orgId, patientId} pair a phone number is registered under. */
export async function getPatientIndexEntries(phone: string): Promise<PatientIndexEntry[]> {
  const id = normalizePhoneForIndex(phone)
  const snap = await getDoc(doc(db, 'patientIndex', id))
  if (!snap.exists()) return []
  const data = snap.data() as PatientIndexDoc
  return data.organisations ?? []
}
