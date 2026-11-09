import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useCollection } from '../../lib/useData';
import { submitExercise, MAX_UPLOAD_MB, isBlockedFile, driveConfigured, moduleVisibleTo } from '../../lib/api';
import { KINDS, isPortalKind, isLocked, submitPractice, TARGET_WPM } from '../../lib/practice';
import SampleView from '../../components/SampleView';
import Practice, { MetricsTable, metricsLine } from '../../components/practice';
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
          {items.map((x, idx) => {
            const sub = subOf(x.id);
            const locked = isLocked(mod, items, idx, subOf);
            const k = KINDS[x.kind] || KINDS.upload;
            return (
              <div key={x.id} className={'ex-row' + (locked ? ' locked' : '')} onClick={() => (locked ? alert('आधीचा सराव पूर्ण करून सादर केल्यावर हा उघडेल 🔒') : setEx(x))}>
                <div><b>{locked ? '🔒 ' : ''}{x.title}</b><div className="small muted">{k.icon} {isPortalKind(x.kind) ? k.short + ' · पोर्टलवरच' : x.tool}{x.keysLabel && ` · Keys: ${x.keysLabel}`}{x.sampleHtml && x.kind !== 'letter' && ' · 📘 नमुन्यासह'}{sub?.metrics && ' · ' + metricsLine(sub.kind, sub.metrics)}</div></div>
                <div className="row nowrap">{sub?.status === 'evaluated' && <b>{sub.marks}/{sub.maxMarks}</b>}{locked ? <span className="badge">बंद</span> : <StatusBadge status={sub?.status} />}</div>
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

function TaskInfo({ ex, module }) {
  return (
    <>
      <div className="small muted">{module?.title} · {ex.tool} · कमाल गुण {ex.maxMarks || 10}</div>
      {ex.intro && <p className="target-box mt" style={{ fontSize: 16 }}>{ex.intro}</p>}
      {ex.target && ex.kind !== 'typing' && (<><h3>सराव मजकूर</h3><div className="target-box">{ex.target}</div></>)}
      {ex.steps?.length > 0 && (<><h3 className="mt">पायऱ्या</h3><ol className="steps">{ex.steps.map((st, i) => <li key={i}>{st}</li>)}</ol></>)}
      {ex.skills && <p className="small"><b>कौशल्ये:</b> {ex.skills}</p>}
      {ex.resourceUrl && <a className="btn light sm" href={ex.resourceUrl} target="_blank" rel="noreferrer">🔗 संदर्भ / नमुना फाइल पहा</a>}
    </>
  );
}

function ExerciseDetail(props) {
  const { ex, module, onBack } = props;
  const head = <div className="page-head"><h1 style={{ fontSize: 22 }}>{ex.title}</h1><button className="btn light" onClick={onBack}>← मागे</button></div>;

  if (isPortalKind(ex.kind)) return <>{head}<PortalDetail {...props} /></>;

  if (ex.sampleHtml) {
    return (
      <>
        {head}
        <div className="workspace">
          <div className="card ws-sample">
            <h3 style={{ marginTop: 0 }}>📘 तयार नमुना (Ready-Made Format)</h3>
            <p className="small muted" style={{ marginTop: -6 }}>हा नमुना बघून तसाच document तयार करा — हाच format, font, border.</p>
            <SampleView html={ex.sampleHtml} />
          </div>
          <div className="ws-task">
            <div className="card"><h3 style={{ marginTop: 0 }}>✍️ तुमचे काम</h3><TaskInfo ex={ex} module={module} /><Checklist /></div>
            <UploadCard {...props} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {head}
      <div className="grid split">
        <div className="card"><TaskInfo ex={ex} module={module} /></div>
        <div><UploadCard {...props} /></div>
      </div>
    </>
  );
}

function Checklist() {
  const items = ['नमुना नीट वाचला', 'तसेच formatting केले (font, alignment, border)', 'Spelling व माहिती तपासली', 'फाइल योग्य नावाने save केली'];
  return (
    <div className="mt">
      <b className="small">सादर करण्यापूर्वी तपासा:</b>
      {items.map((t) => <label key={t} className="check-item"><input type="checkbox" /> {t}</label>)}
    </div>
  );
}

// पोर्टलवरच करायचा सराव: माहिती + मागील निकाल + "सराव सुरू करा" (पूर्ण स्क्रीन)
function PortalDetail({ ex, module, sub, student, onDone }) {
  const [open, setOpen] = useState(false);
  const k = KINDS[ex.kind];
  // आपोआप गुण मिळालेले असल्यास पुन्हा प्रयत्न चालतो (सर्वोत्तम राहतो); शिक्षकांनी गुण दिल्यास बंद
  const canSubmit = !(sub?.status === 'evaluated' && sub.auto !== true);
  const onSubmit = async (metrics, work) => { const r = await submitPractice({ student, exercise: ex, module, metrics, work, prev: sub }); onDone(); return r; };
  const how = {
    keys: 'खालील बटण दाबा, स्क्रीनवरील अक्षरे तशीच टाइप करा. चूक लाल दिसेल; Backspace ने दुरुस्त करा. पूर्ण झाल्यावर निकाल दिसेल.',
    typing: `डावीकडील परिच्छेद उजवीकडील पानावर टाइप करा. वेळ ${Math.round(Number(ex.duration || 600) / 60)} मिनिटे. शब्दानुसार तपासणी: बरोबर (हिरवा), चुकीचा (लाल), गाळलेला (पिवळा).`,
    letter: 'डावीकडील पत्र उजवीकडील Word सारख्या संपादकात formatting सह (Bold, Underline, Center, Right इ.) तसेच टाइप करा.',
    writer: 'डावीकडे नमुना, उजवीकडे Word / Writer सारखा पूर्ण संपादक (File, Edit, Insert, Format, Table menus; font, रंग, alignment, tables, चित्रे, page break). नमुन्याप्रमाणे document तयार करून Submit Work दाबा.',
    calc: 'उजवीकडे Excel / Calc सारखी पूर्ण sheet: सूत्रे (=SUM, =AVERAGE, =IF…), formatting, merge, borders, अनेक sheets. संदर्भाप्रमाणे sheet तयार करा आणि FINISH दाबा.',
    impress: 'उजवीकडे PowerPoint / Impress सारखा slides editor: नवीन slide (layouts), text, आकार, चित्रे, tables, themes, Slide Show. नमुन्याप्रमाणे presentation तयार करा.',
    statement: 'डावीकडील तक्ता उजवीकडील Excel sheet मध्ये त्याच cells मध्ये तसाच भरा.',
    email: 'Mail to, Subject, CC, BCC व मजकूर — सर्व तंतोतंत टाइप करून Send दाबा.',
    mcq: `${(ex.questions || []).length} प्रश्न. उत्तर निवडताच बरोबर/चूक दिसेल.`,
  }[ex.kind];
  return (
    <>
      <div className="grid split">
        <div className="card">
          <div className="small muted">{module?.title} · {k.icon} {k.label} · कमाल गुण {ex.maxMarks || 10}</div>
          {ex.intro && <p className="target-box mt" style={{ fontSize: 16 }}>{ex.intro}</p>}
          <p>{how}</p>
          {(ex.kind === 'typing' || ex.kind === 'keys') && <p className="small muted">लक्ष्य वेग: {ex.targetWpm || TARGET_WPM[ex.lang] || 30} WPM · भाषा: {ex.lang === 'mr' ? 'मराठी (संगणकावर Marathi keyboard सुरू करा)' : 'English'}</p>}
          {ex.steps?.length > 0 && (<><h3 className="mt">सूचना</h3><ol className="steps">{ex.steps.map((st, i) => <li key={i}>{st}</li>)}</ol></>)}
          <button className="btn saffron big mt" onClick={() => setOpen(true)}>▶ सराव सुरू करा</button>
          <p className="small muted">फाइल अपलोड नाही — सर्व काम इथेच. सादर करताच गुण आपोआप मिळतात. कितीही वेळा प्रयत्न करा — सर्वोत्तम गुण राहतात.</p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🏅 तुमचे सादरीकरण</h3>
          {sub?.metrics ? (
            <>
              <div className="row"><StatusBadge status={sub.status} /><span className="small muted">{fmtDateTime(sub.submittedAt)} · {sub.attempts || 1} वेळा सादर</span></div>
              {sub.status === 'evaluated' && <div className="stat s3 mt"><div className="n">{sub.marks} / {sub.maxMarks}</div><div className="l">मिळालेले गुण</div></div>}
              {sub.feedback && <div className="alert info mt"><b>शिक्षकांचा अभिप्राय:</b> {sub.feedback}</div>}
              <div className="mt"><MetricsTable kind={sub.kind} m={sub.metrics} /></div>
              {sub.history?.length > 1 && (
                <div className="mt small"><b>मागील सादरीकरणे:</b> {sub.history.slice(0, -1).reverse().map((h, i) => <span key={i} className="badge" style={{ margin: 2 }}>{h.wpm != null ? h.wpm + ' WPM · ' : ''}{h.accuracy}%</span>)}</div>
              )}
              {sub.status === 'redo' && <div className="alert err mt">शिक्षकांनी पुन्हा सादर करायला सांगितले आहे.</div>}
            </>
          ) : sub?.fileUrl ? <p className="small">📎 <a href={sub.fileUrl} target="_blank" rel="noreferrer">{sub.fileName}</a></p> : <p className="muted">अजून सादर केलेले नाही.</p>}
        </div>
      </div>
      {open && <Practice ex={ex} canSubmit={canSubmit} onSubmit={onSubmit} onExit={() => setOpen(false)} />}
    </>
  );
}

function UploadCard({ ex, module, sub, student, onDone }) {
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
    <div className="card mt-sm">
      <h3 style={{ marginTop: 0 }}>📤 तुमचे उत्तर सादर करा</h3>
      {sub && (
        <div className="small" style={{ marginBottom: 10 }}>
          <StatusBadge status={sub.status} /> <span className="muted">{fmtDateTime(sub.submittedAt)}</span>
          {sub.fileUrl && <div className="mt"><a href={sub.fileUrl} target="_blank" rel="noreferrer">📎 {sub.fileName}</a></div>}
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
  );
}
