import { doc, getDoc } from 'firebase/firestore'
import { db } from '#/lib/firebase'
import type { OrgInfo } from '#/types'

export async function getOrgInfo(orgId: string): Promise<OrgInfo> {
  const snap = await getDoc(doc(db, 'doctor', orgId))
  if (!snap.exists()) return { name: 'Hospital' }
  const data = snap.data() as Partial<OrgInfo>
  return { name: data.name?.trim() || 'Hospital', ...data }
}
