import { useState } from 'react';
import { useCollection } from '../../lib/useData';
import { saveNotice, removeDoc } from '../../lib/api';
import { Spinner, Alert } from '../../components/ui';
import { fmtDate, byTimeDesc } from '../../lib/format';

export default function Notices() {
  const notices = useCollection('notices');
  const [f, setF] = useState({ title: '', link: '' });
  const [err, setErr] = useState('');

  const add = async (e) => {
    e.preventDefault();
    try { await saveNotice({ ...f, active: true }); setF({ title: '', link: '' }); notices.reload(); } catch (e2) { setErr(e2.message); }
  };
  const toggle = async (n) => { await saveNotice({ id: n.id, active: n.active === false }); notices.reload(); };
  const del = async (n) => { if (confirm('ही सूचना हटवायची?')) { await removeDoc('notices', n.id); notices.reload(); } };

  if (notices.loading) return <Spinner />;
  return (
    <>
      <div className="page-head"><h1>📢 सूचना फलक</h1></div>
      <p className="muted">येथील सूचना मुख्यपृष्ठावरील "ताज्या घडामोडी" व "सूचना फलक" मध्ये दिसतात.</p>
      <form className="card" onSubmit={add}>
        <div className="form-grid">
          <div className="full"><label className="req">सूचना</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="उदा. 15 नोव्हेंबरपासून नवीन Tally बॅच सुरू" required /></div>
          <div className="full"><label>लिंक (ऐच्छिक)</label><input type="url" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} /></div>
        </div>
        <Alert>{err}</Alert>
        <div className="actions"><button className="btn saffron">+ सूचना जोडा</button></div>
      </form>
      <div className="table-wrap mt">
        <table>
          <thead><tr><th>दिनांक</th><th>सूचना</th><th>स्थिती</th><th></th></tr></thead>
          <tbody>
            {[...notices.data].sort(byTimeDesc('createdAt')).map((n) => (
              <tr key={n.id}>
                <td className="nowrap">{fmtDate(n.createdAt)}</td>
                <td>{n.title}</td>
                <td>{n.active === false ? <span className="badge bad">लपवलेली</span> : <span className="badge ok">दिसते</span>}</td>
                <td className="nowrap"><button className="btn sm light" onClick={() => toggle(n)}>{n.active === false ? 'दाखवा' : 'लपवा'}</button> <button className="btn sm red" onClick={() => del(n)}>हटवा</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
