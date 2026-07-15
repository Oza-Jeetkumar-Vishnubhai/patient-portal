import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '#/lib/firebase'
import { normalizePhoneForIndex } from '#/lib/phone'
import type { FamilyMember } from '#/types'

function membersCollection(ownerPhone: string) {
  return collection(db, 'patientIndex', normalizePhoneForIndex(ownerPhone), 'members')
}

/** Lists every family member `ownerPhone` has added and can therefore view. */
export async function getFamilyMembers(ownerPhone: string): Promise<FamilyMember[]> {
  const snap = await getDocs(membersCollection(ownerPhone))
  return snap.docs.map((d) => d.data() as FamilyMember)
}

/** Links `memberPhone` (already OTP-verified by the caller) under `ownerPhone`. */
export async function addFamilyMember(
  ownerPhone: string,
  memberPhone: string,
  name: string | null,
): Promise<void> {
  const memberId = normalizePhoneForIndex(memberPhone)
  const member: FamilyMember = { phone: memberId, name, addedAt: Date.now() }
  await setDoc(doc(membersCollection(ownerPhone), memberId), member)
}

export async function removeFamilyMember(ownerPhone: string, memberPhone: string): Promise<void> {
  const memberId = normalizePhoneForIndex(memberPhone)
  await deleteDoc(doc(membersCollection(ownerPhone), memberId))
}
