import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '#/lib/firebase'
import type { BillSummary, PharmacyTypes } from '#/types'

export async function getBillsForPatient(
  orgId: string,
  patientId: string,
): Promise<BillSummary[]> {
  const ref = collection(db, 'doctor', orgId, 'bills')
  const snap = await getDocs(query(ref, where('patient_id', '==', patientId)))
  return snap.docs
    .map((d) => ({ billId: d.id, data: d.data() as PharmacyTypes }))
    .sort((a, b) => b.data.generated_at - a.data.generated_at)
}

export async function getBill(orgId: string, billId: string): Promise<PharmacyTypes | null> {
  const snap = await getDoc(doc(db, 'doctor', orgId, 'bills', billId))
  if (!snap.exists()) return null
  return snap.data() as PharmacyTypes
}
