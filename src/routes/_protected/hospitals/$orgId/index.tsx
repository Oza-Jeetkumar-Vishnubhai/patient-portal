import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Building2,
  FileText,
  MapPin,
  Pill,
  Receipt,
  User as UserIcon,
} from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { useGetBillsQuery, useGetPrescriptionsQuery, useGetVisitsQuery } from '#/store/patientApi'
import { EmptyState } from '#/components/EmptyState'
import { Skeleton } from '#/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { formatCurrency, formatDate } from '#/lib/format'
import { paymentStatusVariant } from '#/lib/theme'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/_protected/hospitals/$orgId/')({
  component: HospitalDetailPage,
})

function HospitalDetailPage() {
  const { orgId } = Route.useParams()
  const { user } = useAuth()
  const phone = user?.phoneNumber ?? ''
  const { data: visits, isLoading: visitsLoading } = useGetVisitsQuery(phone, { skip: !phone })

  const visit = visits?.find((v) => v.orgId === orgId)

  if (visitsLoading) {
    return (
      <main className="page-wrap px-4 pb-8 pt-8 sm:pt-14">
        <Skeleton className="h-40 rounded-3xl" />
      </main>
    )
  }

  if (!visit) {
    return (
      <main className="page-wrap px-4 pb-8 pt-8 sm:pt-14">
        <EmptyState
          icon={Building2}
          title="Hospital not found"
          description="We couldn't find a record for this hospital under your account."
        />
      </main>
    )
  }

  const location = [visit.org.city, visit.org.state].filter(Boolean).join(', ')

  return (
    <main className="page-wrap px-4 pb-8 pt-8 sm:pt-14">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="island-shell relative overflow-hidden rounded-3xl px-6 py-8 sm:px-8"
      >
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(150deg,var(--lagoon),var(--palm))] text-white">
            <Building2 className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="display-title m-0 truncate text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
              {visit.org.name}
            </h1>
            {location && (
              <p className="m-0 mt-1 flex items-center gap-1 text-sm text-[var(--sea-ink-soft)]">
                <MapPin className="size-3.5" />
                {location}
              </p>
            )}
          </div>
        </div>

        {visit.patient && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-5 sm:grid-cols-4">
            <InfoField label="Patient" value={visit.patient.name} />
            <InfoField label="Patient ID" value={visit.patient.patient_id} />
            <InfoField label="Age / Gender" value={`${visit.patient.age} / ${visit.patient.gender}`} />
            <InfoField label="Mobile" value={visit.patient.mobile} />
          </div>
        )}
      </motion.section>

      <section className="mt-6">
        <Tabs defaultValue="prescriptions">
          <TabsList>
            <TabsTrigger value="prescriptions">
              <Pill /> Prescriptions
            </TabsTrigger>
            <TabsTrigger value="bills">
              <Receipt /> Bills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions" className="mt-5">
            <PrescriptionsTab orgId={orgId} patientId={visit.patientId} />
          </TabsContent>
          <TabsContent value="bills" className="mt-5">
            <BillsTab orgId={orgId} patientId={visit.patientId} />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="m-0 flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
        <UserIcon className="size-3" />
        {label}
      </p>
      <p className="m-0 truncate text-sm font-medium text-[var(--sea-ink)]">{value}</p>
    </div>
  )
}

function PrescriptionsTab({ orgId, patientId }: { orgId: string; patientId: string }) {
  const { data, isLoading, isError } = useGetPrescriptionsQuery({ orgId, patientId })

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState icon={Pill} title="Couldn't load prescriptions" description="Please try again shortly." />
    )
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Pill}
        title="No prescriptions yet"
        description="Prescriptions issued at this hospital will appear here."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {data.map(({ prescriptionId, data: p }, i) => (
        <motion.div
          key={prescriptionId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Link
            to="/hospitals/$orgId/prescriptions/$prescriptionId"
            params={{ orgId, prescriptionId }}
            className="island-shell feature-card flex items-center justify-between gap-3 rounded-2xl px-5 py-4 no-underline"
          >
            <div className="min-w-0">
              <p className="m-0 truncate font-semibold text-[var(--sea-ink)]">
                {p.diseaseDetail || 'General consultation'}
              </p>
              <p className="m-0 mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                {formatDate(p.created_at)} &middot; Dr. {p.prescribed_by.name} &middot;{' '}
                {p.medicines.length} medicine{p.medicines.length === 1 ? '' : 's'}
              </p>
            </div>
            <FileText className="size-4 flex-shrink-0 text-[var(--sea-ink-soft)]" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

function BillsTab({ orgId, patientId }: { orgId: string; patientId: string }) {
  const { data, isLoading, isError } = useGetBillsQuery({ orgId, patientId })

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <EmptyState icon={Receipt} title="Couldn't load bills" description="Please try again shortly." />
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No bills yet"
        description="Bills generated at this hospital will appear here."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {data.map(({ billId, data: bill }, i) => {
        const variant = paymentStatusVariant(bill.payment_status)
        return (
          <motion.div
            key={billId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              to="/hospitals/$orgId/bills/$billId"
              params={{ orgId, billId }}
              className="island-shell feature-card flex items-center justify-between gap-3 rounded-2xl px-5 py-4 no-underline"
            >
              <div className="min-w-0">
                <p className="m-0 truncate font-semibold text-[var(--sea-ink)]">
                  {formatCurrency(bill.total_amount)}
                </p>
                <p className="m-0 mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                  {formatDate(bill.generated_at)}
                </p>
              </div>
              <span className={cn('status-pill', `status-pill--${variant}`)}>
                {bill.payment_status}
              </span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
