// Client-side patient report -> opens a print-ready window the browser can
// "Save as PDF". No server, no libs. Filename is seeded via the document title.

import { complianceStats, currentStreak, activeSlots, slotLabel } from './portalLogic';
import { lastNDates } from './portalData';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function exportPatientReport(patient, doctor) {
  const stats = complianceStats(patient);
  const streak = currentStreak(patient);
  const slots = activeSlots(patient.prescription.schedule);
  const days = lastNDates(7);
  const fileBase = `${patient.id}_${patient.name.replace(/\s+/g, '')}_report`;

  const gridRows = slots
    .map((slot) => {
      const cells = days
        .map((d) => {
          const v = patient.compliance?.[d]?.[slot];
          const mark = v === 'taken' ? '✓' : v === 'missed' ? '✗' : '•';
          const cls = v === 'taken' ? 'ok' : v === 'missed' ? 'bad' : 'pend';
          return `<td class="${cls}">${mark}</td>`;
        })
        .join('');
      return `<tr><th>${slotLabel(slot)}</th>${cells}</tr>`;
    })
    .join('');

  const brewRows =
    patient.brews.length
      ? patient.brews
          .map(
            (b) =>
              `<tr><td>${new Date(b.startedAt).toLocaleDateString()}</td><td>${esc(b.kashaya)}</td><td>${b.score}%</td><td>${b.durationMin} min</td></tr>`,
          )
          .join('')
      : `<tr><td colspan="4" class="muted">No brew sessions recorded</td></tr>`;

  const symptomRows =
    Object.entries(patient.symptoms).length
      ? Object.entries(patient.symptoms)
          .sort((a, b) => (a[0] < b[0] ? 1 : -1))
          .map(([d, s]) => `<tr><td>${d}</td><td>${esc(s.feeling.replace(/_/g, ' '))}</td><td>${esc(s.note || '—')}</td></tr>`)
          .join('')
      : `<tr><td colspan="3" class="muted">No symptom check-ins recorded</td></tr>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(fileBase)}</title>
<style>
  * { font-family: 'Segoe UI', Tahoma, sans-serif; }
  body { margin: 40px; color: #012f13; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #5f7568; font-size: 13px; margin-bottom: 24px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .06em; color: #3f6d15; margin: 26px 0 10px; border-bottom: 2px solid #e2f0cc; padding-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid #cddfab; padding: 7px 10px; text-align: left; }
  th { background: #eef5e2; }
  .kv td:first-child { font-weight: 700; width: 34%; color: #5f7568; }
  .grid td { text-align: center; font-weight: 700; }
  .grid .ok { background: #d9edc4; color: #2f7d32; }
  .grid .bad { background: #fbe0dd; color: #c23b30; }
  .grid .pend { background: #f4f4ee; color: #999; }
  .muted { color: #999; text-align: center; }
  .foot { margin-top: 40px; font-size: 11px; color: #9aa; }
  @media print { body { margin: 16px; } h2 { page-break-after: avoid; } }
</style></head><body>
  <h1>${esc(patient.name)} — Treatment Report</h1>
  <div class="sub">${esc(patient.id)} · ${esc(patient.hospitalDomain)} · Generated ${new Date().toLocaleString()}</div>

  <h2>Patient</h2>
  <table class="kv">
    <tr><td>Name</td><td>${esc(patient.name)}</td></tr>
    <tr><td>Patient ID</td><td>${esc(patient.id)}</td></tr>
    <tr><td>Age / Gender</td><td>${esc(patient.age)} · ${esc(patient.gender)}</td></tr>
    <tr><td>Phone</td><td>${esc(patient.phone)}</td></tr>
    <tr><td>Condition</td><td>${esc(patient.condition)}</td></tr>
    <tr><td>Hospital</td><td>${esc(doctor?.hospitalName || patient.hospitalDomain)}</td></tr>
    <tr><td>Treating doctor</td><td>${esc(doctor?.name || patient.prescription.updatedBy)}</td></tr>
    <tr><td>Status</td><td>${patient.active ? 'Active' : 'Treatment completed'}</td></tr>
  </table>

  <h2>Prescription</h2>
  <table class="kv">
    <tr><td>Kashaya</td><td>${esc(patient.prescription.kashaya)}</td></tr>
    <tr><td>Schedule</td><td>${slots
      .map((s) => `${slotLabel(s)} ${esc(patient.prescription.schedule[s].time)} (${patient.prescription.schedule[s].food} food)`)
      .join('<br>')}</td></tr>
    <tr><td>Duration</td><td>Week ${patient.prescription.weekOf} of ${patient.prescription.durationWeeks}</td></tr>
    <tr><td>Doctor's notes</td><td>${esc(patient.prescription.notes)}</td></tr>
  </table>

  <h2>Compliance — last 7 days (${stats.pct}%, streak ${streak}d)</h2>
  <table class="grid">
    <tr><th></th>${days.map((d) => `<th>${d.slice(5)}</th>`).join('')}</tr>
    ${gridRows}
  </table>

  <h2>Brew history</h2>
  <table><tr><th>Date</th><th>Kashaya</th><th>Consistency</th><th>Duration</th></tr>${brewRows}</table>

  <h2>Symptom trend</h2>
  <table><tr><th>Date</th><th>Feeling</th><th>Note</th></tr>${symptomRows}</table>

  <div class="foot">Vedikshaya — AFI-aligned decoction therapy. This report is a demo artefact.</div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}
