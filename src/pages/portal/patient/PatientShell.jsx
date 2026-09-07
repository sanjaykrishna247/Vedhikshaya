import { PortalShell } from '../shared';
import { usePatientNav } from './usePatientNav';

// Thin wrapper so every patient page gets the nav + shared top bar.
export default function PatientShell({ children }) {
  const nav = usePatientNav();
  return (
    <PortalShell variant="patient" nav={nav}>
      {children}
    </PortalShell>
  );
}
