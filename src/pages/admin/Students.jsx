import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCollection } from '../../lib/useData';
import StudentForm from '../../components/StudentForm';
import BulkImport from '../../components/BulkImport';
import { Spinner, Empty } from '../../components/ui';
import { money, byText } from '../../lib/format';

export default function Students() {
  const [params, setParams] = useSearchParams();
  const students = useCollection('students');
  const batches = useCollection('batches');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('active');
  const [form, setForm] = useState(params.get('new') ? {} : null);
  const [bulk, setBulk] = useState(false);
  const batch = params.get('batch') || '';

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return students.data
      .filter((s) => !batch || s.batchId === batch)
      .filter((s) => status === 'all' || (status === 'active' ? s.active !== false : s.active === false))
      .filter((s) => !t || [s.name, s.mobile, s.loginId, s.school].some((x) => String(x || '').toLowerCase().includes(t)))
      .sort(byText('name'));
  }, [students.data, q, batch, status]);

  if (students.loading || batches.loading) return <Spinner />;

  return (
    <>
      <div className="page-head">
        <h1>विद्यार्थी ({list.length})</h1>
        <div className="row">
          <button className="btn light" onClick={() => setBulk(true)}>📥 Excel मधून नोंदणी</button>
          <button className="btn saffron" onClick={() => setForm({})}>+ नवीन विद्यार्थी</button>
        </div>
      </div>
      <div className="toolbar">
        <input placeholder="🔍 नाव / Student ID / मोबाईल शोधा" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={batch} onChange={(e) => setParams(e.target.value ? { batch: e.target.value } : {})}>
          <option value="">सर्व बॅच</option>
          {batches.data.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">सक्रिय</option><option value="inactive">निष्क्रिय</option><option value="all">सर्व</option>
        </select>
      </div>
      {list.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student ID</th><th>नाव</th><th>मोबाईल</th><th>बॅच</th><th className="num">एकूण फी</th><th className="num">जमा</th><th className="num">बाकी</th><th></th></tr></thead>
            <tbody>
              {list.map((s) => {
                const due = Number(s.totalFee || 0) - Number(s.paidTotal || 0);
                return (
                  <tr key={s.id}>
                    <td className="nowrap"><b>{s.loginId}</b></td>
                    <td><Link to={`/admin/students/${s.id}`}><b>{s.name}</b></Link>{s.school && <div className="small muted">{s.school}</div>}</td>
                    <td>{s.mobile}</td>
                    <td className="small">{s.batchName}</td>
                    <td className="num">{money(s.totalFee)}</td>
                    <td className="num">{money(s.paidTotal)}</td>
                    <td className="num">{due > 0 ? <span className="badge bad">{money(due)}</span> : <span className="badge ok">पूर्ण</span>}</td>
                    <td className="nowrap">
                      <Link className="btn sm light" to={`/admin/fees?student=${s.id}`}>💰 फी</Link>{' '}
                      <button className="btn sm" onClick={() => setForm(s)}>संपादन</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <Empty>विद्यार्थी सापडले नाहीत.</Empty>}

      {bulk && <BulkImport batches={batches.data} students={students.data} onClose={() => setBulk(false)} onDone={students.reload} />}
      {form && <StudentForm student={form} batches={batches.data} defaultBatch={batch} onClose={() => { setForm(null); if (params.get('new')) setParams({}); }} onSaved={students.reload} />}
    </>
  );
}
