import { useMemo, useState } from 'react';
import { useCollection } from '../../lib/useData';
import { evaluateSubmission, bulkEvaluate } from '../../lib/api';
import { KINDS, isPortalKind } from '../../lib/practice';
import { MetricsTable, WorkView, metricsLine } from '../../components/practice';
import { Modal, Spinner, StatusBadge, Alert, Empty } from '../../components/ui';
import { fmtDateTime, byTimeDesc } from '../../lib/format';

export default function Submissions() {
  const subs = useCollection('submissions');
  const batches = useCollection('batches');
  const exercises = useCollection('exercises');
  const [kind, setKind] = useState('');
  const [batch, setBatch] = useState('');
  const [status, setStatus] = useState('submitted');
  const [q, setQ] = useState('');
  const [cur, setCur] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return subs.data
      .filter((s) => !batch || s.batchId === batch)
      .filter((s) => !status || s.status === status)
      .filter((s) => !kind || (kind === 'upload' ? !isPortalKind(s.kind) : s.kind === kind))
      .filter((s) => !t || [s.studentName, s.exerciseTitle].some((x) => String(x || '').toLowerCase().includes(t)))
      .sort(byTimeDesc('submittedAt'));
  }, [subs.data, batch, status, q, kind]);

  const suggestable = list.filter((s) => s.status === 'submitted' && typeof s.suggestedMarks === 'number');
  const acceptAll = async () => {
    if (!confirm(`${suggestable.length} सादरीकरणांना सुचवलेले गुण (WPM / अचूकतेनुसार) द्यायचे?`)) return;
    setBusy(true);
    try { await bulkEvaluate(suggestable.map((sub) => ({ sub, marks: sub.suggestedMarks }))); await subs.reload(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const openEval = (s) => {
    setErr('');
    setCur(s);
    setForm({ marks: s.marks ?? (typeof s.suggestedMarks === 'number' ? s.suggestedMarks : ''), feedback: s.feedback || '' });
  };

  const save = async (st) => {
    setErr('');
    if (st === 'evaluated') {
      const m = Number(form.marks);
      if (form.marks === '' || isNaN(m) || m < 0 || m > Number(cur.maxMarks)) return setErr(`गुण 0 ते ${cur.maxMarks} दरम्यान द्या.`);
    }
    setBusy(true);
    try {
      await evaluateSubmission(cur, { marks: form.marks, feedback: form.feedback, status: st });
      // पुढील तपासणी बाकी सराव आपोआप उघडा
      const idx = list.findIndex((x) => x.id === cur.id);
      const next = list.slice(idx + 1).find((x) => x.status === 'submitted');
      await subs.reload();
      if (next && status === 'submitted') openEval(next); else setCur(null);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  if (subs.loading) return <Spinner />;

  return (
    <>
      <div className="page-head"><h1>सराव मूल्यांकन</h1></div>
      <div className="toolbar">
        <input placeholder="🔍 विद्यार्थी / सराव शोधा" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={batch} onChange={(e) => setBatch(e.target.value)}>
          <option value="">सर्व बॅच</option>{batches.data.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="submitted">तपासणी बाकी</option><option value="evaluated">तपासलेले</option><option value="redo">पुन्हा सादर करायला सांगितलेले</option><option value="">सर्व</option>
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">सर्व प्रकार</option>
          {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.short}</option>)}
        </select>
        {suggestable.length > 0 && <button className="btn green" disabled={busy} onClick={acceptAll}>✓ सुचवलेले गुण द्या ({suggestable.length})</button>}
      </div>
      {list.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>विद्यार्थी</th><th>सराव</th><th>काम / निकाल</th><th>सादर</th><th>स्थिती</th><th className="num">गुण</th><th></th></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td><b>{s.studentName}</b><div className="small muted">{s.batchName}</div></td>
                  <td>{s.exerciseTitle}<div className="small muted">{s.moduleTitle}</div></td>
                  <td className="small">{isPortalKind(s.kind)
                    ? <>{KINDS[s.kind].icon} {metricsLine(s.kind, s.metrics)}{typeof s.suggestedMarks === 'number' && s.status !== 'evaluated' && <div className="muted">सुचवलेले गुण: {s.suggestedMarks}</div>}</>
                    : s.fileUrl ? <a href={s.fileUrl} target="_blank" rel="noreferrer">📎 उघडा</a> : '-'}</td>
                  <td className="small nowrap">{fmtDateTime(s.submittedAt)}</td>
                  <td><StatusBadge status={s.status} />{s.status === 'evaluated' && s.auto && <div className="small muted">🤖 आपोआप</div>}</td>
                  <td className="num">{s.status === 'evaluated' ? `${s.marks}/${s.maxMarks}` : '-'}</td>
                  <td><button className="btn sm" onClick={() => openEval(s)}>{s.status === 'evaluated' ? 'बदला' : 'तपासा'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>{status === 'submitted' ? 'तपासणीसाठी काहीही बाकी नाही 👍' : 'नोंद नाही.'}</Empty>}

      {cur && (
        <Modal title="सराव तपासणी" onClose={() => setCur(null)} wide>
          <div className="grid g2">
            <div>
              <div><b>{cur.studentName}</b> <span className="muted small">({cur.batchName})</span></div>
              <div className="mt"><b>{cur.exerciseTitle}</b><div className="small muted">{cur.moduleTitle}</div></div>
              <div className="small mt">सादर: {fmtDateTime(cur.submittedAt)}</div>
              {cur.note && <div className="target-box mt small"><b>विद्यार्थ्याची टीप:</b> {cur.note}</div>}
              {isPortalKind(cur.kind) ? (
                <div className="mt">
                  <div className="small"><b>{KINDS[cur.kind].icon} {KINDS[cur.kind].label}</b> · {cur.attempts || 1} वेळा सादर</div>
                  <MetricsTable kind={cur.kind} m={cur.metrics} />
                </div>
              ) : <a className="btn light mt" href={cur.fileUrl} target="_blank" rel="noreferrer">📎 {cur.fileName} — Drive मध्ये उघडा</a>}
            </div>
            <div>
              <label className="req">गुण (कमाल {cur.maxMarks})</label>
              {typeof cur.suggestedMarks === 'number' && <div className="small muted" style={{ marginTop: -4, marginBottom: 6 }}>सुचवलेले गुण (आकड्यांनुसार): <b>{cur.suggestedMarks}</b> <button type="button" className="btn sm light" onClick={() => setForm({ ...form, marks: cur.suggestedMarks })}>वापरा</button></div>}
              <input type="number" min="0" max={cur.maxMarks} step="0.5" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} autoFocus />
              <label>अभिप्राय (विद्यार्थ्याला दिसेल)</label>
              <textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="उदा. छान! Heading bold करा." />
              <Alert>{err}</Alert>
              <div className="actions">
                <button className="btn red" disabled={busy} onClick={() => save('redo')}>↩ पुन्हा सादर करा</button>
                <button className="btn green" disabled={busy} onClick={() => save('evaluated')}>{busy ? 'जतन…' : '✓ गुण जतन करा'}</button>
              </div>
            </div>
          </div>
          {isPortalKind(cur.kind) && <div className="mt"><h4 style={{ margin: '6px 0' }}>विद्यार्थ्याचे काम</h4><WorkView ex={exercises.data.find((x) => x.id === cur.exerciseId)} sub={cur} /></div>}
        </Modal>
      )}
    </>
  );
}
