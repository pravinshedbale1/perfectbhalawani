import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCollection } from '../../lib/useData';
import { recordPayment, cancelPayment } from '../../lib/api';
import { Spinner, Alert, Field, Empty } from '../../components/ui';
import { money, fmtDate, todayISO, MONTHS_MR, PAY_MODES, byTimeDesc, byText } from '../../lib/format';

export default function Fees() {
  const [params, setParams] = useSearchParams();
  const students = useCollection('students');
  const payments = useCollection('payments');
  const batches = useCollection('batches');
  const sid = params.get('student') || '';
  const [q, setQ] = useState('');
  const [f, setF] = useState({ amount: '', mode: PAY_MODES[0], date: todayISO(), forMonth: MONTHS_MR[new Date().getMonth()] + ' ' + new Date().getFullYear(), note: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState('');
  const [sel, setSel] = useState([]);
  const [filter, setFilter] = useState({ from: todayISO().slice(0, 8) + '01', to: todayISO(), batch: '' });

  const student = students.data.find((s) => s.id === sid);
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return students.data.filter((s) => [s.name, s.mobile, s.loginId].some((x) => String(x || '').toLowerCase().includes(t))).sort(byText('name')).slice(0, 8);
  }, [q, students.data]);

  const list = useMemo(() =>
    payments.data
      .filter((p) => (!filter.from || p.date >= filter.from) && (!filter.to || p.date <= filter.to))
      .filter((p) => !filter.batch || p.batchId === filter.batch)
      .sort(byTimeDesc('createdAt')),
  [payments.data, filter]);
  const total = list.filter((p) => !p.cancelled).reduce((a, p) => a + Number(p.amount), 0);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const id = await recordPayment(student, f);
      setLastId(id);
      setF({ ...f, amount: '', note: '' });
      await Promise.all([students.reload(), payments.reload()]);
    } catch (e2) { setErr(e2.message); }
    finally { setBusy(false); }
  };

  const cancel = async (p) => {
    if (!confirm(`पावती ${p.receiptNo} (${money(p.amount)}) रद्द करायची? ही रक्कम विद्यार्थ्याच्या जमा फीमधून वजा होईल.`)) return;
    await cancelPayment(p);
    await Promise.all([students.reload(), payments.reload()]);
  };

  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (students.loading || payments.loading) return <Spinner />;
  const due = student ? Number(student.totalFee || 0) - Number(student.paidTotal || 0) : 0;

  return (
    <>
      <div className="page-head"><h1>फी व पावती</h1></div>

      <div className="grid split">
        <div className="card">
          <h3>1. विद्यार्थी निवडा</h3>
          {student ? (
            <div className="target-box">
              <div className="row between">
                <div><b>{student.name}</b> <span className="small muted">({student.regNo})</span><div className="small">{student.batchName} · 📞 {student.mobile}</div></div>
                <button className="btn sm light" onClick={() => { setParams({}); setLastId(''); }}>बदला</button>
              </div>
              <div className="row mt small">
                <span>एकूण: <b>{money(student.totalFee)}</b></span>
                <span>जमा: <b>{money(student.paidTotal)}</b></span>
                <span>बाकी: <b style={{ color: due > 0 ? 'var(--bad)' : 'var(--ok)' }}>{money(due)}</b></span>
              </div>
            </div>
          ) : (
            <>
              <input placeholder="🔍 नाव / Student ID / मोबाईल" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
              {matches.map((s) => (
                <div key={s.id} className="ex-row" onClick={() => { setParams({ student: s.id }); setQ(''); setLastId(''); }}>
                  <div><b>{s.name}</b><div className="small muted">{s.batchName} · {s.mobile}</div></div>
                  <span className="small">बाकी {money(Number(s.totalFee || 0) - Number(s.paidTotal || 0))}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="card">
          <h3>2. फी जमा करा</h3>
          {lastId && (
            <Alert type="ok">
              फी जमा झाली ✅ <Link className="btn sm green" to={`/admin/print?ids=${lastId}&dual=1`} target="_blank">🖨️ पावती प्रिंट करा</Link>
            </Alert>
          )}
          <form onSubmit={submit}>
            <div className="form-grid">
              <Field label="रक्कम (₹)" required><input type="number" min="1" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} required disabled={!student} /></Field>
              <Field label="दिनांक" required><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} required /></Field>
              <Field label="भरणा पद्धत"><select value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}>{PAY_MODES.map((m) => <option key={m}>{m}</option>)}</select></Field>
              <Field label="महिना / हप्ता"><input value={f.forMonth} onChange={(e) => setF({ ...f, forMonth: e.target.value })} /></Field>
              <Field label="टीप (UPI Ref इ.)" full><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
            </div>
            <Alert>{err}</Alert>
            <div className="actions"><button className="btn saffron" disabled={!student || busy}>{busy ? 'जतन होत आहे…' : '💾 फी जमा करा'}</button></div>
          </form>
        </div>
      </div>

      <div className="page-head mt"><h2 style={{ margin: 0, fontSize: 22, color: 'var(--navy)' }}>पावती यादी</h2>
        <Link className={'btn' + (sel.length ? '' : ' light')} to={sel.length ? `/admin/print?ids=${sel.join(',')}` : '#'} target={sel.length ? '_blank' : undefined}
          onClick={(e) => !sel.length && e.preventDefault()}>🖨️ निवडलेल्या {sel.length} पावत्या प्रिंट (A4 वर 2)</Link>
      </div>
      <div className="toolbar">
        <label className="row small" style={{ margin: 0 }}>पासून <input type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} /></label>
        <label className="row small" style={{ margin: 0 }}>पर्यंत <input type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} /></label>
        <select value={filter.batch} onChange={(e) => setFilter({ ...filter, batch: e.target.value })}>
          <option value="">सर्व बॅच</option>{batches.data.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <span className="badge info" style={{ alignSelf: 'center', fontSize: 15 }}>एकूण जमा: {money(total)}</span>
      </div>
      {list.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th><input type="checkbox" checked={sel.length === list.length} onChange={(e) => setSel(e.target.checked ? list.map((p) => p.id) : [])} /></th>
              <th>पावती क्र.</th><th>दिनांक</th><th>विद्यार्थी</th><th>बॅच</th><th>पद्धत</th><th className="num">रक्कम</th><th></th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} style={p.cancelled ? { opacity: 0.5 } : null}>
                  <td><input type="checkbox" checked={sel.includes(p.id)} onChange={() => toggle(p.id)} /></td>
                  <td className="nowrap">{p.receiptNo} {p.cancelled && <span className="badge bad">रद्द</span>}</td>
                  <td>{fmtDate(p.date)}</td>
                  <td><Link to={`/admin/students/${p.studentId}`}>{p.studentName}</Link></td>
                  <td className="small">{p.batchName}</td>
                  <td className="small">{p.mode}</td>
                  <td className="num">{money(p.amount)}</td>
                  <td className="nowrap">
                    <Link className="btn sm light" to={`/admin/print?ids=${p.id}&dual=1`} target="_blank">🖨️</Link>{' '}
                    {!p.cancelled && <button className="btn sm red" onClick={() => cancel(p)}>रद्द</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>या कालावधीत पावती नाही.</Empty>}
    </>
  );
}
