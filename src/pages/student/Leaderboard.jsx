import { useAuth } from '../../lib/auth';
import { useDocument } from '../../lib/useData';
import LeaderboardTable from '../../components/LeaderboardTable';
import { Spinner } from '../../components/ui';

export default function StudentLeaderboard() {
  const { profile: s } = useAuth();
  const board = useDocument('leaderboards', s.batchId);
  return (
    <>
      <div className="page-head"><h1>🏆 लीडरबोर्ड — {s.batchName}</h1></div>
      {board.loading ? <Spinner /> : <LeaderboardTable board={board.data} meId={s.id} />}
    </>
  );
}
