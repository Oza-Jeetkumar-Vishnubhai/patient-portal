import { useState  } from 'react'
import type {ReactNode} from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  Home as HomeIcon,
  LogOut,
  Plus,
  Settings,
  Stethoscope,
  Trash2,
  User,
} from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { signOut } from '#/lib/auth'
import { cn } from '#/lib/utils'
import { nameInitials, phoneInitials } from '#/lib/initials'
import { useAppDispatch } from '#/store/hooks'
import { setActivePhone } from '#/store/familySlice'
import { useGetFamilyMembersQuery, useRemoveFamilyMemberMutation } from '#/store/patientApi'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '#/components/ui/sheet'
import { FamilySwitcher } from './FamilySwitcher'
import { AddFamilyMemberDialog } from './AddFamilyMemberDialog'
import ThemeToggle from './ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/hospitals', label: 'Hospitals', icon: Building2 },
] as const

function isActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [profileOpen, setProfileOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)

  const ownerPhone = user?.phoneNumber ?? ''
  const { data: members = [] } = useGetFamilyMembersQuery(ownerPhone, { skip: !ownerPhone })
  const [removeFamilyMember] = useRemoveFamilyMemberMutation()

  async function handleSignOut() {
    dispatch(setActivePhone(null))
    await signOut()
    setProfileOpen(false)
    void navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0">
      {/* Desktop / tablet top bar */}
      <header className="sticky top-0 z-40 hidden border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-lg sm:block">
        <div className="page-wrap flex items-center gap-6 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-base font-semibold text-[var(--sea-ink)] no-underline"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--lagoon),var(--palm))] text-white shadow-[0_6px_16px_rgba(47,106,74,0.3)]">
              <Stethoscope className="size-4" />
            </span>
            Patient Portal
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = isActive(location.pathname, to)
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold no-underline transition',
                    active
                      ? 'text-[var(--sea-ink)]'
                      : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-pill"
                      className="absolute inset-0 rounded-full bg-[var(--chip-bg)] shadow-[0_8px_20px_rgba(30,90,72,0.1)]"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <Icon className="relative z-10 size-4" />
                  <span className="relative z-10">{label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <FamilySwitcher size="sm" />
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Account settings"
              className="rounded-full p-1.5 text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)]"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--header-bg)] px-4 py-3 backdrop-blur-lg sm:hidden">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--lagoon),var(--palm))] text-white">
            <Stethoscope className="size-3.5" />
          </span>
          Patient Portal
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <FamilySwitcher />
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <nav className="mobile-tab-bar sm:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(location.pathname, to)
          return (
            <Link key={to} to={to} className={cn('tab-item', active && 'is-active')}>
              <Icon />
              {label}
            </Link>
          )
        })}
        <button type="button" className="tab-item" onClick={() => setProfileOpen(true)}>
          <User />
          Profile
        </button>
      </nav>

      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Your account</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] p-4">
              <Avatar className="size-11">
                <AvatarFallback className="bg-[var(--lagoon)] text-white">
                  {phoneInitials(user?.phoneNumber)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                  {user?.phoneNumber}
                </p>
                <p className="m-0 text-xs text-[var(--sea-ink-soft)]">Signed in via OTP</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold tracking-wide text-[var(--sea-ink-soft)] uppercase">
                Family members
              </p>
              {members.length === 0 && (
                <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                  No family members added yet.
                </p>
              )}
              {members.map((member) => (
                <div
                  key={member.phone}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--line)] p-3"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-[var(--chip-bg)] text-[var(--sea-ink)]">
                      {nameInitials(member.name) ?? <User className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                      {member.name || member.phone}
                    </p>
                    {member.name && (
                      <p className="m-0 text-xs text-[var(--sea-ink-soft)]">{member.phone}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${member.name || member.phone}`}
                    onClick={() =>
                      void removeFamilyMember({ ownerPhone, memberPhone: member.phone })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setAddMemberOpen(true)}>
                <Plus className="size-4" />
                Add family member
              </Button>
            </div>

            <Button variant="outline" className="w-full" onClick={() => void handleSignOut()}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AddFamilyMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        ownerPhone={ownerPhone}
      />
    </div>
  )
}
