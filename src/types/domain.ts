/**
 * UI-facing composed types, derived from the raw dardibook + firestore
 * document shapes. These are what components and the Redux store deal with.
 */

import type { OrgInfo } from './firestore'
import type {
  PharmacyTypes,
  PrescriptionFormTypes,
  RegisterPatientFormTypes,
} from './dardibook'

/** One hospital the signed-in phone number has a record at. */
export interface HospitalVisit {
  orgId: string
  patientId: string
  org: OrgInfo
  patient: RegisterPatientFormTypes | null
}

export interface PrescriptionSummary {
  prescriptionId: string
  data: PrescriptionFormTypes
}

export interface BillSummary {
  billId: string
  data: PharmacyTypes
}
