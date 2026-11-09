import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// सोपे data hooks — composite index टाळण्यासाठी sorting client-side
export function useCollection(name, filters = [], deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      // कोणत्याही filter चे मूल्य रिकामे असल्यास query करू नका
      if (filters.some((f) => f[2] === undefined || f[2] === null || f[2] === '')) {
        setData([]);
        return;
      }
      const q = query(collection(db, name), ...filters.map((f) => where(...f)));
      const snap = await getDocs(q);
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setError(null);
    } catch (e) {
      console.error(name, e);
      setError(e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, JSON.stringify(filters), ...deps]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load, setData };
}

export function useDocument(path, id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!id) { setData(null); setLoading(false); return; }
    setLoading(true);
    try {
      const s = await getDoc(doc(db, path, id));
      setData(s.exists() ? { id: s.id, ...s.data() } : null);
    } catch (e) { console.error(e); setData(null); }
    finally { setLoading(false); }
  }, [path, id]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}
