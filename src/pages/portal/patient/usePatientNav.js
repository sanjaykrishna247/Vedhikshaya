import { usePortal } from '../../../portal/PortalContext';
import { useDashLang } from '../../dashboard/dashI18n';
import { Icon } from '../shared';

export function usePatientNav() {
  const { session, getChat } = usePortal();
  const { t } = useDashLang();
  const unread = session ? getChat(session.id).filter((m) => m.sender === 'doctor' && !m.read).length : 0;

  return [
    { to: '/patient/dashboard', label: t('pnav.today'), icon: Icon.today, end: true },
    { to: '/patient/compliance', label: t('pnav.compliance'), icon: Icon.compliance },
    { to: '/patient/prescription', label: t('pnav.prescription'), icon: Icon.rx },
    { to: '/patient/symptoms', label: t('pnav.symptoms'), icon: Icon.symptom },
    { to: '/patient/chat', label: t('pnav.chat'), icon: Icon.chat, badge: unread },
  ];
}

export function usePatient() {
  const { patients, session } = usePortal();
  return patients.find((p) => p.id === session?.id) || null;
}
