import { Navigate, useLocation } from 'react-router-dom';
import { usePortal } from './PortalContext';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12h demo session

export default function PortalRoute({ role, children }) {
  const { session, portalLogout } = usePortal();
  const location = useLocation();

  if (!session?.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // expired -> clear + bounce
  if (Date.now() - (session.issuedAt || 0) > TOKEN_TTL_MS) {
    portalLogout();
    return <Navigate to="/login" replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
