import { doc, getDoc } from 'firebase/firestore'
import { db } from '#/lib/firebase'
import type { RegisterPatientFormTypes } from '#/types'

export async function getPatientAtOrg(
  orgId: string,
  patientId: string,
): Promise<RegisterPatientFormTypes | null> {
  const snap = await getDoc(doc(db, 'doctor', orgId, 'patients', patientId))
  if (!snap.exists()) return null
  return snap.data() as RegisterPatientFormTypes
}
