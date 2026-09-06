import { useMemo } from 'react';
import { usePortal } from '../../../portal/PortalContext';
import { Icon } from '../shared';

// Builds the doctor sidebar nav with a live unread-chat badge.
export function useDoctorNav() {
  const { store, patients } = usePortal();
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
    { to: '/doctor/dashboard', label: 'Patients', icon: Icon.patients, end: true },
    { to: '/doctor/brew', label: 'Brew Monitor', icon: Icon.brew },
    { to: '/doctor/chat', label: 'Chat', icon: Icon.chat, badge: unread },
  ];
}
