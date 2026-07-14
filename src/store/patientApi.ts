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
 * returning to (or reloading) a screen the patient already opened renders
 * instantly from cache — no loading skeleton.
 *
 * That cache is otherwise "forever" — dardibook writes new visits/
 * prescriptions/bills into Firestore independently of this app, so we can't
 * rely on cache invalidation events telling us when to drop it. Instead this
 * always revalidates in the background (cached data renders immediately;
 * only `isFetching` flips true while the check runs) on every mount —
 * including a hard page reload, since that creates a fresh subscriber too —
 * plus whenever the browser tab regains focus or the network reconnects.
 * `setupListeners` in store/index.ts wires up the focus/reconnect listeners
 * this depends on.
 */
export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fakeBaseQuery<Error>(),
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
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
