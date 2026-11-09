import { useState } from 'react';
import { useCollection } from '../../lib/useData';
import { saveModule, saveExercise, removeDoc, seedDemoModules } from '../../lib/api';
import { Modal, Spinner, Field, Alert, Empty } from '../../components/ui';

const byOrder = (a, b) => Number(a.order || 0) - Number(b.order || 0);

export default function Exercises() {
  const modules = useCollection('modules');
  const exercises = useCollection('exercises');
  const [open, setOpen] = useState(null);
  const [mEdit, setMEdit] = useState(null);
  const [eEdit, setEEdit] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => Promise.all([modules.reload(), exercises.reload()]);

  const seed = async () => {
    if (!confirm('डेमो फाइलमधील 13 मॉड्यूल व 53 सराव लोड करायचे?')) return;
    setBusy(true);
    try { await seedDemoModules(); await reload(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const saveM = async (e) => {
    e.preventDefault();
    try { await saveModule({ ...mEdit, order: Number(mEdit.order || 0) }); setMEdit(null); reload(); } catch (e2) { setErr(e2.message); }
  };
  const saveE = async (e) => {
    e.preventDefault();
    const steps = typeof eEdit.stepsText === 'string' ? eEdit.stepsText.split('\n').map((s) => s.trim()).filter(Boolean) : eEdit.steps || [];
    const { stepsText, ...rest } = eEdit;
    try { await saveExercise({ ...rest, steps, order: Number(rest.order || 0), maxMarks: Number(rest.maxMarks || 10) }); setEEdit(null); reload(); } catch (e2) { setErr(e2.message); }
  };
  const delM = async (m) => {
    if (exercises.data.some((x) => x.moduleId === m.id)) return alert('आधी या मॉड्यूलमधील सराव हटवा.');
    if (confirm(`"${m.title}" हटवायचे?`)) { await removeDoc('modules', m.id); reload(); }
  };
  const delE = async (x) => { if (confirm(`"${x.title}" हटवायचा?`)) { await removeDoc('exercises', x.id); reload(); } };

  if (modules.loading || exercises.loading) return <Spinner />;
  const mods = [...modules.data].sort(byOrder);

  return (
    <>
      <div className="page-head">
        <h1>मॉड्यूल व सराव</h1>
        <div className="row">
          {!mods.length && <button className="btn light" disabled={busy} onClick={seed}>{busy ? 'लोड होत आहे…' : '📥 डेमो सराव लोड करा'}</button>}
          <button className="btn saffron" onClick={() => { setErr(''); setMEdit({ title: '', desc: '', icon: '📘', order: mods.length + 1, active: true }); }}>+ नवीन मॉड्यूल</button>
        </div>
      </div>
      {!mods.length && <Empty>अजून मॉड्यूल नाहीत. "डेमो सराव लोड करा" वापरून तुमच्या डेमोमधील सर्व सराव एका क्लिकमध्ये जोडा.</Empty>}
      {mods.map((m) => {
        const items = exercises.data.filter((x) => x.moduleId === m.id).sort(byOrder);
        const isOpen = open === m.id;
        return (
          <div key={m.id} className="card" style={{ marginBottom: 12, padding: 0 }}>
            <div className="ex-row" onClick={() => setOpen(isOpen ? null : m.id)}>
              <div className="row"><span style={{ fontSize: 26 }}>{m.icon}</span>
                <div><b>{m.order}. {m.title}</b> {m.active === false && <span className="badge bad">लपवलेले</span>}<div className="small muted">{items.length} सराव</div></div>
              </div>
              <div className="row" onClick={(e) => e.stopPropagation()}>
                <button className="btn sm light" onClick={() => { setErr(''); setMEdit(m); }}>संपादन</button>
                <button className="btn sm red" onClick={() => delM(m)}>हटवा</button>
                <span>{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>
            {isOpen && (
              <div style={{ padding: '0 14px 14px' }}>
                {items.map((x) => (
                  <div key={x.id} className="row between" style={{ padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
                    <div><b>{x.title}</b> {x.active === false && <span className="badge bad">लपवलेले</span>}<div className="small muted">{x.tool} · कमाल गुण {x.maxMarks || 10}</div></div>
                    <div className="row">
                      <button className="btn sm light" onClick={() => { setErr(''); setEEdit({ ...x, stepsText: (x.steps || []).join('\n') }); }}>संपादन</button>
                      <button className="btn sm red" onClick={() => delE(x)}>हटवा</button>
                    </div>
                  </div>
                ))}
                <button className="btn sm mt" onClick={() => { setErr(''); setEEdit({ moduleId: m.id, title: '', tool: '', intro: '', stepsText: '', skills: '', target: '', maxMarks: 10, order: items.length + 1, active: true }); }}>+ सराव जोडा</button>
              </div>
            )}
          </div>
        );
      })}

      {mEdit && (
        <Modal title={mEdit.id ? 'मॉड्यूल संपादन' : 'नवीन मॉड्यूल'} onClose={() => setMEdit(null)}>
          <form onSubmit={saveM}>
            <div className="form-grid">
              <Field label="शीर्षक" required full><input value={mEdit.title} onChange={(e) => setMEdit({ ...mEdit, title: e.target.value })} required /></Field>
              <Field label="आयकॉन (emoji)"><input value={mEdit.icon} onChange={(e) => setMEdit({ ...mEdit, icon: e.target.value })} /></Field>
              <Field label="क्रम"><input type="number" value={mEdit.order} onChange={(e) => setMEdit({ ...mEdit, order: e.target.value })} /></Field>
              <Field label="वर्णन" full><textarea value={mEdit.desc} onChange={(e) => setMEdit({ ...mEdit, desc: e.target.value })} /></Field>
              <Field label="विद्यार्थ्यांना दाखवा">
                <select value={mEdit.active === false ? '0' : '1'} onChange={(e) => setMEdit({ ...mEdit, active: e.target.value === '1' })}><option value="1">होय</option><option value="0">नाही</option></select>
              </Field>
            </div>
            <Alert>{err}</Alert>
            <div className="actions"><button className="btn">जतन करा</button></div>
          </form>
        </Modal>
      )}

      {eEdit && (
        <Modal title={eEdit.id ? 'सराव संपादन' : 'नवीन सराव'} onClose={() => setEEdit(null)} wide>
          <form onSubmit={saveE}>
            <div className="form-grid">
              <Field label="शीर्षक" required full><input value={eEdit.title} onChange={(e) => setEEdit({ ...eEdit, title: e.target.value })} required /></Field>
              <Field label="साधन / Software"><input value={eEdit.tool} onChange={(e) => setEEdit({ ...eEdit, tool: e.target.value })} placeholder="उदा. LibreOffice Writer" /></Field>
              <Field label="मॉड्यूल">
                <select value={eEdit.moduleId} onChange={(e) => setEEdit({ ...eEdit, moduleId: e.target.value })}>{mods.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
              </Field>
              <Field label="कमाल गुण"><input type="number" min="1" value={eEdit.maxMarks} onChange={(e) => setEEdit({ ...eEdit, maxMarks: e.target.value })} /></Field>
              <Field label="क्रम"><input type="number" value={eEdit.order} onChange={(e) => setEEdit({ ...eEdit, order: e.target.value })} /></Field>
              <Field label="प्रस्तावना / उद्दिष्ट" full><textarea value={eEdit.intro} onChange={(e) => setEEdit({ ...eEdit, intro: e.target.value })} /></Field>
              <Field label="पायऱ्या (प्रत्येक ओळीत एक पायरी)" full><textarea rows={7} value={eEdit.stepsText} onChange={(e) => setEEdit({ ...eEdit, stepsText: e.target.value })} /></Field>
              <Field label="सराव मजकूर (टायपिंगसाठी, ऐच्छिक)" full><textarea value={eEdit.target || ''} onChange={(e) => setEEdit({ ...eEdit, target: e.target.value })} /></Field>
              <Field label="कौशल्ये" full><input value={eEdit.skills} onChange={(e) => setEEdit({ ...eEdit, skills: e.target.value })} /></Field>
              <Field label="विद्यार्थ्यांना दाखवा">
                <select value={eEdit.active === false ? '0' : '1'} onChange={(e) => setEEdit({ ...eEdit, active: e.target.value === '1' })}><option value="1">होय</option><option value="0">नाही</option></select>
              </Field>
            </div>
            <Alert>{err}</Alert>
            <div className="actions"><button className="btn">जतन करा</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
