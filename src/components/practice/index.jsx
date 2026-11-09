import { KeysPractice, PassagePractice } from './Typing';
import LetterPractice from './Letter';
import StatementPractice from './Statement';
import EmailPractice from './Email';
import McqPractice from './Mcq';
import SheetGrid from './SheetGrid';
import SampleView from '../SampleView';
import { EMAIL_FIELDS, compareWords, gridFromRows, words, fmtClock } from '../../lib/practice';

const MAP = { keys: KeysPractice, typing: PassagePractice, letter: LetterPractice, statement: StatementPractice, email: EmailPractice, mcq: McqPractice };

export default function Practice(props) {
  const C = MAP[props.ex.kind];
  return C ? <C {...props} /> : null;
}

// आकड्यांचा छोटा सारांश (यादी/टेबलसाठी)
export function metricsLine(kind, m) {
  if (!m) return '';
  const t = m.seconds ? ` · ${fmtClock(m.seconds)}` : '';
  if (kind === 'mcq') return `${m.correct}/${m.total} बरोबर${t}`;
  if (kind === 'statement') return `${m.accuracy}% · ${m.correctCells}/${m.totalCells} cells${t}`;
  if (kind === 'email') return `${m.accuracy}% · fields ${m.fieldsOk}/4${t}`;
  return `${m.wpm ?? 0} WPM · ${m.accuracy}%${m.errors != null ? ` · ${m.errors} चुका` : ''}${t}`;
}

// तपशीलवार आकडे (Admin तपासणी / विद्यार्थी निकाल)
export function MetricsTable({ kind, m }) {
  if (!m) return null;
  const rows = [];
  const add = (l, v) => v !== undefined && v !== null && rows.push([l, v]);
  if (kind === 'mcq') { add('बरोबर', `${m.correct}/${m.total}`); add('चूक', m.wrong); add('सोडलेले', m.total - m.attempted); add('टक्के', m.accuracy + '%'); }
  else if (kind === 'statement') { add('अचूकता', m.accuracy + '%'); add('बरोबर cells', `${m.correctCells}/${m.totalCells}`); add('चुकीचे cells', m.wrongCells); add('जास्तीचे cells', m.extraCells); }
  else if (kind === 'email') {
    add('एकूण अचूकता', m.accuracy + '%');
    EMAIL_FIELDS.forEach(([k, l]) => add(l, m.fields?.[k] ? '✓ बरोबर' : '✗ चूक'));
    add('मजकूर अचूकता', m.body?.accuracy + '%'); add('मजकूर: चुकीचे/गाळलेले/जास्त', `${m.body?.wrong}/${m.body?.missed}/${m.body?.extra}`); add('WPM', m.wpm);
  } else {
    add('वेग (WPM)', m.wpm); add('Net WPM', m.netWpm); add('अचूकता', m.accuracy + '%'); add('मजकूर अचूकता', m.textAccuracy != null ? m.textAccuracy + '%' : undefined);
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
  if (kind === 'letter') {
    return (
      <div className="grid g2">
        <div><b className="small">संदर्भ</b><SampleView html={ex.sampleHtml} maxHeight={520} /></div>
        <div><b className="small">विद्यार्थ्याचे पत्र</b><SampleView html={w.html} maxHeight={520} /></div>
      </div>
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
