import { useMemo } from 'react';
import { usePortal } from '../../../portal/PortalContext';
import { useDashLang } from '../../dashboard/dashI18n';
import { Icon } from '../shared';

// Builds the doctor sidebar nav with a live unread-chat badge.
export function useDoctorNav() {
  const { store, patients } = usePortal();
  const { t } = useDashLang();
  const domain = store.doctor.hospitalDomain;

  const unread = useMemo(() => {
    let n = 0;
    patients.forEach((p) => {
      const msgs = store.chats[`${domain}/${p.id}`] || [];
      n += msgs.filter((m) => m.sender === 'patient' && !m.read).length;
    });
    return n;
  }, [store.chats, patients, domain]);

  return [
    { to: '/doctor/dashboard', label: t('pnav.patients'), icon: Icon.patients, end: true },
    { to: '/doctor/brew', label: t('pnav.brewMonitor'), icon: Icon.brew },
    { to: '/doctor/chat', label: t('pnav.chat'), icon: Icon.chat, badge: unread },
  ];
}
