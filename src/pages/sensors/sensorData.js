// Deterministic-ish dummy time-series generator for demo sensor charts.
// A seeded PRNG keeps the "random" walk stable across re-renders instead
// of jumping every time React remounts the chart.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeries({ seed, points = 36, stepMinutes = 5, base, variance, drift = 0 }) {
  const rand = mulberry32(seed);
  const now = Date.now();
  const data = [];
  let value = base;

  for (let i = points - 1; i >= 0; i -= 1) {
    value += (rand() - 0.5) * variance + drift;
    data.push({
      date: now - i * stepMinutes * 60 * 1000,
      value: Math.max(0, value),
    });
  }
  return data;
}
