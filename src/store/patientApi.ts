import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { getPatientIndexEntries } from '#/lib/firestore/patientIndex'
import { getOrgInfo } from '#/lib/firestore/organisations'
import { getPatientAtOrg } from '#/lib/firestore/patients'
import { getBill, getBillsForPatient } from '#/lib/firestore/bills'
import { getPrescription, getPrescriptionsForPatient } from '#/lib/firestore/prescriptions'
import type { BillSummary, HospitalVisit, PrescriptionSummary } from '#/types'

/**
 * All patient-portal data reads go through this RTK Query api. Results are
 * cached in the Redux store and (via redux-persist) in localStorage, so
 * returning to a hospital/prescription/bill the patient already opened
 * renders instantly from cache while a background refetch keeps it fresh.
 */
export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fakeBaseQuery<Error>(),
  endpoints: (builder) => ({
    getVisits: builder.query<HospitalVisit[], string>({
      queryFn: async (phone) => {
        try {
          const entries = await getPatientIndexEntries(phone)
          const visits = await Promise.all(
            entries.map(async ({ orgId, patientId }): Promise<HospitalVisit> => {
              const [org, patient] = await Promise.all([
                getOrgInfo(orgId),
                getPatientAtOrg(orgId, patientId),
              ])
              return { orgId, patientId, org, patient }
            }),
          )
          return { data: visits }
        } catch (err) {
          return { error: err as Error }
        }
      },
    }),

    getPrescriptions: builder.query<PrescriptionSummary[], { orgId: string; patientId: string }>({
      queryFn: async ({ orgId, patientId }) => {
        try {
          return { data: await getPrescriptionsForPatient(orgId, patientId) }
        } catch (err) {
          return { error: err as Error }
        }
      },
    }),

    getPrescriptionById: builder.query<
      PrescriptionSummary | null,
      { orgId: string; patientId: string; prescriptionId: string }
    >({
      queryFn: async ({ orgId, patientId, prescriptionId }) => {
        try {
          const data = await getPrescription(orgId, patientId, prescriptionId)
          return { data: data ? { prescriptionId, data } : null }
        } catch (err) {
          return { error: err as Error }
        }
      },
    }),

    getBills: builder.query<BillSummary[], { orgId: string; patientId: string }>({
      queryFn: async ({ orgId, patientId }) => {
        try {
          return { data: await getBillsForPatient(orgId, patientId) }
        } catch (err) {
          return { error: err as Error }
        }
      },
    }),

    getBillById: builder.query<BillSummary | null, { orgId: string; billId: string }>({
      queryFn: async ({ orgId, billId }) => {
        try {
          const data = await getBill(orgId, billId)
          return { data: data ? { billId, data } : null }
        } catch (err) {
          return { error: err as Error }
        }
      },
    }),
  }),
})

export const {
  useGetVisitsQuery,
  useGetPrescriptionsQuery,
  useGetPrescriptionByIdQuery,
  useGetBillsQuery,
  useGetBillByIdQuery,
} = patientApi
