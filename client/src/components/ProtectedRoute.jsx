import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)

  // Wait for the session-restore check (via the refresh-token cookie)
  // before deciding to redirect, so a page refresh doesn't bounce a
  // logged-in user back to /login.
  if (status !== 'ready') return <LoadingSpinner label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace />
  return children
}
