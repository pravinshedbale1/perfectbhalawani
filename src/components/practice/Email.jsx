import { useState } from 'react';
import Shell, { ResultCard, useClock, useFinish } from './Shell';
import { EMAIL_FIELDS, compareEmail, words, wpmOf, fmtClock } from '../../lib/practice';

const block = (e) => e.preventDefault();

// Email Writing: डावीकडे संदर्भ ईमेल, उजवीकडे Mail to / Subject / CC / BCC / मजकूर. Send = पूर्ण.
export default function EmailPractice({ ex, canSubmit, onSubmit, onExit }) {
  const ref = ex.email || {};
  const [got, setGot] = useState({ to: '', subject: '', cc: '', bcc: '', body: '' });
  const f = useFinish({ onSubmit });
  const clock = useClock(Number(ex.duration || 0) || 0, () => done());
  const refBody = words(ref.body).length;
  const progress = refBody ? Math.min(100, Math.round((words(got.body).length / refBody) * 100)) : 0;

  const upd = (k, v) => { if (!clock.running) clock.start(); setGot((g) => ({ ...g, [k]: v })); };

  function done() {
    clock.stop();
    const c = compareEmail(ref, got);
    const seconds = Math.max(1, Math.round(clock.exact()));
    const chars = Object.values(got).join(' ').replace(/\s+/g, ' ').trim().length;
    const metrics = { accuracy: c.accuracy, errors: c.errors, fields: c.fields, fieldsOk: c.fieldsOk, body: c.body, wpm: wpmOf(chars, seconds), seconds };
    f.finish({
      metrics,
      work: { email: got },
      rows: [
        ['एकूण अचूकता', c.accuracy + '%'],
        ...EMAIL_FIELDS.map(([k, l]) => [l, c.fields[k] ? '✓' : '✗']),
        ['मजकूर अचूकता', c.body.accuracy + '%'],
        ['WPM', metrics.wpm],
        ['वेळ', fmtClock(seconds)],
      ],
    });
  }
  const reset = () => { setGot({ to: '', subject: '', cc: '', bcc: '', body: '' }); clock.reset(); f.clear(); };

  const fields = (vals, ro) => (
    <>
      {EMAIL_FIELDS.map(([k, l]) => (
        <div className="mail-row" key={k}>
          <label>{l} :</label>
          <input value={vals[k] || ''} readOnly={ro} onChange={ro ? undefined : (e) => upd(k, e.target.value)} onPaste={ro ? undefined : block} spellCheck={false} autoComplete="off" />
        </div>
      ))}
      <textarea className="mail-body" value={vals.body || ''} readOnly={ro} onChange={ro ? undefined : (e) => upd('body', e.target.value)} onPaste={ro ? undefined : block} spellCheck={false} />
    </>
  );

  return (
    <Shell ex={ex} clock={clock} countdown={!!Number(ex.duration)} onExit={onExit} onReset={reset} onSubmit={done} submitLabel="➤ Send"
      stats={[['प्रगती', progress + '%']]}
      result={f.res && <ResultCard maxMarks={ex.maxMarks || 10} rows={f.res.rows} {...f} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className="mail-task">📧 <b>काम:</b> डावीकडील ईमेल उजवीकडे तंतोतंत टाइप करा (Mail to, Subject, CC, BCC व मजकूर) आणि Send दाबा. रिकामे field रिकामेच ठेवा.</div>
      <div className="split-desk mail">
        <div className="mail-card"><div className="mail-head">✉ REFERENCE EMAIL</div>{fields(ref, true)}</div>
        <div className="mail-card"><div className="mail-head">✏ तुमचा ईमेल — इथे टाइप करा</div>{fields(got, false)}
          <div style={{ textAlign: 'center' }}><button className="btn saffron" onClick={done}>➤ Send</button></div>
        </div>
      </div>
    </Shell>
  );
}
