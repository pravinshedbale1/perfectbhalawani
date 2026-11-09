import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCollection, useDocument } from '../../lib/useData';
import { resetStudentPassword, setStudentLoginDisabled, updateStudent, recomputeLeaderboard, driveConfigured } from '../../lib/api';
import StudentForm from '../../components/StudentForm';
import { Spinner, StatusBadge, Modal, Alert } from '../../components/ui';
import { money, fmtDate, byTimeDesc } from '../../lib/format';

export default function StudentDetail() {
  const { id } = useParams();
  const st = useDocument('students', id);
  const batches = useCollection('batches');
  const pays = useCollection('payments', [['studentId', '==', id]]);
  const subs = useCollection('submissions', [['studentId', '==', id]]);
  const [edit, setEdit] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState({});

  if (st.loading) return <Spinner />;
  const s = st.data;
  if (!s) return <div className="alert err">विद्यार्थी सापडला नाही.</div>;

  const due = Number(s.totalFee || 0) - Number(s.paidTotal || 0);
  const evald = subs.data.filter((x) => x.status === 'evaluated');
  const total = evald.reduce((a, x) => a + Number(x.marks || 0), 0);
  const max = evald.reduce((a, x) => a + Number(x.maxMarks || 0), 0);

  const toggleActive = async () => {
    const next = s.active === false;
    if (!confirm(next ? 'विद्यार्थी पुन्हा सक्रिय करायचा?' : 'विद्यार्थी निष्क्रिय करायचा? (लॉगिन बंद होईल)')) return;
    await updateStudent(id, { active: next });
    if (driveConfigured()) await setStudentLoginDisabled(id, !next).catch((e) => alert('लॉगिन स्थिती बदलता आली नाही: ' + e.message));
    await recomputeLeaderboard(s.batchId);
    st.reload();
  };

  const doReset = async (e) => {
    e.preventDefault();
    setMsg({});
    try {
      await resetStudentPassword(id, pw);
      setMsg({ ok: `नवीन पासवर्ड सेट झाला: ${pw}` });
    } catch (e2) { setMsg({ err: e2.message }); }
  };

  const Info = ({ k, v }) => <div className="small" style={{ padding: '4px 0', borderBottom: '1px dashed var(--line)' }}><span className="muted">{k}:</span> <b>{v || '-'}</b></div>;

  return (
    <>
      <div className="page-head">
        <h1>{s.name} {s.active === false && <span className="badge bad">निष्क्रिय</span>}</h1>
        <div className="row">
          <Link className="btn saffron" to={`/admin/fees?student=${id}`}>💰 फी जमा</Link>
          <button className="btn" onClick={() => setEdit(true)}>संपादन</button>
          <button className="btn light" onClick={() => { setPw(`pc${String(s.mobile).slice(-4)}`); setMsg({}); setPwOpen(true); }}>🔑 पासवर्ड रीसेट</button>
          <button className={'btn ' + (s.active === false ? 'green' : 'red')} onClick={toggleActive}>{s.active === false ? 'सक्रिय करा' : 'निष्क्रिय करा'}</button>
        </div>
      </div>

      <div className="grid g3">
        <div className="card">
          <h3>वैयक्तिक माहिती</h3>
          <Info k="नोंदणी क्र." v={s.regNo} />
          <Info k="मोबाईल (Login)" v={s.mobile} />
          <Info k="ईमेल" v={s.email} />
          <Info k="जन्मतारीख" v={fmtDate(s.dob)} />
          <Info k="लिंग" v={s.gender} />
          <Info k="शाळा" v={s.school} />
          <Info k="इयत्ता" v={s.standard} />
          <Info k="पालक" v={[s.parentName, s.parentMobile].filter(Boolean).join(' · ')} />
          <Info k="पत्ता" v={s.address} />
        </div>
        <div className="card">
          <h3>बॅच व फी</h3>
          <Info k="बॅच" v={s.batchName} />
          <Info k="अभ्यासक्रम" v={s.course} />
          <Info k="प्रवेश" v={fmtDate(s.admissionDate)} />
          <Info k="एकूण फी" v={money(s.totalFee)} />
          <Info k="जमा" v={money(s.paidTotal)} />
          <div className="mt">{due > 0 ? <span className="badge bad">बाकी {money(due)}</span> : <span className="badge ok">फी पूर्ण</span>}</div>
        </div>
        <div className="card">
          <h3>सराव प्रगती</h3>
          <div className="stat s3"><div className="n">{total} / {max}</div><div className="l">एकूण गुण</div></div>
          <p className="small">सादर: {subs.data.length} · तपासले: {evald.length}</p>
        </div>
      </div>

      <h3 className="mt">फी भरणा इतिहास</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>पावती क्र.</th><th>दिनांक</th><th>पद्धत</th><th className="num">रक्कम</th><th></th></tr></thead>
          <tbody>
            {[...pays.data].sort(byTimeDesc('createdAt')).map((p) => (
              <tr key={p.id} style={p.cancelled ? { opacity: 0.5, textDecoration: 'line-through' } : null}>
                <td>{p.receiptNo}</td><td>{fmtDate(p.date)}</td><td>{p.mode}</td><td className="num">{money(p.amount)}</td>
                <td><Link className="btn sm light" to={`/admin/print?ids=${p.id}&dual=1`} target="_blank">🖨️ पावती</Link></td>
              </tr>
            ))}
            {!pays.data.length && <tr><td colSpan={5} className="muted">नोंद नाही</td></tr>}
          </tbody>
        </table>
      </div>

      <h3 className="mt">सादर केलेले सराव</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>सराव</th><th>फाइल</th><th>स्थिती</th><th className="num">गुण</th></tr></thead>
          <tbody>
            {[...subs.data].sort(byTimeDesc('submittedAt')).map((x) => (
              <tr key={x.id}>
                <td>{x.exerciseTitle}<div className="small muted">{x.moduleTitle}</div></td>
                <td><a href={x.fileUrl} target="_blank" rel="noreferrer">📎 {x.fileName}</a></td>
                <td><StatusBadge status={x.status} /></td>
                <td className="num">{x.status === 'evaluated' ? `${x.marks}/${x.maxMarks}` : '-'}</td>
              </tr>
            ))}
            {!subs.data.length && <tr><td colSpan={4} className="muted">अजून सराव सादर नाही</td></tr>}
          </tbody>
        </table>
      </div>

      {edit && <StudentForm student={s} batches={batches.data} onClose={() => setEdit(false)} onSaved={st.reload} />}
      {pwOpen && (
        <Modal title="पासवर्ड रीसेट" onClose={() => setPwOpen(false)}>
          {!driveConfigured() && <Alert type="info">पासवर्ड रीसेटसाठी Apps Script सेटअप आवश्यक आहे (apps-script/README.md).</Alert>}
          <form onSubmit={doReset}>
            <label>नवीन पासवर्ड (किमान 6 अक्षरे)</label>
            <input value={pw} minLength={6} onChange={(e) => setPw(e.target.value)} required />
            <Alert>{msg.err}</Alert><Alert type="ok">{msg.ok}</Alert>
            <div className="actions"><button className="btn" disabled={!driveConfigured()}>रीसेट करा</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
