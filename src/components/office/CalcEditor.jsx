// Calc (Excel / LibreOffice Calc सारखे) — Fortune-sheet (MIT): सूत्रे, formatting, merge, borders, freeze, sort, filter, अनेक sheets
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import { parseBook, serializeBook } from '../../lib/office';

/**
 * json: जतन केलेली workbook (string) — बदलल्यास (key) नव्याने लोड
 * onChange(jsonString), onFirstInput(), readOnly, height
 */
const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
const colLetter = (c) => { let s = ''; c += 1; while (c) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };

const CalcEditor = forwardRef(function CalcEditor({ json, onChange, onFirstInput, readOnly, reference, height = 560, blockPaste }, ref) {
  const [initJson] = useState(json); // फक्त सुरुवातीला लोड; नवीन file साठी key बदला
  const data = useMemo(() => parseBook(initJson), [initJson]);
  const first = useRef(false);
  const last = useRef(null); // लोड होतानाचे onChange (बदल नसताना) दुर्लक्षित करण्यासाठी
  if (last.current === null) last.current = serializeBook(data);
  const wb = useRef(null);
  const cb = useRef({ onChange, onFirstInput });
  cb.current = { onChange, onFirstInput };
  useImperativeHandle(ref, () => ({ getJson: () => serializeBook(wb.current?.getAllSheets?.() || []) }));

  // संदर्भ मोड: निवडलेल्या cell चे formatting दाखवा (Fortune-sheet चा toolbar read-only मध्ये चालत नाही)
  const [info, setInfo] = useState(null);
  const showCell = (sheetId, sel) => {
    if (!sel) return;
    const r = sel.row_focus ?? sel.row?.[0], c = sel.column_focus ?? sel.column?.[0];
    const sheet = data.find((x) => x.id === sheetId) || data[0];
    const cell = (sheet.celldata || []).find((x) => x.r === r && x.c === c)?.v;
    const v = cell && typeof cell === 'object' ? cell : {};
    const merged = Object.values(sheet.config?.merge || {}).find((m) => m.r === r && m.c === c);
    const fonts = ['Times New Roman', 'Arial', 'Tahoma', 'Verdana'];
    setInfo({
      addr: `${colLetter(c)}${r + 1}`,
      font: typeof v.ff === 'number' ? fonts[v.ff] || 'Times New Roman' : v.ff || 'Times New Roman',
      size: v.fs || 10, bold: !!v.bl, italic: !!v.it, underline: !!v.un, strike: !!v.cl,
      color: v.fc || '#000000', bg: v.bg || '', align: { 0: 'मध्यभागी (Center)', 1: 'डावीकडे (Left)', 2: 'उजवीकडे (Right)' }[v.ht] || '',
      fmt: v.ct?.fa && v.ct.fa !== 'General' ? v.ct.fa : '', formula: v.f || '',
      merge: merged ? `${colLetter(c)}${r + 1}:${colLetter(c + merged.cs - 1)}${r + merged.rs}` : '',
    });
  };

  const showRef = useRef(showCell);
  showRef.current = showCell;
  const lastAddr = useRef('');
  // hooks एकदाच तयार (नवीन object प्रत्येक render ला दिल्यास Fortune-sheet पुन्हा पुन्हा render होते)
  const hooks = useMemo(() => (reference ? {
    afterSelectionChange: (sheetId, sel) => {
      const k = `${sheetId}:${sel?.row_focus ?? sel?.row?.[0]}:${sel?.column_focus ?? sel?.column?.[0]}`;
      if (k === lastAddr.current) return;
      lastAddr.current = k;
      setTimeout(() => showRef.current(sheetId, sel), 0);
    },
  } : {}), [reference]);

  // Excel प्रमाणे Tab = उजवीकडे, Shift+Tab = डावीकडे (Fortune-sheet मध्ये नाही म्हणून)
  const NAV = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift', 'Control', 'Meta', 'Alt', 'Tab', 'Escape'];
  const onKeyCapture = (e) => {
    if (readOnly) {
      const copy = (e.ctrlKey || e.metaKey) && ['c', 'a'].includes(String(e.key).toLowerCase());
      if (!NAV.includes(e.key) && !copy) { e.preventDefault(); e.stopPropagation(); }
      return;
    }
    if (e.key !== 'Tab' || !e.isTrusted) return;
    e.preventDefault(); e.stopPropagation();
    const host = e.currentTarget;
    const send = (key, keyCode) => (host.querySelector('.luckysheet-cell-input') || document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key, code: key, keyCode, which: keyCode, bubbles: true, cancelable: true }));
    // Fortune-sheet: cell संपादन चालू असताना input box चा zIndex 19 असतो
    const editing = host.querySelector('.luckysheet-input-box')?.style.zIndex === '19';
    if (editing) { send('Enter', 13); send('ArrowUp', 38); }
    send(e.shiftKey ? 'ArrowLeft' : 'ArrowRight', e.shiftKey ? 37 : 39);
  };

  const sheetEl = (
    <div className="calc-host" style={{ height }} onKeyDownCapture={onKeyCapture}
      onPasteCapture={blockPaste || readOnly ? stop : undefined}
      onCutCapture={readOnly ? stop : undefined} onDropCapture={readOnly ? stop : undefined}
      onDoubleClickCapture={readOnly ? stop : undefined} onContextMenuCapture={readOnly ? stop : undefined}
      onMouseDownCapture={readOnly ? (e) => { if (e.target.closest?.('.luckysheet-selection-copy, .fortune-fill-handle, .luckysheet-cs-draghandle')) stop(e); } : undefined}>
      <Workbook
        ref={wb}
        data={data}
        allowEdit /* Fortune-sheet मध्ये allowEdit=false असताना cell वर क्लिक केल्यास अनंत loop होतो — म्हणून read-only आम्ही स्वतः अडवतो */
        showToolbar={!readOnly}
        hooks={hooks}
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
  if (!reference) return sheetEl;
  return (
    <div className="calc-ref">
      <div className="fmt-bar">
        {info ? (
          <>
            <span>🔍 <b>{info.addr}</b></span><span><b>{info.font}</b></span><span><b>{info.size}</b> size</span>
            {info.bold && <span className="on"><b>Bold</b></span>}{info.italic && <span className="on"><i>Italic</i></span>}
            {info.underline && <span className="on"><u>Underline</u></span>}{info.strike && <span className="on"><s>Strike</s></span>}
            {info.align && <span>{info.align}</span>}
            <span><i className="sw" style={{ background: info.color }} /> अक्षर {info.color}</span>
            {info.bg && <span><i className="sw" style={{ background: info.bg }} /> Fill {info.bg}</span>}
            {info.fmt && <span>Format: {info.fmt}</span>}
            {info.merge && <span className="on">Merge {info.merge}</span>}
            {info.formula && <span className="on">सूत्र: <code>{info.formula}</code></span>}
          </>
        ) : <span>👆 संदर्भातील कोणत्याही cell वर क्लिक करा — Font, Size, Bold, रंग, Alignment, Merge व सूत्र (formula) इथे दिसेल.</span>}
      </div>
      {sheetEl}
    </div>
  );
});

export default CalcEditor;
