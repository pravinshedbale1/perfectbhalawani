import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuth, authErrorMr, adminEmail } from '../lib/auth';
import { Alert, Spinner } from '../components/ui';

// पहिल्या Admin ची नोंदणी — फक्त एकदाच चालते
export default function Setup() {
  const [done, setDone] = useState(null);
  const [f, setF] = useState({ name: '', email: 'admin', pw: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    getDoc(doc(db, 'config', 'bootstrap')).then((s) => setDone(s.exists())).catch((e) => { setErr(authErrorMr(e)); setDone(false); });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      let cred;
      try { cred = await createUserWithEmailAndPassword(auth, adminEmail(f.email), f.pw); }
      catch (e1) {
        if (String(e1.code).includes('email-already-in-use')) cred = await signInWithEmailAndPassword(auth, adminEmail(f.email), f.pw);
        else throw e1;
      }
      const b = writeBatch(db);
      b.set(doc(db, 'admins', cred.user.uid), { name: f.name, email: adminEmail(f.email), createdAt: serverTimestamp() });
      b.set(doc(db, 'config', 'bootstrap'), { by: cred.user.uid, at: serverTimestamp() });
      await b.commit();
      await refresh();
      nav('/admin');
    } catch (e2) { setErr(authErrorMr(e2)); }
    finally { setBusy(false); }
  };

  if (done === null) return <Spinner />;
  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <div className="card">
        <h2>पहिला Admin तयार करा</h2>
        {done ? (
          <Alert type="info">Admin आधीच तयार झाला आहे. कृपया <a href="/login?admin=1">लॉगिन</a> करा.</Alert>
        ) : (
          <form onSubmit={submit}>
            <p className="muted small">हे पान फक्त पहिल्यांदा वापरायचे आहे. नंतर ते आपोआप बंद होते.</p>
            <label className="req">नाव</label>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
            <label className="req">Admin ID</label>
            <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
            <label className="req">पासवर्ड (किमान 6 अक्षरे)</label>
            <input type="password" minLength={6} value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} required />
            <Alert>{err}</Alert>
            <button className="btn block mt" disabled={busy}>{busy ? 'कृपया थांबा…' : 'Admin तयार करा'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
