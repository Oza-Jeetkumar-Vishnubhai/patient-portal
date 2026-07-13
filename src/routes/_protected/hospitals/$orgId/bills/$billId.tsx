import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarClock, CreditCard, FileText, Receipt } from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { useGetBillByIdQuery, useGetVisitsQuery } from '#/store/patientApi'
import { EmptyState } from '#/components/EmptyState'
import { Skeleton } from '#/components/ui/skeleton'
import { formatCurrency, formatDate } from '#/lib/format'
import { paymentStatusVariant } from '#/lib/theme'
import { cn } from '#/lib/utils'
import type { PharmacyTypes } from '#/types'

export const Route = createFileRoute('/_protected/hospitals/$orgId/bills/$billId')({
  component: BillDetailPage,
})

function BillDetailPage() {
  const { orgId, billId } = Route.useParams()
  const { user } = useAuth()
  const phone = user?.phoneNumber ?? ''
  const { data: visits, isLoading: visitsLoading } = useGetVisitsQuery(phone, { skip: !phone })
  const visit = visits?.find((v) => v.orgId === orgId)

  const { data, isLoading, isError } = useGetBillByIdQuery({ orgId, billId })

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
          icon={Receipt}
          title="Bill not found"
          description="This bill may have been removed, or the link is incorrect."
        />
      ) : (
        <BillBody bill={data.data} orgId={orgId} patientId={visit?.patientId} />
      )}
    </main>
  )
}

function BillBody({
  bill,
  orgId,
  patientId,
}: {
  bill: PharmacyTypes
  orgId: string
  patientId?: string
}) {
  const variant = paymentStatusVariant(bill.payment_status)
  const medicineTotal = bill.medicines.reduce((sum, m) => sum + m.quantity * m.price, 0)
  const serviceTotal = bill.services.reduce((sum, s) => sum + s.quantity * s.price, 0)
  const subtotal = medicineTotal + serviceTotal

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-5"
    >
      <section className="island-shell rounded-3xl px-6 py-7 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="island-kicker mb-2">Bill</p>
            <p className="display-title m-0 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
              {formatCurrency(bill.total_amount)}
            </p>
            <span className={cn('status-pill mt-2', `status-pill--${variant}`)}>
              {bill.payment_status}
            </span>
          </div>
          <div className="text-right text-sm text-[var(--sea-ink-soft)]">
            <p className="m-0 flex items-center justify-end gap-1.5">
              <CalendarClock className="size-3.5" />
              {formatDate(bill.generated_at)}
            </p>
            {bill.payment_method && (
              <p className="m-0 mt-1 flex items-center justify-end gap-1.5">
                <CreditCard className="size-3.5" />
                {bill.payment_method}
              </p>
            )}
          </div>
        </div>

        {bill.prescription_id && patientId && (
          <Link
            to="/hospitals/$orgId/prescriptions/$prescriptionId"
            params={{ orgId, prescriptionId: bill.prescription_id }}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--lagoon-deep)] no-underline hover:underline"
          >
            <FileText className="size-3.5" />
            View related prescription
          </Link>
        )}
      </section>

      {bill.medicines.length > 0 && (
        <section className="island-shell overflow-hidden rounded-3xl px-6 py-7 sm:px-8">
          <h2 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Medicines</h2>
          <LineItemTable
            rows={bill.medicines.map((m) => ({
              key: m.id,
              label: m.medicineName,
              quantity: m.quantity,
              price: m.price,
            }))}
          />
        </section>
      )}

      {bill.services.length > 0 && (
        <section className="island-shell overflow-hidden rounded-3xl px-6 py-7 sm:px-8">
          <h2 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Services</h2>
          <LineItemTable
            rows={bill.services.map((s) => ({
              key: s.service_id,
              label: s.service_name,
              quantity: s.quantity,
              price: s.price,
            }))}
          />
        </section>
      )}

      <section className="island-shell rounded-3xl px-6 py-7 sm:px-8">
        <h2 className="mb-4 text-sm font-semibold text-[var(--sea-ink)]">Summary</h2>
        <div className="space-y-2 text-sm">
          <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
          {bill.discount > 0 && (
            <SummaryRow label="Discount" value={`- ${formatCurrency(bill.discount)}`} />
          )}
          {bill.tax_percentage > 0 && (
            <SummaryRow label={`Tax (${bill.tax_percentage}%)`} value="" />
          )}
          <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-2 text-base font-semibold text-[var(--sea-ink)]">
            <span>Total</span>
            <span>{formatCurrency(bill.total_amount)}</span>
          </div>
        </div>
        {bill.notes && (
          <p className="mt-4 border-t border-[var(--line)] pt-4 text-sm text-[var(--sea-ink-soft)]">
            {bill.notes}
          </p>
        )}
      </section>
    </motion.div>
  )
}

function LineItemTable({
  rows,
}: {
  rows: { key: string; label: string; quantity: number; price: number }[]
}) {
  return (
    <div className="divide-y divide-[var(--line)]">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
        <span>Item</span>
        <span>Qty</span>
        <span>Price</span>
        <span>Amount</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2.5 text-sm"
        >
          <span className="min-w-0 truncate text-[var(--sea-ink)]">{row.label}</span>
          <span className="text-[var(--sea-ink-soft)]">{row.quantity}</span>
          <span className="text-[var(--sea-ink-soft)]">{formatCurrency(row.price)}</span>
          <span className="font-medium text-[var(--sea-ink)]">
            {formatCurrency(row.quantity * row.price)}
          </span>
        </div>
      ))}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[var(--sea-ink-soft)]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
