import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, authErrorMr } from '../lib/auth';
import { Alert } from '../components/ui';

export default function Login() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('admin') ? 'admin' : 'student');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  // "विद्यार्थी लॉगिन" / "Admin लॉगिन" लिंकनुसार टॅब बदला
  const wantAdmin = !!params.get('admin');
  useEffect(() => { setMode(wantAdmin ? 'admin' : 'student'); setErr(''); }, [wantAdmin]);

  // आधीच त्याच प्रकारच्या खात्याने लॉगिन असल्यासच डॅशबोर्डवर पाठवा
  useEffect(() => {
    if (auth.role && auth.role === mode) nav(auth.role === 'admin' ? '/admin' : '/student', { replace: true });
  }, [auth.role, mode, nav]);

  // दुसऱ्या प्रकारच्या खात्याने लॉगिन असल्यास: सूचना दाखवा
  const otherRole = auth.role && auth.role !== mode ? auth.role : null;
  if (otherRole) {
    const who = otherRole === 'admin' ? 'Admin' : `विद्यार्थी (${auth.profile?.loginId || ''})`;
    return (
      <div className="login-page">
        <div className="card" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>🔐</div>
          <h2 style={{ color: 'var(--navy)' }}>तुम्ही आधीच लॉगिन आहात</h2>
          <p className="muted">या ब्राउझरमध्ये सध्या <b>{who}</b> म्हणून लॉगिन आहे.
            {mode === 'student' ? ' विद्यार्थी म्हणून लॉगिन करण्यासाठी आधी बाहेर पडा.' : ' Admin म्हणून लॉगिन करण्यासाठी आधी बाहेर पडा.'}</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn light" onClick={() => nav(otherRole === 'admin' ? '/admin' : '/student')}>
              {otherRole === 'admin' ? 'Admin डॅशबोर्ड' : 'माझे डॅशबोर्ड'} →
            </button>
            <button className="btn saffron" onClick={() => auth.logout()}>
              बाहेर पडा व {mode === 'student' ? 'विद्यार्थी' : 'Admin'} लॉगिन करा
            </button>
          </div>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (mode === 'admin') await auth.loginAdmin(id, pw);
      else await auth.loginStudent(id, pw);
    } catch (e2) {
      setErr(authErrorMr(e2));
    } finally {
      setBusy(false);
    }
  };

  const noRole = auth.user && !auth.loading && !auth.role;

  return (
    <div className="login-page">
      <div className="login-wrap">
        <div className="login-side">
          <h2>ऑनलाइन शिक्षण पोर्टल</h2>
          <ul>
            <li>📚 मॉड्यूलनिहाय सराव व त्यांची माहिती</li>
            <li>📤 सराव फाइल (Word/Excel/PDF/फोटो) अपलोड</li>
            <li>📊 गुण व शिक्षकांचा अभिप्राय</li>
            <li>🏆 बॅचमधील लीडरबोर्ड</li>
            <li>💰 फी भरणा तपशील</li>
          </ul>
          <p className="small" style={{ color: '#a9bdd8' }}>Student ID व पासवर्ड संस्थेकडून प्रवेशाच्या वेळी दिला जातो.</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <h2>लॉगिन</h2>
          <p className="muted small" style={{ margin: 0 }}>{mode === 'student' ? 'तुमचा Student ID व पासवर्ड वापरा.' : 'संस्थेचे Admin खाते.'}</p>
          <div className="tabs" role="tablist">
            <button type="button" className={mode === 'student' ? 'on' : ''} onClick={() => { setMode('student'); setErr(''); }}>👨‍🎓 विद्यार्थी</button>
            <button type="button" className={mode === 'admin' ? 'on' : ''} onClick={() => { setMode('admin'); setErr(''); }}>🔐 Admin</button>
          </div>
          {noRole && <Alert>हे खाते कोणत्याही विद्यार्थी/Admin शी जोडलेले नाही. <a href="#" onClick={(e) => { e.preventDefault(); auth.logout(); }}>बाहेर पडा</a></Alert>}
          {mode === 'student' ? (
            <>
              <label className="req">Student ID</label>
              <input value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="उदा. PC1001" autoCapitalize="characters" required />
            </>
          ) : (
            <>
              <label className="req">Admin ID</label>
              <input value={id} onChange={(e) => setId(e.target.value)} placeholder="admin" autoCapitalize="none" required />
            </>
          )}
          <label className="req">पासवर्ड</label>
          <div className="pw-field">
            <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
            <button type="button" onClick={() => setShow(!show)}>{show ? 'लपवा' : 'दाखवा'}</button>
          </div>
          <Alert>{err}</Alert>
          <button className="btn block mt" disabled={busy}>{busy ? 'कृपया थांबा…' : 'लॉगिन करा'}</button>
          {mode === 'student' && <p className="small muted mt">पासवर्ड विसरलात? कृपया संस्थेशी संपर्क साधा.</p>}
        </form>
      </div>
    </div>
  );
}
