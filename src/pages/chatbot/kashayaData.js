export const KASHAYA_CATALOGUE = [
  {
    name: 'Dashamoola Kwatha',
    for: ['fever', 'cold', 'cough', 'flu', 'joint pain', 'arthritis', 'inflammation', 'body ache'],
    note: 'Supports joint mobility, reduces inflammation, and helps with fevers and colds. Best taken warm, twice daily.',
  },
  {
    name: 'Triphala Kwatha',
    for: ['digestion', 'indigestion', 'stomach', 'constipation', 'bloating', 'acidity', 'gas'],
    note: 'A classic digestive and detoxifying formulation. Take 100 mL after dinner for best results.',
  },
  {
    name: 'Guduchi Kwatha',
    for: ['immunity', 'weak immunity', 'infection', 'allergy', 'skin', 'recurring illness'],
    note: 'An adaptogenic immunity booster. Recommended once daily, ideally in the morning on an empty stomach.',
  },
  {
    name: 'Ashwagandha Kwatha',
    for: ['stress', 'anxiety', 'sleep', 'insomnia', 'fatigue', 'weakness', 'low energy'],
    note: 'Supports stress resilience and restorative sleep. Best taken in the evening, 30 minutes before bed.',
  },
];

export function findRecommendation(text) {
  const lower = text.toLowerCase();

  const byName = KASHAYA_CATALOGUE.find((k) => lower.includes(k.name.toLowerCase()));
  if (byName) return byName;

  return KASHAYA_CATALOGUE.find((k) => k.for.some((symptom) => lower.includes(symptom))) || null;
}
