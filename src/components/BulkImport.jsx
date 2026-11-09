import { useRef, useState } from 'react';
import { Modal, Alert } from './ui';
import { downloadTemplate, parseStudentsFile, downloadResults } from '../lib/bulk';
import { createStudent, recomputeLeaderboard } from '../lib/api';
import { authErrorMr } from '../lib/auth';
import { money } from '../lib/format';

// Excel template मधून विद्यार्थी एकत्र नोंदणी: template → upload → तपासणी → नोंदणी → निकाल
export default function BulkImport({ batches, students, onClose, onDone }) {
  const [rows, setRows] = useState(null);
  const [fileName, setFileName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [done, setDone] = useState(false);
  const stopRef = useRef(false);
  const inputRef = useRef(null);

  const pick = async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setErr(''); setRows(null); setDone(false); setProgress(null);
    try {
      const r = await parseStudentsFile(f, batches, students);
      if (!r.length) return setErr('फाइलमध्ये विद्यार्थ्यांची माहिती सापडली नाही. Template वापरा.');
      setRows(r);
      setFileName(f.name);
    } catch (e2) { setErr('फाइल वाचता आली नाही: ' + e2.message); }
  };

  const valid = rows?.filter((r) => !r.errors.length && !r.loginId) || [];
  const invalid = rows?.filter((r) => r.errors.length) || [];

  const register = async () => {
    if (!valid.length) return;
    if (!confirm(`${valid.length} विद्यार्थ्यांची नोंदणी करायची?${invalid.length ? `\n(${invalid.length} चुकीच्या ओळी वगळल्या जातील)` : ''}`)) return;
    setBusy(true); stopRef.current = false;
    const next = [...rows];
    const touched = new Set();
    let ok = 0, fail = 0;
    for (const r of valid) {
      if (stopRef.current) break;
      setProgress({ i: ok + fail + 1, n: valid.length, name: r.data.name });
      const idx = next.indexOf(r);
      try {
        const { loginId } = await createStudent(r.data, r.password);
        next[idx] = { ...r, loginId };
        touched.add(r.data.batchId);
        ok++;
      } catch (e) {
        next[idx] = { ...r, fail: authErrorMr(e) };
        fail++;
        if (String(e.code).includes('too-many-requests') || String(e.code).includes('quota')) {
          next[idx].fail += ' — Firebase मर्यादा; थोड्या वेळाने उर्वरितांसाठी पुन्हा चालवा.';
          setRows([...next]);
          break;
        }
      }
      setRows([...next]);
    }
    await Promise.all([...touched].map((b) => recomputeLeaderboard(b).catch(() => {})));
    setProgress({ done: true, ok, fail });
    setBusy(false); setDone(true);
    onDone?.();
  };

  return (
    <Modal title="📥 Excel मधून विद्यार्थी नोंदणी" onClose={() => !busy && onClose()} wide>
      <div className="steps-row" style={{ marginBottom: 14 }}>
        <div className="card step-card"><h3>Template डाउनलोड</h3><p>बॅचची नावे व सूचनांसह Excel.</p>
          <button className="btn sm light mt" onClick={() => downloadTemplate(batches)}>⬇️ Template</button></div>
        <div className="card step-card"><h3>माहिती भरा</h3><p>प्रत्येक ओळीत एक विद्यार्थी. नाव, मोबाईल, बॅच आवश्यक.</p></div>
        <div className="card step-card"><h3>Upload व नोंदणी</h3><p>तपासणी झाल्यावर एका क्लिकमध्ये नोंदणी.</p>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={pick} />
          <button className="btn sm saffron mt" disabled={busy} onClick={() => inputRef.current.click()}>📤 Excel निवडा</button></div>
      </div>

      <Alert>{err}</Alert>

      {rows && (
        <>
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="row">
              <span className="small muted">📄 {fileName}</span>
              <span className="badge ok">{rows.filter((r) => !r.errors.length).length} योग्य</span>
              {invalid.length > 0 && <span className="badge bad">{invalid.length} चुका</span>}
              {rows.some((r) => r.warnings.length) && <span className="badge warn">{rows.filter((r) => r.warnings.length).length} सूचना</span>}
            </div>
            <div className="row">
              {done && <button className="btn sm green" onClick={() => downloadResults(rows)}>⬇️ निकाल (ID व पासवर्ड) डाउनलोड</button>}
              {!done && <button className="btn" disabled={busy || !valid.length} onClick={register}>✅ {valid.length} विद्यार्थ्यांची नोंदणी करा</button>}
              {busy && <button className="btn sm red" onClick={() => { stopRef.current = true; }}>थांबवा</button>}
            </div>
          </div>

          {progress && !progress.done && (
            <div className="card" style={{ padding: 12, marginBottom: 10 }}>
              <div className="small">⏳ {progress.i} / {progress.n} — {progress.name}</div>
              <div className="progress"><div style={{ width: (progress.i / progress.n) * 100 + '%' }} /></div>
            </div>
          )}
          {progress?.done && (
            <Alert type={progress.fail ? 'info' : 'ok'}>
              {progress.ok} विद्यार्थ्यांची नोंदणी झाली{progress.fail ? `, ${progress.fail} अयशस्वी` : ''}. निकाल फाइल डाउनलोड करून विद्यार्थ्यांना ID व पासवर्ड द्या.
            </Alert>
          )}

          <div className="table-wrap" style={{ maxHeight: '50vh' }}>
            <table>
              <thead><tr><th>ओळ</th><th>नाव</th><th>मोबाईल</th><th>बॅच</th><th className="num">फी</th><th>स्थिती</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._row} style={r.errors.length ? { background: 'var(--bad-bg)' } : null}>
                    <td>{r._row}</td>
                    <td><b>{r.data.name || '—'}</b>{r.data.school && <div className="small muted">{r.data.school}</div>}</td>
                    <td>{r.data.mobile}</td>
                    <td className="small">{r.data.batchName}</td>
                    <td className="num">{money(r.data.totalFee)}</td>
                    <td className="small">
                      {r.loginId ? <span className="badge ok">✓ {r.loginId}</span>
                        : r.fail ? <span className="badge bad">✗ {r.fail}</span>
                        : r.errors.length ? <span style={{ color: 'var(--bad)' }}>✗ {r.errors.join(', ')}</span>
                        : <span className="badge info">तयार</span>}
                      {r.warnings.length > 0 && <div style={{ color: 'var(--warn)' }}>⚠ {r.warnings.join(', ')}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invalid.length > 0 && !done && <p className="small muted mt">चुकीच्या ओळी Excel मध्ये दुरुस्त करून फाइल पुन्हा निवडा, किंवा त्या वगळून उर्वरितांची नोंदणी करा.</p>}
        </>
      )}
    </Modal>
  );
}
