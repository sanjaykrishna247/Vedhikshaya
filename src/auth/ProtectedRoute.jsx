import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { usePortal } from '../portal/PortalContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const { session } = usePortal();
  const location = useLocation();

  // a logged-in doctor/patient portal user can also reach the shared brew
  // console / sensors / history pages
  if (!isAuthenticated && !session?.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
