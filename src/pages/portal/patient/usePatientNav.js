import { usePortal } from '../../../portal/PortalContext';
import { Icon } from '../shared';

export function usePatientNav() {
  const { session, getChat } = usePortal();
  const unread = session ? getChat(session.id).filter((m) => m.sender === 'doctor' && !m.read).length : 0;

  return [
    { to: '/patient/dashboard', label: "Today", icon: Icon.today, end: true },
    { to: '/patient/compliance', label: 'Compliance', icon: Icon.compliance },
    { to: '/patient/prescription', label: 'Prescription', icon: Icon.rx },
    { to: '/patient/symptoms', label: 'Symptoms', icon: Icon.symptom },
    { to: '/patient/chat', label: 'Chat', icon: Icon.chat, badge: unread },
  ];
}

export function usePatient() {
  const { patients, session } = usePortal();
  return patients.find((p) => p.id === session?.id) || null;
}
