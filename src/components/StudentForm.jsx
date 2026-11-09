import { useState } from 'react';
import { Modal, Field, Alert } from './ui';
import { createStudent, updateStudent, recomputeLeaderboard } from '../lib/api';
import { authErrorMr } from '../lib/auth';
import { todayISO } from '../lib/format';

const blank = {
  name: '', mobile: '', email: '', gender: '', dob: '', parentName: '', parentMobile: '',
  address: '', school: '', standard: '', batchId: '', totalFee: '', admissionDate: todayISO(), notes: '',
};

export default function StudentForm({ student, batches, onClose, onSaved, defaultBatch }) {
  const isNew = !student?.id;
  const [f, setF] = useState(() => (isNew ? { ...blank, batchId: defaultBatch || '' } : { ...blank, ...student }));
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pickBatch = (e) => {
    const b = batches.find((x) => x.id === e.target.value);
    setF({ ...f, batchId: e.target.value, totalFee: isNew || !f.totalFee ? (b?.fee ?? f.totalFee) : f.totalFee });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!/^\d{10}$/.test(f.mobile)) return setErr('मोबाईल नंबर 10 अंकी असावा.');
    const b = batches.find((x) => x.id === f.batchId);
    if (!b) return setErr('कृपया बॅच निवडा.');
    const password = pw || `pc${f.mobile.slice(-4)}`;
    if (isNew && password.length < 6) return setErr('पासवर्ड किमान 6 अक्षरांचा हवा.');
    const { id, createdAt, updatedAt, paidTotal, regNo, loginEmail, active, ...rest } = f;
    const data = { ...rest, name: f.name.trim(), batchName: b.name, course: b.course || '', totalFee: Number(f.totalFee || 0) };
    setBusy(true);
    try {
      if (isNew) {
        await createStudent(data, password);
        setCreated({ mobile: f.mobile, password });
      } else {
        await updateStudent(student.id, data);
        if (student.batchId !== f.batchId) {
          await Promise.all([recomputeLeaderboard(student.batchId), recomputeLeaderboard(f.batchId)]);
        }
        onSaved?.();
        onClose();
      }
    } catch (e2) {
      setErr(authErrorMr(e2));
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <Modal title="विद्यार्थी नोंदणी यशस्वी ✅" onClose={() => { onSaved?.(); onClose(); }}>
        <p>विद्यार्थ्याला खालील लॉगिन माहिती द्या:</p>
        <div className="target-box">
          <div>संकेतस्थळ: <b>perfectbhalawani.in</b></div>
          <div>मोबाईल (Login ID): <b>{created.mobile}</b></div>
          <div>पासवर्ड: <b>{created.password}</b></div>
        </div>
        <p className="small muted">विद्यार्थी लॉगिननंतर "माझी माहिती" मधून पासवर्ड बदलू शकतो.</p>
        <div className="actions">
          <button className="btn light" onClick={() => navigator.clipboard?.writeText(`परफेक्ट कॉम्प्युटर्स, भाळवणी\nलॉगिन: https://perfectbhalawani.in/login\nमोबाईल: ${created.mobile}\nपासवर्ड: ${created.password}`)}>📋 कॉपी करा</button>
          <button className="btn" onClick={() => { onSaved?.(); onClose(); }}>ठीक आहे</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={isNew ? 'नवीन विद्यार्थी नोंदणी' : 'विद्यार्थी माहिती संपादन'} onClose={onClose} wide>
      <form onSubmit={submit}>
        <div className="form-grid">
          <Field label="विद्यार्थ्याचे पूर्ण नाव" required><input value={f.name} onChange={set('name')} required placeholder="आडनाव नाव वडिलांचे नाव" /></Field>
          <Field label="मोबाईल नंबर (Login ID)" required>
            <input inputMode="numeric" maxLength={10} value={f.mobile} disabled={!isNew}
              onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, '') })} required />
            {!isNew && <small className="muted">लॉगिन मोबाईल बदलता येत नाही.</small>}
          </Field>
          <Field label="बॅच" required>
            <select value={f.batchId} onChange={pickBatch} required>
              <option value="">— बॅच निवडा —</option>
              {batches.filter((b) => b.active !== false || b.id === f.batchId).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="एकूण फी (₹)"><input type="number" min="0" value={f.totalFee} onChange={set('totalFee')} /></Field>
          <Field label="ईमेल"><input type="email" value={f.email} onChange={set('email')} /></Field>
          <Field label="प्रवेश दिनांक"><input type="date" value={f.admissionDate} onChange={set('admissionDate')} /></Field>
          <Field label="जन्मतारीख"><input type="date" value={f.dob} onChange={set('dob')} /></Field>
          <Field label="लिंग">
            <select value={f.gender} onChange={set('gender')}>
              <option value="">—</option><option>पुरुष</option><option>स्त्री</option><option>इतर</option>
            </select>
          </Field>
          <Field label="शाळा / महाविद्यालय"><input value={f.school} onChange={set('school')} /></Field>
          <Field label="इयत्ता / शिक्षण"><input value={f.standard} onChange={set('standard')} placeholder="उदा. 10 वी, 12 वी, B.Com" /></Field>
          <Field label="पालकाचे नाव"><input value={f.parentName} onChange={set('parentName')} /></Field>
          <Field label="पालकाचा मोबाईल"><input inputMode="numeric" maxLength={10} value={f.parentMobile} onChange={(e) => setF({ ...f, parentMobile: e.target.value.replace(/\D/g, '') })} /></Field>
          <Field label="पत्ता" full><textarea value={f.address} onChange={set('address')} rows={2} /></Field>
          <Field label="टीप" full><input value={f.notes} onChange={set('notes')} /></Field>
          {isNew && (
            <Field label="लॉगिन पासवर्ड" full>
              <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder={`रिकामे ठेवल्यास: pc${(f.mobile || '0000').slice(-4)}`} />
            </Field>
          )}
        </div>
        <Alert>{err}</Alert>
        <div className="actions">
          <button type="button" className="btn light" onClick={onClose}>रद्द</button>
          <button className="btn" disabled={busy}>{busy ? 'जतन होत आहे…' : isNew ? 'नोंदणी करा' : 'जतन करा'}</button>
        </div>
      </form>
    </Modal>
  );
}
