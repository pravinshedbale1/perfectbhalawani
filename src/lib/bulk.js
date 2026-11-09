// Excel मधून विद्यार्थी एकत्र नोंदणी — template, वाचन व तपासणी
import { DEFAULT_STUDENT_PASSWORD } from '../config';

// [Excel मधील मथळा, field, आवश्यक?, उदाहरण]
export const TEMPLATE_COLUMNS = [
  ['विद्यार्थ्याचे पूर्ण नाव *', 'name', true, 'पाटील राहुल सुरेश'],
  ['मोबाईल *', 'mobile', true, '9876543210'],
  ['बॅच *', 'batch', true, ''],
  ['ईमेल', 'email', false, ''],
  ['जन्मतारीख (dd-mm-yyyy)', 'dob', false, '15-06-2008'],
  ['लिंग (पुरुष/स्त्री/इतर)', 'gender', false, 'पुरुष'],
  ['शाळा / महाविद्यालय', 'school', false, 'श्री विद्यालय, भाळवणी'],
  ['इयत्ता / शिक्षण', 'standard', false, '10 वी'],
  ['पालकाचे नाव', 'parentName', false, 'सुरेश पाटील'],
  ['पालकाचा मोबाईल', 'parentMobile', false, '9876500000'],
  ['पत्ता', 'address', false, 'मु. पो. भाळवणी'],
  ['एकूण फी (रिकामे = बॅचची फी)', 'totalFee', false, ''],
  ['प्रवेश दिनांक (dd-mm-yyyy, रिकामे = आज)', 'admissionDate', false, ''],
  [`पासवर्ड (रिकामे = ${DEFAULT_STUDENT_PASSWORD})`, 'password', false, ''],
  ['टीप', 'notes', false, ''],
];

export async function downloadTemplate(batches) {
  const XLSX = await import('xlsx');
  const active = batches.filter((b) => b.active !== false);
  const example = Object.fromEntries(TEMPLATE_COLUMNS.map(([h, f, , ex]) => [h, f === 'batch' ? active[0]?.name || 'बॅचचे नाव' : ex]));
  const ws = XLSX.utils.json_to_sheet([example], { header: TEMPLATE_COLUMNS.map((c) => c[0]) });
  ws['!cols'] = TEMPLATE_COLUMNS.map(([h]) => ({ wch: Math.max(14, h.length + 2) }));
  // मोबाईल स्तंभ text म्हणून (सुरुवातीचे 0 / e+ format टाळण्यासाठी)
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'विद्यार्थी');
  const bs = XLSX.utils.json_to_sheet(active.map((b) => ({ 'बॅचचे नाव (जसेच्या तसे कॉपी करा)': b.name, अभ्यासक्रम: b.course || '', 'एकूण फी': b.fee || 0, वेळ: b.timing || '' })));
  bs['!cols'] = [{ wch: 40 }, { wch: 14 }, { wch: 10 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, bs, 'बॅच यादी');
  const help = XLSX.utils.aoa_to_sheet([
    ['सूचना'],
    ['1. "विद्यार्थी" sheet मध्ये प्रत्येक ओळीत एक विद्यार्थी भरा. उदाहरणाची ओळ काढून टाका किंवा बदला.'],
    ['2. * असलेले स्तंभ आवश्यक: नाव, 10 अंकी मोबाईल, बॅच.'],
    ['3. बॅचचे नाव "बॅच यादी" sheet मधून जसेच्या तसे कॉपी करा.'],
    ['4. तारखा dd-mm-yyyy स्वरूपात (उदा. 15-06-2008).'],
    [`5. पासवर्ड रिकामा ठेवल्यास ${DEFAULT_STUDENT_PASSWORD} वापरला जाईल. Student ID आपोआप मिळेल.`],
    ['6. मथळ्यांची (पहिली ओळ) नावे बदलू नका.'],
  ]);
  help['!cols'] = [{ wch: 90 }];
  XLSX.utils.book_append_sheet(wb, help, 'सूचना');
  XLSX.writeFile(wb, 'student-registration-template.xlsx');
}

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Excel तारीख (Date / "15-06-2008" / "15/06/2008" / "2008-06-15") → yyyy-mm-dd
function parseDate(v) {
  if (v === '' || v === null || v === undefined) return '';
  if (v instanceof Date && !isNaN(v)) return iso(new Date(v.getTime() + 12 * 3600e3)); // timezone drift टाळा
  const s = String(v).trim();
  let m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  return null; // अवैध
}

const digits = (v) => String(v ?? '').replace(/\.0+$/, '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

export async function parseStudentsFile(file, batches, existingStudents) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  const ws = wb.Sheets['विद्यार्थी'] || wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true });
  const byHeader = Object.fromEntries(TEMPLATE_COLUMNS.map(([h, f]) => [h.trim(), f]));
  const findField = (key) => byHeader[String(key).trim()] || TEMPLATE_COLUMNS.find(([h]) => h.replace(/\s*[*(].*$/, '') === String(key).replace(/\s*[*(].*$/, '').trim())?.[1];
  const batchByName = Object.fromEntries(batches.map((b) => [b.name.trim().toLowerCase(), b]));
  const existingMobiles = new Set(existingStudents.map((s) => s.mobile));
  const seen = new Map();

  return raw
    .map((r, i) => {
      const row = { _row: i + 2 };
      for (const [k, v] of Object.entries(r)) { const f = findField(k); if (f) row[f] = typeof v === 'string' ? v.trim() : v; }
      return row;
    })
    .filter((r) => TEMPLATE_COLUMNS.some(([, f]) => r[f] !== undefined && String(r[f]).trim() !== ''))
    .map((r) => {
      const errors = [], warnings = [];
      const name = String(r.name || '').trim();
      const mobile = digits(r.mobile);
      const parentMobile = digits(r.parentMobile);
      const batch = batchByName[String(r.batch || '').trim().toLowerCase()];
      if (!name) errors.push('नाव नाही');
      if (!/^\d{10}$/.test(mobile)) errors.push('मोबाईल 10 अंकी नाही');
      if (!r.batch) errors.push('बॅच नाही');
      else if (!batch) errors.push(`बॅच "${r.batch}" सापडली नाही`);
      else if (batch.active === false) warnings.push('बॅच बंद आहे');
      if (parentMobile && !/^\d{10}$/.test(parentMobile)) errors.push('पालकाचा मोबाईल 10 अंकी नाही');
      const dob = parseDate(r.dob);
      const admissionDate = parseDate(r.admissionDate);
      if (dob === null) errors.push('जन्मतारीख चुकीची');
      if (admissionDate === null) errors.push('प्रवेश दिनांक चुकीचा');
      const fee = r.totalFee === '' || r.totalFee === undefined ? Number(batch?.fee || 0) : Number(String(r.totalFee).replace(/[^\d.]/g, ''));
      if (isNaN(fee)) errors.push('फी चुकीची');
      const password = String(r.password || '').trim() || DEFAULT_STUDENT_PASSWORD;
      if (password.length < 6) errors.push('पासवर्ड किमान 6 अक्षरे');
      const key = mobile + '|' + name.toLowerCase();
      if (mobile && existingMobiles.has(mobile)) warnings.push('हा मोबाईल आधीच नोंदणीकृत');
      if (seen.has(key)) errors.push(`ओळ ${seen.get(key)} ची पुनरावृत्ती`); else seen.set(key, r._row);
      return {
        _row: r._row, errors, warnings, password,
        data: {
          name, mobile, email: String(r.email || ''), gender: String(r.gender || ''), dob: dob || '',
          school: String(r.school || ''), standard: String(r.standard || ''), parentName: String(r.parentName || ''),
          parentMobile, address: String(r.address || ''), notes: String(r.notes || ''),
          totalFee: isNaN(fee) ? 0 : fee, admissionDate: admissionDate || iso(new Date()),
          batchId: batch?.id || '', batchName: batch?.name || String(r.batch || ''), course: batch?.course || '', courseId: batch?.courseId || '',
        },
      };
    });
}

export async function downloadResults(results) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(results.map((r) => ({
    'ओळ': r._row, 'नाव': r.data.name, 'मोबाईल': r.data.mobile, 'बॅच': r.data.batchName,
    'Student ID': r.loginId || '', 'पासवर्ड': r.loginId ? r.password : '', 'स्थिती': r.loginId ? 'नोंदणी झाली' : 'अयशस्वी: ' + (r.fail || r.errors.join(', ')),
  })));
  ws['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 12 }, { wch: 26 }, { wch: 12 }, { wch: 14 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'नोंदणी निकाल');
  XLSX.writeFile(wb, `registration-result_${iso(new Date())}.xlsx`);
}
