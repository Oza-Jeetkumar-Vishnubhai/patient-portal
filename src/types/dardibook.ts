/**
 * Mirrors the document shapes written by the dardibook doctor-side app.
 * Kept as a 1:1 copy of dardibook's FormTypes.ts so the two apps never drift
 * silently — if dardibook's schema changes, update this file to match.
 */

export interface OrgUserType {
  id: string
  name: string
  email: string
}

export interface PatientBed {
  bedId: string
  bedBookingId: string
  admission_at: number
  admission_by: OrgUserType
  admission_for: OrgUserType
  discharge_at: number
  dischargeMarked: boolean
  discharged_by?: OrgUserType
}

export interface RegisterPatientFormTypes {
  patient_id: string
  name: string
  mobile: string
  gender: 'Male' | 'Female' | 'Other'
  age: string
  street_address: string
  city: string
  state: string
  zip: string
  registered_date: number[]
  registered_date_time: number[]
  prescribed_date_time: number[]
  bed_info: PatientBed[]
  registerd_by: OrgUserType
  registerd_for: OrgUserType
}

export interface DosageTypes {
  morning: string
  afternoon: string
  evening: string
  night: string
}

export interface MedicinesDetails {
  id: string
  medicineName: string
  instruction: string
  dosages: DosageTypes
  type: string
  duration: number
  durationType: string
}

export interface ReferDetails {
  hospitalName: string
  doctorName: string
  referMessage: string
}

export interface ReceiptDetails {
  id: string
  title: string
  amount: number
}

export interface PrescriptionAdditionalinfo {
  id: string
  label: string
  value: string
}

export interface UploadedFileInfo {
  name: string
  url: string
}

export interface PrescriptionFormTypes {
  prescription_id: string
  orgId: string
  prescription_for_bed: boolean
  diseaseId: string
  diseaseDetail: string
  medicines: MedicinesDetails[]
  advice: string
  nextVisit: string
  refer: ReferDetails
  created_at: number
  registerd_by: OrgUserType
  prescribed_by: OrgUserType
  prescriber_assigned: OrgUserType
  receipt_details: ReceiptDetails[]
  prescription_additional_details: PrescriptionAdditionalinfo[]
  attachments_data?: UploadedFileInfo[]
}

export interface MedicineItems extends MedicinesDetails {
  quantity: number
  price: number
}

export interface ServiceItems {
  service_id: string
  service_name: string
  quantity: number
  price: number
}

export interface PharmacyTypes {
  bill_id: string
  prescription_id?: string
  name: string
  patient_id?: string
  mobile: string
  gender?: 'Male' | 'Female' | 'Other'
  medicines: MedicineItems[]
  services: ServiceItems[]
  generated_at: number
  prescribed_by?: OrgUserType
  generated_by: OrgUserType
  payment_status: 'Paid' | 'Unpaid' | 'Not Required' | 'Refunded'
  total_amount: number
  discount: number
  payment_method?: 'Cash' | 'Card' | 'UPI' | 'Online'
  tax_percentage: number
  notes?: string
}
