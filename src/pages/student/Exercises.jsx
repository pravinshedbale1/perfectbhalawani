import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useCollection } from '../../lib/useData';
import { submitExercise, MAX_UPLOAD_MB, isBlockedFile, driveConfigured, moduleVisibleTo } from '../../lib/api';
import { Spinner, StatusBadge, Alert, Empty } from '../../components/ui';
import { fmtDateTime } from '../../lib/format';

const byOrder = (a, b) => Number(a.order || 0) - Number(b.order || 0);

export default function StudentExercises() {
  const { profile: s } = useAuth();
  const modules = useCollection('modules');
  const exercises = useCollection('exercises');
  const subs = useCollection('submissions', [['studentId', '==', s.id]]);
  const [mod, setMod] = useState(null);
  const [ex, setEx] = useState(null);

  if (modules.loading || exercises.loading || subs.loading) return <Spinner />;
  const mods = modules.data.filter((m) => moduleVisibleTo(m, s.courseId)).sort(byOrder);
  const exOf = (mid) => exercises.data.filter((x) => x.moduleId === mid && x.active !== false).sort(byOrder);
  const subOf = (eid) => subs.data.find((x) => x.exerciseId === eid);

  if (ex) {
    const m = mods.find((x) => x.id === ex.moduleId);
    return <ExerciseDetail ex={ex} module={m} sub={subOf(ex.id)} student={s} onBack={() => setEx(null)} onDone={subs.reload} />;
  }

  if (mod) {
    const items = exOf(mod.id);
    return (
      <>
        <div className="page-head"><h1>{mod.icon} {mod.title}</h1><button className="btn light" onClick={() => setMod(null)}>← सर्व मॉड्यूल</button></div>
        {mod.desc && <p className="muted">{mod.desc}</p>}
        <div className="card" style={{ padding: 0 }}>
          {items.map((x) => {
            const sub = subOf(x.id);
            return (
              <div key={x.id} className="ex-row" onClick={() => setEx(x)}>
                <div><b>{x.title}</b><div className="small muted">{x.tool}</div></div>
                <div className="row nowrap">{sub?.status === 'evaluated' && <b>{sub.marks}/{sub.maxMarks}</b>}<StatusBadge status={sub?.status} /></div>
              </div>
            );
          })}
          {!items.length && <Empty>या मॉड्यूलमध्ये सराव नाहीत.</Empty>}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head"><h1>📚 सराव मॉड्यूल्स</h1></div>
      {!mods.length && <Empty>अजून सराव उपलब्ध नाहीत.</Empty>}
      <div className="grid auto">
        {mods.map((m) => {
          const items = exOf(m.id);
          const done = items.filter((x) => subOf(x.id)).length;
          return (
            <div key={m.id} className="card module-card" onClick={() => setMod(m)}>
              <div className="icon">{m.icon}</div>
              <h3 style={{ margin: '6px 0' }}>{m.title}</h3>
              <div className="small muted">{done} / {items.length} सादर</div>
              <div className="progress"><div style={{ width: (items.length ? (done / items.length) * 100 : 0) + '%' }} /></div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ExerciseDetail({ ex, module, sub, student, onBack, onDone }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState(sub?.note || '');
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);
  const locked = sub?.status === 'evaluated';

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ err: 'कृपया फाइल निवडा.' });
    setBusy(true); setMsg({});
    try {
      await submitExercise({ student, exercise: ex, module, file, note });
      setMsg({ ok: 'सराव यशस्वीरित्या सादर झाला ✅' });
      setFile(null);
      onDone();
    } catch (e2) { setMsg({ err: e2.message }); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="page-head"><h1 style={{ fontSize: 22 }}>{ex.title}</h1><button className="btn light" onClick={onBack}>← मागे</button></div>
      <div className="grid split">
        <div className="card">
          <div className="small muted">{module?.title} · {ex.tool} · कमाल गुण {ex.maxMarks || 10}</div>
          {ex.intro && <p className="target-box mt" style={{ fontSize: 16 }}>{ex.intro}</p>}
          {ex.target && (<><h3>सराव मजकूर</h3><div className="target-box">{ex.target}</div></>)}
          {ex.steps?.length > 0 && (<><h3 className="mt">पायऱ्या</h3><ol className="steps">{ex.steps.map((st, i) => <li key={i}>{st}</li>)}</ol></>)}
          {ex.skills && <p className="small"><b>कौशल्ये:</b> {ex.skills}</p>}
          {ex.resourceUrl && <a className="btn light sm" href={ex.resourceUrl} target="_blank" rel="noreferrer">🔗 संदर्भ / नमुना पहा</a>}
        </div>
        <div>
          <div className="card">
            <h3>तुमचे उत्तर सादर करा</h3>
            {sub && (
              <div className="small" style={{ marginBottom: 10 }}>
                <StatusBadge status={sub.status} /> <span className="muted">{fmtDateTime(sub.submittedAt)}</span>
                <div className="mt"><a href={sub.fileUrl} target="_blank" rel="noreferrer">📎 {sub.fileName}</a></div>
                {sub.status === 'evaluated' && <div className="stat s3 mt"><div className="n">{sub.marks} / {sub.maxMarks}</div><div className="l">मिळालेले गुण</div></div>}
                {sub.feedback && <div className="alert info mt"><b>शिक्षकांचा अभिप्राय:</b> {sub.feedback}</div>}
              </div>
            )}
            {locked ? (
              <p className="muted small">हा सराव तपासला गेला आहे.</p>
            ) : !driveConfigured() ? (
              <Alert type="info">फाइल अपलोड सुविधा लवकरच सुरू होईल.</Alert>
            ) : (
              <form onSubmit={upload}>
                <div className="dropzone">
                  <input type="file" onChange={(e) => {
                    const f = e.target.files[0] || null;
                    if (f && isBlockedFile(f)) { setMsg({ err: 'व्हिडिओ व ऑडिओ/गाण्यांच्या फाइल्स सादर करता येत नाहीत.' }); e.target.value = ''; setFile(null); return; }
                    if (f && f.size > MAX_UPLOAD_MB * 1024 * 1024) { setMsg({ err: `फाइल ${MAX_UPLOAD_MB} MB पेक्षा लहान असावी.` }); e.target.value = ''; setFile(null); return; }
                    setMsg({}); setFile(f);
                  }} />
                  <div className="small muted mt">कोणतीही फाइल (Word, Excel, PDF, फोटो, ZIP इ.) · व्हिडिओ/गाणी नाहीत · कमाल {MAX_UPLOAD_MB} MB</div>
                </div>
                <label>टीप (ऐच्छिक)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="उदा. पायरी 4 मध्ये अडचण आली." />
                <Alert>{msg.err}</Alert><Alert type="ok">{msg.ok}</Alert>
                <button className="btn saffron block mt" disabled={busy}>{busy ? 'अपलोड होत आहे… कृपया थांबा' : sub ? '📤 पुन्हा सादर करा' : '📤 सादर करा'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
