import { useEffect, useMemo, useRef, useState } from 'react';
import Shell, { ResultCard, useClock, useFinish } from './Shell';
import { compareWords, words, wpmOf, fmtClock } from '../../lib/practice';

const block = (e) => e.preventDefault();

// ---------------- Keyboard Lesson: अक्षरानुसार, चूक लाल, Backspace चालते, वेळ वाढती ----------------
export function KeysPractice({ ex, canSubmit, onSubmit, onExit }) {
  const text = useMemo(() => String(ex.target || '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').trim(), [ex.target]);
  const [typed, setTyped] = useState('');
  const [keys, setKeys] = useState({ total: 0, ok: 0 });
  const [round, setRound] = useState(0);
  const area = useRef(null);
  const curRef = useRef(null);
  const f = useFinish({ onSubmit });
  const clock = useClock(0);

  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++;
  const secs = Math.max(1, clock.sec);
  const wpm = clock.sec ? wpmOf(correct, secs) : 0;
  const accuracy = keys.total ? Math.round((keys.ok / keys.total) * 100) : 100;
  const progress = text.length ? Math.round((typed.length / text.length) * 100) : 0;

  useEffect(() => { curRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [typed.length]);
  useEffect(() => { area.current?.focus(); }, [round]);

  const done = (t = typed, k = keys) => {
    clock.stop();
    let c = 0;
    for (let i = 0; i < t.length; i++) if (t[i] === text[i]) c++;
    const seconds = Math.max(1, Math.round(clock.exact()));
    const acc = k.total ? Math.round((k.ok / k.total) * 100) : 0;
    const metrics = { wpm: wpmOf(c, seconds), accuracy: acc, errors: k.total - k.ok, keystrokes: k.total, chars: t.length, total: text.length, progress: Math.round((t.length / text.length) * 100), seconds };
    f.finish({ metrics, work: { typed: t.slice(0, 5000) }, rows: [['वेग (WPM)', metrics.wpm], ['अचूकता', acc + '%'], ['चुका', metrics.errors], ['पूर्ण', metrics.progress + '%'], ['वेळ', fmtClock(seconds)]] });
  };

  const onChange = (e) => {
    if (f.res) return;
    let v = e.target.value;
    if (v.length > text.length) v = v.slice(0, text.length);
    if (!clock.running && v.length) clock.start();
    let k = keys;
    if (v.length > typed.length) {
      let ok = 0;
      for (let i = typed.length; i < v.length; i++) if (v[i] === text[i]) ok++;
      k = { total: keys.total + (v.length - typed.length), ok: keys.ok + ok };
      setKeys(k);
    }
    setTyped(v);
    if (v.length >= text.length) done(v, k);
  };

  const reset = () => { setTyped(''); setKeys({ total: 0, ok: 0 }); clock.reset(); f.clear(); setRound((r) => r + 1); };

  const chars = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const cls = i < typed.length ? (typed[i] === c ? 'ok' : 'bad') : i === typed.length ? 'cur' : '';
    chars.push(<span key={i} ref={i === typed.length ? curRef : null} className={cls}>{c === '\n' ? '↵' : c}</span>);
    if (c === '\n') chars.push(<br key={'b' + i} />);
  }

  return (
    <Shell ex={ex} clock={clock} onExit={onExit} onReset={reset} onSubmit={() => done()} submitLabel="✓ पूर्ण करा"
      stats={[['WPM', wpm], ['अचूकता', accuracy + '%'], ['चुका', keys.total - keys.ok], ['प्रगती', progress + '%']]}
      result={f.res && <ResultCard rows={f.res.rows} {...f} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className="px-pad">
        {ex.keysLabel && <div className="px-focus">Focus keys: <code>{ex.keysLabel}</code></div>}
        <div className="px-progress"><div style={{ width: progress + '%' }} /></div>
        <div className={'keys-board' + (ex.lang === 'mr' ? ' mr' : '')} onClick={() => area.current?.focus()}>
          {!typed.length && <div className="keys-hint">⌨️ इथे क्लिक करा आणि टाइप करायला सुरुवात करा…</div>}
          <div className="keys-text">{chars}</div>
          <textarea ref={area} className="keys-input" value={typed} onChange={onChange} onPaste={block} onDrop={block}
            spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" aria-label="टायपिंग" />
        </div>
        <p className="small muted">💡 बोटे Home Row (ASDF JKL;) वर ठेवा, कीबोर्डकडे पाहू नका. चूक झाल्यास Backspace वापरा — पण झालेली चूक अचूकतेत मोजली जाते. वेगापेक्षा अचूकता महत्त्वाची.</p>
      </div>
    </Shell>
  );
}

// ---------------- Speed Typing: डावीकडे परिच्छेद (शब्दानुसार रंग), उजवीकडे Word सारखे पान, उलटी वेळ ----------------
export function PassagePractice({ ex, canSubmit, onSubmit, onExit }) {
  const ref = useMemo(() => words(ex.target), [ex.target]);
  const paras = useMemo(() => {
    // परिच्छेद रचना टिकवा: प्रत्येक शब्दाचा index
    let k = 0;
    return String(ex.target || '').split(/\n+/).map((p) => words(p).map((w) => ({ w, i: k++ })));
  }, [ex.target]);
  const limit = Number(ex.duration || 600);
  const [typed, setTyped] = useState('');
  const [round, setRound] = useState(0);
  const f = useFinish({ onSubmit });
  const typedRef = useRef('');
  const box = useRef(null);
  const curRef = useRef(null);
  const clock = useClock(limit, () => done(typedRef.current));

  const cmp = useMemo(() => compareWords(ref, words(typed), { partial: true }), [ref, typed]);
  const secs = Math.max(1, clock.sec);
  const wpm = clock.sec ? wpmOf(typed.trim().length, secs) : 0;

  useEffect(() => { curRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [cmp.next]);
  useEffect(() => { box.current?.focus(); }, [round]);

  function done(t) {
    clock.stop();
    const c = compareWords(ref, words(t), { partial: true });
    const seconds = Math.max(1, Math.min(limit, Math.round(clock.exact())));
    // परिच्छेद पूर्ण न करता लवकर सादर केल्यास WPM पूर्ण वेळेवर (परीक्षेप्रमाणे)
    const complete = words(t).length >= ref.length;
    const basis = complete ? seconds : limit;
    const metrics = { wpm: wpmOf(t.trim().length, basis), netWpm: Math.max(0, Math.round(wpmOf(t.trim().length, basis) - c.errors / (basis / 60))), wpmBasis: basis, accuracy: c.accuracy, errors: c.errors, correctWords: c.correct, wrongWords: c.wrong, missedWords: c.missed, extraWords: c.extra, typedWords: words(t).length, totalWords: ref.length, seconds };
    f.finish({
      metrics,
      work: { typed: t.slice(0, 20000) },
      rows: [['वेग (WPM)', metrics.wpm], ['अचूकता', c.accuracy + '%'], ['बरोबर शब्द', c.correct], ['चुकीचे', c.wrong], ['गाळलेले', c.missed], ['जास्त', c.extra], ['वेळ', fmtClock(seconds)]],
    });
  }

  const onChange = (e) => {
    if (f.res) return;
    const v = e.target.value;
    if (!clock.running && v.length) clock.start();
    typedRef.current = v;
    setTyped(v);
  };
  const reset = () => { setTyped(''); typedRef.current = ''; clock.reset(); f.clear(); setRound((r) => r + 1); };

  return (
    <Shell ex={ex} clock={clock} countdown onExit={onExit} onReset={reset} onSubmit={() => done(typed)} submitLabel="✓ Submit Passage"
      stats={[['शब्द', words(typed).length], ['WPM', wpm], ['अचूकता', cmp.accuracy + '%'], ['चुका', cmp.errors]]}
      result={f.res && <ResultCard rows={f.res.rows} {...f} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className="word-desk">
        <div className="word-page ref">
          <div className="word-label">मूळ परिच्छेद</div>
          {paras.map((p, pi) => (
            <p key={pi}>{p.map(({ w, i }) => (
              <span key={i} ref={i === cmp.next ? curRef : null} className={'w ' + (cmp.status[i] || (i === cmp.next ? 'cur' : ''))}>{w} </span>
            ))}</p>
          ))}
        </div>
        <div className="word-page">
          <div className="word-label">तुमचे पान — डावीकडील मजकूर तसाच टाइप करा</div>
          <textarea ref={box} className={'word-input' + (ex.lang === 'mr' ? ' mr' : '')} value={typed} onChange={onChange}
            onPaste={block} onDrop={block} onContextMenu={block} disabled={!!f.res}
            spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
            placeholder={ex.lang === 'mr' ? 'इथे क्लिक करून टाइप करा (Marathi keyboard सुरू करा)…' : 'Click here and start typing…'} />
        </div>
      </div>
      <div className="word-status">शब्द: {words(typed).length} / {ref.length} · <span className="ok">■</span> बरोबर <span className="bad">■</span> चुकीचा <span className="miss">■</span> गाळलेला</div>
    </Shell>
  );
}
