import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../lib/auth';
import Receipt from '../../components/Receipt';
import { Spinner } from '../../components/ui';

// A4 पानावर 2 पावत्या (प्रत्येकी अर्धा A4).
// dual=1 → एकाच पावतीच्या 2 प्रती (विद्यार्थी प्रत + कार्यालय प्रत)
export default function PrintReceipts() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const ids = (params.get('ids') || '').split(',').filter(Boolean);
  const [dual, setDual] = useState(params.get('dual') === '1');
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (auth.role !== 'admin') return;
    Promise.all(ids.map((id) => getDoc(doc(db, 'payments', id))))
      .then((snaps) => setItems(snaps.filter((s) => s.exists()).map((s) => ({ id: s.id, ...s.data() }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.role, params.get('ids')]);

  if (auth.loading) return <Spinner />;
  if (auth.role !== 'admin') return <Navigate to="/login?admin=1" replace />;
  if (!items) return <Spinner />;

  const halves = dual
    ? items.flatMap((p) => [{ p, label: 'विद्यार्थी प्रत' }, { p, label: 'कार्यालय प्रत' }])
    : items.map((p) => ({ p }));
  const pages = [];
  for (let i = 0; i < halves.length; i += 2) pages.push(halves.slice(i, i + 2));

  return (
    <>
      <div className="print-toolbar">
        <b>🖨️ पावती प्रिंट — {items.length} पावती, {pages.length} A4 पान</b>
        <label><input type="checkbox" checked={dual} onChange={(e) => setDual(e.target.checked)} /> प्रत्येक पावतीच्या 2 प्रती (विद्यार्थी + कार्यालय)</label>
        <span style={{ flex: 1 }} />
        <button className="btn saffron" onClick={() => window.print()}>प्रिंट करा</button>
        <button className="btn light" onClick={() => window.close()}>बंद करा</button>
      </div>
      <div className="sheets">
        {pages.map((pg, i) => (
          <div className="a4" key={i}>
            {pg.map((h, j) => <div className="half" key={j}><Receipt p={h.p} copyLabel={h.label} /></div>)}
          </div>
        ))}
      </div>
    </>
  );
}
