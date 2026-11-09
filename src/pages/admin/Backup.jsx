import { useState } from 'react';
import { useDocument } from '../../lib/useData';
import { BACKUP_COLLECTIONS, fetchAll, downloadExcel, downloadJson, markBackupDone } from '../../lib/backup';
import { Alert } from '../../components/ui';
import { fmtDateTime, toDate } from '../../lib/format';

export default function Backup() {
  const last = useDocument('counters', 'lastBackup');
  const [withPw, setWithPw] = useState(true);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState({});
  const [counts, setCounts] = useState(null);

  const run = async (kind) => {
    setMsg({});
    try {
      setBusy('माहिती गोळा होत आहे…');
      const data = await fetchAll((name) => setBusy(`वाचत आहे: ${BACKUP_COLLECTIONS.find((c) => c[0] === name)?.[1]}…`));
      const c = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length]));
      setCounts(c);
      setBusy('फाइल तयार होत आहे…');
      if (kind === 'excel' || kind === 'both') await downloadExcel(data, { includePasswords: withPw });
      if (kind === 'json' || kind === 'both') downloadJson(data, { includePasswords: withPw });
      await markBackupDone(c);
      await last.reload();
      setMsg({ ok: 'बॅकअप डाउनलोड झाला ✅ — फाइल सुरक्षित ठिकाणी (Google Drive / pen drive) जतन करा.' });
    } catch (e) {
      setMsg({ err: 'बॅकअप अयशस्वी: ' + e.message });
    } finally {
      setBusy('');
    }
  };

  const lastAt = toDate(last.data?.at);
  const days = lastAt ? Math.floor((Date.now() - lastAt.getTime()) / 864e5) : null;

  return (
    <>
      <div className="page-head"><h1>💾 डेटा बॅकअप</h1></div>

      <div className="grid split">
        <div className="card">
          <h3>संपूर्ण बॅकअप डाउनलोड करा</h3>
          <p className="muted">बॅच, अभ्यासक्रम, मॉड्यूल, सराव, विद्यार्थी माहिती, फी पावत्या, सादर सराव व गुण, सूचना — सर्व माहिती एका फाइलमध्ये.</p>

          <label className="row" style={{ fontWeight: 500, margin: '12px 0' }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={withPw} onChange={(e) => setWithPw(e.target.checked)} />
            विद्यार्थ्यांचे लॉगिन पासवर्ड समाविष्ट करा
          </label>
          {withPw && <Alert type="info">⚠️ या फाइलमध्ये विद्यार्थ्यांचे पासवर्ड असतील — फाइल कोणाशीही शेअर करू नका.</Alert>}

          <div className="row mt">
            <button className="btn green" disabled={!!busy} onClick={() => run('excel')}>📊 Excel बॅकअप</button>
            <button className="btn" disabled={!!busy} onClick={() => run('json')}>🗂️ JSON बॅकअप</button>
            <button className="btn saffron" disabled={!!busy} onClick={() => run('both')}>⬇️ दोन्ही डाउनलोड करा</button>
          </div>
          {busy && <p className="muted mt">⏳ {busy}</p>}
          <Alert>{msg.err}</Alert><Alert type="ok">{msg.ok}</Alert>

          {counts && (
            <div className="table-wrap mt" style={{ maxHeight: 'none' }}>
              <table>
                <thead><tr><th>माहिती</th><th className="num">नोंदी</th></tr></thead>
                <tbody>
                  {BACKUP_COLLECTIONS.filter(([k]) => withPw || k !== 'studentLogins').map(([k, label]) => (
                    <tr key={k}><td>{label}</td><td className="num">{counts[k] ?? 0}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid" style={{ alignContent: 'start' }}>
          <div className={'stat ' + (days === null || days > 7 ? 's4' : 's3')}>
            <div className="n" style={{ fontSize: 20 }}>{lastAt ? fmtDateTime(lastAt) : 'अजून नाही'}</div>
            <div className="l">शेवटचा बॅकअप{days !== null ? ` · ${days === 0 ? 'आज' : days + ' दिवसांपूर्वी'}` : ''}</div>
          </div>
          <div className="card small">
            <h3>कोणती फाइल कशासाठी?</h3>
            <p><b>📊 Excel</b> — प्रत्येक माहितीसाठी वेगळी sheet. उघडून वाचता/प्रिंट करता येते.</p>
            <p><b>🗂️ JSON</b> — संपूर्ण तांत्रिक प्रत. गरज पडल्यास डेटा परत आणण्यासाठी (restore) हीच वापरली जाते.</p>
            <p className="muted" style={{ marginBottom: 0 }}>💡 दर आठवड्याला एकदा बॅकअप घ्या व Google Drive मध्ये ठेवा. विद्यार्थ्यांनी अपलोड केलेल्या फाइल्स आधीच Google Drive मध्ये सुरक्षित आहेत.</p>
          </div>
        </div>
      </div>
    </>
  );
}
