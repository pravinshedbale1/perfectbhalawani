import { useState } from 'react';

// ड्रॅग-अँड-ड्रॉप + ↑↓ बटणांनी क्रम बदलणारी यादी.
// items: [{id,...}], onReorder(newItems), renderItem(item, index, handle)
export default function Sortable({ items, onReorder, renderItem, type = 'item', className = '' }) {
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);

  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onReorder(next);
  };

  return (
    <div className={'sortable ' + className}>
      {items.map((it, i) => (
        <div
          key={it.id}
          className={'sort-item' + (drag === i ? ' dragging' : '') + (over === i && drag !== null && drag !== i ? ' over' : '')}
          draggable
          onDragStart={(e) => {
            setDrag(i);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify({ type, id: it.id }));
          }}
          onDragOver={(e) => { if (drag !== null) { e.preventDefault(); setOver(i); } }}
          onDragLeave={() => setOver((o) => (o === i ? null : o))}
          onDrop={(e) => { if (drag !== null) { e.preventDefault(); move(drag, i); } setDrag(null); setOver(null); }}
          onDragEnd={() => { setDrag(null); setOver(null); }}
        >
          {renderItem(it, i, {
            up: <button type="button" className="ord-btn" title="वर" aria-label="वर हलवा" disabled={i === 0} onClick={(e) => { e.stopPropagation(); move(i, i - 1); }}>▲</button>,
            down: <button type="button" className="ord-btn" title="खाली" aria-label="खाली हलवा" disabled={i === items.length - 1} onClick={(e) => { e.stopPropagation(); move(i, i + 1); }}>▼</button>,
            grip: <span className="grip" title="ओढून क्रम बदला" aria-hidden="true">⋮⋮</span>,
          })}
        </div>
      ))}
    </div>
  );
}
