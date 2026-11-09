import { useState } from 'react';
import Shell, { ResultCard, useClock, useFinish } from './Shell';
import { fmtClock } from '../../lib/practice';

// MCQ: एका वेळी एक प्रश्न, उत्तर निवडताच बरोबर/चूक, मागे-पुढे, शेवटी निकाल
export default function McqPractice({ ex, canSubmit, onSubmit, onExit }) {
  const qs = ex.questions || [];
  const [ans, setAns] = useState(() => qs.map(() => -1));
  const [i, setI] = useState(0);
  const f = useFinish({ onSubmit });
  const clock = useClock(Number(ex.duration || 0) || 0, () => done());
  const correct = ans.filter((a, k) => a >= 0 && a === qs[k].answer).length;
  const wrong = ans.filter((a, k) => a >= 0 && a !== qs[k].answer).length;
  const q = qs[i];

  const pick = (j) => {
    if (ans[i] >= 0 || f.res) return;
    if (!clock.running) clock.start();
    setAns((a) => a.map((x, k) => (k === i ? j : x)));
  };

  function done() {
    clock.stop();
    const c = ans.filter((a, k) => a >= 0 && a === qs[k].answer).length;
    const att = ans.filter((a) => a >= 0).length;
    const seconds = Math.max(1, Math.round(clock.exact()));
    const metrics = { total: qs.length, attempted: att, correct: c, wrong: att - c, accuracy: qs.length ? Math.round((c / qs.length) * 100) : 0, errors: att - c, seconds };
    f.finish({ metrics, work: { answers: ans }, rows: [['गुण', `${c}/${qs.length}`], ['बरोबर', c], ['चूक', att - c], ['सोडलेले', qs.length - att], ['टक्के', metrics.accuracy + '%'], ['वेळ', fmtClock(seconds)]] });
  }
  const reset = () => { setAns(qs.map(() => -1)); setI(0); clock.reset(); f.clear(); };

  if (!qs.length) return <Shell ex={ex} onExit={onExit}><div className="px-pad"><p>या सरावात अजून प्रश्न नाहीत.</p></div></Shell>;
  const a = ans[i];

  return (
    <Shell ex={ex} clock={clock} countdown={!!Number(ex.duration)} onExit={onExit} onReset={reset} onSubmit={() => (ans.some((x) => x < 0) && !confirm(`${ans.filter((x) => x < 0).length} प्रश्न बाकी आहेत. तरी संपवायचे?`) ? null : done())} submitLabel="✓ प्रश्नमंजुषा संपवा"
      stats={[['✓', correct], ['✗', wrong], ['प्रगती', `${i + 1}/${qs.length}`]]}
      result={f.res && <ResultCard maxMarks={ex.maxMarks || 10} rows={f.res.rows} {...f} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className="mcq">
        <div className="px-progress"><div style={{ width: ((i + 1) / qs.length) * 100 + '%' }} /></div>
        <div className="mcq-card">
          <div className="small muted">प्रश्न {i + 1} / {qs.length}</div>
          <h2>{q.q}</h2>
          <div className="mcq-opts">
            {q.options.map((o, j) => {
              const cls = a < 0 ? '' : j === q.answer ? 'right' : j === a ? 'wrong' : 'dim';
              return (
                <button key={j} className={'mcq-opt ' + cls} onClick={() => pick(j)} disabled={a >= 0}>
                  <span className="mcq-l">{'ABCDEF'[j]}</span>{o}
                </button>
              );
            })}
          </div>
          {a >= 0 && (a === q.answer
            ? <div className="alert ok">✅ बरोबर!</div>
            : <div className="alert err">❌ चूक. बरोबर उत्तर: ({'ABCDEF'[q.answer]}) {q.options[q.answer]}</div>)}
          <div className="row between mt">
            <button className="btn light" disabled={i === 0} onClick={() => setI(i - 1)}>← मागील</button>
            {i < qs.length - 1
              ? <button className="btn" onClick={() => setI(i + 1)}>पुढील प्रश्न →</button>
              : <button className="btn saffron" onClick={done}>✓ निकाल पहा</button>}
          </div>
        </div>
        <div className="mcq-dots">
          {qs.map((x, k) => (
            <button key={k} className={'dot' + (k === i ? ' cur' : '') + (ans[k] < 0 ? '' : ans[k] === x.answer ? ' r' : ' w')} onClick={() => setI(k)}>{k + 1}</button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
