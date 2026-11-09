import { useMemo, useRef, useState } from 'react';
import Shell, { ResultCard, useClock, useFinish } from './Shell';
import SampleView from '../SampleView';
import RichEditor from '../RichEditor';
import { compareFormatting, compareWords, htmlText, words, wpmOf, fmtClock } from '../../lib/practice';

// Letter Writing: डावीकडे संदर्भ पत्र, उजवीकडे Word सारखा संपादक. वेळ वाढती, शब्द, WPM.
export default function LetterPractice({ ex, canSubmit, onSubmit, onExit }) {
  const refWords = useMemo(() => words(htmlText(ex.sampleHtml)), [ex.sampleHtml]);
  const [html, setHtml] = useState('');
  const [version, setVersion] = useState(0);
  const htmlRef = useRef('');
  const f = useFinish({ onSubmit });
  const clock = useClock(Number(ex.duration || 0) || 0, () => done());

  const text = useMemo(() => htmlText(html), [html]);
  const typedWords = words(text).length;
  const wpm = clock.sec ? wpmOf(text.replace(/\s+/g, ' ').trim().length, clock.sec) : 0;

  function done() {
    clock.stop();
    const h = htmlRef.current;
    const t = htmlText(h);
    const c = compareWords(refWords, words(t));
    const fm = compareFormatting(ex.sampleHtml, h);
    const seconds = Math.max(1, Math.round(clock.exact()));
    const accuracy = fm.total ? Math.round(c.accuracy * 0.8 + fm.score * 0.2) : c.accuracy;
    const metrics = { wpm: wpmOf(t.replace(/\s+/g, ' ').trim().length, seconds), accuracy, textAccuracy: c.accuracy, errors: c.errors, correctWords: c.correct, wrongWords: c.wrong, missedWords: c.missed, extraWords: c.extra, typedWords: words(t).length, totalWords: refWords.length, formatting: fm, seconds };
    f.finish({
      metrics,
      work: { html: h.slice(0, 200000) },
      rows: [['एकूण अचूकता', accuracy + '%'], ['मजकूर अचूकता', c.accuracy + '%'], ['Formatting', fm.total ? `${fm.matched}/${fm.total}` : '—'], ['WPM', metrics.wpm], ['शब्द', `${metrics.typedWords}/${refWords.length}`], ['वेळ', fmtClock(seconds)]],
    });
    return fm;
  }

  const reset = () => { if (!f.res && html && !confirm('टाइप केलेले सर्व काढून नवीन सुरुवात करायची?')) return; setHtml(''); htmlRef.current = ''; clock.reset(); f.clear(); setVersion((v) => v + 1); };
  const fmNote = f.res?.metrics.formatting?.missing?.length ? `Formatting राहिले: ${f.res.metrics.formatting.missing.join(', ')}` : '';

  return (
    <Shell ex={ex} clock={clock} countdown={!!Number(ex.duration)} onExit={onExit} onReset={reset} onSubmit={done} submitLabel="✓ Submit Work"
      stats={[['शब्द', `${typedWords}/${refWords.length}`], ['WPM', wpm]]}
      result={f.res && <ResultCard rows={f.res.rows} {...f} note={fmNote} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className="split-desk">
        <div className="desk-ref">
          <div className="word-label light">REFERENCE DOCUMENT — हे पत्र तसेच (formatting सह) टाइप करा</div>
          <SampleView html={ex.sampleHtml} />
        </div>
        <div className="desk-work">
          <RichEditor value="" version={version} blockPaste simple height="calc(100vh - 170px)"
            onFirstInput={() => !clock.running && clock.start()}
            onChange={(h) => { htmlRef.current = h; setHtml(h); }} />
        </div>
      </div>
    </Shell>
  );
}
