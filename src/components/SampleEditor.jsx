import { useState } from 'react';
import RichEditor from './RichEditor';
import { SAMPLES_BY_TITLE, SAMPLE_MODULES } from '../seed/samples';
import { LAB_MODULES } from '../seed/practiceLab';

// प्रमाणित नमुन्यांची यादी (Admin "नमुना निवडा" साठी)
const STANDARD = [
  ...LAB_MODULES.flatMap((m) => m.exercises.filter((x) => x.sampleHtml).map((x) => ({ title: `${m.title} — ${x.title}`, html: x.sampleHtml }))),
  ...SAMPLE_MODULES.flatMap((m) => m.exercises.map((x) => ({ title: `${m.title} — ${x.title}`, html: x.sampleHtml }))),
  ...Object.entries(SAMPLES_BY_TITLE).filter(([, v]) => v.sampleHtml).map(([t, v]) => ({ title: t, html: v.sampleHtml })),
];

const MAX_KB = 700;

// नमुना / संदर्भ document संपादक: थेट संपादन + HTML कोड + प्रमाणित नमुना निवड
export default function SampleEditor({ value, onChange }) {
  const [mode, setMode] = useState('visual');
  const [version, setVersion] = useState(0);

  const setAll = (html) => { onChange(html); setVersion((v) => v + 1); };
  const pickStandard = (e) => {
    const i = e.target.value;
    e.target.value = '';
    if (i === '') return;
    if ((value || '').trim() && !confirm('सध्याचा नमुना बदलून हा प्रमाणित नमुना वापरायचा?')) return;
    setAll(STANDARD[Number(i)].html);
  };
  const kb = Math.round(new Blob([value || '']).size / 1024);

  return (
    <div className="sample-editor">
      <div className="se-top">
        <div className="seg">
          <button type="button" className={mode === 'visual' ? 'on' : ''} onClick={() => { setMode('visual'); setVersion((v) => v + 1); }}>✏️ थेट संपादन</button>
          <button type="button" className={mode === 'html' ? 'on' : ''} onClick={() => setMode('html')}>&lt;/&gt; HTML</button>
        </div>
        <select onChange={pickStandard} defaultValue="" style={{ width: 'auto', maxWidth: 340 }}>
          <option value="">📚 प्रमाणित नमुना वापरा…</option>
          {STANDARD.map((s, i) => <option key={i} value={i}>{s.title}</option>)}
        </select>
        {value && <button type="button" className="btn sm light" onClick={() => confirm('नमुना काढून टाकायचा?') && setAll('')}>🗑 रिकामा करा</button>}
      </div>
      {mode === 'visual'
        ? <RichEditor value={value} version={version} onChange={onChange} />
        : <textarea className="se-html" value={value || ''} onChange={(e) => onChange(e.target.value)} spellCheck={false} placeholder="<h2>नमुना</h2> …" />}
      <div className="small mt" style={kb > MAX_KB ? { color: 'var(--bad)' } : { color: 'var(--muted)' }}>
        💡 Word / वेबसाइटवरून मजकूर कॉपी-पेस्ट करता येतो (formatting सह). आकार: {kb} KB {kb > MAX_KB && `— ${MAX_KB} KB पेक्षा जास्त; मोठी चित्रे काढा किंवा लिंकने जोडा.`}
      </div>
    </div>
  );
}
