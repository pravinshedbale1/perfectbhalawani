import { useAuth } from '../../lib/auth';
import { useCollection } from '../../lib/useData';
import { Spinner, StatusBadge, Empty } from '../../components/ui';
import { fmtDateTime, byTimeDesc } from '../../lib/format';

export default function StudentResults() {
  const { profile: s } = useAuth();
  const subs = useCollection('submissions', [['studentId', '==', s.id]]);
  if (subs.loading) return <Spinner />;
  const list = [...subs.data].sort(byTimeDesc('submittedAt'));
  const ev = list.filter((x) => x.status === 'evaluated');
  const total = ev.reduce((a, x) => a + Number(x.marks || 0), 0);
  const max = ev.reduce((a, x) => a + Number(x.maxMarks || 0), 0);
  return (
    <>
      <div className="page-head"><h1>📊 माझे गुण</h1><span className="badge ok" style={{ fontSize: 16 }}>एकूण {total} / {max}{max ? ` (${Math.round((total / max) * 100)}%)` : ''}</span></div>
      {list.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>सराव</th><th>सादर</th><th>स्थिती</th><th className="num">गुण</th><th>अभिप्राय</th></tr></thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.id}>
                  <td>{x.exerciseTitle}<div className="small muted">{x.moduleTitle}</div></td>
                  <td className="small nowrap">{fmtDateTime(x.submittedAt)}</td>
                  <td><StatusBadge status={x.status} /></td>
                  <td className="num"><b>{x.status === 'evaluated' ? `${x.marks}/${x.maxMarks}` : '-'}</b></td>
                  <td className="small">{x.feedback || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>अजून कोणताही सराव सादर केलेला नाही.</Empty>}
    </>
  );
}
