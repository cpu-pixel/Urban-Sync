import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Wraps any route that requires authentication.
 * If no token is present, redirects to /login.
 * The token is checked synchronously from localStorage via the store,
 * so there is no flash of unauthenticated content.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(state => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
