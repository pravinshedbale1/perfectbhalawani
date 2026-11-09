import { useMemo, useState } from 'react';
import Shell, { ResultCard, useClock, useFinish } from './Shell';
import SheetGrid from './SheetGrid';
import { compareSheet, gridFromRows, rowsFromGrid, fmtClock } from '../../lib/practice';

// Statement Writing: डावीकडे संदर्भ तक्ता (फक्त वाचा), उजवीकडे Excel सारखी grid. सेलनुसार तुलना.
export default function StatementPractice({ ex, canSubmit, onSubmit, onExit }) {
  const ref = useMemo(() => gridFromRows(ex.sheetRows || []), [ex.sheetRows]);
  const [grid, setGrid] = useState([]);
  const f = useFinish({ onSubmit });
  const clock = useClock(Number(ex.duration || 0) || 0, () => done());
  const filled = grid.flat().filter((x) => String(x).trim()).length;
  const refCells = ref.flat().filter((x) => String(x).trim()).length;

  function done() {
    clock.stop();
    const c = compareSheet(ex.sheetRows || [], grid);
    const seconds = Math.max(1, Math.round(clock.exact()));
    const metrics = { accuracy: c.accuracy, errors: c.wrongCells + c.extra, correctCells: c.correct, wrongCells: c.wrongCells, extraCells: c.extra, totalCells: c.cells, badCells: c.bad, seconds };
    f.finish({
      metrics,
      work: { rows: rowsFromGrid(grid) },
      rows: [['अचूकता', c.accuracy + '%'], ['बरोबर cells', `${c.correct}/${c.cells}`], ['चुकीचे', c.wrongCells], ['जास्तीचे', c.extra], ['वेळ', fmtClock(seconds)]],
    });
  }
  const reset = () => { if (!f.res && filled && !confirm('भरलेले सर्व काढायचे?')) return; setGrid([]); clock.reset(); f.clear(); };

  return (
    <Shell ex={ex} clock={clock} countdown={!!Number(ex.duration)} onExit={onExit} onReset={reset} onSubmit={done} submitLabel="✓ FINISH"
      stats={[['भरलेले cells', `${filled}/${refCells}`]]}
      result={f.res && <ResultCard rows={f.res.rows} {...f} note={f.res.metrics.badCells?.length ? 'चुकीचे cells: ' + f.res.metrics.badCells.join(', ') : ''} canSubmit={canSubmit} onSubmit={f.submit} onAgain={reset} onExit={onExit} />}>
      <div className="split-desk excel">
        <div className="desk-ref">
          <div className="word-label">REFERENCE SHEET (फक्त वाचा)</div>
          <SheetGrid grid={ref} readOnly minRows={Math.max(12, ref.length + 2)} />
        </div>
        <div className="desk-work">
          <div className="word-label">तुमची Excel sheet — तक्ता तसाच भरा (Enter = खाली, Tab = उजवीकडे)</div>
          <SheetGrid grid={grid} onChange={setGrid} onFirstInput={() => !clock.running && clock.start()} minRows={Math.max(15, ref.length + 4)} />
        </div>
      </div>
    </Shell>
  );
}
