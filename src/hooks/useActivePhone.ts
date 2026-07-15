import { useAuth } from '#/contexts/AuthContext'
import { useAppSelector } from '#/store/hooks'

/** The phone number whose data should currently be shown — the signed-in
 * user's own, unless they've switched to viewing a family member's. */
export function useActivePhone(): string {
  const { user } = useAuth()
  const activePhone = useAppSelector((state) => state.family.activePhone)
  return activePhone ?? user?.phoneNumber ?? ''
}
