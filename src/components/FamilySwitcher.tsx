import { useState } from 'react'
import { Plus, User as UserIcon } from 'lucide-react'
import { useAuth } from '#/contexts/AuthContext'
import { useActivePhone } from '#/hooks/useActivePhone'
import { useGetFamilyMembersQuery } from '#/store/patientApi'
import { useAppDispatch } from '#/store/hooks'
import { setActivePhone } from '#/store/familySlice'
import { normalizePhoneForIndex } from '#/lib/phone'
import { nameInitials, phoneInitials } from '#/lib/initials'
import { Avatar, AvatarFallback, AvatarGroup } from '#/components/ui/avatar'
import { cn } from '#/lib/utils'
import { AddFamilyMemberDialog } from './AddFamilyMemberDialog'

interface FamilySwitcherProps {
  size?: 'sm' | 'default' | 'lg'
}

/** Stacked avatar disks in the header: the signed-in user plus any family
 * members they've added, each clickable to switch whose data is shown. */
export function FamilySwitcher({ size = 'default' }: FamilySwitcherProps) {
  const { user } = useAuth()
  const ownerPhone = user?.phoneNumber ?? ''
  const activePhone = useActivePhone()
  const dispatch = useAppDispatch()
  const [addOpen, setAddOpen] = useState(false)

  const { data: members = [] } = useGetFamilyMembersQuery(ownerPhone, { skip: !ownerPhone })

  const activeMemberPhone = normalizePhoneForIndex(activePhone)
  const isSelfActive = activeMemberPhone === normalizePhoneForIndex(ownerPhone)

  function avatarClasses(active: boolean) {
    return cn(
      'cursor-pointer transition',
      active
        ? 'ring-2 ring-[var(--lagoon)] ring-offset-1 ring-offset-[var(--header-bg)]'
        : 'opacity-60 hover:opacity-100',
    )
  }

  return (
    <>
      <AvatarGroup>
        <Avatar
          size={size}
          className={avatarClasses(isSelfActive)}
          onClick={() => dispatch(setActivePhone(null))}
        >
          <AvatarFallback className="bg-[var(--lagoon)] text-white">
            {phoneInitials(ownerPhone)}
          </AvatarFallback>
        </Avatar>

        {members.map((member) => {
          const active = activeMemberPhone === member.phone
          const initials = nameInitials(member.name)
          return (
            <Avatar
              key={member.phone}
              size={size}
              className={avatarClasses(active)}
              onClick={() => dispatch(setActivePhone(member.phone))}
            >
              <AvatarFallback className="bg-[var(--chip-bg)] text-[var(--sea-ink)]">
                {initials ?? <UserIcon className="size-4" />}
              </AvatarFallback>
            </Avatar>
          )
        })}

        <button
          type="button"
          aria-label="Add family member"
          onClick={() => setAddOpen(true)}
          className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] ring-2 ring-background transition hover:text-[var(--sea-ink)] data-[size=lg]:size-10 data-[size=sm]:size-6"
          data-size={size}
        >
          <Plus className="size-3.5" />
        </button>
      </AvatarGroup>

      <AddFamilyMemberDialog open={addOpen} onOpenChange={setAddOpen} ownerPhone={ownerPhone} />
    </>
  )
}
