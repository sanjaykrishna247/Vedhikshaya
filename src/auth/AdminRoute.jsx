import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Demo-scope admin gating: a single known admin account. Swap for a real
// role check once the User model carries a role column.
export const ADMIN_EMAIL = 'admin@vedikshaya.com';

export function isAdmin(user) {
  return user?.email?.toLowerCase() === ADMIN_EMAIL;
}

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (!isAdmin(user)) return <Navigate to="/home" replace />;
  return children;
}
