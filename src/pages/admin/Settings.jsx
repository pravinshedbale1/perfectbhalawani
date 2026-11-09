import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { authErrorMr } from '../../lib/auth';
import { Alert } from '../../components/ui';
import { DEFAULT_STUDENT_PASSWORD, STUDENT_ID_PREFIX, STUDENT_ID_START } from '../../config';

export default function Settings() {
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
      setF({ old: '', pw: '', pw2: '' });
      setMsg({ ok: 'Admin पासवर्ड बदलला ✅' });
    } catch (e2) { setMsg({ err: authErrorMr(e2) }); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="page-head"><h1>⚙️ सेटिंग्ज</h1></div>
      <div className="grid g2">
        <form className="card" onSubmit={change}>
          <h3>Admin पासवर्ड बदला</h3>
          <p className="small muted">Admin ID: <b>{auth.currentUser?.email?.split('@')[0]}</b></p>
          <label className="req">सध्याचा पासवर्ड</label><input type="password" value={f.old} onChange={(e) => setF({ ...f, old: e.target.value })} required />
          <label className="req">नवीन पासवर्ड</label><input type="password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} required />
          <label className="req">नवीन पासवर्ड पुन्हा</label><input type="password" value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} required />
          <Alert>{msg.err}</Alert><Alert type="ok">{msg.ok}</Alert>
          <button className="btn mt" disabled={busy}>पासवर्ड बदला</button>
        </form>
        <div className="card">
          <h3>विद्यार्थी लॉगिन नियम</h3>
          <ul className="small">
            <li>Student ID आपोआप: {STUDENT_ID_PREFIX}{STUDENT_ID_START + 1}, {STUDENT_ID_PREFIX}{STUDENT_ID_START + 2}, …</li>
            <li>डीफॉल्ट पासवर्ड: <b>{DEFAULT_STUDENT_PASSWORD}</b> (नोंदणीवेळी बदलता येतो)</li>
            <li>विद्यार्थी "माझी माहिती" मधून स्वतःचा पासवर्ड बदलू शकतो.</li>
            <li>विसरल्यास: विद्यार्थी → नाव → "🔑 पासवर्ड / रीसेट".</li>
          </ul>
          <p className="small muted">हे नियम <code>src/config.js</code> मध्ये बदलता येतात.</p>
        </div>
      </div>
    </>
  );
}
