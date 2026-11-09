import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useAuth, authErrorMr } from '../../lib/auth';
import { Alert } from '../../components/ui';
import { fmtDate } from '../../lib/format';

export default function StudentProfile() {
  const { profile: s } = useAuth();
  const [f, setF] = useState({ old: '', pw: '', pw2: '' });
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);

  const change = async (e) => {
    e.preventDefault();
    setMsg({});
    if (f.pw.length < 6) return setMsg({ err: 'नवीन पासवर्ड किमान 6 अक्षरांचा हवा.' });
    if (f.pw !== f.pw2) return setMsg({ err: 'दोन्ही पासवर्ड जुळत नाहीत.' });
    setBusy(true);
    try {
      const u = auth.currentUser;
      await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, f.old));
      await updatePassword(u, f.pw);
      await setDoc(doc(db, 'studentLogins', u.uid), { loginId: s.loginId, password: f.pw, updatedAt: serverTimestamp() }).catch(() => {});
      setF({ old: '', pw: '', pw2: '' });
      setMsg({ ok: 'पासवर्ड बदलला ✅' });
    } catch (e2) { setMsg({ err: authErrorMr(e2) }); }
    finally { setBusy(false); }
  };

  const rows = [
    ['Student ID', s.loginId], ['नाव', s.name], ['मोबाईल', s.mobile], ['ईमेल', s.email], ['बॅच', s.batchName],
    ['अभ्यासक्रम', s.course], ['प्रवेश दिनांक', fmtDate(s.admissionDate)], ['जन्मतारीख', fmtDate(s.dob)],
    ['शाळा / महाविद्यालय', s.school], ['इयत्ता', s.standard], ['पालक', s.parentName], ['पत्ता', s.address],
  ];
  return (
    <>
      <div className="page-head"><h1>👤 माझी माहिती</h1></div>
      <div className="grid g2">
        <div className="card">
          <table><tbody>{rows.map(([k, v]) => <tr key={k}><th style={{ width: '40%' }}>{k}</th><td>{v || '-'}</td></tr>)}</tbody></table>
          <p className="small muted mt">माहितीत बदल हवा असल्यास संस्थेशी संपर्क साधा.</p>
        </div>
        <form className="card" onSubmit={change}>
          <h3>पासवर्ड बदला</h3>
          <label className="req">सध्याचा पासवर्ड</label><input type="password" value={f.old} onChange={(e) => setF({ ...f, old: e.target.value })} required />
          <label className="req">नवीन पासवर्ड</label><input type="password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} required />
          <label className="req">नवीन पासवर्ड पुन्हा</label><input type="password" value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} required />
          <Alert>{msg.err}</Alert><Alert type="ok">{msg.ok}</Alert>
          <button className="btn mt" disabled={busy}>पासवर्ड बदला</button>
        </form>
      </div>
    </>
  );
}
