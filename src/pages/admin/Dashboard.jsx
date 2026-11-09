import { Link } from 'react-router-dom';
import { useCollection } from '../../lib/useData';
import { money, todayISO, fmtDate, byTimeDesc } from '../../lib/format';
import { Spinner } from '../../components/ui';

export default function AdminDashboard() {
  const students = useCollection('students');
  const batches = useCollection('batches');
  const payments = useCollection('payments');
  const pending = useCollection('submissions', [['status', '==', 'submitted']]);

  if (students.loading || payments.loading) return <Spinner />;

  const active = students.data.filter((s) => s.active !== false);
  const pays = payments.data.filter((p) => !p.cancelled);
  const today = todayISO();
  const month = today.slice(0, 7);
  const todaySum = pays.filter((p) => p.date === today).reduce((a, p) => a + Number(p.amount), 0);
  const monthSum = pays.filter((p) => String(p.date).startsWith(month)).reduce((a, p) => a + Number(p.amount), 0);
  const dues = active.reduce((a, s) => a + Math.max(0, Number(s.totalFee || 0) - Number(s.paidTotal || 0)), 0);
  const recent = [...pays].sort(byTimeDesc('createdAt')).slice(0, 8);

  return (
    <>
      <div className="page-head"><h1>डॅशबोर्ड</h1>
        <div className="row">
          <Link className="btn saffron" to="/admin/students?new=1">+ नवीन विद्यार्थी</Link>
          <Link className="btn" to="/admin/fees">💰 फी जमा करा</Link>
        </div>
      </div>
      <div className="grid g4">
        <div className="stat"><div className="n">{active.length}</div><div className="l">सक्रिय विद्यार्थी</div></div>
        <div className="stat s2"><div className="n">{batches.data.filter((b) => b.active !== false).length}</div><div className="l">सक्रिय बॅच</div></div>
        <div className="stat s3"><div className="n">{money(todaySum)}</div><div className="l">आजची वसुली · या महिन्यात {money(monthSum)}</div></div>
        <div className="stat s4"><div className="n">{money(dues)}</div><div className="l">एकूण बाकी फी</div></div>
      </div>

      <div className="grid g2 mt">
        <div className="card">
          <div className="row between"><h3>तपासणी बाकी ({pending.data.length})</h3><Link to="/admin/submissions">सर्व पहा →</Link></div>
          {pending.data.slice(0, 8).map((s) => (
            <div key={s.id} className="small" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <b>{s.studentName}</b> — {s.exerciseTitle} <span className="muted">({s.batchName})</span>
            </div>
          ))}
          {!pending.data.length && <p className="muted">सर्व सराव तपासले आहेत 👍</p>}
        </div>
        <div className="card">
          <div className="row between"><h3>अलीकडील पावत्या</h3><Link to="/admin/fees">सर्व पहा →</Link></div>
          <table>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id}><td className="small">{p.receiptNo}</td><td>{p.studentName}</td><td className="small">{fmtDate(p.date)}</td><td className="num">{money(p.amount)}</td></tr>
              ))}
            </tbody>
          </table>
          {!recent.length && <p className="muted">अजून पावती नाही.</p>}
        </div>
      </div>
    </>
  );
}
