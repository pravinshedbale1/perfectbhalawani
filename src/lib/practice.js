import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ---------------- सरावाचे प्रकार ----------------
// upload: फाइल तयार करून अपलोड · बाकी सर्व पोर्टलवरच करायचे (फाइल नाही)
export const KINDS = {
  upload: { icon: '📤', label: 'फाइल अपलोड', short: 'फाइल अपलोड' },
  keys: { icon: '⌨️', label: 'Keyboard Lesson (अक्षरानुसार)', short: 'Keyboard Lesson' },
  typing: { icon: '⏱️', label: 'Speed Typing (परिच्छेद)', short: 'Speed Typing' },
  letter: { icon: '📝', label: 'Letter Writing (Word सारखे)', short: 'Letter Writing' },
  statement: { icon: '📊', label: 'Statement (Excel सारखे)', short: 'Statement' },
  email: { icon: '📧', label: 'Email Writing', short: 'Email Writing' },
  mcq: { icon: '❓', label: 'MCQ प्रश्नमंजुषा', short: 'MCQ' },
};
export const isPortalKind = (k) => !!k && k !== 'upload' && !!KINDS[k];
export const TARGET_WPM = { en: 30, mr: 20 };

// ---------------- मजकूर तुलना ----------------
const norm = (s) => String(s || '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/—/g, '—');
export const words = (s) => norm(s).split(/\s+/).filter(Boolean);

// HTML → साधा मजकूर (परिच्छेद/ओळी वेगळ्या ठेवून)
export function htmlText(html) {
  const d = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
  d.querySelectorAll('br').forEach((b) => b.replaceWith(' \n '));
  d.querySelectorAll('p,div,li,tr,h1,h2,h3,h4,h5,h6,table').forEach((b) => b.append(' \n '));
  d.querySelectorAll('td,th').forEach((b) => b.append(' '));
  return (d.body.textContent || '').replace(/ /g, ' ');
}

// शब्दानुसार तुलना (LCS). परत: ref चा प्रत्येक शब्द ok/bad/miss, चुकीचे/गाळलेले/जास्त शब्द
// partial=true: शेवटी न पोहोचलेले शब्द "गाळलेले" धरत नाही (वेळ संपल्यास)
export function compareWords(refWords, typedWords, { partial = false } = {}) {
  const R = partial ? refWords.slice(0, Math.min(refWords.length, typedWords.length + 12)) : refWords;
  const n = R.length, m = typedWords.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    L[i][j] = R[i] === typedWords[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  }
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (R[i] === typedWords[j]) { ops.push({ t: 'ok', r: i, w: j }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { ops.push({ t: 'miss', r: i }); i++; }
    else { ops.push({ t: 'extra', w: j }); j++; }
  }
  while (j < m) ops.push({ t: 'extra', w: j++ });
  if (!partial) while (i < n) ops.push({ t: 'miss', r: i++ });
  // शेजारी miss+extra = चुकीचा शब्द
  const merged = [];
  for (let k = 0; k < ops.length; k++) {
    const a = ops[k], b = ops[k + 1];
    if (b && ((a.t === 'miss' && b.t === 'extra') || (a.t === 'extra' && b.t === 'miss'))) {
      merged.push({ t: 'bad', r: a.t === 'miss' ? a.r : b.r, w: a.t === 'extra' ? a.w : b.w }); k++;
    } else merged.push(a);
  }
  // partial: शेवटचे गाळलेले (अजून न पोहोचलेले) काढा
  if (partial) while (merged.length && merged[merged.length - 1].t === 'miss') merged.pop();
  const status = new Array(refWords.length).fill('');
  let correct = 0, wrong = 0, missed = 0, extra = 0, lastRef = -1;
  for (const o of merged) {
    if (o.t === 'ok') { correct++; status[o.r] = 'ok'; lastRef = o.r; }
    else if (o.t === 'bad') { wrong++; status[o.r] = 'bad'; lastRef = o.r; }
    else if (o.t === 'miss') { missed++; status[o.r] = 'miss'; lastRef = Math.max(lastRef, o.r); }
    else extra++;
  }
  const total = correct + wrong + missed + extra;
  return { status, correct, wrong, missed, extra, errors: wrong + missed + extra, accuracy: total ? Math.round((correct / total) * 100) : 100, next: lastRef + 1 };
}

export const wpmOf = (chars, seconds) => (seconds > 0 ? Math.round(chars / 5 / (seconds / 60)) : 0);

// ---------------- Statement (Excel) ----------------
// Firestore मध्ये nested array चालत नाही → प्रत्येक ओळ TAB ने जोडलेली string
export const gridFromRows = (rows = []) => rows.map((r) => String(r).split('\t'));
export const rowsFromGrid = (grid = []) => {
  const g = grid.map((r) => r.map((c) => String(c ?? '')));
  while (g.length && g[g.length - 1].every((c) => !c.trim())) g.pop();
  return g.map((r) => { const x = [...r]; while (x.length && !x[x.length - 1].trim()) x.pop(); return x.join('\t'); });
};
const cellNorm = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
export function compareSheet(refRows, grid) {
  const ref = gridFromRows(refRows);
  let total = 0, correct = 0, extra = 0;
  const bad = [];
  const H = Math.max(ref.length, grid.length);
  for (let r = 0; r < H; r++) {
    const W = Math.max(ref[r]?.length || 0, grid[r]?.length || 0);
    for (let c = 0; c < W; c++) {
      const a = cellNorm(ref[r]?.[c]), b = cellNorm(grid[r]?.[c]);
      if (a) { total++; if (a === b) correct++; else bad.push(`${String.fromCharCode(65 + c)}${r + 1}`); }
      else if (b) { extra++; bad.push(`${String.fromCharCode(65 + c)}${r + 1}`); }
    }
  }
  return { cells: total, correct, wrongCells: total - correct, extra, accuracy: total + extra ? Math.round((correct / (total + extra)) * 100) : 100, bad: bad.slice(0, 40) };
}

// ---------------- Email ----------------
export const EMAIL_FIELDS = [['to', 'Mail to'], ['subject', 'Subject'], ['cc', 'CC'], ['bcc', 'BCC']];
const fieldNorm = (k, v) => {
  const s = String(v || '').trim().replace(/\s+/g, ' ');
  return k === 'subject' ? s : s.toLowerCase().replace(/\s*[,;]\s*/g, ',');
};
export function compareEmail(ref, got) {
  const fields = {};
  let ok = 0;
  for (const [k] of EMAIL_FIELDS) { fields[k] = fieldNorm(k, ref[k]) === fieldNorm(k, got[k]); if (fields[k]) ok++; }
  const body = compareWords(words(ref.body), words(got.body));
  const fieldScore = (ok / EMAIL_FIELDS.length) * 100;
  return { fields, fieldsOk: ok, body: { correct: body.correct, wrong: body.wrong, missed: body.missed, extra: body.extra, accuracy: body.accuracy }, errors: body.errors + (EMAIL_FIELDS.length - ok), accuracy: Math.round(fieldScore * 0.4 + body.accuracy * 0.6) };
}

// ---------------- MCQ ----------------
// मजकूर स्वरूप:  Q: प्रश्न / A) पर्याय / B) पर्याय * (बरोबर उत्तरापुढे *)
export function parseMcq(text) {
  const out = [], errs = [];
  let cur = null;
  const push = () => { if (cur) out.push(cur); cur = null; };
  String(text || '').split('\n').forEach((raw, li) => {
    const line = raw.trim();
    if (!line) return;
    const q = line.match(/^(?:Q\d*|प्र\d*|\d+)\s*[:.)]\s*(.+)$/i);
    const o = line.match(/^([A-Fa-f]|[अआइई])\s*[).:]\s*(.+)$/);
    if (o && cur) {
      let t = o[2].trim(); const right = /\*\s*$/.test(t);
      t = t.replace(/\s*\*\s*$/, '');
      if (right) cur.answer = cur.options.length;
      cur.options.push(t);
    } else if (q) { push(); cur = { q: q[1].trim(), options: [], answer: -1 }; }
    else if (cur && !cur.options.length) cur.q += ' ' + line;
    else errs.push(`ओळ ${li + 1} समजली नाही: "${line.slice(0, 40)}"`);
  });
  push();
  out.forEach((x, i) => {
    if (x.options.length < 2) errs.push(`प्रश्न ${i + 1}: किमान 2 पर्याय हवेत.`);
    if (x.answer < 0) errs.push(`प्रश्न ${i + 1}: बरोबर उत्तरापुढे * लावा.`);
  });
  return { questions: out, errors: errs };
}
export const formatMcq = (qs = []) => qs.map((x, i) => [`Q${i + 1}: ${x.q}`, ...x.options.map((o, j) => `${'ABCDEF'[j]}) ${o}${j === x.answer ? ' *' : ''}`)].join('\n')).join('\n\n');

// ---------------- सुचवलेले गुण ----------------
const half = (x) => Math.round(x * 2) / 2;
export function suggestMarks(ex, m) {
  const max = Number(ex.maxMarks || 10);
  let f;
  if (ex.kind === 'mcq') f = m.total ? m.correct / m.total : 0;
  else if (ex.kind === 'typing' || ex.kind === 'keys') {
    const target = Number(ex.targetWpm || TARGET_WPM[ex.lang] || 30);
    f = Math.min(1, (m.wpm || 0) / target) * ((m.accuracy || 0) / 100);
    if (ex.kind === 'keys' && m.progress != null) f *= Math.min(1, m.progress / 100); // धडा पूर्ण केल्याप्रमाणे
  } else f = (m.accuracy || 0) / 100;
  return Math.max(0, Math.min(max, half(max * f)));
}

// ---------------- सादर करणे (Admin तपासणीसाठी; गुण Admin देतो) ----------------
export async function submitPractice({ student, exercise, module, metrics, work, prev }) {
  const suggestedMarks = suggestMarks(exercise, metrics);
  const short = { wpm: metrics.wpm ?? null, accuracy: metrics.accuracy ?? null, errors: metrics.errors ?? null, seconds: metrics.seconds ?? null, at: new Date().toISOString() };
  await setDoc(doc(db, 'submissions', `${student.id}_${exercise.id}`), {
    studentId: student.id,
    studentName: student.name,
    batchId: student.batchId,
    batchName: student.batchName || '',
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
    moduleId: module?.id || exercise.moduleId || '',
    moduleTitle: module?.title || '',
    maxMarks: Number(exercise.maxMarks || 10),
    kind: exercise.kind,
    metrics,
    work: work || {},
    suggestedMarks,
    status: 'submitted',
    attempts: increment(1),
    history: [...(prev?.history || []), short].slice(-10),
    submittedAt: serverTimestamp(),
  }, { merge: true });
  return suggestedMarks;
}

// मॉड्यूल "क्रमाने उघडा" असल्यास: आधीचा सराव सादर केल्याशिवाय पुढचा बंद
export const isLocked = (module, items, idx, subOf) => !!module?.sequential && idx > 0 && !subOf(items[idx - 1].id);

export const fmtClock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ---------------- Letter: formatting तपासणी (Bold / Underline / Italic / Center / Right / Justify / Table) ----------------
const FORMATS = [
  ['bold', 'Bold', (d) => d.querySelector('b,strong,[style*="font-weight: bold"],[style*="font-weight:bold"],[style*="font-weight: 700"],h1,h2,h3')],
  ['underline', 'Underline', (d) => d.querySelector('u,[style*="underline"]')],
  ['italic', 'Italic', (d) => d.querySelector('i,em,[style*="italic"]')],
  ['center', 'मध्यभागी (Center)', (d) => d.querySelector('[style*="text-align: center"],[style*="text-align:center"],[align=center],center')],
  ['right', 'उजवीकडे (Right)', (d) => d.querySelector('[style*="text-align: right"],[style*="text-align:right"],[align=right]')],
  ['justify', 'Justify', (d) => d.querySelector('[style*="text-align: justify"],[style*="text-align:justify"],[align=justify]')],
  ['table', 'Table', (d) => d.querySelector('table')],
];
export function compareFormatting(refHtml, html) {
  const P = (h) => new DOMParser().parseFromString(`<div>${h || ''}</div>`, 'text/html');
  const a = P(refHtml), b = P(html);
  const need = FORMATS.filter(([, , q]) => q(a));
  const missing = need.filter(([, , q]) => !q(b)).map(([, l]) => l);
  return { total: need.length, matched: need.length - missing.length, missing, score: need.length ? Math.round(((need.length - missing.length) / need.length) * 100) : 100 };
}
