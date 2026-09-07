// Tiny client-side "Excel" export. Writes an HTML workbook that Excel /
// LibreOffice open natively as a formatted sheet — no dependency, no server.

const esc = (v) =>
  String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// sections: [{ title?, headers: string[], rows: (string|number)[][] }]
export function downloadXls(filename, sections) {
  const list = Array.isArray(sections) ? sections : [sections];
  const body = list
    .map((s) => {
      const head = s.headers?.length
        ? `<tr>${s.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`
        : '';
      const rows = (s.rows || [])
        .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
        .join('');
      return `${s.title ? `<tr><td class="sec" colspan="99">${esc(s.title)}</td></tr>` : ''}${head}${rows}<tr><td colspan="99"></td></tr>`;
    })
    .join('');

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>
  table { border-collapse: collapse; font-family: 'Segoe UI', Calibri, sans-serif; font-size: 11pt; }
  th { background: #E2F0CC; color: #012F13; font-weight: bold; border: 1px solid #9ec36a; padding: 5px 9px; text-align: left; }
  td { border: 1px solid #cddfab; padding: 5px 9px; }
  td.sec { background: #012F13; color: #fff; font-weight: bold; border: none; padding: 8px 9px; }
</style></head>
<body><table>${body}</table></body></html>`;

  const blob = new Blob(['﻿', html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
