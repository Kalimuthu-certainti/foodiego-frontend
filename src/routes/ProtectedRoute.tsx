import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAccess } from '../store/authStore';

/**
 * Route guard: renders nested routes only when an access token is present.
 * Otherwise redirects to /login, preserving the attempted location so the
 * login flow can return the user there afterwards.
 */
export default function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = getAccess() !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
