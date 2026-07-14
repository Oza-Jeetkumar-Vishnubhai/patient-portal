import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '#/lib/firebase'
import type { PrescriptionFormTypes, PrescriptionSummary } from '#/types'

export async function getPrescriptionsForPatient(
  orgId: string,
  patientId: string,
): Promise<PrescriptionSummary[]> {
  const ref = collection(db, 'doctor', orgId, 'patients', patientId, 'prescriptions')
  const snap = await getDocs(query(ref, orderBy('created_at', 'desc')))
  return snap.docs.map((d) => ({ prescriptionId: d.id, data: d.data() as PrescriptionFormTypes }))
}

export async function getPrescription(
  orgId: string,
  patientId: string,
  prescriptionId: string,
): Promise<PrescriptionFormTypes | null> {
  const snap = await getDoc(
    doc(db, 'doctor', orgId, 'patients', patientId, 'prescriptions', prescriptionId),
  )
  if (!snap.exists()) return null
  return snap.data() as PrescriptionFormTypes
}
