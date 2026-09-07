// Shared brew-history log. A brew started anywhere in the app (the dashboard
// console, or a patient tapping "Start Brew") is recorded here and shows up on
// the Brew History page.

const KEY = 'vedikshaya_brew_log';

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function getBrewLog() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 60)));
  } catch {
    /* ignore */
  }
  // let same-tab listeners (Brew History page) know
  window.dispatchEvent(new Event('vedikshaya:brewlog'));
}

export function logBrewStart(name = 'Kashaya Kwatha') {
  const arr = getBrewLog();
  // don't double-log if one is already in progress
  if (arr[0]?.status === 'In progress') return arr[0].id;
  const id = `bl_${Date.now()}`;
  arr.unshift({
    id,
    startedAt: Date.now(),
    date: fmtDate(Date.now()),
    name,
    dose: '—',
    consistency: '—',
    status: 'In progress',
  });
  save(arr);
  return id;
}

export function logBrewComplete({ consistencyPct, doseMl } = {}) {
  const arr = getBrewLog();
  const entry = arr.find((e) => e.status === 'In progress');
  if (!entry) return;
  entry.status = 'Completed';
  entry.endedAt = Date.now();
  entry.dose = doseMl != null ? `${Math.round(doseMl)} mL` : entry.dose;
  entry.consistency = consistencyPct != null ? `${Number(consistencyPct).toFixed(1)}%` : entry.consistency;
  save(arr);
}

export function logBrewInterrupted() {
  const arr = getBrewLog();
  const entry = arr.find((e) => e.status === 'In progress');
  if (!entry) return;
  entry.status = 'Interrupted';
  entry.endedAt = Date.now();
  save(arr);
}
