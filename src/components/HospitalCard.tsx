import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Building2, ChevronRight, MapPin } from 'lucide-react'
import { formatDate, latestTimestamp } from '#/lib/format'
import type { HospitalVisit } from '#/types'

export function HospitalCard({ visit, index = 0 }: { visit: HospitalVisit; index?: number }) {
  const lastVisit = latestTimestamp(visit.patient?.registered_date_time)
  const location = [visit.org.city, visit.org.state].filter(Boolean).join(', ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Link
        to="/hospitals/$orgId"
        params={{ orgId: visit.orgId }}
        className="island-shell feature-card group flex items-center gap-4 rounded-2xl p-5 no-underline"
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(150deg,var(--lagoon),var(--palm))] text-white">
          <Building2 className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-base font-semibold text-[var(--sea-ink)]">
            {visit.org.name}
          </h3>
          {location && (
            <p className="m-0 mt-0.5 flex items-center gap-1 truncate text-xs text-[var(--sea-ink-soft)]">
              <MapPin className="size-3" />
              {location}
            </p>
          )}
          {visit.patient && (
            <p className="m-0 mt-1.5 text-sm text-[var(--sea-ink-soft)]">
              Patient: <span className="font-medium text-[var(--sea-ink)]">{visit.patient.name}</span>
            </p>
          )}
          {lastVisit && (
            <p className="m-0 mt-0.5 text-xs text-[var(--sea-ink-soft)]">
              Last visit {formatDate(lastVisit)}
            </p>
          )}
        </div>
        <ChevronRight className="size-5 flex-shrink-0 text-[var(--sea-ink-soft)] transition group-hover:translate-x-0.5 group-hover:text-[var(--sea-ink)]" />
      </Link>
    </motion.div>
  )
}
