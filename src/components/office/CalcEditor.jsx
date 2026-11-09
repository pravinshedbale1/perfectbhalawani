// Calc (Excel / LibreOffice Calc सारखे) — Fortune-sheet (MIT): सूत्रे, formatting, merge, borders, freeze, sort, filter, अनेक sheets
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import { parseBook, serializeBook } from '../../lib/office';

/**
 * json: जतन केलेली workbook (string) — बदलल्यास (key) नव्याने लोड
 * onChange(jsonString), onFirstInput(), readOnly, height
 */
const CalcEditor = forwardRef(function CalcEditor({ json, onChange, onFirstInput, readOnly, height = 560, blockPaste }, ref) {
  const [initJson] = useState(json); // फक्त सुरुवातीला लोड; नवीन file साठी key बदला
  const data = useMemo(() => parseBook(initJson), [initJson]);
  const first = useRef(false);
  const last = useRef(null); // लोड होतानाचे onChange (बदल नसताना) दुर्लक्षित करण्यासाठी
  if (last.current === null) last.current = serializeBook(data);
  const wb = useRef(null);
  const cb = useRef({ onChange, onFirstInput });
  cb.current = { onChange, onFirstInput };
  useImperativeHandle(ref, () => ({ getJson: () => serializeBook(wb.current?.getAllSheets?.() || []) }));

  // Excel प्रमाणे Tab = उजवीकडे, Shift+Tab = डावीकडे (Fortune-sheet मध्ये नाही म्हणून)
  const onKeyCapture = (e) => {
    if (e.key !== 'Tab' || readOnly || !e.isTrusted) return;
    e.preventDefault(); e.stopPropagation();
    const host = e.currentTarget;
    const send = (key, keyCode) => (host.querySelector('.luckysheet-cell-input') || document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key, code: key, keyCode, which: keyCode, bubbles: true, cancelable: true }));
    // Fortune-sheet: cell संपादन चालू असताना input box चा zIndex 19 असतो
    const editing = host.querySelector('.luckysheet-input-box')?.style.zIndex === '19';
    if (editing) { send('Enter', 13); send('ArrowUp', 38); }
    send(e.shiftKey ? 'ArrowLeft' : 'ArrowRight', e.shiftKey ? 37 : 39);
  };

  return (
    <div className="calc-host" style={{ height }} onKeyDownCapture={onKeyCapture}
      onPasteCapture={blockPaste ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}>
      <Workbook
        ref={wb}
        data={data}
        allowEdit={!readOnly}
        showToolbar={!readOnly}
        showFormulaBar
        showSheetTabs
        lang="en"
        row={Math.max(40, ...data.map((s) => (s.celldata || []).reduce((m, c) => Math.max(m, c.r + 6), 0)))}
        column={Math.max(16, ...data.map((s) => (s.celldata || []).reduce((m, c) => Math.max(m, c.c + 3), 0)))}
        onChange={(sheets) => {
          if (readOnly) return;
          const j = serializeBook(sheets);
          if (j === last.current) return;
          last.current = j;
          if (!first.current) { first.current = true; cb.current.onFirstInput?.(); }
          cb.current.onChange?.(j);
        }}
      />
    </div>
  );
});

export default CalcEditor;
