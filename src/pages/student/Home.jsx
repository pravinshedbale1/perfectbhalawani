import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useCollection, useBoard } from '../../lib/useData';
import { money, fmtDate, byTimeDesc } from '../../lib/format';
import { moduleVisibleTo } from '../../lib/api';
import { Spinner } from '../../components/ui';

export default function StudentHome() {
  const { profile: s } = useAuth();
  const subs = useCollection('submissions', [['studentId', '==', s.id]]);
  const pays = useCollection('payments', [['studentId', '==', s.id]]);
  const exercises = useCollection('exercises');
  const modules = useCollection('modules');
  const board = useBoard(s.batchId);

  if (subs.loading || exercises.loading || modules.loading) return <Spinner />;
  const visibleMods = new Set(modules.data.filter((m) => moduleVisibleTo(m, s.courseId)).map((m) => m.id));
  const activeEx = exercises.data.filter((x) => x.active !== false && visibleMods.has(x.moduleId));
  const evald = subs.data.filter((x) => x.status === 'evaluated');
  const total = evald.reduce((a, x) => a + Number(x.marks || 0), 0);
  const max = evald.reduce((a, x) => a + Number(x.maxMarks || 0), 0);
  const myRank = board.data?.rows?.find((r) => r.studentId === s.id)?.rank;
  const due = Number(s.totalFee || 0) - Number(s.paidTotal || 0);
  const pct = activeEx.length ? Math.round((subs.data.length / activeEx.length) * 100) : 0;
  const recent = [...evald].sort(byTimeDesc('evaluatedAt')).slice(0, 5);
  const redo = subs.data.filter((x) => x.status === 'redo');

  return (
    <>
      <div className="page-head"><h1>नमस्कार, {s.name.split(' ')[0]} 👋</h1><Link className="btn saffron" to="/student/exercises">📚 सराव सुरू करा</Link></div>
      {redo.length > 0 && <div className="alert info">⚠️ {redo.length} सराव पुन्हा सादर करायला सांगितले आहेत. <Link to="/student/exercises">पहा →</Link></div>}
      <div className="grid g4">
        <div className="stat"><div className="n">{subs.data.length}/{activeEx.length}</div><div className="l">सादर केलेले सराव</div><div className="progress"><div style={{ width: pct + '%' }} /></div></div>
        <div className="stat s3"><div className="n">{total}/{max}</div><div className="l">एकूण गुण</div></div>
        <div className="stat s2"><div className="n">{myRank ? '#' + myRank : '-'}</div><div className="l">बॅचमधील क्रमांक</div></div>
        <div className={'stat ' + (due > 0 ? 's4' : 's3')}><div className="n">{money(Math.max(due, 0))}</div><div className="l">बाकी फी</div></div>
      </div>
      <div className="grid g2 mt">
        <div className="card">
          <h3>अलीकडील गुण</h3>
          {recent.map((x) => (
            <div key={x.id} className="row between small" style={{ padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>
              <span>{x.exerciseTitle}</span><b>{x.marks}/{x.maxMarks}</b>
            </div>
          ))}
          {!recent.length && <p className="muted">अजून गुण मिळालेले नाहीत.</p>}
        </div>
        <div className="card">
          <h3>फी तपशील</h3>
          <div className="small">एकूण फी: <b>{money(s.totalFee)}</b> · जमा: <b>{money(s.paidTotal)}</b></div>
          <table className="mt"><tbody>
            {[...pays.data].filter((p) => !p.cancelled).sort(byTimeDesc('createdAt')).map((p) => (
              <tr key={p.id}><td className="small">{p.receiptNo}</td><td className="small">{fmtDate(p.date)}</td><td className="num">{money(p.amount)}</td></tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </>
  );
}
