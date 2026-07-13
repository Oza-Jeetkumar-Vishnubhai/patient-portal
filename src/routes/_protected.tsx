import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'
import { AppShell } from '#/components/AppShell'

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
