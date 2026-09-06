import { PortalShell } from '../shared';
import { usePatientNav, usePatient } from './usePatientNav';
import { currentStreak } from '../../../portal/portalLogic';

// Thin wrapper so every patient page gets the nav + the streak chip in the
// top bar without repeating the wiring.
export default function PatientShell({ children }) {
  const nav = usePatientNav();
  const patient = usePatient();
  const streak = patient ? currentStreak(patient) : 0;

  return (
    <PortalShell
      variant="patient"
      nav={nav}
      headerExtra={<span className="pt__streak-chip">🔥 {streak}d</span>}
    >
      {children}
    </PortalShell>
  );
}
