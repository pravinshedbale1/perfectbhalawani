import { useMemo, useRef, useState } from 'react';
import Shell, { ResultCard, useClock, useFinish } from './Shell';
import SampleView from '../SampleView';
import WriterEditor from '../office/WriterEditor';
import CalcEditor from '../office/CalcEditor';
import ImpressEditor from '../office/ImpressEditor';
import { compareFormatting, compareWords, htmlText, words, wpmOf, fmtClock } from '../../lib/practice';
import { compareCalc, compareDeck, compareCalcSample, compareDeckSample, parseDeck } from '../../lib/office';

const MAX_BYTES = 850 * 1024;
const size = (s) => new Blob([s || '']).size;

// संदर्भ (डावीकडे): तयार file असल्यास तीच (फक्त पाहण्यासाठी), नाहीतर नमुना (HTML)
// संदर्भ (डावीकडे) = त्याच प्रकारचा संपादक, फक्त पाहण्यासाठी: क्लिक केल्यावर font / size / formatting दिसते
export function OfficeReference({ ex, height = 'calc(100vh - 130px)' }) {
  if (ex.kind === 'calc' && ex.refBook) return <CalcEditor json={ex.refBook} readOnly reference height={height} />;
  if (ex.kind === 'impress' && parseDeck(ex.refDeck).slides.length) return <ImpressEditor json={ex.refDeck} readOnly height={height} />;
  if ((ex.kind === 'writer' || ex.kind === 'letter') && ex.sampleHtml) return <WriterEditor value={ex.sampleHtml} reference height={height} />;
  return ex.sampleHtml ? <SampleView html={ex.sampleHtml} /> : <p className="small muted" style={{ color: '#fff' }}>या सरावासाठी नमुना नाही — उजवीकडील सूचनांप्रमाणे काम करा.</p>;
}

// Writer / Letter: Word सारखा पूर्ण संपादक (menus: File Edit View Insert Format Tools Table)
export function WriterPractice({ ex, canSubmit, onSubmit, onExit }) {
  const refWords = useMemo(() => words(htmlText(ex.sampleHtml)), [ex.sampleHtml]);
  const [round, setRound] = useState(0);
  const [refOpen, setRefOpen] = useState(true);
  const htmlRef = useRef('');
  const [typedWords, setTypedWords] = useState(0);
  const f = useFinish({ onSubmit });
  const clock = useClock(Number(ex.duration || 0) || 0, () => done());
  const isLetter = ex.kind === 'letter';

  function done() {
    clock.stop();
    const h = htmlRef.current;
    const t = htmlText(h);
    const seconds = Math.max(1, Math.round(clock.exact()));
    const fm = compareFormatting(ex.sampleHtml, h);
    const c = refWords.length ? compareWords(refWords, words(t)) : null;
    const accuracy = c ? (fm.total ? Math.round(c.accuracy * 0.75 + fm.score * 0.25) : c.accuracy) : null;
    const metrics = {
      wpm: wpmOf(t.replace(/\s+/g, ' ').trim().length, seconds), accuracy, textAccuracy: c?.accuracy ?? null,
      errors: c?.errors ?? null, correctWords: c?.correct, wrongWords: c?.wrong, missedWords: c?.missed, extraWords: c?.extra,
      typedWords: words(t).length, totalWords: refWords.length, formatting: fm, seconds,
    };
    if (size(h) > MAX_BYTES) { alert('Document खूप मोठे आहे (चित्रे लहान करा / कमी करा).'); clock.start(); return; }
    f.finish({
      metrics, work: { html: h },
      rows: [['एकूण अचूकता', accuracy != null ? accuracy + '%' : '—'], ['मजकूर अचूकता', c ? c.accuracy + '%' : '—'], ['Formatting', fm.total ? `${fm.matched}/${fm.total}` : '—'], ['शब्द', `${metrics.typedWords}${refWords.length ? '/' + refWords.length : ''}`], ['WPM', metrics.wpm], ['वेळ', fmtClock(seconds)]],
    });
  }
  const reset = () => { if (!f.res && htmlRef.current && !confirm('टाइप केलेले सर्व काढून नवीन सुरुवात करायची?')) return; htmlRef.current = ''; setTypedWords(0); clock.reset(); f.clear(); setRound((r) => r + 1); };
  const fmNote = f.res?.metrics.formatting?.missing?.length ? `Formatting राहिले: ${f.res.metrics.formatting.missing.join(', ')}` : '';

  return (
    <Shell ex={ex} clock={clock} countdown={!!Number(ex.duration)} onExit={onExit} onReset={reset} onSubmit={done} submitLabel="✓ Submit Work"
      stats={[['शब्द', refWords.length ? `${typedWords}/${refWords.length}` : typedWords]]}
      result={f.res && <ResultCard maxMarks={ex.maxMarks || 10} rows={f.res.rows} {...f} note={fmNote} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className={'split-desk office' + (refOpen ? '' : ' wide')}>
        {refOpen && (
          <div className="desk-ref">
            <div className="word-label light">📘 नमुना — हाच document {isLetter ? 'टाइप करा' : 'तयार करा'} <button className="ref-hide" onClick={() => setRefOpen(false)}>लपवा ⟨</button></div>
            <OfficeReference ex={ex} />
          </div>
        )}
        <div className="desk-work">
          {!refOpen && <button className="ref-show" onClick={() => setRefOpen(true)}>⟩ नमुना दाखवा</button>}
          <WriterEditor key={round} value="" blockPaste height="calc(100vh - 92px)"
            onFirstInput={() => !clock.running && clock.start()}
            onChange={(h) => { htmlRef.current = h; setTypedWords(words(htmlText(h)).length); }} />
        </div>
      </div>
    </Shell>
  );
}

// Calc: पूर्ण spreadsheet (सूत्रे, formatting, merge, borders, sheets)
export function CalcPractice({ ex, canSubmit, onSubmit, onExit }) {
  const [round, setRound] = useState(0);
  const [refOpen, setRefOpen] = useState(true);
  const book = useRef('');
  const f = useFinish({ onSubmit });
  const clock = useClock(Number(ex.duration || 0) || 0, () => done());

  function done() {
    clock.stop();
    const j = book.current || '[]';
    const seconds = Math.max(1, Math.round(clock.exact()));
    if (size(j) > MAX_BYTES) { alert('Workbook खूप मोठे आहे.'); clock.start(); return; }
    const c = ex.refBook ? compareCalc(ex.refBook, j) : ex.sampleHtml ? compareCalcSample(ex.sampleHtml, j) : null;
    const metrics = c ? { accuracy: c.accuracy, approx: !!c.approx, values: c.values, formulas: c.formulas, format: c.format, badCells: c.bad, errors: c.errors, seconds } : { accuracy: null, seconds };
    f.finish({
      metrics, work: { book: j },
      rows: c ? [['एकूण अचूकता', c.accuracy + '%'], ['मूल्ये', `${c.values.ok}/${c.values.total}`], ['सूत्रे', c.formulas.total ? `${c.formulas.ok}/${c.formulas.total}` : '—'], ['Formatting', c.format.total ? `${c.format.ok}/${c.format.total}` : '—'], ['वेळ', fmtClock(seconds)]]
        : [['वेळ', fmtClock(seconds)], ['तपासणी', 'शिक्षक करतील']],
    });
  }
  const reset = () => { if (!f.res && book.current && !confirm('सर्व काढून नवीन सुरुवात करायची?')) return; book.current = ''; clock.reset(); f.clear(); setRound((r) => r + 1); };

  return (
    <Shell ex={ex} clock={clock} countdown={!!Number(ex.duration)} onExit={onExit} onReset={reset} onSubmit={done} submitLabel="✓ FINISH"
      result={f.res && <ResultCard maxMarks={ex.maxMarks || 10} rows={f.res.rows} {...f} note={f.res.metrics.badCells?.length ? 'तपासा: ' + f.res.metrics.badCells.join(', ') : ''} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className={'split-desk office excel' + (refOpen ? '' : ' wide')}>
        {refOpen && (
          <div className="desk-ref">
            <div className="word-label">📘 संदर्भ (फक्त वाचा) <button className="ref-hide" onClick={() => setRefOpen(false)}>लपवा ⟨</button></div>
            <OfficeReference ex={ex} height="calc(100vh - 140px)" />
          </div>
        )}
        <div className="desk-work">
          <div className="word-label">तुमची Excel sheet {!refOpen && <button className="ref-hide" onClick={() => setRefOpen(true)}>⟩ संदर्भ दाखवा</button>}</div>
          <CalcEditor key={round} json="" height="calc(100vh - 140px)" blockPaste
            onFirstInput={() => !clock.running && clock.start()} onChange={(j) => { book.current = j; }} />
        </div>
      </div>
    </Shell>
  );
}

// Impress: slides editor (layouts, text, shapes, pictures, themes, slide show)
export function ImpressPractice({ ex, canSubmit, onSubmit, onExit }) {
  const [round, setRound] = useState(0);
  const [refOpen, setRefOpen] = useState(true);
  const deck = useRef('');
  const f = useFinish({ onSubmit });
  const clock = useClock(Number(ex.duration || 0) || 0, () => done());
  const hasRef = parseDeck(ex.refDeck).slides.length > 0;

  function done() {
    clock.stop();
    const j = deck.current || '';
    const seconds = Math.max(1, Math.round(clock.exact()));
    if (size(j) > MAX_BYTES) { alert('Presentation खूप मोठे आहे — चित्रे कमी करा.'); clock.start(); return; }
    const d = parseDeck(j);
    const c = hasRef ? compareDeck(ex.refDeck, j) : ex.sampleHtml ? compareDeckSample(ex.sampleHtml, j) : null;
    const metrics = c ? { ...c, seconds } : { accuracy: null, slides: d.slides.length, seconds };
    f.finish({
      metrics, work: { deck: j },
      rows: c ? [['एकूण अचूकता', c.accuracy + '%'], ['Slides', `${c.slides}/${c.refSlides}`], ['मजकूर अचूकता', c.textAccuracy != null ? c.textAccuracy + '%' : '—'], ['चित्रे / आकार', `${c.images} / ${c.shapes}`], ['वेळ', fmtClock(seconds)]]
        : [['Slides', d.slides.length], ['वेळ', fmtClock(seconds)], ['तपासणी', 'शिक्षक करतील']],
    });
  }
  const reset = () => { if (!f.res && deck.current && !confirm('सर्व slides काढून नवीन सुरुवात करायची?')) return; deck.current = ''; clock.reset(); f.clear(); setRound((r) => r + 1); };

  return (
    <Shell ex={ex} clock={clock} countdown={!!Number(ex.duration)} onExit={onExit} onReset={reset} onSubmit={done} submitLabel="✓ Submit Presentation"
      result={f.res && <ResultCard maxMarks={ex.maxMarks || 10} rows={f.res.rows} {...f} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className={'split-desk office impress' + (refOpen ? '' : ' wide')}>
        {refOpen && (
          <div className="desk-ref">
            <div className="word-label light">📘 नमुना <button className="ref-hide" onClick={() => setRefOpen(false)}>लपवा ⟨</button></div>
            <OfficeReference ex={ex} />
          </div>
        )}
        <div className="desk-work">
          {!refOpen && <button className="ref-show" onClick={() => setRefOpen(true)}>⟩ नमुना दाखवा</button>}
          <ImpressEditor key={round} json="" height="calc(100vh - 92px)"
            onFirstInput={() => !clock.running && clock.start()} onChange={(j) => { deck.current = j; }} />
        </div>
      </div>
    </Shell>
  );
}
