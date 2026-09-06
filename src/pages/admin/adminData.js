// Seed data for the admin console. Everything is in-memory — add / remove /
// status changes persist for the session and reset on reload (demo scope).

export const HOSPITALS = [
  { id: 'h1', name: 'Apollo Ayurveda Centre', city: 'Chennai', tier: 'Partner', joined: '2025-11-02', pods: 14 },
  { id: 'h2', name: 'Arya Vaidya Sala Clinic', city: 'Kottakkal', tier: 'Flagship', joined: '2025-09-18', pods: 22 },
  { id: 'h3', name: 'Jiva Wellness Hospital', city: 'Faridabad', tier: 'Partner', joined: '2026-01-12', pods: 9 },
  { id: 'h4', name: 'Sri Sri Tattva Panchakarma', city: 'Bengaluru', tier: 'Partner', joined: '2026-02-25', pods: 11 },
];

export const DOCTORS = [
  { id: 'd1', name: 'Dr. Meera Nair', hospitalId: 'h1', speciality: 'Kayachikitsa', reg: 'TN-AYUR-4821' },
  { id: 'd2', name: 'Dr. Suresh Varma', hospitalId: 'h1', speciality: 'Panchakarma', reg: 'TN-AYUR-5107' },
  { id: 'd3', name: 'Dr. Lakshmi Menon', hospitalId: 'h2', speciality: 'Kaumarabhritya', reg: 'KL-AYUR-2299' },
  { id: 'd4', name: 'Dr. Anil Kurup', hospitalId: 'h2', speciality: 'Kayachikitsa', reg: 'KL-AYUR-2610' },
  { id: 'd5', name: 'Dr. Ritu Sharma', hospitalId: 'h3', speciality: 'Swasthavritta', reg: 'HR-AYUR-1043' },
  { id: 'd6', name: 'Dr. Kavya Reddy', hospitalId: 'h4', speciality: 'Rasashastra', reg: 'KA-AYUR-3388' },
];

export const PATIENTS = [
  { id: 'p1', name: 'Ramesh Iyer', hospitalId: 'h1', doctorId: 'd1', kashaya: 'Nilavembu Kudineer Chooranam', lastDose: '2026-09-03', payment: 'Paid', amount: 1800 },
  { id: 'p2', name: 'Fathima Rasheed', hospitalId: 'h1', doctorId: 'd2', kashaya: 'Shadanga Paniya', lastDose: '2026-09-01', payment: 'Pending', amount: 2400 },
  { id: 'p3', name: 'Joseph Thomas', hospitalId: 'h2', doctorId: 'd3', kashaya: 'Tulsi-Dalchini-Sunthi-Marich', lastDose: '2026-08-30', payment: 'Paid', amount: 1500 },
  { id: 'p4', name: 'Sneha Patil', hospitalId: 'h2', doctorId: 'd4', kashaya: 'Nilavembu Kudineer Chooranam', lastDose: '2026-09-04', payment: 'Paid', amount: 1800 },
  { id: 'p5', name: 'Arjun Deshmukh', hospitalId: 'h3', doctorId: 'd5', kashaya: 'Tulsi-Dalchini-Sunthi-Marich', lastDose: '2026-09-02', payment: 'Pending', amount: 1500 },
  { id: 'p6', name: 'Priya Raghavan', hospitalId: 'h4', doctorId: 'd6', kashaya: 'Shadanga Paniya', lastDose: '2026-08-28', payment: 'Paid', amount: 2400 },
  { id: 'p7', name: 'Vikram Singh', hospitalId: 'h1', doctorId: 'd1', kashaya: 'Tulsi-Dalchini-Sunthi-Marich', lastDose: '2026-09-05', payment: 'Pending', amount: 1500 },
  { id: 'p8', name: 'Divya Krishnan', hospitalId: 'h2', doctorId: 'd3', kashaya: 'Nilavembu Kudineer Chooranam', lastDose: '2026-09-03', payment: 'Paid', amount: 1800 },
];

export const COMPLAINTS = [
  { id: 'c1', from: 'anitha.k@gmail.com', hospitalId: 'h2', subject: 'Pod did not dispense the full 100 mL dose', opened: '2026-09-04', priority: 'High', status: 'Open' },
  { id: 'c2', from: 'r.menon@outlook.com', hospitalId: 'h1', subject: 'Billing amount higher than quoted at reception', opened: '2026-09-03', priority: 'Medium', status: 'Open' },
  { id: 'c3', from: 'skumar92@gmail.com', hospitalId: 'h3', subject: 'App shows wrong Kashaya name after scanning pod', opened: '2026-09-02', priority: 'Low', status: 'In Review' },
  { id: 'c4', from: 'jaya.pillai@gmail.com', hospitalId: 'h4', subject: 'Requested refund for an interrupted brew', opened: '2026-08-31', priority: 'Medium', status: 'Open' },
];

export const KASHAYA_OPTIONS = [
  'Nilavembu Kudineer Chooranam',
  'Tulsi-Dalchini-Sunthi-Marich',
  'Shadanga Paniya',
];

export function uid(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
