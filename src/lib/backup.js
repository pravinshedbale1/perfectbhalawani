import { collection, doc, getDocs, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

// बॅकअपमध्ये समाविष्ट होणारे सर्व collections (मराठी नावासह — Excel sheet नावे)
export const BACKUP_COLLECTIONS = [
  ['batches', 'बॅच'],
  ['courses', 'अभ्यासक्रम'],
  ['modules', 'मॉड्यूल'],
  ['exercises', 'सराव'],
  ['students', 'विद्यार्थी'],
  ['studentLogins', 'लॉगिन पासवर्ड'],
  ['payments', 'फी पावत्या'],
  ['submissions', 'सादर सराव व गुण'],
  ['leaderboards', 'लीडरबोर्ड'],
  ['notices', 'सूचना'],
  ['counters', 'क्रमांक'],
  ['admins', 'Admin'],
];

const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
};

// Firestore Timestamp → JSON मध्ये ओळखता येईल असे (restore साठी)
const toJson = (v) => {
  if (v instanceof Timestamp) return { __type: 'timestamp', value: v.toDate().toISOString() };
  if (Array.isArray(v)) return v.map(toJson);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toJson(x)]));
  return v;
};

// Excel साठी सपाट (flat) मूल्य
const toCell = (v) => {
  if (v instanceof Timestamp) return v.toDate();
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === 'object' ? JSON.stringify(toJson(x)) : x)).join('; ');
  if (v && typeof v === 'object') return JSON.stringify(toJson(v));
  return v;
};

export async function fetchAll(onProgress) {
  const data = {};
  for (const [name] of BACKUP_COLLECTIONS) {
    onProgress?.(name);
    const snap = await getDocs(collection(db, name));
    data[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return data;
}

function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export function downloadJson(data, { includePasswords }) {
  const out = {
    app: 'perfectbhalawani.in',
    format: 1,
    createdAt: new Date().toISOString(),
    collections: Object.fromEntries(
      Object.entries(data)
        .filter(([k]) => includePasswords || k !== 'studentLogins')
        .map(([k, rows]) => [k, rows.map(toJson)])
    ),
  };
  download(new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' }), `perfect-bhalawani-backup_${stamp()}.json`);
}

export async function downloadExcel(data, { includePasswords }) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  for (const [name, label] of BACKUP_COLLECTIONS) {
    if (!includePasswords && name === 'studentLogins') continue;
    const rows = (data[name] || []).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, toCell(v)])));
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ माहिती: 'नोंद नाही' }], { cellDates: true, dateNF: 'dd-mm-yyyy hh:mm' });
    XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));
  }
  XLSX.writeFile(wb, `perfect-bhalawani-backup_${stamp()}.xlsx`, { compression: true });
}

export async function markBackupDone(counts) {
  await setDoc(doc(db, 'counters', 'lastBackup'), { at: serverTimestamp(), counts });
}
