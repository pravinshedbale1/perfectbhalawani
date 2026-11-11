import { KeysPractice, PassagePractice } from './Typing';
import { lazy, Suspense } from 'react';
import StatementPractice from './Statement';
import EmailPractice from './Email';
import McqPractice from './Mcq';
import SheetGrid from './SheetGrid';
import SampleView from '../SampleView';
import { Spinner } from '../ui';
import { downloadDoc, downloadXlsx } from '../../lib/office';
import { doc, getDoc } from 'firebase/firestore';
import { downloadDriveFile } from '../../lib/api';
import { db } from '../../firebase';

// जड संपादक (TinyMCE / Fortune-sheet / Fabric) गरज असेल तेव्हाच लोड
const WriterPractice = lazy(() => import('./Office').then((m) => ({ default: m.WriterPractice })));
const CalcPractice = lazy(() => import('./Office').then((m) => ({ default: m.CalcPractice })));
const ImpressPractice = lazy(() => import('./Office').then((m) => ({ default: m.ImpressPractice })));
const CalcEditor = lazy(() => import('../office/CalcEditor'));
const ImpressViewer = lazy(() => import('../office/ImpressEditor').then((m) => ({ default: m.ImpressViewer })));
const Loading = () => <div className="px-shell" style={{ display: 'grid', placeItems: 'center' }}><div style={{ textAlign: 'center' }}><Spinner /><p className="muted">Office संपादक लोड होत आहे…</p></div></div>;
import { EMAIL_FIELDS, compareWords, gridFromRows, words, fmtClock } from '../../lib/practice';

const MAP = { keys: KeysPractice, typing: PassagePractice, letter: WriterPractice, writer: WriterPractice, calc: CalcPractice, impress: ImpressPractice, statement: StatementPractice, email: EmailPractice, mcq: McqPractice };

export default function Practice(props) {
  const C = MAP[props.ex.kind];
  return C ? <Suspense fallback={<Loading />}><C {...props} /></Suspense> : null;
}

// आकड्यांचा छोटा सारांश (यादी/टेबलसाठी)
export function metricsLine(kind, m) {
  if (!m) return '';
  const t = m.seconds ? ` · ${fmtClock(m.seconds)}` : '';
  if (kind === 'mcq') return `${m.correct}/${m.total} बरोबर${t}`;
  if (kind === 'statement') return `${m.accuracy}% · ${m.correctCells}/${m.totalCells} cells${t}`;
  if (kind === 'email') return `${m.accuracy}% · fields ${m.fieldsOk}/4${t}`;
  if (kind === 'calc') return m.accuracy != null ? `${m.accuracy}% · मूल्ये ${m.values.ok}/${m.values.total}${m.formulas?.total ? ` · सूत्रे ${m.formulas.ok}/${m.formulas.total}` : ''}${t}` : `Workbook${t}`;
  if (kind === 'impress') return `${m.slides} slides${m.accuracy != null ? ` · ${m.accuracy}%` : ''}${t}`;
  if (kind === 'writer' && m.accuracy == null) return `${m.typedWords} शब्द${t}`;
  return `${m.wpm ?? 0} WPM · ${m.accuracy}%${m.errors != null ? ` · ${m.errors} चुका` : ''}${t}`;
}

// तपशीलवार आकडे (Admin तपासणी / विद्यार्थी निकाल)
export function MetricsTable({ kind, m }) {
  if (!m) return null;
  const rows = [];
  const add = (l, v) => v !== undefined && v !== null && rows.push([l, v]);
  if (kind === 'mcq') { add('बरोबर', `${m.correct}/${m.total}`); add('चूक', m.wrong); add('सोडलेले', m.total - m.attempted); add('टक्के', m.accuracy + '%'); }
  else if (kind === 'statement') { add('अचूकता', m.accuracy + '%'); add('बरोबर cells', `${m.correctCells}/${m.totalCells}`); add('चुकीचे cells', m.wrongCells); add('जास्तीचे cells', m.extraCells); }
  else if (kind === 'calc') {
    if (m.accuracy != null) { add('एकूण अचूकता', m.accuracy + '%'); add('मूल्ये (values)', `${m.values.ok}/${m.values.total}`); add('सूत्रे (formulas)', m.formulas.total ? `${m.formulas.ok}/${m.formulas.total}` : '—'); add('Formatting', m.format.total ? `${m.format.ok}/${m.format.total}` : '—'); if (m.badCells?.length) add('तपासा', m.badCells.join(', ')); }
    else add('तपासणी', 'संदर्भ file नाही — शिक्षक पाहून गुण देतील');
  } else if (kind === 'impress') {
    add('Slides', m.refSlides ? `${m.slides}/${m.refSlides}` : m.slides);
    if (m.accuracy != null) { add('एकूण अचूकता', m.accuracy + '%'); add('मजकूर अचूकता', m.textAccuracy != null ? m.textAccuracy + '%' : '—'); add('चित्रे', `${m.images}/${m.refImages}`); add('आकार', `${m.shapes}/${m.refShapes}`); }
  } else if (kind === 'email') {
    add('एकूण अचूकता', m.accuracy + '%');
    EMAIL_FIELDS.forEach(([k, l]) => add(l, m.fields?.[k] ? '✓ बरोबर' : '✗ चूक'));
    add('मजकूर अचूकता', m.body?.accuracy + '%'); add('मजकूर: चुकीचे/गाळलेले/जास्त', `${m.body?.wrong}/${m.body?.missed}/${m.body?.extra}`); add('WPM', m.wpm);
  } else {
    add('वेग (WPM)', m.wpm); add('Net WPM', m.netWpm); add('अचूकता', m.accuracy != null ? m.accuracy + '%' : 'शिक्षक तपासतील'); add('मजकूर अचूकता', m.textAccuracy != null ? m.textAccuracy + '%' : undefined);
    add('चुका', m.errors); add('Keystrokes', m.keystrokes); add('पूर्ण', m.progress != null ? m.progress + '%' : undefined);
    if (m.totalWords) add('शब्द (टाइप/एकूण)', `${m.typedWords}/${m.totalWords}`);
    if (m.correctWords != null) add('बरोबर/चुकीचे/गाळलेले/जास्त', `${m.correctWords}/${m.wrongWords}/${m.missedWords}/${m.extraWords}`);
    if (m.formatting?.total) add('Formatting', `${m.formatting.matched}/${m.formatting.total}${m.formatting.missing.length ? ' (राहिले: ' + m.formatting.missing.join(', ') + ')' : ''}`);
  }
  add('वेळ', m.seconds ? fmtClock(m.seconds) : undefined);
  return (
    <table className="metrics"><tbody>{rows.map(([l, v]) => <tr key={l}><th>{l}</th><td>{v}</td></tr>)}</tbody></table>
  );
}

// विद्यार्थ्याचे काम (संदर्भासह) — Admin तपासणीसाठी
export function WorkView({ ex, sub }) {
  const w = sub.work || {};
  const kind = sub.kind;
  if (!ex) return <p className="small muted">मूळ सराव हटवला आहे.</p>;
  if (kind === 'typing' || kind === 'keys') {
    const ref = words(ex.target);
    const c = compareWords(ref, words(w.typed || ''), { partial: true });
    return (
      <div className="grid g2">
        <div><b className="small">मूळ (रंग = विद्यार्थ्याची तुलना)</b><div className="work-box">{ref.map((x, i) => <span key={i} className={'w ' + (c.status[i] || '')}>{x} </span>)}</div></div>
        <div><b className="small">विद्यार्थ्याने टाइप केलेले</b><div className="work-box pre">{w.typed || '—'}</div></div>
      </div>
    );
  }
  const dlName = `${sub.studentName || 'student'}_${ex.title || 'practice'}`.replace(/[^\w\u0900-\u097F]+/g, '_').slice(0, 60);
  if (w.ext) {
    // खऱ्या LibreOffice मध्ये केलेले काम (.odt / .ods / .odp)
    const has = !!(w.file || w.hasFile || w.driveId);
    const dl = async () => {
      let b64 = w.file;
      if (!b64 && w.driveId) b64 = await downloadDriveFile(w.driveId).catch((e) => { alert(e.message); return null; });
      if (!b64 && w.hasFile) { const fd = await getDoc(doc(db, 'submissionFiles', sub.id)); if (fd.exists()) b64 = fd.data().file; }
      if (!b64) return;
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([bytes]));
      a.download = w.fileName || `${dlName}.${w.ext}`;
      document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 500);
    };
    return (
      <div className="lo-ref-box">
        <p style={{ marginTop: 0 }}>🖥️ विद्यार्थ्याने हे काम <b>LibreOffice</b> मध्ये केले — फाइल: <code>{w.fileName}</code> ({Math.round((w.size || 0) / 1024)} KB)</p>
        <div className="row">
          {has && <a className="btn saffron" href={`/office.html?mode=view&sub=${sub.id}`} target="_blank" rel="noreferrer">🖥️ LibreOffice मध्ये उघडा (संदर्भासह)</a>}
          {has && <button className="btn light" onClick={dl}>⬇️ .{w.ext} डाउनलोड</button>}
          {w.driveUrl && <a className="btn light" href={w.driveUrl} target="_blank" rel="noreferrer">📎 Drive मध्ये उघडा</a>}
        </div>
      </div>
    );
  }
  if (kind === 'letter' || kind === 'writer') {
    return (
      <>
        <div className="grid g2">
          <div><b className="small">संदर्भ</b>{ex.sampleHtml ? <SampleView html={ex.sampleHtml} maxHeight={560} /> : <p className="small muted">नमुना नाही</p>}</div>
          <div><b className="small">विद्यार्थ्याचे document</b><SampleView html={w.html} maxHeight={560} /></div>
        </div>
        <button className="btn sm light mt" onClick={() => downloadDoc(w.html, dlName)}>⬇️ Word (.doc) डाउनलोड</button>
      </>
    );
  }
  if (kind === 'calc') {
    return (
      <Suspense fallback={<Spinner />}>
        <b className="small">विद्यार्थ्याची workbook</b>
        <CalcEditor key={sub.id + (sub.attempts || 0)} json={w.book} readOnly height={380} />
        {ex.refBook && <><b className="small mt" style={{ display: 'block' }}>संदर्भ</b><CalcEditor key={'r' + sub.id} json={ex.refBook} readOnly height={300} /></>}
        {!ex.refBook && ex.sampleHtml && <><b className="small mt" style={{ display: 'block' }}>नमुना</b><SampleView html={ex.sampleHtml} maxHeight={360} /></>}
        <button className="btn sm light mt" onClick={() => downloadXlsx(w.book, dlName)}>⬇️ Excel (.xlsx) डाउनलोड</button>
      </Suspense>
    );
  }
  if (kind === 'impress') {
    return (
      <Suspense fallback={<Spinner />}>
        <b className="small">विद्यार्थ्याचे slides (क्लिक = Slide Show)</b>
        <ImpressViewer json={w.deck} width={300} />
        {ex.refDeck ? <><b className="small">संदर्भ</b><ImpressViewer json={ex.refDeck} width={220} /></> : ex.sampleHtml && <><b className="small">नमुना</b><SampleView html={ex.sampleHtml} maxHeight={360} /></>}
      </Suspense>
    );
  }
  if (kind === 'statement') {
    const marks = Object.fromEntries((sub.metrics?.badCells || []).map((k) => [k, 1]));
    return <div><b className="small">विद्यार्थ्याची sheet (लाल = चुकीचे)</b><SheetGrid grid={gridFromRows(w.rows || [])} readOnly marks={marks} minRows={8} minCols={5} /></div>;
  }
  if (kind === 'email') {
    const e = w.email || {}, r = ex.email || {};
    return (
      <table className="metrics"><tbody>
        {EMAIL_FIELDS.map(([k, l]) => <tr key={k}><th>{l}</th><td>{sub.metrics?.fields?.[k] ? '✓' : '✗'} {e[k] || <i className="muted">(रिकामे)</i>}{!sub.metrics?.fields?.[k] && <div className="small muted">अपेक्षित: {r[k] || '(रिकामे)'}</div>}</td></tr>)}
        <tr><th>मजकूर</th><td><div className="work-box pre">{e.body || '—'}</div></td></tr>
      </tbody></table>
    );
  }
  if (kind === 'mcq') {
    const qs = ex.questions || [];
    return (
      <ol className="mcq-review">
        {qs.map((q, i) => {
          const a = w.answers?.[i] ?? -1;
          return <li key={i} className={a < 0 ? '' : a === q.answer ? 'r' : 'w'}>{q.q}<div className="small">{a < 0 ? 'सोडले' : `उत्तर: ${q.options[a]}`}{a !== q.answer && <> · बरोबर: {q.options[q.answer]}</>}</div></li>;
        })}
      </ol>
    );
  }
  return null;
}
