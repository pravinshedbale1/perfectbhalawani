// Bulk student registration from Excel — template, parsing and validation.
// The template is in English; batch and gender columns are drop-down lists (LOV).
import { DEFAULT_STUDENT_PASSWORD } from '../config';

const MAX_ROWS = 1000; // rows that get the drop-down validation

// [English header, field, required?, example, Marathi header (older templates)]
export const TEMPLATE_COLUMNS = [
  ['Full Name *', 'name', true, 'Patil Rahul Suresh', 'विद्यार्थ्याचे पूर्ण नाव *'],
  ['Mobile *', 'mobile', true, '9876543210', 'मोबाईल *'],
  ['Batch *', 'batch', true, '', 'बॅच *'],
  ['Email', 'email', false, '', 'ईमेल'],
  ['Date of Birth (DD-MM-YYYY)', 'dob', false, '15-06-2008', 'जन्मतारीख (dd-mm-yyyy)'],
  ['Gender', 'gender', false, 'Male', 'लिंग (पुरुष/स्त्री/इतर)'],
  ['School / College', 'school', false, 'Shri Vidyalaya, Bhalawani', 'शाळा / महाविद्यालय'],
  ['Standard / Education', 'standard', false, '10th', 'इयत्ता / शिक्षण'],
  ['Parent Name', 'parentName', false, 'Suresh Patil', 'पालकाचे नाव'],
  ['Parent Mobile', 'parentMobile', false, '9876500000', 'पालकाचा मोबाईल'],
  ['Address', 'address', false, 'At Post Bhalawani', 'पत्ता'],
  ['Total Fee (blank = batch fee)', 'totalFee', false, '', 'एकूण फी (रिकामे = बॅचची फी)'],
  ['Admission Date (DD-MM-YYYY, blank = today)', 'admissionDate', false, '', 'प्रवेश दिनांक (dd-mm-yyyy, रिकामे = आज)'],
  [`Password (blank = ${DEFAULT_STUDENT_PASSWORD})`, 'password', false, '', `पासवर्ड (रिकामे = ${DEFAULT_STUDENT_PASSWORD})`],
  ['Notes', 'notes', false, '', 'टीप'],
];
const GENDERS = { male: 'पुरुष', female: 'स्त्री', other: 'इतर', पुरुष: 'पुरुष', स्त्री: 'स्त्री', इतर: 'इतर', m: 'पुरुष', f: 'स्त्री' };
const TEXT_FIELDS = new Set(['mobile', 'parentMobile', 'dob', 'admissionDate', 'password']);

function saveBuffer(buf, filename) {
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export async function downloadTemplate(batches) {
  const ExcelJS = (await import('exceljs')).default;
  const active = batches.filter((b) => b.active !== false).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const wb = new ExcelJS.Workbook();
  wb.creator = 'perfectbhalawani.in';

  // --- Students sheet ---
  const ws = wb.addWorksheet('Students', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = TEMPLATE_COLUMNS.map(([h, f]) => ({
    header: h, key: f,
    width: Math.max(14, h.length + 2, f === 'batch' ? Math.max(24, ...active.map((b) => b.name.length + 2)) : 0),
    style: TEXT_FIELDS.has(f) ? { numFmt: '@' } : {},
  }));
  const head = ws.getRow(1);
  head.height = 22;
  head.eachCell((c, i) => {
    const req = TEMPLATE_COLUMNS[i - 1][2];
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: req ? 'FFF47920' : 'FF0B3D78' } };
    c.alignment = { vertical: 'middle', wrapText: true };
  });
  ws.addRow(Object.fromEntries(TEMPLATE_COLUMNS.map(([, f, , ex]) => [f, f === 'batch' ? active[0]?.name || '' : ex])));

  // --- Batches sheet (source of the LOV) ---
  const bs = wb.addWorksheet('Batches');
  bs.columns = [
    { header: 'Batch Name', key: 'name', width: Math.max(24, ...active.map((b) => b.name.length + 2)) },
    { header: 'Course', key: 'course', width: 14 },
    { header: 'Total Fee', key: 'fee', width: 12 },
    { header: 'Timing', key: 'timing', width: 20 },
  ];
  bs.getRow(1).font = { bold: true };
  active.forEach((b) => bs.addRow({ name: b.name, course: b.course || '', fee: Number(b.fee || 0), timing: b.timing || '' }));

  const lists = wb.addWorksheet('Lists', { state: 'veryHidden' });
  ['Male', 'Female', 'Other'].forEach((g, i) => { lists.getCell(i + 1, 1).value = g; });

  // Drop-down lists (data validation)
  const col = (f) => ws.getColumn(TEMPLATE_COLUMNS.findIndex((c) => c[1] === f) + 1).letter;
  const batchCol = col('batch'), genderCol = col('gender');
  for (let r = 2; r <= MAX_ROWS + 1; r++) {
    if (active.length) {
      ws.getCell(`${batchCol}${r}`).dataValidation = {
        type: 'list', allowBlank: false, formulae: [`Batches!$A$2:$A$${active.length + 1}`],
        showErrorMessage: true, errorStyle: 'stop', errorTitle: 'Invalid batch', error: 'Please select a batch from the list.',
        showInputMessage: true, promptTitle: 'Batch', prompt: 'Select from the list',
      };
    }
    ws.getCell(`${genderCol}${r}`).dataValidation = {
      type: 'list', allowBlank: true, formulae: ['Lists!$A$1:$A$3'],
      showErrorMessage: true, errorStyle: 'stop', errorTitle: 'Invalid gender', error: 'Select Male, Female or Other.',
    };
  }

  // --- Instructions sheet ---
  const hs = wb.addWorksheet('Instructions');
  hs.getColumn(1).width = 100;
  [
    'How to fill this template',
    '1. Fill one student per row in the "Students" sheet. Replace or delete the example row.',
    '2. Orange columns are required: Full Name, 10-digit Mobile, Batch.',
    '3. Batch and Gender are drop-down lists — click the cell and pick a value.',
    '4. Dates in DD-MM-YYYY format (e.g. 15-06-2008).',
    `5. Leave Password blank to use the default (${DEFAULT_STUDENT_PASSWORD}). Student IDs are generated automatically.`,
    '6. Leave Total Fee blank to use the batch fee.',
    '7. Do not change the header row.',
  ].forEach((t, i) => { const c = hs.getCell(i + 1, 1); c.value = t; if (!i) c.font = { bold: true, size: 14 }; });

  saveBuffer(await wb.xlsx.writeBuffer(), 'student-registration-template.xlsx');
}

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Excel date (Date / "15-06-2008" / "15/06/2008" / "2008-06-15") → yyyy-mm-dd
function parseDate(v) {
  if (v === '' || v === null || v === undefined) return '';
  if (v instanceof Date && !isNaN(v)) return iso(new Date(v.getTime() + 12 * 3600e3)); // avoid timezone drift
  const s = String(v).trim();
  let m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  return null; // invalid
}

const digits = (v) => String(v ?? '').replace(/\.0+$/, '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
// संदेश दोन्ही भाषांत: स्क्रीनवर मराठी, Excel निकालात English
const E = (mr, en) => ({ mr, en });
const norm = (h) => String(h).replace(/\s*[*(].*$/, '').trim().toLowerCase();

export async function parseStudentsFile(file, batches, existingStudents) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  const ws = wb.Sheets.Students || wb.Sheets['विद्यार्थी'] || wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true });
  // English or older Marathi headers
  const headerMap = new Map();
  TEMPLATE_COLUMNS.forEach(([en, f, , , mr]) => { headerMap.set(norm(en), f); headerMap.set(norm(mr), f); });
  const findField = (key) => headerMap.get(norm(key));
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
      if (!name) errors.push(E('नाव नाही', 'Name missing'));
      if (!/^\d{10}$/.test(mobile)) errors.push(E('मोबाईल 10 अंकी नाही', 'Mobile is not 10 digits'));
      if (!r.batch) errors.push(E('बॅच नाही', 'Batch missing'));
      else if (!batch) errors.push(E(`बॅच "${r.batch}" सापडली नाही`, `Batch "${r.batch}" not found`));
      else if (batch.active === false) warnings.push(E('बॅच बंद आहे', 'Batch is closed'));
      if (parentMobile && !/^\d{10}$/.test(parentMobile)) errors.push(E('पालकाचा मोबाईल 10 अंकी नाही', 'Parent mobile is not 10 digits'));
      const dob = parseDate(r.dob);
      const admissionDate = parseDate(r.admissionDate);
      if (dob === null) errors.push(E('जन्मतारीख चुकीची', 'Invalid date of birth'));
      if (admissionDate === null) errors.push(E('प्रवेश दिनांक चुकीचा', 'Invalid admission date'));
      const gRaw = String(r.gender || '').trim();
      const gender = gRaw ? GENDERS[gRaw.toLowerCase()] : '';
      if (gRaw && !gender) errors.push(E(`लिंग "${gRaw}" चुकीचे`, `Invalid gender "${gRaw}"`));
      const fee = r.totalFee === '' || r.totalFee === undefined ? Number(batch?.fee || 0) : Number(String(r.totalFee).replace(/[^\d.]/g, ''));
      if (isNaN(fee)) errors.push(E('फी चुकीची', 'Invalid fee'));
      const password = String(r.password || '').trim() || DEFAULT_STUDENT_PASSWORD;
      if (password.length < 6) errors.push(E('पासवर्ड किमान 6 अक्षरे', 'Password must be at least 6 characters'));
      const key = mobile + '|' + name.toLowerCase();
      if (mobile && existingMobiles.has(mobile)) warnings.push(E('हा मोबाईल आधीच नोंदणीकृत', 'Mobile already registered'));
      if (seen.has(key)) errors.push(E(`ओळ ${seen.get(key)} ची पुनरावृत्ती`, `Duplicate of row ${seen.get(key)}`)); else seen.set(key, r._row);
      return {
        _row: r._row, errors, warnings, password,
        data: {
          name, mobile, email: String(r.email || ''), gender: gender || '', dob: dob || '',
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
    'Row': r._row, 'Name': r.data.name, 'Mobile': r.data.mobile, 'Batch': r.data.batchName,
    'Student ID': r.loginId || '', 'Password': r.loginId ? r.password : '',
    'Status': r.loginId ? 'Registered' : 'Failed: ' + (r.failEn || r.errors.map((x) => x.en).join(', ')),
  })));
  ws['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 12 }, { wch: 26 }, { wch: 12 }, { wch: 14 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registration Result');
  XLSX.writeFile(wb, `registration-result_${iso(new Date())}.xlsx`);
}
