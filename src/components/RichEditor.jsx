import { useEffect, useMemo, useRef } from 'react';
import { sampleDoc } from './SampleView';

// Word सारखा संपादक: iframe designMode (स्वतंत्र CSS) + toolbar.
// value फक्त सुरुवातीला/ version बदलल्यावर वापरले जाते; बदल onChange ने कळवले जातात.
export default function RichEditor({ value, version = 0, onChange, onFirstInput, blockPaste, height = 420, simple }) {
  const frame = useRef(null);
  const cb = useRef({ onChange, onFirstInput });
  cb.current = { onChange, onFirstInput };
  const srcDoc = useMemo(() => sampleDoc(value || ''), [version]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const f = frame.current;
    const onLoad = () => {
      const d = f.contentDocument;
      d.designMode = 'on';
      try { d.execCommand('styleWithCSS', false, true); } catch { /* ignore */ }
      d.body.style.minHeight = '90%';
      const sync = () => cb.current.onChange?.(d.body.innerHTML);
      const first = () => cb.current.onFirstInput?.();
      d.addEventListener('input', () => { first(); sync(); });
      d.addEventListener('keyup', sync);
      if (blockPaste) {
        ['paste', 'drop'].forEach((ev) => d.addEventListener(ev, (e) => e.preventDefault()));
      } else d.addEventListener('paste', () => setTimeout(sync, 0));
    };
    f.addEventListener('load', onLoad);
    return () => f.removeEventListener('load', onLoad);
  }, [version, blockPaste]);

  const cmd = (c, arg = null) => {
    const d = frame.current?.contentDocument;
    if (!d) return;
    frame.current.contentWindow.focus();
    d.execCommand(c, false, arg);
    cb.current.onChange?.(d.body.innerHTML);
  };
  const insertTable = () => {
    const r = Number(prompt('ओळी (rows)?', '3')) || 0;
    const c = Number(prompt('स्तंभ (columns)?', '3')) || 0;
    if (!r || !c) return;
    const row = `<tr>${'<td>&nbsp;</td>'.repeat(c)}</tr>`;
    cmd('insertHTML', `<table style="width:100%;border-collapse:collapse">${row.repeat(r)}</table><p></p>`);
  };

  return (
    <div className="rich">
      <div className="se-bar">
        <button type="button" title="Undo" onClick={() => cmd('undo')}>↶</button>
        <button type="button" title="Redo" onClick={() => cmd('redo')}>↷</button>
        <span className="se-sep" />
        <select title="शैली" defaultValue="" onChange={(e) => { cmd('formatBlock', e.target.value); e.target.value = ''; }}>
          <option value="" disabled>Paragraph</option>
          <option value="P">Paragraph</option><option value="H1">Heading 1</option><option value="H2">Heading 2</option><option value="H3">Heading 3</option>
        </select>
        <select title="Font" defaultValue="" onChange={(e) => { cmd('fontName', e.target.value); e.target.value = ''; }}>
          <option value="" disabled>Font</option>
          {['Times New Roman', 'Arial', 'Calibri', 'Georgia', 'Verdana', 'Noto Sans Devanagari'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select title="Size" defaultValue="" onChange={(e) => { cmd('fontSize', e.target.value); e.target.value = ''; }}>
          <option value="" disabled>Size</option>
          {[['1', '8'], ['2', '10'], ['3', '12'], ['4', '14'], ['5', '18'], ['6', '24'], ['7', '36']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span className="se-sep" />
        <button type="button" title="Bold (Ctrl+B)" onClick={() => cmd('bold')}><b>B</b></button>
        <button type="button" title="Italic (Ctrl+I)" onClick={() => cmd('italic')}><i>I</i></button>
        <button type="button" title="Underline (Ctrl+U)" onClick={() => cmd('underline')}><u>U</u></button>
        {!simple && <label title="अक्षर रंग" className="se-color">A<input type="color" onChange={(e) => cmd('foreColor', e.target.value)} /></label>}
        {!simple && <label title="पार्श्वरंग" className="se-color">🖍<input type="color" defaultValue="#fff59d" onChange={(e) => cmd('hiliteColor', e.target.value)} /></label>}
        <span className="se-sep" />
        <button type="button" title="डावीकडे" onClick={() => cmd('justifyLeft')}>⬅</button>
        <button type="button" title="मध्यभागी" onClick={() => cmd('justifyCenter')}>↔</button>
        <button type="button" title="उजवीकडे" onClick={() => cmd('justifyRight')}>➡</button>
        <button type="button" title="Justify" onClick={() => cmd('justifyFull')}>☰</button>
        <button type="button" title="Indent" onClick={() => cmd('indent')}>⇥</button>
        <button type="button" title="Outdent" onClick={() => cmd('outdent')}>⇤</button>
        <span className="se-sep" />
        <button type="button" title="Bullets" onClick={() => cmd('insertUnorderedList')}>•≡</button>
        <button type="button" title="Numbering" onClick={() => cmd('insertOrderedList')}>1≡</button>
        <button type="button" title="Table" onClick={insertTable}>▦</button>
        {!simple && <button type="button" title="रेषा" onClick={() => cmd('insertHorizontalRule')}>―</button>}
        {!simple && <button type="button" title="चित्र (लिंक)" onClick={() => { const u = prompt('चित्राची लिंक (https://…)'); if (u) cmd('insertImage', u); }}>🖼</button>}
        {!simple && <button type="button" title="लिंक" onClick={() => { const u = prompt('लिंक (https://…)'); if (u) cmd('createLink', u); }}>🔗</button>}
        <button type="button" title="Formatting काढा" onClick={() => cmd('removeFormat')}>⌫</button>
      </div>
      <iframe ref={frame} key={version} title="संपादक" className="se-frame" style={{ height }} sandbox="allow-same-origin" srcDoc={srcDoc} />
    </div>
  );
}
