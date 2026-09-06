// Demo data + pure helpers for the Doctor / Patient portals.
// Everything here is session/localStorage scoped — no real backend. It lets the
// full clinical workflow be demoed end to end (add patient -> credentials ->
// doses -> compliance -> chat -> reports) without a live database.

export const KASHAYAS = [
  {
    id: 'dashamoola',
    name: 'Dashamoola Kwatha',
    sanskrit: 'दशमूल क्वाथ',
    benefit:
      'Ten-root decoction that eases vata-driven aches, calms the nervous system and supports easy breathing. Traditionally used through recovery and post-natal care.',
    ingredients: [
      'Bilva', 'Agnimantha', 'Shyonaka', 'Gambhari', 'Patala',
      'Shalaparni', 'Prishniparni', 'Brihati', 'Kantakari', 'Gokshura',
    ],
    contraindications: 'Avoid in high pitta states with acute burning; not during acute fever spikes above 102°F.',
    afi: 'AFI Part I — 4:1 reduction, 85–90°C draw, single fresh dose within 30 min.',
  },
  {
    id: 'triphala',
    name: 'Triphala Kwatha',
    sanskrit: 'त्रिफला क्वाथ',
    benefit:
      'Three-fruit decoction that gently regulates digestion and elimination, supports the eyes and acts as a mild daily detox without harsh purgation.',
    ingredients: ['Haritaki', 'Bibhitaki', 'Amalaki'],
    contraindications: 'Avoid during diarrhoea, dehydration and first trimester of pregnancy.',
    afi: 'AFI Part I — 4:1 reduction, 85–90°C draw, taken warm on an empty stomach.',
  },
  {
    id: 'guduchi',
    name: 'Guduchi Kwatha',
    sanskrit: 'गुडूची क्वाथ',
    benefit:
      'Single-herb decoction of Tinospora that supports immune resilience, helps clear low-grade fevers and steadies blood sugar and joint comfort over time.',
    ingredients: ['Guduchi (Tinospora cordifolia) stem'],
    contraindications: 'Use cautiously with immunosuppressant therapy and in pregnancy.',
    afi: 'AFI Part I — 4:1 reduction, 85–90°C draw, twice daily as prescribed.',
  },
];

export const kashayaByName = (name) => KASHAYAS.find((k) => k.name === name) || KASHAYAS[0];

export const DOCTOR_QUICK_REPLIES = [
  'Continue with current prescription',
  'Please do not miss your doses',
  'Book a follow-up appointment',
  'Your compliance is improving, well done',
];

export const PATIENT_QUERY_TEMPLATES = [
  'I missed my dose, what should I do?',
  'Can I take this with food or milk?',
  'I am experiencing side effects',
  'I would like to book an appointment',
];

export const SYMPTOM_OPTIONS = [
  { value: 'much_better', emoji: '😊', label: 'Much Better', score: 5 },
  { value: 'better', emoji: '🙂', label: 'Better', score: 4 },
  { value: 'same', emoji: '😐', label: 'Same', score: 3 },
  { value: 'worse', emoji: '🙁', label: 'Worse', score: 2 },
  { value: 'much_worse', emoji: '😞', label: 'Much Worse', score: 1 },
];

export const BADGES = [
  { days: 3, icon: '🌱', title: 'Getting Started' },
  { days: 7, icon: '🌿', title: 'One Week Strong' },
  { days: 14, icon: '🌳', title: 'Committed' },
  { days: 30, icon: '🏆', title: 'Champion' },
];

export const BREW_ERROR_TYPES = ['TEMP_HIGH', 'TEMP_LOW', 'DRY_RUN', 'BOIL_OVER', 'SENSOR_FAIL'];

// ---------------------------------------------------------------------------
// username / credential helpers
// ---------------------------------------------------------------------------

// "Apollo Hospital" -> "apollohospital.com"
export function hospitalDomain(name) {
  const slug = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return slug ? `${slug}.com` : '';
}

const USERNAME_RE = /^(DR|PT)(\d{4})@([a-z0-9]+\.com)$/i;

// Returns { valid, role, prefix, number, domain } — role is 'doctor' | 'patient'
export function parseUsername(raw) {
  const value = String(raw || '').trim();
  const m = value.match(USERNAME_RE);
  if (!m) return { valid: false };
  const kind = m[1].toUpperCase();
  return {
    valid: true,
    role: kind === 'DR' ? 'doctor' : 'patient',
    prefix: `${kind}${m[2]}`,
    number: Number(m[2]),
    domain: m[3].toLowerCase(),
    // normalised, fully lower-case — safe to compare against stored usernames
    username: `${kind}${m[2]}@${m[3]}`.toLowerCase(),
  };
}

const PW_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function randomPassword(len = 8) {
  let out = '';
  const rnd = globalThis.crypto?.getRandomValues
    ? Array.from(globalThis.crypto.getRandomValues(new Uint32Array(len)))
    : Array.from({ length: len }, () => Math.floor(Math.random() * 1e9));
  for (let i = 0; i < len; i += 1) out += PW_ALPHABET[rnd[i] % PW_ALPHABET.length];
  return out;
}

// ---------------------------------------------------------------------------
// date helpers (local, no libs)
// ---------------------------------------------------------------------------

export const ymd = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export const todayYmd = () => ymd(new Date());

export function lastNDates(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(ymd(d));
  }
  return out;
}

// "6:00 AM" -> minutes since midnight
export function timeToMinutes(t) {
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3] && m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m[2]);
}

export function minutesToTime(mins) {
  const m = ((mins % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const ap = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${ap}`;
}

// ---------------------------------------------------------------------------
// seed store
// ---------------------------------------------------------------------------

const DEFAULT_SCHEDULE = () => ({
  morning: { on: true, time: '6:00 AM', food: 'before' },
  afternoon: { on: false, time: '1:00 PM', food: 'after' },
  night: { on: true, time: '8:00 PM', food: 'after' },
});

// Build a plausible 7-day compliance history for a patient.
function seedCompliance(schedule, quality) {
  const slots = ['morning', 'afternoon', 'night'].filter((s) => schedule[s].on);
  const log = {};
  lastNDates(7).forEach((date, idx) => {
    log[date] = {};
    slots.forEach((slot) => {
      // last day (today) stays pending; earlier days follow the quality dial
      if (idx === 6) {
        log[date][slot] = 'pending';
        return;
      }
      const r = Math.random();
      log[date][slot] = r < quality ? 'taken' : r < quality + 0.12 ? 'pending' : 'missed';
    });
  });
  return log;
}

function makePatient(seed) {
  const schedule = seed.schedule || DEFAULT_SCHEDULE();
  return {
    id: seed.id,
    number: seed.number,
    username: seed.username,
    password: seed.password,
    name: seed.name,
    age: seed.age,
    gender: seed.gender,
    phone: seed.phone,
    condition: seed.condition,
    hospitalDomain: seed.hospitalDomain,
    doctorId: seed.doctorId,
    active: seed.active !== false,
    online: false,
    createdAt: seed.createdAt || Date.now(),
    prescription: {
      kashaya: seed.kashaya,
      schedule,
      durationWeeks: seed.durationWeeks || 8,
      weekOf: seed.weekOf || 3,
      notes: seed.notes || 'Take with lukewarm water. Rest well and stay hydrated.',
      updatedAt: Date.now(),
      updatedBy: seed.doctorName || 'Dr. Meera Nair',
    },
    compliance: seedCompliance(schedule, seed.quality ?? 0.8),
    bestStreak: seed.bestStreak ?? 6,
    brews: seed.brews || [],
    symptoms: seed.symptoms || {},
  };
}

export function seedStore() {
  const domain = 'apollohospital.com';
  const doctor = {
    id: 'DR2024',
    number: 2024,
    username: `DR2024@${domain}`,
    name: 'Dr. Meera Nair',
    password: '123456',
    hospitalName: 'Apollo Hospital',
    hospitalDomain: domain,
    speciality: 'Kayachikitsa (Internal Medicine)',
    available: true,
  };

  const brewSample = (kashaya, score, mins) => ({
    id: `brew_${Math.random().toString(36).slice(2, 9)}`,
    kashaya,
    score,
    startedAt: Date.now() - mins * 60000,
    durationMin: 24,
    phase: 'Complete',
  });

  const patients = [
    makePatient({
      id: 'PT1042', number: 1042, username: `PT1042@${domain}`, password: '123456',
      name: 'Anand Rao', age: 54, gender: 'Male', phone: '+91 9845 66210',
      condition: 'Chronic lower-back pain (vata)', kashaya: 'Dashamoola Kwatha',
      hospitalDomain: domain, doctorId: doctor.id, doctorName: doctor.name,
      durationWeeks: 8, weekOf: 3, quality: 0.86, bestStreak: 9,
      notes: 'Warm compress after the night dose. Avoid cold, dry foods.',
      brews: [brewSample('Dashamoola Kwatha', 97, 90), brewSample('Dashamoola Kwatha', 94, 1550), brewSample('Dashamoola Kwatha', 91, 3000)],
      symptoms: { [todayYmd()]: { feeling: 'better', note: 'Stiffness easing in the mornings', at: Date.now() - 3600_000 } },
    }),
    makePatient({
      id: 'PT1043', number: 1043, username: `PT1043@${domain}`, password: '123456',
      name: 'Kavya Menon', age: 32, gender: 'Female', phone: '+91 99872 41005',
      condition: 'Irregular digestion, bloating', kashaya: 'Triphala Kwatha',
      hospitalDomain: domain, doctorId: doctor.id, doctorName: doctor.name,
      durationWeeks: 6, weekOf: 2, quality: 0.62, bestStreak: 4,
      schedule: {
        morning: { on: true, time: '6:30 AM', food: 'before' },
        afternoon: { on: false, time: '1:00 PM', food: 'after' },
        night: { on: true, time: '9:00 PM', food: 'after' },
      },
      brews: [brewSample('Triphala Kwatha', 88, 200), brewSample('Triphala Kwatha', 90, 1700)],
    }),
    makePatient({
      id: 'PT1044', number: 1044, username: `PT1044@${domain}`, password: '123456',
      name: 'Suresh Iyer', age: 47, gender: 'Male', phone: '+91 90031 55678',
      condition: 'Recurrent low-grade fever, fatigue', kashaya: 'Guduchi Kwatha',
      hospitalDomain: domain, doctorId: doctor.id, doctorName: doctor.name,
      durationWeeks: 10, weekOf: 5, quality: 0.93, bestStreak: 15,
      brews: [brewSample('Guduchi Kwatha', 96, 50), brewSample('Guduchi Kwatha', 95, 1500)],
    }),
    makePatient({
      id: 'PT1045', number: 1045, username: `PT1045@${domain}`, password: '123456',
      name: 'Fatima Sheikh', age: 29, gender: 'Female', phone: '+91 98200 77341',
      condition: 'Post-viral joint aches', kashaya: 'Dashamoola Kwatha',
      hospitalDomain: domain, doctorId: doctor.id, doctorName: doctor.name,
      durationWeeks: 4, weekOf: 4, quality: 0.7, bestStreak: 5, active: false,
    }),
  ];

  return {
    version: 4,
    doctor,
    patients,
    counters: { patient: 1045 },
    chats: {}, // `${domain}/${patientId}` -> message[]
    alerts: { doctor: [] }, // doctor-facing alerts
    notifications: { doctor: [], byPatient: {} },
    brewFeed: [
      {
        patientId: 'PT1044', kashaya: 'Guduchi Kwatha', tempC: 88, phase: 'Stirring',
        remainingMin: 6, score: 96, error: null, startedAt: Date.now() - 18 * 60000,
      },
      {
        patientId: 'PT1043', kashaya: 'Triphala Kwatha', tempC: 79, phase: 'Boil',
        remainingMin: 12, score: 90, error: 'TEMP_LOW', startedAt: Date.now() - 9 * 60000,
      },
    ],
  };
}
