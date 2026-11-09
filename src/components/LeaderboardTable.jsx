import { fmtDateTime } from '../lib/format';
import { Empty } from './ui';

export default function LeaderboardTable({ board, meId }) {
  if (!board?.rows?.length) return <Empty>अजून गुण दिलेले नाहीत. सराव तपासल्यानंतर लीडरबोर्ड दिसेल.</Empty>;
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead><tr><th>क्रमांक</th><th>विद्यार्थी</th><th className="num">तपासलेले सराव</th><th className="num">एकूण गुण</th><th className="num">टक्केवारी</th></tr></thead>
          <tbody>
            {board.rows.map((r) => (
              <tr key={r.studentId} className={r.studentId === meId ? 'me' : ''}>
                <td><span className={'rank' + (r.rank <= 3 ? ' r' + r.rank : '')}>{r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</span></td>
                <td>{r.name}{r.studentId === meId && ' (मी)'}</td>
                <td className="num">{r.evaluated}</td>
                <td className="num"><b>{r.total}</b> / {r.max}</td>
                <td className="num">{r.max ? Math.round((r.total / r.max) * 100) + '%' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">अद्ययावत: {fmtDateTime(board.updatedAt)}</p>
    </>
  );
}
