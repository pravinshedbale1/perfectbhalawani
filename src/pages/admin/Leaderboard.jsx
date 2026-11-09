import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCollection, useDocument } from '../../lib/useData';
import { recomputeLeaderboard } from '../../lib/api';
import LeaderboardTable from '../../components/LeaderboardTable';
import { Spinner } from '../../components/ui';

export default function AdminLeaderboard() {
  const [params, setParams] = useSearchParams();
  const batches = useCollection('batches');
  const batch = params.get('batch') || batches.data.find((b) => b.active !== false)?.id || '';
  const board = useDocument('leaderboards', batch);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    try { await recomputeLeaderboard(batch); await board.reload(); } finally { setBusy(false); }
  };

  if (batches.loading) return <Spinner />;
  return (
    <>
      <div className="page-head">
        <h1>🏆 लीडरबोर्ड</h1>
        <div className="row">
          <select value={batch} onChange={(e) => setParams({ batch: e.target.value })} style={{ width: 'auto' }}>
            {batches.data.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button className="btn light" onClick={refresh} disabled={!batch || busy}>{busy ? 'Refreshing…' : '🔄 Refresh'}</button>
        </div>
      </div>
      {board.loading ? <Spinner /> : <LeaderboardTable board={board.data} />}
    </>
  );
}
