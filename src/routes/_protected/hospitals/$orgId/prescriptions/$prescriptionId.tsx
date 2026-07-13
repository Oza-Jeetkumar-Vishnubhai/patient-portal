import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Paperclip,
  Pill,
  Receipt,
  Stethoscope,
} from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { useGetPrescriptionByIdQuery, useGetVisitsQuery } from '#/store/patientApi'
import { EmptyState } from '#/components/EmptyState'
import { Skeleton } from '#/components/ui/skeleton'
import { formatCurrency, formatDate } from '#/lib/format'
import type { DosageTypes, PrescriptionFormTypes } from '#/types'

export const Route = createFileRoute(
  '/_protected/hospitals/$orgId/prescriptions/$prescriptionId',
)({
  component: PrescriptionDetailPage,
})

const DOSAGE_LABELS: { key: keyof DosageTypes; short: string }[] = [
  { key: 'morning', short: 'Morning' },
  { key: 'afternoon', short: 'Afternoon' },
  { key: 'evening', short: 'Evening' },
  { key: 'night', short: 'Night' },
]

function PrescriptionDetailPage() {
  const { orgId, prescriptionId } = Route.useParams()
  const { user } = useAuth()
  const phone = user?.phoneNumber ?? ''
  const { data: visits, isLoading: visitsLoading } = useGetVisitsQuery(phone, { skip: !phone })
  const visit = visits?.find((v) => v.orgId === orgId)

  const { data, isLoading, isError } = useGetPrescriptionByIdQuery(
    { orgId, patientId: visit?.patientId ?? '', prescriptionId },
    { skip: !visit },
  )

  const loading = visitsLoading || isLoading

  return (
    <main className="page-wrap px-4 pb-8 pt-8 sm:pt-14">
      <Link
        to="/hospitals/$orgId"
        params={{ orgId }}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
      >
        <ArrowLeft className="size-4" />
        Back to {visit?.org.name ?? 'hospital'}
      </Link>

      {loading ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : isError || !data ? (
        <EmptyState
          icon={Pill}
          title="Prescription not found"
          description="This prescription may have been removed, or the link is incorrect."
        />
      ) : (
        <PrescriptionBody prescription={data.data} />
      )}
    </main>
  )
}

function PrescriptionBody({ prescription: p }: { prescription: PrescriptionFormTypes }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-5"
    >
      <section className="island-shell rounded-3xl px-6 py-7 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="island-kicker mb-2">Prescription</p>
            <h1 className="display-title m-0 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
              {p.diseaseDetail || 'General consultation'}
            </h1>
          </div>
          <div className="text-right text-sm text-[var(--sea-ink-soft)]">
            <p className="m-0 flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              {formatDate(p.created_at)}
            </p>
            <p className="m-0 mt-1 flex items-center gap-1.5">
              <Stethoscope className="size-3.5" />
              Dr. {p.prescribed_by.name}
            </p>
          </div>
        </div>
      </section>

      <section className="island-shell rounded-3xl px-6 py-7 sm:px-8">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--sea-ink)]">
          <Pill className="size-4" />
          Medicines
        </h2>
        {p.medicines.length === 0 ? (
          <p className="text-sm text-[var(--sea-ink-soft)]">No medicines listed.</p>
        ) : (
          <div className="grid gap-3">
            {p.medicines.map((med) => (
              <div key={med.id} className="rounded-2xl border border-[var(--line)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 font-semibold text-[var(--sea-ink)]">{med.medicineName}</p>
                  <span className="rounded-full bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--sea-ink-soft)]">
                    {med.duration} {med.durationType}
                  </span>
                </div>
                {med.instruction && (
                  <p className="m-0 mt-1 text-xs text-[var(--sea-ink-soft)]">{med.instruction}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {DOSAGE_LABELS.filter(({ key }) => {
                    const v = med.dosages[key]
                    return v && v !== '0'
                  }).map(({ key, short }) => (
                    <span
                      key={key}
                      className="rounded-full bg-[var(--status-info-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--status-info)]"
                    >
                      {short}: {med.dosages[key]}
                    </span>
                  ))}
                  {DOSAGE_LABELS.every(({ key }) => !med.dosages[key] || med.dosages[key] === '0') && (
                    <span className="text-xs text-[var(--sea-ink-soft)]">No dosage schedule specified</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {(p.advice || p.nextVisit) && (
        <section className="island-shell grid gap-4 rounded-3xl px-6 py-7 sm:grid-cols-2 sm:px-8">
          {p.advice && (
            <div>
              <h3 className="mb-1.5 text-sm font-semibold text-[var(--sea-ink)]">Advice</h3>
              <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{p.advice}</p>
            </div>
          )}
          {p.nextVisit && (
            <div>
              <h3 className="mb-1.5 text-sm font-semibold text-[var(--sea-ink)]">Next visit</h3>
              <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{p.nextVisit}</p>
            </div>
          )}
        </section>
      )}

      {p.refer.hospitalName && (
        <section className="island-shell rounded-3xl px-6 py-7 sm:px-8">
          <h3 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">Referral</h3>
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
            Referred to <span className="font-medium text-[var(--sea-ink)]">Dr. {p.refer.doctorName}</span>{' '}
            at <span className="font-medium text-[var(--sea-ink)]">{p.refer.hospitalName}</span>
          </p>
          {p.refer.referMessage && (
            <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">{p.refer.referMessage}</p>
          )}
        </section>
      )}

      {p.prescription_additional_details.length > 0 && (
        <section className="island-shell rounded-3xl px-6 py-7 sm:px-8">
          <h3 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Additional details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {p.prescription_additional_details.map((d) => (
              <div key={d.id}>
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                  {d.label}
                </p>
                <p className="m-0 text-sm text-[var(--sea-ink)]">{d.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {p.receipt_details.length > 0 && (
        <section className="island-shell rounded-3xl px-6 py-7 sm:px-8">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)]">
            <Receipt className="size-4" />
            Charges
          </h3>
          <div className="divide-y divide-[var(--line)]">
            {p.receipt_details.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-[var(--sea-ink-soft)]">{r.title}</span>
                <span className="font-medium text-[var(--sea-ink)]">{formatCurrency(r.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {p.attachments_data && p.attachments_data.length > 0 && (
        <section className="island-shell rounded-3xl px-6 py-7 sm:px-8">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)]">
            <Paperclip className="size-4" />
            Attachments
          </h3>
          <div className="grid gap-2">
            {p.attachments_data.map((file) => (
              <a
                key={file.url}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--lagoon-deep)] no-underline hover:bg-[var(--link-bg-hover)]"
              >
                <FileText className="size-4" />
                {file.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  )
}
