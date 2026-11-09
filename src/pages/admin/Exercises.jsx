import { useMemo, useState } from 'react';
import { useCollection } from '../../lib/useData';
import {
  saveModule, saveExercise, removeDoc, seedDemoModules, saveOrder, moveExercise,
  saveCourse, seedDefaultCourses, duplicateModule, duplicateExercise, applyStandardSamples,
} from '../../lib/api';
import ExerciseKindFields from '../../components/ExerciseKindFields';
import { KINDS, parseMcq, formatMcq, gridFromRows, rowsFromGrid } from '../../lib/practice';
import { COURSES } from '../../config';
import Sortable from '../../components/Sortable';
import { Modal, Spinner, Field, Alert, Empty } from '../../components/ui';
import { money } from '../../lib/format';

const byOrder = (a, b) => Number(a.order || 0) - Number(b.order || 0);

// अभ्यासक्रम → मॉड्यूल → सराव : संपूर्ण syllabus व्यवस्थापन
export default function Syllabus() {
  const [tab, setTab] = useState('modules');
  const courses = useCollection('courses');
  const modules = useCollection('modules');
  const exercises = useCollection('exercises');

  if (courses.loading || modules.loading || exercises.loading) return <Spinner />;
  return (
    <>
      <div className="page-head">
        <h1>📚 अभ्यासक्रम व सराव</h1>
        <div className="seg">
          <button className={tab === 'modules' ? 'on' : ''} onClick={() => setTab('modules')}>मॉड्यूल व सराव</button>
          <button className={tab === 'courses' ? 'on' : ''} onClick={() => setTab('courses')}>अभ्यासक्रम ({courses.data.length})</button>
        </div>
      </div>
      {tab === 'courses'
        ? <CoursesTab courses={courses} modules={modules.data} />
        : <ModulesTab courses={courses.data} modules={modules} exercises={exercises} />}
    </>
  );
}

/* ------------------------------ अभ्यासक्रम ------------------------------ */
function CoursesTab({ courses, modules }) {
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useMemo(() => [...courses.data].sort(byOrder), [courses.data]);

  const reorder = async (next) => {
    courses.setData(next.map((c, i) => ({ ...c, order: i + 1 })));
    await saveOrder('courses', next);
  };
  const save = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await saveCourse({ ...edit, fee: Number(edit.fee || 0), order: edit.order || list.length + 1 });
      setEdit(null);
      courses.reload();
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (c) => {
    const used = modules.filter((m) => m.courseIds?.includes(c.id)).length;
    if (!confirm(`"${c.title}" हटवायचा?${used ? `\n${used} मॉड्यूल्स या अभ्यासक्रमाशी जोडलेले आहेत (ते "सर्वांसाठी" होतील).` : ''}`)) return;
    await removeDoc('courses', c.id);
    courses.reload();
  };
  const seed = async () => {
    setBusy(true);
    try { await seedDefaultCourses(COURSES); await courses.reload(); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="row between" style={{ marginBottom: 12 }}>
        <p className="muted small" style={{ margin: 0 }}>ओढून (⋮⋮) किंवा ▲▼ ने क्रम बदला. हा क्रम मुख्यपृष्ठावर दिसतो.</p>
        <div className="row">
          {!list.length && <button className="btn light" disabled={busy} onClick={seed}>📥 डीफॉल्ट अभ्यासक्रम लोड करा</button>}
          <button className="btn saffron" onClick={() => { setErr(''); setEdit({ name: '', title: '', icon: '📘', desc: '', duration: '', fee: '', active: true, showOnHome: true }); }}>+ नवीन अभ्यासक्रम</button>
        </div>
      </div>
      {!list.length && <Empty>अजून अभ्यासक्रम नाहीत.</Empty>}
      <Sortable items={list} type="course" onReorder={reorder} renderItem={(c, i, h) => (
        <div className="srow">
          {h.grip}
          <span className="sicon">{c.icon}</span>
          <div className="smain">
            <b>{c.title}</b> <span className="badge info">{c.name}</span>
            {c.active === false && <span className="badge bad">बंद</span>}
            {c.showOnHome === false && <span className="badge warn">मुख्यपृष्ठावर नाही</span>}
            <div className="small muted">{[c.duration, c.fee ? money(c.fee) : '', `${modules.filter((m) => m.courseIds?.includes(c.id)).length} मॉड्यूल्स`].filter(Boolean).join(' · ')}</div>
          </div>
          <div className="sact">
            {h.up}{h.down}
            <button className="btn sm light" onClick={() => { setErr(''); setEdit(c); }}>संपादन</button>
            <button className="btn sm red" onClick={() => del(c)}>हटवा</button>
          </div>
        </div>
      )} />

      {edit && (
        <Modal title={edit.id ? 'अभ्यासक्रम संपादन' : 'नवीन अभ्यासक्रम'} onClose={() => setEdit(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="पूर्ण नाव (मराठी)" required full><input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="उदा. टॅली (Tally Prime + GST)" required /></Field>
              <Field label="लघु नाव / कोड" required><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="उदा. Tally" required /></Field>
              <Field label="आयकॉन (emoji)"><input value={edit.icon} onChange={(e) => setEdit({ ...edit, icon: e.target.value })} /></Field>
              <Field label="कालावधी"><input value={edit.duration || ''} onChange={(e) => setEdit({ ...edit, duration: e.target.value })} placeholder="उदा. 3 महिने" /></Field>
              <Field label="फी (₹)"><input type="number" min="0" value={edit.fee || ''} onChange={(e) => setEdit({ ...edit, fee: e.target.value })} /></Field>
              <Field label="वर्णन" full><textarea value={edit.desc || ''} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} /></Field>
              <Field label="स्थिती">
                <select value={edit.active === false ? '0' : '1'} onChange={(e) => setEdit({ ...edit, active: e.target.value === '1' })}><option value="1">सक्रिय</option><option value="0">बंद</option></select>
              </Field>
              <Field label="मुख्यपृष्ठावर दाखवा">
                <select value={edit.showOnHome === false ? '0' : '1'} onChange={(e) => setEdit({ ...edit, showOnHome: e.target.value === '1' })}><option value="1">होय</option><option value="0">नाही</option></select>
              </Field>
            </div>
            <Alert>{err}</Alert>
            <div className="actions"><button type="button" className="btn light" onClick={() => setEdit(null)}>रद्द</button><button className="btn">जतन करा</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* --------------------------- मॉड्यूल व सराव --------------------------- */
function ModulesTab({ courses, modules, exercises }) {
  const [courseFilter, setCourseFilter] = useState('');
  const [sel, setSel] = useState(null);
  const [mEdit, setMEdit] = useState(null);
  const [eEdit, setEEdit] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [dropOn, setDropOn] = useState(null);

  const courseName = (id) => courses.find((c) => c.id === id)?.name || '?';
  const allMods = useMemo(() => [...modules.data].sort(byOrder), [modules.data]);
  const mods = allMods.filter((m) => !courseFilter || (courseFilter === '_all' ? !m.courseIds?.length : m.courseIds?.includes(courseFilter)));
  const exOf = (mid) => exercises.data.filter((x) => x.moduleId === mid).sort(byOrder);
  const current = allMods.find((m) => m.id === sel) || mods[0];
  const items = current ? exOf(current.id) : [];

  const reloadAll = () => Promise.all([modules.reload(), exercises.reload()]);

  const reorderModules = async (next) => {
    // फिल्टर असताना: दिसणाऱ्या मॉड्यूल्सचा क्रम बदलून उर्वरित क्रम तसाच ठेवा
    const visibleIds = new Set(next.map((m) => m.id));
    let k = 0;
    const merged = allMods.map((m) => (visibleIds.has(m.id) ? next[k++] : m));
    modules.setData(merged.map((m, i) => ({ ...m, order: i + 1 })));
    await saveOrder('modules', merged);
  };
  const reorderExercises = async (next) => {
    const ids = new Set(next.map((x) => x.id));
    exercises.setData([...exercises.data.filter((x) => !ids.has(x.id)), ...next.map((x, i) => ({ ...x, order: i + 1 }))]);
    await saveOrder('exercises', next);
  };

  // सराव दुसऱ्या मॉड्यूलवर ड्रॉप केल्यास हलवा
  const dropOnModule = async (e, m) => {
    setDropOn(null);
    try {
      const d = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
      if (d.type !== 'exercise') return;
      e.preventDefault();
      const x = exercises.data.find((y) => y.id === d.id);
      if (!x || x.moduleId === m.id) return;
      await moveExercise(x.id, m.id, exOf(m.id).length + 1);
      await exercises.reload();
    } catch { /* ignore */ }
  };

  const seed = async () => {
    if (!confirm('डेमो फाइलमधील 13 मॉड्यूल व 53 सराव लोड करायचे?')) return;
    setBusy(true);
    try { await seedDemoModules(); await reloadAll(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const addStandard = async () => {
    if (!confirm('प्रमाणित नमुने जोडायचे?\n• सध्याच्या सरावांना (नाव जुळल्यास) Ready-Made नमुना व टायपिंग चाचणी जोडली जाईल — तुम्ही लिहिलेले नमुने बदलणार नाहीत.\n• Typing Lab (Keyboard Lessons, Speed Typing, Letter, Statement, Email, MCQ) व Ready-Made Writer / Calc / Impress मॉड्यूल्स नसल्यास नवीन जोडले जातील.')) return;
    setBusy(true);
    try {
      const r = await applyStandardSamples();
      await reloadAll();
      alert(`झाले ✅\n${r.updated} सरावांना नमुना/टायपिंग जोडले.\n${r.added} नवीन नमुना-सराव जोडले.`);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const saveM = async (e) => {
    e.preventDefault();
    try {
      await saveModule({ ...mEdit, order: Number(mEdit.order || allMods.length + 1), courseIds: mEdit.courseIds || [] });
      setMEdit(null);
      reloadAll();
    } catch (e2) { setErr(e2.message); }
  };
  const saveE = async (e) => {
    e.preventDefault();
    const steps = String(eEdit.stepsText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const { stepsText, ...rest } = eEdit;
    const { mcqText, sheetGrid, ...data } = rest;
    const kind = data.kind || 'upload';
    if (new Blob([data.sampleHtml || '']).size > 900 * 1024) return setErr('नमुना खूप मोठा आहे (900 KB पेक्षा जास्त). मोठी चित्रे काढून लिंकने जोडा.');
    if ((kind === 'typing' || kind === 'keys') && !String(data.target || '').trim()) return setErr('टाइप करायचा मजकूर आवश्यक आहे.');
    if (kind === 'letter' && !String(data.sampleHtml || '').trim()) return setErr('संदर्भ पत्र आवश्यक आहे.');
    if (kind === 'email' && (!data.email?.to || !data.email?.body)) return setErr('ईमेलचा "Mail to" व मजकूर आवश्यक आहे.');
    if (kind === 'statement') {
      data.sheetRows = rowsFromGrid(sheetGrid || []);
      if (!data.sheetRows.length) return setErr('संदर्भ तक्ता भरा.');
    }
    if (kind === 'mcq') {
      const p = parseMcq(mcqText);
      if (!p.questions.length) return setErr('किमान एक प्रश्न लिहा.');
      if (p.errors.length) return setErr(p.errors[0]);
      data.questions = p.questions;
    }
    const movedModule = data.id && exercises.data.find((x) => x.id === data.id)?.moduleId !== data.moduleId;
    try {
      await saveExercise({
        ...data, steps, maxMarks: Number(data.maxMarks || 10), kind,
        ...(data.targetWpm ? { targetWpm: Number(data.targetWpm) } : {}),
        order: movedModule || !data.order ? exOf(data.moduleId).length + 1 : Number(data.order),
      });
      setEEdit(null);
      reloadAll();
    } catch (e2) { setErr(e2.message); }
  };
  const delM = async (m) => {
    if (exOf(m.id).length) return alert('आधी या मॉड्यूलमधील सराव हटवा किंवा दुसऱ्या मॉड्यूलमध्ये हलवा.');
    if (confirm(`"${m.title}" हटवायचे?`)) { await removeDoc('modules', m.id); setSel(null); reloadAll(); }
  };
  const delE = async (x) => { if (confirm(`"${x.title}" हटवायचा?\n(विद्यार्थ्यांनी सादर केलेल्या फाइल्स व गुण कायम राहतील.)`)) { await removeDoc('exercises', x.id); reloadAll(); } };
  const toggle = async (col, it) => {
    await (col === 'modules' ? saveModule : saveExercise)({ id: it.id, active: it.active === false });
    reloadAll();
  };
  const newExercise = () => ({ moduleId: current.id, title: '', tool: '', intro: '', stepsText: '', skills: '', target: '', resourceUrl: '', sampleHtml: '', kind: 'upload', maxMarks: 10, active: true });

  return (
    <>
      <div className="toolbar">
        <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setSel(null); }}>
          <option value="">सर्व मॉड्यूल्स ({allMods.length})</option>
          <option value="_all">फक्त "सर्व अभ्यासक्रमांसाठी" असलेले</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        {!allMods.length && <button className="btn light" disabled={busy} onClick={seed}>{busy ? 'लोड होत आहे…' : '📥 डेमो सराव लोड करा'}</button>}
        {!!allMods.length && <button className="btn light" disabled={busy} onClick={addStandard}>{busy ? 'जोडत आहे…' : '📚 प्रमाणित नमुने व सराव जोडा'}</button>}
        <button className="btn saffron" onClick={() => { setErr(''); setMEdit({ title: '', desc: '', icon: '📘', active: true, courseIds: courseFilter && courseFilter !== '_all' ? [courseFilter] : [] }); }}>+ नवीन मॉड्यूल</button>
      </div>

      {!allMods.length ? <Empty>अजून मॉड्यूल नाहीत.</Empty> : (
        <div className="syl">
          <div className="card syl-col">
            <div className="syl-head"><b>मॉड्यूल्स</b><span className="small muted">ओढा / ▲▼ · सराव इथे ड्रॉप करून हलवा</span></div>
            {!mods.length && <Empty>या फिल्टरमध्ये मॉड्यूल नाहीत.</Empty>}
            <Sortable items={mods} type="module" onReorder={reorderModules} renderItem={(m, i, h) => (
              <div
                className={'srow clickable' + (current?.id === m.id ? ' sel' : '') + (dropOn === m.id ? ' drop' : '')}
                onClick={() => setSel(m.id)}
                onDragOver={(e) => { if (e.dataTransfer.types.includes('text/plain')) { e.preventDefault(); setDropOn(m.id); } }}
                onDragLeave={() => setDropOn((d) => (d === m.id ? null : d))}
                onDrop={(e) => dropOnModule(e, m)}
              >
                {h.grip}
                <span className="sicon">{m.icon}</span>
                <div className="smain">
                  <b>{i + 1}. {m.title}</b>
                  <div className="small muted">
                    {exOf(m.id).length} सराव · {m.courseIds?.length ? m.courseIds.map(courseName).join(', ') : 'सर्व अभ्यासक्रम'}
                    {m.active === false && <> · <span className="badge bad">लपवलेले</span></>}
                  </div>
                </div>
                <div className="sact">{h.up}{h.down}</div>
              </div>
            )} />
          </div>

          <div className="card syl-col">
            {current ? (
              <>
                <div className="syl-head wrapit">
                  <div className="row" style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 26 }}>{current.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <b style={{ fontSize: 18 }}>{current.title}</b>
                      {current.desc && <div className="small muted">{current.desc}</div>}
                    </div>
                  </div>
                  <div className="row">
                    <button className="btn sm light" onClick={() => toggle('modules', current)}>{current.active === false ? '👁 दाखवा' : '🙈 लपवा'}</button>
                    <button className="btn sm light" onClick={async () => { await duplicateModule(current, items, allMods.length + 1); reloadAll(); }}>⧉ प्रत</button>
                    <button className="btn sm" onClick={() => { setErr(''); setMEdit({ ...current, courseIds: current.courseIds || [] }); }}>संपादन</button>
                    <button className="btn sm red" onClick={() => delM(current)}>हटवा</button>
                  </div>
                </div>
                <div className="row between" style={{ margin: '12px 0 8px' }}>
                  <b>सराव ({items.length})</b>
                  <button className="btn sm saffron" onClick={() => { setErr(''); setEEdit(newExercise()); }}>+ सराव जोडा</button>
                </div>
                {!items.length && <Empty>या मॉड्यूलमध्ये सराव नाहीत.</Empty>}
                <Sortable items={items} type="exercise" onReorder={reorderExercises} renderItem={(x, i, h) => (
                  <div className="srow">
                    {h.grip}
                    <span className="snum">{i + 1}</span>
                    <div className="smain">
                      <b>{x.title}</b>
                      <div className="small muted">
                        {x.kind && x.kind !== 'upload' && <span className="badge info">{KINDS[x.kind]?.icon} {KINDS[x.kind]?.short}</span>}{x.sampleHtml && x.kind !== 'letter' && <span className="badge ok">📘 नमुना</span>}{' '}
                        {[x.tool, `${(x.steps || []).length} पायऱ्या`, `कमाल गुण ${x.maxMarks || 10}`].filter(Boolean).join(' · ')}
                        {x.active === false && <> · <span className="badge bad">लपवलेला</span></>}
                      </div>
                    </div>
                    <div className="sact">
                      {h.up}{h.down}
                      <button className="btn sm light" title={x.active === false ? 'दाखवा' : 'लपवा'} onClick={() => toggle('exercises', x)}>{x.active === false ? '👁' : '🙈'}</button>
                      <button className="btn sm light" title="प्रत" onClick={async () => { await duplicateExercise(x, items.length + 1); reloadAll(); }}>⧉</button>
                      <button className="btn sm" onClick={() => { setErr(''); setEEdit({ ...x, stepsText: (x.steps || []).join('\n'), mcqText: formatMcq(x.questions), sheetGrid: gridFromRows(x.sheetRows) }); }}>संपादन</button>
                      <button className="btn sm red" onClick={() => delE(x)}>✕</button>
                    </div>
                  </div>
                )} />
              </>
            ) : <Empty>डावीकडून मॉड्यूल निवडा.</Empty>}
          </div>
        </div>
      )}

      {mEdit && (
        <Modal title={mEdit.id ? 'मॉड्यूल संपादन' : 'नवीन मॉड्यूल'} onClose={() => setMEdit(null)}>
          <form onSubmit={saveM}>
            <div className="form-grid">
              <Field label="शीर्षक" required full><input value={mEdit.title} onChange={(e) => setMEdit({ ...mEdit, title: e.target.value })} required /></Field>
              <Field label="आयकॉन (emoji)"><input value={mEdit.icon} onChange={(e) => setMEdit({ ...mEdit, icon: e.target.value })} /></Field>
              <Field label="विद्यार्थ्यांना दाखवा">
                <select value={mEdit.active === false ? '0' : '1'} onChange={(e) => setMEdit({ ...mEdit, active: e.target.value === '1' })}><option value="1">होय</option><option value="0">नाही (लपवलेले)</option></select>
              </Field>
              <Field label="सराव क्रमाने उघडा">
                <select value={mEdit.sequential ? '1' : '0'} onChange={(e) => setMEdit({ ...mEdit, sequential: e.target.value === '1' })}><option value="0">नाही — सर्व सराव खुले</option><option value="1">होय — आधीचा सादर केल्यावरच पुढचा</option></select>
              </Field>
              <Field label="वर्णन" full><textarea value={mEdit.desc || ''} onChange={(e) => setMEdit({ ...mEdit, desc: e.target.value })} /></Field>
              <Field label="कोणत्या अभ्यासक्रमासाठी?" full>
                <div className="chips">
                  <label className={'chip' + (!mEdit.courseIds?.length ? ' on' : '')}>
                    <input type="checkbox" checked={!mEdit.courseIds?.length} onChange={() => setMEdit({ ...mEdit, courseIds: [] })} /> सर्व अभ्यासक्रम
                  </label>
                  {courses.map((c) => {
                    const on = mEdit.courseIds?.includes(c.id);
                    return (
                      <label key={c.id} className={'chip' + (on ? ' on' : '')}>
                        <input type="checkbox" checked={!!on} onChange={() => setMEdit({ ...mEdit, courseIds: on ? mEdit.courseIds.filter((x) => x !== c.id) : [...(mEdit.courseIds || []), c.id] })} />
                        {c.icon} {c.name}
                      </label>
                    );
                  })}
                </div>
                {!courses.length && <small className="muted">आधी "अभ्यासक्रम" टॅबमध्ये अभ्यासक्रम जोडा.</small>}
              </Field>
            </div>
            <Alert>{err}</Alert>
            <div className="actions"><button type="button" className="btn light" onClick={() => setMEdit(null)}>रद्द</button><button className="btn">जतन करा</button></div>
          </form>
        </Modal>
      )}

      {eEdit && (
        <Modal title={eEdit.id ? 'सराव संपादन' : 'नवीन सराव'} onClose={() => setEEdit(null)} wide>
          <form onSubmit={saveE}>
            <div className="form-grid">
              <Field label="शीर्षक" required full><input value={eEdit.title} onChange={(e) => setEEdit({ ...eEdit, title: e.target.value })} required /></Field>
              <Field label="मॉड्यूल (बदलल्यास सराव त्या मॉड्यूलच्या शेवटी जाईल)">
                <select value={eEdit.moduleId} onChange={(e) => setEEdit({ ...eEdit, moduleId: e.target.value })}>{allMods.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
              </Field>
              <Field label="साधन / Software"><input value={eEdit.tool || ''} onChange={(e) => setEEdit({ ...eEdit, tool: e.target.value })} placeholder="उदा. LibreOffice Writer" /></Field>
              <Field label="कमाल गुण"><input type="number" min="1" value={eEdit.maxMarks} onChange={(e) => setEEdit({ ...eEdit, maxMarks: e.target.value })} /></Field>
              <Field label="विद्यार्थ्यांना दाखवा">
                <select value={eEdit.active === false ? '0' : '1'} onChange={(e) => setEEdit({ ...eEdit, active: e.target.value === '1' })}><option value="1">होय</option><option value="0">नाही (लपवलेला)</option></select>
              </Field>
              <ExerciseKindFields e={eEdit} set={setEEdit} />
              <Field label="प्रस्तावना / उद्दिष्ट" full><textarea value={eEdit.intro || ''} onChange={(e) => setEEdit({ ...eEdit, intro: e.target.value })} /></Field>
              <Field label="पायऱ्या (प्रत्येक ओळीत एक पायरी)" full><textarea rows={8} value={eEdit.stepsText} onChange={(e) => setEEdit({ ...eEdit, stepsText: e.target.value })} /></Field>
              <Field label="कौशल्ये"><input value={eEdit.skills || ''} onChange={(e) => setEEdit({ ...eEdit, skills: e.target.value })} /></Field>
              <Field label="संदर्भ लिंक (ऐच्छिक — नमुना फाइल/व्हिडिओ)"><input type="url" value={eEdit.resourceUrl || ''} onChange={(e) => setEEdit({ ...eEdit, resourceUrl: e.target.value })} placeholder="https://" /></Field>
            </div>
            <Alert>{err}</Alert>
            <div className="actions"><button type="button" className="btn light" onClick={() => setEEdit(null)}>रद्द</button><button className="btn">जतन करा</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
