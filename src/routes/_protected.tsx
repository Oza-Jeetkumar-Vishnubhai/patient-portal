import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router'
import { useAuth } from '#/contexts/AuthContext'

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  return <Outlet />
}
