import { Field } from './ui';
import SampleEditor from './SampleEditor';
import SheetGrid from './practice/SheetGrid';
import { KINDS, EMAIL_FIELDS, TARGET_WPM, parseMcq } from '../lib/practice';


// Admin: सरावाच्या प्रकारानुसार fields (eEdit = संपादनातील सराव)
export default function ExerciseKindFields({ e, set }) {
  const kind = e.kind || 'upload';
  const upd = (patch) => set((cur) => ({ ...cur, ...patch }));
  const timeSel = (label, opts, def = 0) => (
    <Field label={label}>
      <select value={Number(e.duration ?? def)} onChange={(x) => upd({ duration: Number(x.target.value) })}>
        {opts.map((n) => <option key={n} value={n}>{n === 0 ? 'मर्यादा नाही (वेळ फक्त मोजा)' : n >= 60 ? `${n / 60} मिनिटे` : `${n} सेकंद`}</option>)}
      </select>
    </Field>
  );
  const mcq = kind === 'mcq' ? parseMcq(e.mcqText) : null;

  return (
    <>
      <Field label="सरावाचा प्रकार" full>
        <div className="kind-pick">
          {Object.entries(KINDS).map(([k, v]) => (
            <button type="button" key={k} className={kind === k ? 'on' : ''} onClick={() => upd({ kind: k, ...(k === 'typing' && !e.duration ? { duration: 300 } : {}) })}>
              <span>{v.icon}</span>{v.label}
            </button>
          ))}
        </div>
        <small className="muted">📤 फक्त "फाइल अपलोड" प्रकारात विद्यार्थी फाइल पाठवतात. बाकी सर्व सराव पोर्टलवरच होतात आणि WPM / अचूकता इ. आकडे तुमच्याकडे तपासणीसाठी येतात.</small>
      </Field>

      {(kind === 'keys' || kind === 'typing') && (
        <>
          <Field label="भाषा">
            <select value={e.lang || 'en'} onChange={(x) => upd({ lang: x.target.value })}><option value="en">English</option><option value="mr">मराठी</option></select>
          </Field>
          {kind === 'typing' ? timeSel('वेळ', [60, 120, 180, 300, 600, 900], 600) : (
            <Field label="Focus keys (ऐच्छिक)"><input value={e.keysLabel || ''} onChange={(x) => upd({ keysLabel: x.target.value })} placeholder="उदा. ASDF ;LKJ" /></Field>
          )}
          <Field label="लक्ष्य वेग WPM (सुचवलेल्या गुणांसाठी)">
            <input type="number" min="5" value={e.targetWpm || ''} placeholder={String(TARGET_WPM[e.lang || 'en'])} onChange={(x) => upd({ targetWpm: x.target.value })} />
          </Field>
          <Field label={kind === 'keys' ? 'धड्याचा मजकूर (नवीन ओळ = विद्यार्थ्याने Enter दाबायचा)' : 'टाइप करायचा परिच्छेद (रिकामी ओळ = नवा परिच्छेद)'} required full>
            <textarea rows={9} value={e.target || ''} onChange={(x) => upd({ target: x.target.value })} className={e.lang === 'mr' ? 'mr' : ''} />
          </Field>
        </>
      )}

      {kind === 'letter' && (
        <>
          {timeSel('वेळ मर्यादा', [0, 300, 600, 900, 1200, 1800, 2700, 3600])}
          <Field label="📄 संदर्भ पत्र (विद्यार्थ्यांना डावीकडे दिसेल; मजकूर व formatting दोन्ही तपासले जातात)" required full>
            <SampleEditor value={e.sampleHtml || ''} onChange={(v) => upd({ sampleHtml: v })} />
          </Field>
        </>
      )}

      {['writer', 'calc', 'impress'].includes(kind) && (
        <>
          {timeSel('वेळ मर्यादा (फक्त माहितीसाठी)', [0, 600, 900, 1200, 1800, 2700, 3600])}
          <Field label="🖥️ संदर्भ / नमुना — खरे LibreOffice" full>
            <div className="lo-ref-box">
              <p style={{ margin: 0 }}>
                विद्यार्थी हा सराव <b>खऱ्या LibreOffice {({ writer: 'Writer', calc: 'Calc', impress: 'Impress' })[kind]}</b> मध्ये करतील (सर्व menus, toolbars, dialogs).
                डावीकडे संदर्भ दस्तऐवज (फक्त वाचण्यासाठी) उघडतो; सादर केल्यावर त्याच्याशी तुलना करून गुण आपोआप मिळतात.
              </p>
              <div className="row mt">
                {e.id
                  ? <button type="button" className="btn saffron" onClick={() => window.open(`/office.html?mode=ref&ex=${e.id}`, '_blank')}>🖥️ LibreOffice मध्ये संदर्भ {e.refFile ? 'बदला' : 'तयार करा'}</button>
                  : <span className="small" style={{ color: 'var(--warn)' }}>आधी हा सराव "जतन करा", मग LibreOffice मध्ये संदर्भ तयार करता येईल.</span>}
                {e.refFile && <span className="badge ok">✓ संदर्भ फाइल ({Math.round((e.refFile.length * 0.75) / 1024)} KB)</span>}
                {e.refFile && <button type="button" className="btn sm light" onClick={() => confirm('LibreOffice संदर्भ फाइल काढायची? (खालील नमुना वापरला जाईल)') && upd({ refFile: '', _clearRef: true })}>🗑 काढा</button>}
                {!e.refFile && (e.refBook || e.refDeck) && <span className="badge info">जुना संदर्भ (आपोआप LibreOffice मध्ये रूपांतरित होतो)</span>}
              </div>
              <p className="small muted" style={{ marginBottom: 0 }}>💡 संदर्भ जतन केल्यानंतर या खिडकीत "जतन करा" दाबण्याची गरज नाही — तो थेट जतन होतो.</p>
            </div>
          </Field>
          <Field label="📘 पर्यायी नमुना (LibreOffice संदर्भ फाइल नसल्यास हाच LibreOffice मध्ये उघडतो)" full>
            <SampleEditor value={e.sampleHtml || ''} onChange={(v) => upd({ sampleHtml: v })} />
          </Field>
        </>
      )}

      {kind === 'statement' && (
        <>
          {timeSel('वेळ मर्यादा', [0, 300, 600, 900, 1200, 1800])}
          <Field label="📊 संदर्भ तक्ता — cells मध्ये टाइप करा किंवा Excel मधून copy करून A1 मध्ये paste करा" required full>
            <SheetGrid grid={e.sheetGrid || []} onChange={(g) => upd({ sheetGrid: g })} allowPaste minRows={12} minCols={8} />
          </Field>
        </>
      )}

      {kind === 'email' && (
        <>
          {timeSel('वेळ मर्यादा', [0, 300, 600, 900])}
          {EMAIL_FIELDS.map(([k, l]) => (
            <Field key={k} label={l + (k === 'to' || k === 'subject' ? '' : ' (रिकामे ठेवू शकता)')} required={k === 'to'}>
              <input value={e.email?.[k] || ''} onChange={(x) => upd({ email: { ...(e.email || {}), [k]: x.target.value } })} />
            </Field>
          ))}
          <Field label="ईमेलचा मजकूर" required full>
            <textarea rows={8} value={e.email?.body || ''} onChange={(x) => upd({ email: { ...(e.email || {}), body: x.target.value } })} />
          </Field>
          <p className="small muted" style={{ gridColumn: '1 / -1', margin: 0 }}>तपासणी: Mail to, Subject, CC, BCC बरोबर आहेत का (40%) + मजकुराची शब्दानुसार अचूकता (60%).</p>
        </>
      )}

      {kind === 'mcq' && (
        <>
          {timeSel('वेळ मर्यादा', [0, 300, 600, 900, 1200, 1800])}
          <Field label={`प्रश्न (${mcq.questions.length}) — बरोबर उत्तरापुढे * लावा`} required full>
            <textarea rows={14} value={e.mcqText || ''} onChange={(x) => upd({ mcqText: x.target.value })} spellCheck={false}
              placeholder={'Q1: CPU चे पूर्ण रूप काय?\nA) Central Processing Unit *\nB) Computer Personal Unit\nC) Control Unit\nD) Central Program\n\nQ2: …'} />
            {mcq.errors.length > 0 && <div className="small" style={{ color: 'var(--bad)' }}>{mcq.errors.slice(0, 5).map((x) => <div key={x}>⚠ {x}</div>)}</div>}
          </Field>
        </>
      )}

      {kind === 'upload' && (
        <Field label="📘 तयार नमुना (Ready-Made Sample) — विद्यार्थ्यांना डावीकडे दिसेल (ऐच्छिक)" full>
          <SampleEditor value={e.sampleHtml || ''} onChange={(v) => upd({ sampleHtml: v })} />
        </Field>
      )}
    </>
  );
}
