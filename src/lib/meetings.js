export const FORMATS = ['Video call', 'Phone call', 'In person'];
export const TOPICS = ['Talk about backing the project further', 'Ask questions about the work', 'Explore working together', 'Something else'];
export const DURATIONS = [15, 30, 60];

export const fmtSlot = (iso, tz) => new Date(iso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short', ...(tz ? { timeZone: tz } : {}) });
export const toIso = (localValue) => { const d = new Date(localValue); return Number.isNaN(d.getTime()) ? null : d.toISOString(); };
export const localMin = () => { const d = new Date(Date.now() + 3600000); d.setMinutes(0, 0, 0); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00`; };
export const isFuture = (iso) => !!iso && new Date(iso).getTime() > Date.now();

const esc = (t) => String(t || '').replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/* downloadable calendar file for a confirmed meeting */
export function icsFor(m, title) {
  const start = new Date(m.final.slot).getTime();
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nomi//Meetings//EN', 'BEGIN:VEVENT', `UID:${m.id}@nomi`, `DTSTAMP:${stamp(Date.now())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(start + m.duration * 60000)}`, `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(m.topic)}`, `LOCATION:${esc(m.final.place || m.format)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
export function downloadIcs(m, title) {
  const url = URL.createObjectURL(new Blob([icsFor(m, title)], { type: 'text/calendar' }));
  const a = document.createElement('a'); a.href = url; a.download = 'nomi-meeting.ics'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
