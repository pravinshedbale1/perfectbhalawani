import { useRef } from 'react';

const col = (i) => String.fromCharCode(65 + i);

// Excel सारखी साधी grid: Enter/↓ खाली, ↑ वर, Tab उजवीकडे. Excel मधून paste (allowPaste) केल्यास अनेक cells भरतात.
export default function SheetGrid({ grid, onChange, readOnly, allowPaste, minRows = 15, minCols = 8, marks, onFirstInput }) {
  const wrap = useRef(null);
  const rows = Math.max(minRows, grid.length + (readOnly ? 0 : 3));
  const cols = Math.max(minCols, ...grid.map((r) => r.length + (readOnly ? 0 : 1)));
  const get = (r, c) => grid[r]?.[c] ?? '';

  const set = (r, c, v) => {
    const g = grid.map((x) => [...x]);
    while (g.length <= r) g.push([]);
    while (g[r].length <= c) g[r].push('');
    g[r][c] = v;
    onChange(g);
  };
  const focus = (r, c) => wrap.current?.querySelector(`input[data-rc="${r}-${c}"]`)?.focus();

  const onKey = (e, r, c) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); focus(r + 1, c); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focus(r - 1, c); }
    else if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) { e.preventDefault(); focus(r, c + 1); }
    else if (e.key === 'ArrowLeft' && e.target.selectionStart === 0) { e.preventDefault(); focus(r, c - 1); }
  };
  const onPaste = (e, r, c) => {
    if (!allowPaste) { e.preventDefault(); return; }
    const t = e.clipboardData.getData('text/plain');
    if (!t.includes('\t') && !t.includes('\n')) return;
    e.preventDefault();
    const lines = t.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
    const g = grid.map((x) => [...x]);
    lines.forEach((l, i) => l.forEach((v, j) => {
      while (g.length <= r + i) g.push([]);
      while (g[r + i].length <= c + j) g[r + i].push('');
      g[r + i][c + j] = v;
    }));
    onChange(g);
  };

  return (
    <div className="sheet-wrap" ref={wrap}>
      <table className="sheet-grid">
        <thead><tr><th />{Array.from({ length: cols }, (_, c) => <th key={c}>{col(c)}</th>)}</tr></thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              <th>{r + 1}</th>
              {Array.from({ length: cols }, (_, c) => {
                const v = get(r, c);
                const m = marks?.[`${col(c)}${r + 1}`];
                return (
                  <td key={c} className={m ? 'bad' : ''}>
                    {readOnly ? <div className="cell">{v}</div> : (
                      <input data-rc={`${r}-${c}`} value={v} onChange={(e) => { onFirstInput?.(); set(r, c, e.target.value); }}
                        onKeyDown={(e) => onKey(e, r, c)} onPaste={(e) => onPaste(e, r, c)} onDrop={(e) => e.preventDefault()}
                        spellCheck={false} autoComplete="off" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
