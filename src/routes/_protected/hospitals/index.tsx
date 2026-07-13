import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Building2, Search } from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { useGetVisitsQuery } from '#/store/patientApi'
import { HospitalCard } from '#/components/HospitalCard'
import { EmptyState } from '#/components/EmptyState'
import { Skeleton } from '#/components/ui/skeleton'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/_protected/hospitals/')({ component: HospitalsPage })

function HospitalsPage() {
  const { user } = useAuth()
  const phone = user?.phoneNumber ?? ''
  const { data: visits, isLoading, isError } = useGetVisitsQuery(phone, { skip: !phone })
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!visits) return []
    const q = search.trim().toLowerCase()
    if (!q) return visits
    return visits.filter((v) => v.org.name.toLowerCase().includes(q))
  }, [visits, search])

  return (
    <main className="page-wrap px-4 pb-8 pt-8 sm:pt-14">
      <div className="mb-6">
        <h1 className="display-title mb-1 text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
          Your hospitals
        </h1>
        <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
          Every hospital where you've been registered as a patient.
        </p>
      </div>

      {(visits?.length ?? 0) > 3 && (
        <div className="relative mb-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals…"
            className="pl-9"
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Building2}
          title="Couldn't load your hospitals"
          description="Something went wrong reaching our records. Please try again in a moment."
        />
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((visit, i) => (
            <HospitalCard key={`${visit.orgId}-${visit.patientId}`} visit={visit} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={search ? 'No matches' : 'No visits yet'}
          description={
            search
              ? 'Try a different search term.'
              : "Once a hospital registers you as a patient with this phone number, it'll show up here."
          }
        />
      )}
    </main>
  )
}
