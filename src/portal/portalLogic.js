// Pure derivations shared by both portals: dose status, compliance %, streaks,
// badges. Kept separate from data + context so they're trivially testable.

import {
  BADGES,
  lastNDates,
  minutesToTime,
  timeToMinutes,
  todayYmd,
} from './portalData';

export const SLOTS = ['morning', 'afternoon', 'night'];
export const slotLabel = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function activeSlots(schedule) {
  return SLOTS.filter((s) => schedule?.[s]?.on);
}

// Status of one dose for a given day, factoring in the current clock for today.
// -> 'taken' | 'missed' | 'pending' | 'upcoming' | 'due'
export function doseStatus(patient, date, slot, now = new Date()) {
  const logged = patient.compliance?.[date]?.[slot];
  if (logged === 'taken') return 'taken';
  if (logged === 'missed') return 'missed';

  const isToday = date === todayYmd();
  if (!isToday) return logged || 'missed';

  const sched = patient.prescription.schedule[slot];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const doseMin = timeToMinutes(sched.time);
  if (nowMin < doseMin) return 'upcoming';
  return 'due'; // time passed today, not yet marked
}

// "Start Brew" is armed from 30 min before the dose until it's marked.
export function canStartBrew(patient, slot, now = new Date()) {
  const sched = patient.prescription.schedule[slot];
  if (!sched?.on) return false;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const doseMin = timeToMinutes(sched.time);
  return nowMin >= doseMin - 30 && nowMin <= doseMin + 180;
}

export function minutesUntil(timeStr, now = new Date()) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return timeToMinutes(timeStr) - nowMin;
}

export function humanCountdown(mins) {
  if (mins <= 0) return 'now';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

// Weekly compliance across the last 7 days for the currently-active slots.
export function complianceStats(patient) {
  const slots = activeSlots(patient.prescription.schedule);
  const days = lastNDates(7);
  let scheduled = 0;
  let taken = 0;
  const missBySlot = { morning: 0, afternoon: 0, night: 0 };

  days.forEach((date) => {
    slots.forEach((slot) => {
      const st = doseStatus(patient, date, slot);
      if (st === 'upcoming' || st === 'pending') return; // not yet countable
      scheduled += 1;
      if (st === 'taken') taken += 1;
      if (st === 'missed' || st === 'due') missBySlot[slot] += 1;
    });
  });

  const pct = scheduled ? Math.round((taken / scheduled) * 100) : 0;
  const mostMissed =
    Object.entries(missBySlot).sort((a, b) => b[1] - a[1])[0]?.[1] > 0
      ? Object.entries(missBySlot).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  return { scheduled, taken, pct, mostMissed, missBySlot, days, slots };
}

// A day counts toward the streak only if every scheduled dose that day is taken.
export function currentStreak(patient) {
  const slots = activeSlots(patient.prescription.schedule);
  let streak = 0;
  const days = [...lastNDates(30)].reverse(); // newest first
  for (const date of days) {
    const statuses = slots.map((slot) => doseStatus(patient, date, slot));
    if (date === todayYmd()) {
      // today only breaks the streak once a dose is actually missed/overdue
      if (statuses.some((s) => s === 'missed' || s === 'due')) break;
      if (statuses.every((s) => s === 'taken')) streak += 1;
      continue;
    }
    if (statuses.every((s) => s === 'taken')) streak += 1;
    else break;
  }
  return streak;
}

export function badgeProgress(streak) {
  const unlocked = BADGES.filter((b) => streak >= b.days);
  const next = BADGES.find((b) => streak < b.days) || null;
  return {
    unlocked,
    next,
    toNext: next ? next.days - streak : 0,
  };
}

export function isPerfectWeek(patient) {
  const { scheduled, taken } = complianceStats(patient);
  return scheduled > 0 && scheduled === taken;
}

// Doctor-side roll-up across a patient list.
export function doctorStats(patients) {
  const active = patients.filter((p) => p.active);
  let compliantToday = 0;
  let missedToday = 0;
  let pendingToday = 0;
  const today = todayYmd();

  active.forEach((p) => {
    const slots = activeSlots(p.prescription.schedule);
    const st = slots.map((slot) => doseStatus(p, today, slot));
    if (slots.length && st.every((s) => s === 'taken')) compliantToday += 1;
    if (st.some((s) => s === 'missed' || s === 'due')) missedToday += 1;
    if (st.some((s) => s === 'upcoming' || s === 'pending') && !st.some((s) => s === 'missed' || s === 'due')) {
      pendingToday += 1;
    }
  });

  return {
    total: active.length,
    compliantToday,
    missedToday,
    pendingToday,
  };
}

export function scheduleSummary(schedule) {
  return activeSlots(schedule)
    .map((s) => `${slotLabel(s)} ${schedule[s].time}`)
    .join(' · ');
}

export { minutesToTime, timeToMinutes };
