import {
  addDoc, collection, doc, getDocs, increment, query, runTransaction,
  serverTimestamp, setDoc, updateDoc, where, writeBatch, deleteDoc, getDoc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';
import { auth, db, secondaryAuth } from '../firebase';
import { studentEmail } from './auth';
import { CENTER, DRIVE_SCRIPT_URL, STUDENT_ID_PREFIX, STUDENT_ID_START } from '../config';
import { SEED_MODULES } from '../seed/modules';

// ---------------- विद्यार्थी ----------------
// नवीन विद्यार्थी: Student ID (PC1001…) तयार करून लॉगिन खाते + माहिती जतन
export async function createStudent(data, password) {
  const n = await nextNumber('studentId');
  const loginId = `${STUDENT_ID_PREFIX}${STUDENT_ID_START + n}`;
  const sec = secondaryAuth();
  const cred = await createUserWithEmailAndPassword(sec, studentEmail(loginId), password);
  const uid = cred.user.uid;
  try {
    const b = writeBatch(db);
    b.set(doc(db, 'students', uid), {
      ...data,
      loginId,
      regNo: loginId,
      paidTotal: 0,
      active: true,
      createdAt: serverTimestamp(),
    });
    b.set(doc(db, 'studentLogins', uid), { loginId, password, updatedAt: serverTimestamp() });
    await b.commit();
  } catch (e) {
    // अर्धवट खाते राहू नये — लॉगिन खाते काढून टाका
    await cred.user.delete().catch(() => {});
    throw e;
  } finally {
    await signOut(sec).catch(() => {});
  }
  return { uid, loginId };
}

// विद्यार्थ्याचा सध्याचा पासवर्ड (फक्त Admin ला दिसतो)
export async function getStudentLogin(uid) {
  const s = await getDoc(doc(db, 'studentLogins', uid));
  return s.exists() ? s.data() : null;
}

// Admin पासवर्ड रीसेट — जतन केलेल्या पासवर्डने secondary लॉगिन करून नवीन पासवर्ड सेट
export async function resetStudentPassword(student, newPassword) {
  if (String(newPassword).length < 6) throw new Error('पासवर्ड किमान 6 अक्षरांचा हवा.');
  const login = await getStudentLogin(student.id);
  if (!login?.password) throw new Error('या विद्यार्थ्याचा जुना पासवर्ड नोंदीत नाही.');
  const sec = secondaryAuth();
  try {
    const cred = await signInWithEmailAndPassword(sec, studentEmail(student.loginId), login.password);
    await updatePassword(cred.user, newPassword);
  } catch (e) {
    if (String(e.code).includes('invalid-credential')) throw new Error('नोंदीतील पासवर्ड जुळत नाही. (विद्यार्थ्याने बाहेरून बदलला असावा)');
    throw e;
  } finally {
    await signOut(sec).catch(() => {});
  }
  await setDoc(doc(db, 'studentLogins', student.id), { loginId: student.loginId, password: newPassword, updatedAt: serverTimestamp() });
}

export const updateStudent = (id, data) => updateDoc(doc(db, 'students', id), { ...data, updatedAt: serverTimestamp() });

// क्रमांक (पावती / नोंदणी) — transaction मध्ये सुरक्षित वाढ
async function nextNumber(key) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'counters', key);
    const s = await tx.get(ref);
    const n = (s.exists() ? s.data().value : 0) + 1;
    tx.set(ref, { value: n });
    return n;
  });
}

// ---------------- फी ----------------
export async function recordPayment(student, { amount, mode, date, note, forMonth }) {
  const amt = Number(amount);
  if (!(amt > 0)) throw new Error('रक्कम योग्य नाही');
  const payRef = doc(collection(db, 'payments'));
  const fy = financialYear(date);
  await runTransaction(db, async (tx) => {
    const cRef = doc(db, 'counters', 'receipt-' + fy);
    const c = await tx.get(cRef);
    const n = (c.exists() ? c.data().value : 0) + 1;
    tx.set(cRef, { value: n });
    tx.set(payRef, {
      receiptNo: `${CENTER.receiptPrefix}/${fy}/${String(n).padStart(4, '0')}`,
      studentId: student.id,
      studentName: student.name,
      regNo: student.regNo || '',
      mobile: student.mobile || '',
      batchId: student.batchId || '',
      batchName: student.batchName || '',
      course: student.course || '',
      totalFee: Number(student.totalFee || 0),
      paidBefore: Number(student.paidTotal || 0),
      amount: amt,
      mode: mode || 'रोख',
      date,
      forMonth: forMonth || '',
      note: note || '',
      cancelled: false,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.email || '',
    });
    tx.update(doc(db, 'students', student.id), { paidTotal: increment(amt) });
  });
  return payRef.id;
}

export async function cancelPayment(p) {
  const b = writeBatch(db);
  b.update(doc(db, 'payments', p.id), { cancelled: true, cancelledAt: serverTimestamp() });
  b.update(doc(db, 'students', p.studentId), { paidTotal: increment(-Number(p.amount)) });
  await b.commit();
}

function financialYear(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const y = d.getFullYear(), m = d.getMonth();
  const start = m >= 3 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

// ---------------- Google Drive (Apps Script) ----------------
export const driveConfigured = () => DRIVE_SCRIPT_URL && !DRIVE_SCRIPT_URL.startsWith('PASTE');

async function callScript(payload) {
  if (!driveConfigured()) throw new Error('Drive upload सेटअप अजून झालेले नाही (config.js मधील DRIVE_SCRIPT_URL).');
  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch(DRIVE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // preflight टाळण्यासाठी
    body: JSON.stringify({ ...payload, idToken }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'सर्व्हर त्रुटी');
  return data;
}

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export const MAX_UPLOAD_MB = 10;
export const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp', 'txt', 'png', 'jpg', 'jpeg', 'zip', 'csv'];

export async function submitExercise({ student, exercise, module, file, note }) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) throw new Error('ही फाइल प्रकार चालत नाही: .' + ext);
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`फाइल ${MAX_UPLOAD_MB} MB पेक्षा लहान असावी.`);
  const up = await callScript({
    action: 'upload',
    base64: await fileToBase64(file),
    fileName: file.name,
    mimeType: file.type,
    batchName: student.batchName,
    studentName: student.name,
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
  });
  const id = `${student.id}_${exercise.id}`;
  await setDoc(doc(db, 'submissions', id), {
    studentId: student.id,
    studentName: student.name,
    batchId: student.batchId,
    batchName: student.batchName || '',
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
    moduleId: module?.id || exercise.moduleId || '',
    moduleTitle: module?.title || '',
    maxMarks: Number(exercise.maxMarks || 10),
    fileId: up.fileId,
    fileUrl: up.url,
    fileName: file.name,
    fileSize: up.size,
    note: note || '',
    status: 'submitted',
    submittedAt: serverTimestamp(),
  }, { merge: true });
}


// ---------------- मूल्यांकन व लीडरबोर्ड ----------------
export async function evaluateSubmission(sub, { marks, feedback, status }) {
  await updateDoc(doc(db, 'submissions', sub.id), {
    marks: status === 'evaluated' ? Number(marks) : null,
    feedback: feedback || '',
    status,
    evaluatedAt: serverTimestamp(),
    evaluatedBy: auth.currentUser?.email || '',
  });
  await recomputeLeaderboard(sub.batchId);
}

export async function recomputeLeaderboard(batchId) {
  if (!batchId) return;
  const [subs, studs] = await Promise.all([
    getDocs(query(collection(db, 'submissions'), where('batchId', '==', batchId))),
    getDocs(query(collection(db, 'students'), where('batchId', '==', batchId))),
  ]);
  const rows = {};
  studs.docs.forEach((d) => {
    const s = d.data();
    if (s.active === false) return;
    rows[d.id] = { studentId: d.id, name: s.name, total: 0, max: 0, evaluated: 0, submitted: 0 };
  });
  subs.docs.forEach((d) => {
    const s = d.data();
    const r = rows[s.studentId];
    if (!r) return;
    r.submitted++;
    if (s.status === 'evaluated' && typeof s.marks === 'number') {
      r.total += s.marks;
      r.max += Number(s.maxMarks || 0);
      r.evaluated++;
    }
  });
  const list = Object.values(rows).sort((a, b) => b.total - a.total || b.evaluated - a.evaluated || a.name.localeCompare(b.name));
  let rank = 0, prev = null;
  list.forEach((r, i) => { if (r.total !== prev) { rank = i + 1; prev = r.total; } r.rank = rank; });
  await setDoc(doc(db, 'leaderboards', batchId), { rows: list, updatedAt: serverTimestamp() });
}

// ---------------- मॉड्यूल व सराव ----------------
export async function seedDemoModules() {
  let b = writeBatch(db), ops = 0;
  const flush = async () => { await b.commit(); b = writeBatch(db); ops = 0; };
  for (const m of SEED_MODULES) {
    const mRef = doc(collection(db, 'modules'));
    b.set(mRef, { title: m.title, desc: m.desc, icon: m.icon, order: m.order, active: true, createdAt: serverTimestamp() });
    ops++;
    for (const e of m.exercises) {
      b.set(doc(collection(db, 'exercises')), { ...e, moduleId: mRef.id, active: true, createdAt: serverTimestamp() });
      if (++ops >= 450) await flush();
    }
  }
  if (ops) await flush();
}

export const saveModule = (m) =>
  m.id ? updateDoc(doc(db, 'modules', m.id), strip(m)) : addDoc(collection(db, 'modules'), { ...strip(m), active: true, createdAt: serverTimestamp() });

export const saveExercise = (e) =>
  e.id ? updateDoc(doc(db, 'exercises', e.id), strip(e)) : addDoc(collection(db, 'exercises'), { ...strip(e), active: true, createdAt: serverTimestamp() });

export const removeDoc = (col, id) => deleteDoc(doc(db, col, id));

// क्रम बदल — दिलेल्या क्रमाने order = 1..n (फक्त बदललेले docs लिहा)
export async function saveOrder(col, items) {
  const b = writeBatch(db);
  let n = 0;
  items.forEach((it, i) => {
    if (Number(it.order) !== i + 1) { b.update(doc(db, col, it.id), { order: i + 1 }); n++; }
  });
  if (n) await b.commit();
}

export const moveExercise = (exId, moduleId, order) => updateDoc(doc(db, 'exercises', exId), { moduleId, order });

export const saveCourse = (c) =>
  c.id ? updateDoc(doc(db, 'courses', c.id), strip(c)) : addDoc(collection(db, 'courses'), { ...strip(c), createdAt: serverTimestamp() });

export async function seedDefaultCourses(list) {
  const b = writeBatch(db);
  list.forEach((c, i) => b.set(doc(collection(db, 'courses')), {
    name: c.name, title: c.mr, icon: c.icon, desc: c.desc, duration: c.duration || '', fee: 0,
    order: i + 1, active: true, showOnHome: true, createdAt: serverTimestamp(),
  }));
  await b.commit();
}

// मॉड्यूल त्याच्या सर्व सरावांसह कॉपी
export async function duplicateModule(m, exercises, order) {
  const mRef = doc(collection(db, 'modules'));
  const b = writeBatch(db);
  b.set(mRef, { ...strip(m), title: m.title + ' (प्रत)', order, active: false, createdAt: serverTimestamp() });
  exercises.forEach((e) => b.set(doc(collection(db, 'exercises')), { ...strip(e), moduleId: mRef.id, createdAt: serverTimestamp() }));
  await b.commit();
}

export const duplicateExercise = (e, order) =>
  addDoc(collection(db, 'exercises'), { ...strip(e), title: e.title + ' (प्रत)', order, active: false, createdAt: serverTimestamp() });

// विद्यार्थ्याला दिसणारे मॉड्यूल: courseIds रिकामे = सर्वांसाठी
export const moduleVisibleTo = (m, courseId) =>
  m.active !== false && (!m.courseIds?.length || !courseId || m.courseIds.includes(courseId));

export const saveBatch = (b) =>
  b.id ? updateDoc(doc(db, 'batches', b.id), strip(b)) : addDoc(collection(db, 'batches'), { ...strip(b), active: true, createdAt: serverTimestamp() });

export const saveNotice = (n) =>
  n.id ? updateDoc(doc(db, 'notices', n.id), strip(n)) : addDoc(collection(db, 'notices'), { ...strip(n), createdAt: serverTimestamp() });

function strip(o) {
  const { id, createdAt, ...rest } = o;
  return rest;
}
