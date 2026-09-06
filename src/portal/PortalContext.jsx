import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  BREW_ERROR_TYPES,
  hospitalDomain,
  kashayaByName,
  parseUsername,
  randomPassword,
  seedStore,
  todayYmd,
} from './portalData';

const STORE_KEY = 'vedikshaya_portal_store_v3';
const SESSION_KEY = 'vedikshaya_portal_session';
const REFRESH_MS = 30_000;

const PortalContext = createContext(null);

// ---- persistence -----------------------------------------------------------

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 3) return parsed;
    }
  } catch {
    /* ignore corrupt / unavailable storage */
  }
  const fresh = seedStore();
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(fresh));
  } catch {
    /* ignore */
  }
  return fresh;
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ---- provider ------------------------------------------------------------

export function PortalProvider({ children }) {
  const [store, setStore] = useState(loadStore);
  const [session, setSession] = useState(loadSession);
  const [tick, setTick] = useState(0); // bumps every REFRESH_MS to force re-derive
  const listenersRef = useRef(new Set()); // simulated "live listener" registry

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      /* ignore */
    }
  }, [store]);

  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [session]);

  // 30s auto-refresh + light brew-feed simulation so the demo feels live
  useEffect(() => {
    if (!session) return undefined;
    const iv = setInterval(() => {
      setStore((s) => {
        if (!s.brewFeed?.length) return s;
        const brewFeed = s.brewFeed.map((b) => ({
          ...b,
          remainingMin: Math.max(0, b.remainingMin - 0.5),
          tempC: Math.round((b.tempC + (Math.random() * 2 - 1)) * 10) / 10,
          score: Math.min(99, Math.max(80, Math.round(b.score + (Math.random() * 2 - 1)))),
        }));
        return { ...s, brewFeed };
      });
      setTick((t) => t + 1);
    }, REFRESH_MS);
    return () => clearInterval(iv);
  }, [session]);

  const patch = useCallback((fn) => setStore((s) => fn(structuredClone(s))), []);

  // ---- auth ----------------------------------------------------------------

  const portalLogin = useCallback(
    async (username, password) => {
      const parsed = parseUsername(username);
      if (!parsed.valid) throw new Error('Invalid username format');
      if (!password || password.length < 4) throw new Error('Enter your password');

      const current = loadStore();

      if (parsed.role === 'doctor') {
        const doc = current.doctor;
        const sess = {
          role: 'doctor',
          id: doc.id,
          name: doc.name,
          hospital_name: doc.hospitalName,
          hospital_domain: doc.hospitalDomain,
          token: `demo.${parsed.prefix}.${Date.now()}`,
          issuedAt: Date.now(),
        };
        setSession(sess);
        return sess;
      }

      // patient
      const pat = current.patients.find(
        (p) => p.username.toLowerCase() === parsed.username && p.hospitalDomain === parsed.domain,
      );
      if (!pat) throw new Error('No patient found for that username');
      patch((s) => {
        const t = s.patients.find((p) => p.id === pat.id);
        if (t) t.online = true;
        return s;
      });
      const sess = {
        role: 'patient',
        id: pat.id,
        name: pat.name,
        hospital_name: current.doctor.hospitalName,
        hospital_domain: pat.hospitalDomain,
        token: `demo.${parsed.prefix}.${Date.now()}`,
        issuedAt: Date.now(),
      };
      setSession(sess);
      return sess;
    },
    [patch],
  );

  const portalLogout = useCallback(() => {
    // disconnect simulated listeners
    listenersRef.current.clear();
    // set patient offline
    if (session?.role === 'patient') {
      patch((s) => {
        const p = s.patients.find((x) => x.id === session.id);
        if (p) p.online = false;
        return s;
      });
    }
    setSession(null);
  }, [session, patch]);

  const registerListener = useCallback((key) => {
    listenersRef.current.add(key);
    return () => listenersRef.current.delete(key);
  }, []);

  // ---- notifications -----------------------------------------------------

  const notifyPatient = useCallback((patientId, text, kind = 'info') => {
    patch((s) => {
      s.notifications.byPatient[patientId] = s.notifications.byPatient[patientId] || [];
      s.notifications.byPatient[patientId].unshift({ id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, text, kind, at: Date.now(), read: false });
      s.notifications.byPatient[patientId] = s.notifications.byPatient[patientId].slice(0, 40);
      return s;
    });
  }, [patch]);

  const notifyDoctor = useCallback((text, kind = 'info') => {
    patch((s) => {
      s.notifications.doctor.unshift({ id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, text, kind, at: Date.now(), read: false });
      s.notifications.doctor = s.notifications.doctor.slice(0, 40);
      return s;
    });
  }, [patch]);

  const markNotificationsRead = useCallback((scope) => {
    patch((s) => {
      if (scope === 'doctor') s.notifications.doctor.forEach((n) => { n.read = true; });
      else if (s.notifications.byPatient[scope]) s.notifications.byPatient[scope].forEach((n) => { n.read = true; });
      return s;
    });
  }, [patch]);

  // ---- doctor: patients -------------------------------------------------

  const addPatient = useCallback(
    (form) => {
      const domain = store.doctor.hospitalDomain;
      const nextNum = store.counters.patient + 1;
      const prefix = `PT${String(nextNum).padStart(4, '0')}`;
      const username = `${prefix}@${domain}`;
      const password = randomPassword(8);

      const patient = {
        id: prefix,
        number: nextNum,
        username,
        password,
        name: form.name.trim(),
        age: Number(form.age) || null,
        gender: form.gender,
        phone: form.phone.trim(),
        condition: form.condition.trim(),
        hospitalDomain: domain,
        doctorId: store.doctor.id,
        active: true,
        online: false,
        createdAt: Date.now(),
        prescription: {
          kashaya: form.kashaya,
          schedule: form.schedule,
          durationWeeks: Number(form.durationWeeks) || 8,
          weekOf: 1,
          notes: form.notes.trim() || '—',
          updatedAt: Date.now(),
          updatedBy: store.doctor.name,
        },
        compliance: { [todayYmd()]: {} },
        bestStreak: 0,
        brews: [],
        symptoms: {},
      };

      patch((s) => {
        s.patients.unshift(patient);
        s.counters.patient = nextNum;
        return s;
      });

      return { patient_id: prefix, username, temp_password: password };
    },
    [store, patch],
  );

  const updatePrescription = useCallback(
    (patientId, next) => {
      patch((s) => {
        const p = s.patients.find((x) => x.id === patientId);
        if (!p) return s;
        p.prescription = {
          ...p.prescription,
          ...next,
          updatedAt: Date.now(),
          updatedBy: s.doctor.name,
        };
        return s;
      });
      notifyPatient(patientId, `Dr. ${store.doctor.name.replace(/^Dr\.?\s*/, '')} updated your prescription. Tap to view changes.`, 'rx');
    },
    [patch, notifyPatient, store.doctor.name],
  );

  const endTreatment = useCallback(
    (patientId, reason = '') => {
      let name = '';
      patch((s) => {
        const p = s.patients.find((x) => x.id === patientId);
        if (!p) return s;
        p.active = false;
        p.endedAt = Date.now();
        p.endReason = reason;
        name = p.name;
        return s;
      });
      notifyPatient(
        patientId,
        `Your treatment course has been completed by ${store.doctor.name}. Please book a review appointment.`,
        'treatment',
      );
      notifyDoctor(`Treatment ended for ${name}.`, 'treatment');
    },
    [patch, notifyPatient, notifyDoctor, store.doctor.name],
  );

  const setDoctorAvailability = useCallback(
    (available) => {
      patch((s) => {
        s.doctor.available = available;
        return s;
      });
    },
    [patch],
  );

  // ---- patient: doses / symptoms --------------------------------------

  const markDose = useCallback(
    (patientId, slot, { scheduledTime, takenAt = Date.now(), brewSessionId = null } = {}) => {
      const date = todayYmd();
      let delay = 0;
      let streakNow = 0;
      patch((s) => {
        const p = s.patients.find((x) => x.id === patientId);
        if (!p) return s;
        p.compliance[date] = p.compliance[date] || {};
        p.compliance[date][slot] = 'taken';
        p.compliance[date][`${slot}_meta`] = {
          scheduled_time: scheduledTime,
          taken_at: takenAt,
          delay_minutes: 0,
          brew_session_id: brewSessionId,
          status: 'taken',
        };
        return s;
      });
      // notifications
      import('./portalLogic').then(({ currentStreak }) => {
        const p = loadStore().patients.find((x) => x.id === patientId);
        if (p) {
          streakNow = currentStreak(p);
          notifyPatient(patientId, `${slot[0].toUpperCase() + slot.slice(1)} dose logged successfully. 🔥 ${streakNow} day streak!`, 'dose');
        }
      });
      return { delay, streak: streakNow };
    },
    [patch, notifyPatient],
  );

  const logSymptom = useCallback(
    (patientId, feeling, note = '') => {
      const date = todayYmd();
      patch((s) => {
        const p = s.patients.find((x) => x.id === patientId);
        if (!p) return s;
        if (p.symptoms[date]) return s; // once per day
        p.symptoms[date] = { feeling, note: note.trim(), at: Date.now() };
        return s;
      });
      notifyDoctor(`${storePatientName(store, patientId)} logged today's symptom check-in.`, 'symptom');
    },
    [patch, notifyDoctor, store],
  );

  // ---- chat ----------------------------------------------------------

  const chatKey = (domain, patientId) => `${domain}/${patientId}`;

  const sendMessage = useCallback(
    (patientId, { sender, text }) => {
      const domain = store.doctor.hospitalDomain;
      const key = chatKey(domain, patientId);
      const msg = {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sender,
        sender_name: sender === 'doctor' ? store.doctor.name : storePatientName(store, patientId),
        sender_id: sender === 'doctor' ? store.doctor.id : patientId,
        message: text,
        timestamp: Date.now(),
        read: false,
      };
      patch((s) => {
        s.chats[key] = s.chats[key] || [];
        s.chats[key].push(msg);
        // busy auto-reply
        if (sender === 'patient' && !s.doctor.available) {
          s.chats[key].push({
            id: `m_${Date.now() + 1}_auto`,
            sender: 'doctor',
            sender_name: s.doctor.name,
            sender_id: s.doctor.id,
            message: `${s.doctor.name} is currently busy. Will respond within 24 hours.`,
            timestamp: Date.now() + 1,
            read: false,
            auto: true,
          });
        }
        return s;
      });
      if (sender === 'doctor') notifyPatient(patientId, `${store.doctor.name} replied to your message`, 'chat');
      else notifyDoctor(`New message from ${storePatientName(store, patientId)}`, 'chat');
    },
    [store, patch, notifyPatient, notifyDoctor],
  );

  const markChatRead = useCallback(
    (patientId, reader) => {
      const key = chatKey(store.doctor.hospitalDomain, patientId);
      patch((s) => {
        (s.chats[key] || []).forEach((m) => {
          if (m.sender !== reader) m.read = true;
        });
        return s;
      });
    },
    [store.doctor.hospitalDomain, patch],
  );

  // ---- brew / alerts ------------------------------------------------

  const dismissAlert = useCallback(
    (alertId) => {
      patch((s) => {
        s.alerts.doctor = s.alerts.doctor.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a));
        return s;
      });
    },
    [patch],
  );

  const triggerAlert = useCallback(
    (patientId, type, message) => {
      const t = BREW_ERROR_TYPES.includes(type) ? type : 'SENSOR_FAIL';
      patch((s) => {
        s.alerts.doctor.unshift({
          id: `a_${Date.now()}`,
          patientId,
          patientName: storePatientName(s, patientId),
          type: t,
          message: message || `${t} during brew session.`,
          at: Date.now(),
          dismissed: false,
        });
        return s;
      });
      notifyDoctor(`${storePatientName(store, patientId)} — ${t} during brew session.`, 'alert');
    },
    [patch, notifyDoctor, store],
  );

  // ---- selectors --------------------------------------------------

  const value = useMemo(
    () => ({
      store,
      session,
      tick,
      // auth
      portalLogin,
      portalLogout,
      registerListener,
      // doctor
      doctor: store.doctor,
      patients: store.patients,
      addPatient,
      updatePrescription,
      endTreatment,
      setDoctorAvailability,
      // patient
      markDose,
      logSymptom,
      // chat
      getChat: (patientId) => store.chats[`${store.doctor.hospitalDomain}/${patientId}`] || [],
      sendMessage,
      markChatRead,
      // brew / alerts
      brewFeed: store.brewFeed || [],
      alerts: (store.alerts?.doctor || []).filter((a) => !a.dismissed),
      allAlerts: store.alerts?.doctor || [],
      dismissAlert,
      triggerAlert,
      // notifications
      doctorNotifications: store.notifications?.doctor || [],
      patientNotifications: (id) => store.notifications?.byPatient?.[id] || [],
      notifyPatient,
      notifyDoctor,
      markNotificationsRead,
      // misc
      kashayaByName,
      hospitalDomain,
    }),
    [
      store, session, tick, portalLogin, portalLogout, registerListener, addPatient,
      updatePrescription, endTreatment, setDoctorAvailability, markDose, logSymptom,
      sendMessage, markChatRead, dismissAlert, triggerAlert, notifyPatient, notifyDoctor,
      markNotificationsRead,
    ],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

function storePatientName(store, id) {
  return store.patients.find((p) => p.id === id)?.name || 'Patient';
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within a PortalProvider');
  return ctx;
}

export { SESSION_KEY, STORE_KEY };
