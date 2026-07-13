import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '#/lib/firebase'
import type { BillSummary, PharmacyTypes } from '#/types'

export async function getBillsForPatient(
  orgId: string,
  patientId: string,
): Promise<BillSummary[]> {
  const ref = collection(db, 'organisations', orgId, 'bills')
  const snap = await getDocs(
    query(ref, where('patient_id', '==', patientId), orderBy('generated_at', 'desc')),
  )
  return snap.docs.map((d) => ({ billId: d.id, data: d.data() as PharmacyTypes }))
}

export async function getBill(orgId: string, billId: string): Promise<PharmacyTypes | null> {
  const snap = await getDoc(doc(db, 'organisations', orgId, 'bills', billId))
  if (!snap.exists()) return null
  return snap.data() as PharmacyTypes
}
