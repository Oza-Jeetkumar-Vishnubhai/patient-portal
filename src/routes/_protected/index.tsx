import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Building2, HeartPulse } from 'lucide-react'
import { useActivePhone } from '#/hooks/useActivePhone'
import { useGetVisitsQuery } from '#/store/patientApi'
import { HospitalCard } from '#/components/HospitalCard'
import { EmptyState } from '#/components/EmptyState'
import { Skeleton } from '#/components/ui/skeleton'
import { Button } from '#/components/ui/button'
import { latestTimestamp, formatDate } from '#/lib/format'
import type { HospitalVisit } from '#/types'

export const Route = createFileRoute('/_protected/')({ component: HomePage })

type VisitWithTimestamp = { v: HospitalVisit; ts: number }

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function HomePage() {
  const phone = useActivePhone()
  const { data: visits, isLoading, isError } = useGetVisitsQuery(phone, { skip: !phone })

  const mostRecent = (visits ?? [])
    .map((v) => ({ v, ts: latestTimestamp(v.patient?.registered_date_time) }))
    .filter((x): x is VisitWithTimestamp => x.ts !== null)
    .sort((a, b) => b.ts - a.ts)
    .at(0)

  return (
    <main className="page-wrap px-4 pb-8 pt-8 sm:pt-14">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="island-shell relative overflow-hidden rounded-4xl px-6 py-10 sm:px-10 sm:py-14"
      >
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

        <p className="island-kicker mb-3 flex items-center gap-1.5">
          <HeartPulse className="size-3.5" />
          {greeting()}
        </p>
        <h1 className="display-title mb-3 max-w-2xl text-3xl leading-[1.08] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          Your health records, all in one place.
        </h1>
        <p className="mb-8 max-w-xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Signed in as <span className="font-semibold text-[var(--sea-ink)]">{phone}</span>. Every
          hospital you've visited shows up here automatically.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-3">
            <div className="text-2xl font-bold text-[var(--sea-ink)]">
              {isLoading ? <Skeleton className="h-7 w-8" /> : (visits?.length ?? 0)}
            </div>
            <p className="m-0 text-xs text-[var(--sea-ink-soft)]">Hospitals visited</p>
          </div>
          {mostRecent && (
            <div className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-3">
              <p className="m-0 truncate text-sm font-semibold text-[var(--sea-ink)]">
                {mostRecent.v.org.name}
              </p>
              <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                Most recent visit &middot; {formatDate(mostRecent.ts)}
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">Your hospitals</h2>
          {(visits?.length ?? 0) > 4 && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/hospitals">View all</Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={Building2}
            title="Couldn't load your hospitals"
            description="Something went wrong reaching our records. Please try again in a moment."
          />
        ) : visits && visits.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {visits.slice(0, 4).map((visit, i) => (
              <HospitalCard key={`${visit.orgId}-${visit.patientId}`} visit={visit} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No visits yet"
            description="Once a hospital registers you as a patient with this phone number, it'll show up here."
          />
        )}
      </section>
    </main>
  )
}
