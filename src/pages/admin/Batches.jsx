import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../../lib/useData';
import { saveBatch, removeDoc } from '../../lib/api';
import { Modal, Spinner, Alert, Field, Empty } from '../../components/ui';
import { money, fmtDate } from '../../lib/format';

const blank = { name: '', course: '', courseId: '', timing: '', startDate: '', fee: '', teacher: '', active: true };

export default function Batches() {
  const batches = useCollection('batches');
  const students = useCollection('students');
  const courses = useCollection('courses');
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');

  const count = (id) => students.data.filter((s) => s.batchId === id && s.active !== false).length;

  const save = async (e) => {
    e.preventDefault();
    try {
      const c = courses.data.find((x) => x.id === edit.courseId);
      await saveBatch({ ...edit, course: c ? c.name : edit.course || '', courseId: edit.courseId || '', fee: Number(edit.fee || 0) });
      setEdit(null);
      batches.reload();
    } catch (e2) { setErr(e2.message); }
  };

  const del = async (b) => {
    if (count(b.id)) return alert('या बॅचमध्ये विद्यार्थी आहेत. आधी त्यांना दुसऱ्या बॅचमध्ये हलवा किंवा बॅच "बंद" करा.');
    if (!confirm(`"${b.name}" बॅच हटवायची?`)) return;
    await removeDoc('batches', b.id);
    batches.reload();
  };

  if (batches.loading) return <Spinner />;
  const list = [...batches.data].sort((a, b) => (b.active !== false) - (a.active !== false) || String(b.startDate).localeCompare(String(a.startDate)));

  return (
    <>
      <div className="page-head"><h1>बॅच व्यवस्थापन</h1><button className="btn saffron" onClick={() => { setErr(''); setEdit(blank); }}>+ नवीन बॅच</button></div>
      {list.length ? (
        <div className="grid auto">
          {list.map((b) => (
            <div key={b.id} className="card accent">
              <div className="row between">
                <h3 style={{ margin: 0 }}>{b.name}</h3>
                {b.active === false ? <span className="badge bad">बंद</span> : <span className="badge ok">सक्रिय</span>}
              </div>
              <div className="small muted mt">
                <div>📘 {b.course || '-'}</div>
                <div>⏰ {b.timing || '-'}</div>
                <div>📅 सुरुवात: {fmtDate(b.startDate)}</div>
                <div>💰 फी: {money(b.fee)}</div>
                {b.teacher && <div>👩‍🏫 {b.teacher}</div>}
              </div>
              <div className="mt"><b>{count(b.id)}</b> विद्यार्थी</div>
              <div className="row mt">
                <Link className="btn sm light" to={`/admin/students?batch=${b.id}`}>विद्यार्थी</Link>
                <Link className="btn sm light" to={`/admin/leaderboard?batch=${b.id}`}>🏆</Link>
                <button className="btn sm" onClick={() => { setErr(''); setEdit(b); }}>संपादन</button>
                <button className="btn sm red" onClick={() => del(b)}>हटवा</button>
              </div>
            </div>
          ))}
        </div>
      ) : <Empty>अजून बॅच नाही. "नवीन बॅच" वर क्लिक करा.</Empty>}

      {edit && (
        <Modal title={edit.id ? 'बॅच संपादन' : 'नवीन बॅच'} onClose={() => setEdit(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="बॅचचे नाव" required><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="उदा. CCC नोव्हेंबर 2026 – सकाळ" required /></Field>
              <Field label="अभ्यासक्रम">
                <select value={edit.courseId || ''} onChange={(e) => {
                  const c = courses.data.find((x) => x.id === e.target.value);
                  setEdit({ ...edit, courseId: e.target.value, fee: !edit.fee && c?.fee ? c.fee : edit.fee });
                }}>
                  <option value="">— निवडा —</option>
                  {[...courses.data].sort((a, b) => a.order - b.order).map((c) => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
                </select>
                {!courses.data.length && <small className="muted">"अभ्यासक्रम व सराव" → अभ्यासक्रम टॅबमध्ये आधी जोडा.</small>}
              </Field>
              <Field label="वेळ"><input value={edit.timing} onChange={(e) => setEdit({ ...edit, timing: e.target.value })} placeholder="उदा. सकाळी 8 ते 9" /></Field>
              <Field label="सुरुवात दिनांक"><input type="date" value={edit.startDate} onChange={(e) => setEdit({ ...edit, startDate: e.target.value })} /></Field>
              <Field label="एकूण फी (₹)"><input type="number" min="0" value={edit.fee} onChange={(e) => setEdit({ ...edit, fee: e.target.value })} /></Field>
              <Field label="शिक्षक"><input value={edit.teacher || ''} onChange={(e) => setEdit({ ...edit, teacher: e.target.value })} /></Field>
              <Field label="स्थिती">
                <select value={edit.active === false ? '0' : '1'} onChange={(e) => setEdit({ ...edit, active: e.target.value === '1' })}>
                  <option value="1">सक्रिय</option><option value="0">बंद</option>
                </select>
              </Field>
            </div>
            <Alert>{err}</Alert>
            <div className="actions"><button type="button" className="btn light" onClick={() => setEdit(null)}>रद्द</button><button className="btn">जतन करा</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
