// Impress (PowerPoint / LibreOffice Impress सारखे) — Fabric.js (MIT) वर आधारित slide editor
import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, StaticCanvas, Textbox, Rect, Circle, Triangle, Ellipse, Line, Polygon, FabricImage, ActiveSelection } from 'fabric';
import { SLIDE_W, SLIDE_H, parseDeck } from '../../lib/office';

const FONTS = ['Calibri', 'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Courier New', 'Impact', 'Noto Sans Devanagari'];
const THEMES = [
  { name: 'Office', bg: '#ffffff', title: '#1f2937', text: '#374151', accent: '#2563eb', font: 'Calibri' },
  { name: 'Navy', bg: '#0b2545', title: '#ffffff', text: '#dbe7f5', accent: '#f4a259', font: 'Calibri' },
  { name: 'Saffron', bg: '#fff4e6', title: '#b45309', text: '#3f2d1c', accent: '#f47920', font: 'Georgia' },
  { name: 'Green', bg: '#ecfdf3', title: '#14532d', text: '#1f3d2b', accent: '#16a34a', font: 'Trebuchet MS' },
  { name: 'Dark', bg: '#111827', title: '#facc15', text: '#e5e7eb', accent: '#38bdf8', font: 'Arial' },
  { name: 'Purple', bg: '#f5f3ff', title: '#5b21b6', text: '#312e81', accent: '#7c3aed', font: 'Verdana' },
];
const uid = () => Math.random().toString(36).slice(2, 9);

const tb = (text, o, t) => new Textbox(text, { fontFamily: t.font, fill: t.text, fontSize: 28, width: 820, left: 70, ...o });
function layoutObjects(kind, t) {
  if (kind === 'title') return [
    tb('Click to add title', { top: 170, fontSize: 54, fontWeight: 'bold', textAlign: 'center', fill: t.title }, t),
    tb('Click to add subtitle', { top: 300, fontSize: 28, textAlign: 'center' }, t),
  ];
  if (kind === 'content') return [
    tb('Click to add title', { top: 36, fontSize: 40, fontWeight: 'bold', fill: t.title }, t),
    tb('• First point\n• Second point\n• Third point', { top: 130, fontSize: 28, lineHeight: 1.4 }, t),
  ];
  if (kind === 'two') return [
    tb('Click to add title', { top: 36, fontSize: 40, fontWeight: 'bold', fill: t.title }, t),
    tb('• Point\n• Point', { top: 140, width: 390, fontSize: 26, lineHeight: 1.4 }, t),
    tb('• Point\n• Point', { top: 140, left: 500, width: 390, fontSize: 26, lineHeight: 1.4 }, t),
  ];
  if (kind === 'section') return [
    new Rect({ left: 0, top: 230, width: SLIDE_W, height: 8, fill: t.accent, selectable: true }),
    tb('Section title', { top: 150, fontSize: 48, fontWeight: 'bold', fill: t.title }, t),
    tb('Short description', { top: 260, fontSize: 24 }, t),
  ];
  if (kind === 'titleonly') return [tb('Click to add title', { top: 36, fontSize: 40, fontWeight: 'bold', fill: t.title }, t)];
  return [];
}

async function renderSlideImage(slide, w = 240) {
  const el = document.createElement('canvas');
  const sc = new StaticCanvas(el, { width: SLIDE_W, height: SLIDE_H, renderOnAddRemove: false });
  await sc.loadFromJSON(slide.json || { objects: [] });
  sc.backgroundColor = slide.bg || '#ffffff';
  sc.renderAll();
  const url = sc.toDataURL({ format: 'png', multiplier: w / SLIDE_W });
  sc.dispose();
  return url;
}

function downscale(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// ---------------- फक्त पाहण्यासाठी (Admin / संदर्भ) ----------------
export function ImpressViewer({ json, width = 480 }) {
  const [imgs, setImgs] = useState([]);
  const [show, setShow] = useState(null);
  useEffect(() => {
    let off = false;
    const d = parseDeck(json);
    Promise.all(d.slides.map((s) => renderSlideImage(s, 960))).then((u) => !off && setImgs(u));
    return () => { off = true; };
  }, [json]);
  if (!parseDeck(json).slides.length) return <p className="small muted">Slides नाहीत.</p>;
  return (
    <div className="imp-viewer">
      {imgs.map((u, i) => (
        <figure key={i} onClick={() => setShow(i)} style={{ width }}><img src={u} alt={`Slide ${i + 1}`} /><figcaption>Slide {i + 1}</figcaption></figure>
      ))}
      {show !== null && <SlideShow images={imgs} start={show} onClose={() => setShow(null)} />}
    </div>
  );
}

function SlideShow({ images, start = 0, onClose }) {
  const [i, setI] = useState(start);
  useEffect(() => {
    const k = (e) => {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) setI((x) => Math.min(images.length - 1, x + 1));
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) setI((x) => Math.max(0, x - 1));
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [images.length, onClose]);
  return (
    <div className="imp-show" onClick={() => (i < images.length - 1 ? setI(i + 1) : onClose())}>
      <img src={images[i]} alt="" />
      <div className="imp-show-bar" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setI(Math.max(0, i - 1))}>◀</button> {i + 1} / {images.length} <button onClick={() => setI(Math.min(images.length - 1, i + 1))}>▶</button>
        <button onClick={onClose}>✕ Esc</button>
      </div>
    </div>
  );
}

// ---------------- संपादक ----------------
export default function ImpressEditor({ json, onChange, onFirstInput, height = 620, readOnly }) {
  const host = useRef(null);
  const el = useRef(null);
  const cv = useRef(null);
  const deck = useRef(null);
  const cur = useRef(0);
  const hist = useRef({ stack: [], idx: -1, lock: false });
  const changed = useRef(false);
  const cb = useRef({ onChange, onFirstInput });
  cb.current = { onChange, onFirstInput };
  const [, force] = useState(0);
  const [thumbs, setThumbs] = useState([]);
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState('home');
  const [show, setShow] = useState(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const rerender = () => force((x) => x + 1);

  const emit = useCallback(() => {
    if (readOnly) return;
    if (!changed.current) { changed.current = true; cb.current.onFirstInput?.(); }
    cb.current.onChange?.(JSON.stringify(deck.current));
  }, []);

  const saveCurrent = useCallback(() => {
    const c = cv.current;
    if (!c || !deck.current.slides[cur.current]) return;
    const j = c.toObject(['selectable']);
    delete j.background;
    deck.current.slides[cur.current].json = j;
  }, []);

  const refreshThumb = useCallback(async (i = cur.current) => {
    const s = deck.current.slides[i];
    if (!s) return;
    const u = await renderSlideImage(s, 200);
    setThumbs((t) => { const n = [...t]; n[i] = u; return n; });
  }, []);

  const pushHist = useCallback(() => {
    const h = hist.current;
    if (h.lock) return;
    const j = JSON.stringify(cv.current.toObject(['selectable']));
    h.stack = h.stack.slice(0, h.idx + 1);
    h.stack.push(j);
    if (h.stack.length > 40) h.stack.shift();
    h.idx = h.stack.length - 1;
  }, []);

  const commit = useCallback(() => {
    saveCurrent();
    pushHist();
    emit();
    refreshThumb();
    rerender();
  }, [saveCurrent, pushHist, emit, refreshThumb]);

  const loadSlide = useCallback(async (i) => {
    const c = cv.current;
    const s = deck.current.slides[i];
    cur.current = i;
    hist.current = { stack: [], idx: -1, lock: true };
    c.discardActiveObject();
    await c.loadFromJSON(s.json || { objects: [] });
    c.backgroundColor = s.bg || '#ffffff';
    if (readOnly) {
      c.selection = false;
      c.getObjects().forEach((o) => o.set({ lockMovementX: true, lockMovementY: true, lockScalingX: true, lockScalingY: true, lockRotation: true, hasControls: false, editable: false, hoverCursor: 'pointer' }));
    }
    c.renderAll();
    hist.current.lock = false;
    pushHist();
    setSel(null);
    rerender();
  }, [pushHist]);

  // canvas आकार (उपलब्ध रुंदीनुसार zoom)
  const fit = useCallback(() => {
    const c = cv.current, h = host.current;
    if (!c || !h) return;
    const w = Math.max(320, h.clientWidth - 24);
    const availH = h.clientHeight > 100 ? h.clientHeight - 34 : (typeof height === 'number' ? height - 110 : 480);
    const z = Math.max(0.2, Math.min(w / SLIDE_W, availH / SLIDE_H));
    c.setDimensions({ width: Math.round(SLIDE_W * z), height: Math.round(SLIDE_H * z) });
    c.setZoom(z);
    c.renderAll();
  }, [height]);

  useEffect(() => {
    const d = parseDeck(json);
    if (!d.slides.length) d.slides = [{ id: uid(), bg: '#ffffff', json: null }];
    deck.current = d;
    const c = new Canvas(el.current, { width: SLIDE_W, height: SLIDE_H, preserveObjectStacking: true, backgroundColor: '#fff' });
    cv.current = c;
    const onSel = () => setSel(c.getActiveObject() || null);
    c.on('selection:created', onSel); c.on('selection:updated', onSel); c.on('selection:cleared', onSel);
    c.on('object:modified', () => commit());
    c.on('text:changed', () => { saveCurrent(); emit(); });
    c.on('text:editing:exited', () => commit());
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host.current);
    (async () => {
      // पहिला slide जतन नसल्यास Title layout
      if (!d.slides[0].json && !readOnly) {
        c.add(...layoutObjects('title', THEMES[0]));
        d.slides[0].json = c.toObject(['selectable']);
      }
      await loadSlide(0);
      const all = await Promise.all(d.slides.map((s) => renderSlideImage(s, 200)));
      setThumbs(all);
    })();
    return () => { ro.disconnect(); c.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // कीबोर्ड: Delete, Ctrl+Z / Y, Ctrl+D
  useEffect(() => {
    const k = (e) => {
      const c = cv.current;
      if (!c || !host.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      const a = c.getActiveObject();
      if (a?.isEditing || readOnly) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && a) { e.preventDefault(); removeSel(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && a) { e.preventDefault(); dup(); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  // ---------- slide क्रिया ----------
  const go = async (i) => { saveCurrent(); refreshThumb(); await loadSlide(i); };
  const addSlide = async (kind) => {
    saveCurrent();
    const c = cv.current;
    const s = { id: uid(), bg: theme.bg, json: null };
    const tmp = new StaticCanvas(document.createElement('canvas'), { width: SLIDE_W, height: SLIDE_H });
    tmp.add(...layoutObjects(kind, theme));
    s.json = tmp.toObject(['selectable']);
    tmp.dispose();
    deck.current.slides.splice(cur.current + 1, 0, s);
    setThumbs((t) => { const n = [...t]; n.splice(cur.current + 1, 0, ''); return n; });
    await loadSlide(cur.current + 1);
    c.renderAll();
    emit(); refreshThumb();
  };
  const dupSlide = async () => {
    saveCurrent();
    const s = JSON.parse(JSON.stringify(deck.current.slides[cur.current]));
    s.id = uid();
    deck.current.slides.splice(cur.current + 1, 0, s);
    setThumbs((t) => { const n = [...t]; n.splice(cur.current + 1, 0, t[cur.current]); return n; });
    await loadSlide(cur.current + 1); emit();
  };
  const delSlide = async () => {
    if (deck.current.slides.length <= 1) return alert('किमान एक slide हवी.');
    if (!confirm(`Slide ${cur.current + 1} हटवायची?`)) return;
    deck.current.slides.splice(cur.current, 1);
    setThumbs((t) => t.filter((_, i) => i !== cur.current));
    await loadSlide(Math.min(cur.current, deck.current.slides.length - 1)); emit();
  };
  const moveSlide = async (d) => {
    const i = cur.current, j = i + d;
    if (j < 0 || j >= deck.current.slides.length) return;
    saveCurrent();
    const a = deck.current.slides;
    [a[i], a[j]] = [a[j], a[i]];
    setThumbs((t) => { const n = [...t]; [n[i], n[j]] = [n[j], n[i]]; return n; });
    cur.current = j; emit(); rerender();
  };

  // ---------- घटक जोडा ----------
  const add = (obj) => {
    const c = cv.current;
    c.add(obj); c.setActiveObject(obj); c.renderAll(); commit();
  };
  const addText = (title) => add(tb(title ? 'Title' : 'Text', { left: 200, top: 200, width: 520, fontSize: title ? 40 : 26, fontWeight: title ? 'bold' : 'normal', fill: title ? theme.title : theme.text }, theme));
  const shapes = {
    rect: () => new Rect({ left: 330, top: 190, width: 300, height: 160, fill: theme.accent, stroke: '', strokeWidth: 0 }),
    rounded: () => new Rect({ left: 330, top: 190, width: 300, height: 160, rx: 22, ry: 22, fill: theme.accent }),
    circle: () => new Circle({ left: 400, top: 190, radius: 80, fill: theme.accent }),
    ellipse: () => new Ellipse({ left: 360, top: 200, rx: 130, ry: 75, fill: theme.accent }),
    triangle: () => new Triangle({ left: 400, top: 180, width: 170, height: 150, fill: theme.accent }),
    line: () => new Line([300, 270, 660, 270], { stroke: theme.text, strokeWidth: 4 }),
    arrow: () => new Polygon([{ x: 0, y: 30 }, { x: 200, y: 30 }, { x: 200, y: 0 }, { x: 270, y: 55 }, { x: 200, y: 110 }, { x: 200, y: 80 }, { x: 0, y: 80 }], { left: 345, top: 215, fill: theme.accent }),
    star: () => new Polygon(Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 40 : 95, a = (Math.PI / 5) * i - Math.PI / 2; return { x: 95 + r * Math.cos(a), y: 95 + r * Math.sin(a) }; }), { left: 385, top: 175, fill: '#f59e0b' }),
  };
  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => {
      const f = input.files[0];
      if (!f) return;
      const url = await downscale(f);
      const img = await FabricImage.fromURL(url);
      const k = Math.min(1, 480 / img.width, 320 / img.height);
      img.set({ left: 240, top: 110, scaleX: k, scaleY: k });
      add(img);
    };
    input.click();
  };
  const addTable = () => {
    const r = Number(prompt('ओळी (rows)?', '3')) || 0, cnum = Number(prompt('स्तंभ (columns)?', '3')) || 0;
    if (!r || !cnum || r > 12 || cnum > 8) return;
    const w = Math.min(800, cnum * 180), cw = w / cnum, rh = 44, x0 = (SLIDE_W - w) / 2, y0 = 140;
    const c = cv.current;
    const objs = [];
    for (let i = 0; i < r; i++) for (let j = 0; j < cnum; j++) {
      objs.push(new Rect({ left: x0 + j * cw, top: y0 + i * rh, width: cw, height: rh, fill: i === 0 ? theme.accent : '#ffffff', stroke: '#94a3b8', strokeWidth: 1 }));
      objs.push(new Textbox(i === 0 ? `Heading ${j + 1}` : '', { left: x0 + j * cw + 6, top: y0 + i * rh + 9, width: cw - 12, fontSize: 18, fontFamily: theme.font, fill: i === 0 ? '#fff' : '#111', fontWeight: i === 0 ? 'bold' : 'normal' }));
    }
    c.add(...objs); c.renderAll(); commit();
  };

  // ---------- निवडलेल्या घटकाचे formatting ----------
  const setProp = (k, v) => {
    const c = cv.current, a = c.getActiveObject();
    if (!a) return;
    const list = a instanceof ActiveSelection ? a.getObjects() : [a];
    list.forEach((o) => {
      if (o.isEditing && o.getSelectionStyles && o.selectionStart !== o.selectionEnd && ['fontWeight', 'fontStyle', 'underline', 'fill', 'fontSize', 'fontFamily'].includes(k)) o.setSelectionStyles({ [k]: v });
      else o.set(k, v);
    });
    c.renderAll(); commit();
  };
  const toggle = (k, on, off) => sel && setProp(k, sel[k] === on ? off : on);
  const removeSel = () => {
    const c = cv.current, a = c.getActiveObject();
    if (!a) return;
    (a instanceof ActiveSelection ? a.getObjects() : [a]).forEach((o) => c.remove(o));
    c.discardActiveObject(); c.renderAll(); commit();
  };
  const dup = async () => {
    const c = cv.current, a = c.getActiveObject();
    if (!a) return;
    const cl = await a.clone();
    cl.set({ left: a.left + 24, top: a.top + 24 });
    add(cl);
  };
  const order = (fn) => { const c = cv.current, a = c.getActiveObject(); if (!a) return; c[fn](a); c.renderAll(); commit(); };
  const undo = async () => {
    const h = hist.current; if (h.idx <= 0) return;
    h.idx--; h.lock = true;
    await cv.current.loadFromJSON(JSON.parse(h.stack[h.idx]));
    cv.current.backgroundColor = deck.current.slides[cur.current].bg; cv.current.renderAll();
    h.lock = false; saveCurrent(); emit(); refreshThumb();
  };
  const redo = async () => {
    const h = hist.current; if (h.idx >= h.stack.length - 1) return;
    h.idx++; h.lock = true;
    await cv.current.loadFromJSON(JSON.parse(h.stack[h.idx]));
    cv.current.backgroundColor = deck.current.slides[cur.current].bg; cv.current.renderAll();
    h.lock = false; saveCurrent(); emit(); refreshThumb();
  };

  // ---------- Design ----------
  const setBg = (color, all) => {
    (all ? deck.current.slides : [deck.current.slides[cur.current]]).forEach((s) => { s.bg = color; });
    cv.current.backgroundColor = color; cv.current.renderAll();
    emit();
    if (all) Promise.all(deck.current.slides.map((s) => renderSlideImage(s, 200))).then(setThumbs); else refreshThumb();
    rerender();
  };
  const applyTheme = async (t) => {
    setTheme(t);
    saveCurrent();
    deck.current.slides.forEach((s) => {
      s.bg = t.bg;
      (s.json?.objects || []).forEach((o) => {
        if (/text/i.test(o.type)) { o.fontFamily = t.font; o.fill = o.fontWeight === 'bold' || o.fontSize >= 36 ? t.title : t.text; }
      });
    });
    await loadSlide(cur.current);
    emit();
    setThumbs(await Promise.all(deck.current.slides.map((s) => renderSlideImage(s, 200))));
  };

  const present = async (from) => {
    saveCurrent();
    const imgs = await Promise.all(deck.current.slides.map((s) => renderSlideImage(s, 1280)));
    setShow({ imgs, from });
  };

  const isText = sel && /text/i.test(sel.type);
  const n = deck.current?.slides.length || 0;

  return (
    <div className="imp" style={{ height }}>
      {readOnly ? (
        <div className="imp-ribbon ro">
          {sel ? (
            <>
              <span>🔍 निवडलेला घटक:</span>
              {isText ? (
                <>
                  <span className="chip"><b>{sel.fontFamily}</b></span>
                  <span className="chip"><b>{Math.round(sel.fontSize * (sel.scaleY || 1))}</b> size</span>
                  {sel.fontWeight === 'bold' && <span className="chip on"><b>Bold</b></span>}
                  {sel.fontStyle === 'italic' && <span className="chip on"><i>Italic</i></span>}
                  {sel.underline && <span className="chip on"><u>Underline</u></span>}
                  <span className="chip">Align: {sel.textAlign}</span>
                  <span className="chip"><i className="sw" style={{ background: sel.fill }} /> अक्षर रंग {String(sel.fill)}</span>
                </>
              ) : (
                <>
                  <span className="chip">{({ rect: 'Rectangle', circle: 'Circle', ellipse: 'Oval', triangle: 'Triangle', line: 'Line', polygon: 'Shape', image: 'Picture' })[String(sel.type).toLowerCase()] || sel.type}</span>
                  {typeof sel.fill === 'string' && sel.fill && <span className="chip"><i className="sw" style={{ background: sel.fill }} /> Fill {sel.fill}</span>}
                  {sel.stroke && sel.strokeWidth > 0 && <span className="chip">Outline {sel.stroke} · {sel.strokeWidth}px</span>}
                </>
              )}
            </>
          ) : <span>👆 slide मधील text / आकारावर क्लिक करा — त्याचा Font, Size, रंग, Bold इ. इथे दिसेल. Slide background: <i className="sw" style={{ background: deck.current?.slides[cur.current]?.bg }} /> {deck.current?.slides[cur.current]?.bg}</span>}
          <span style={{ flex: 1 }} />
          <button onClick={() => present(cur.current)}>▶ Slide Show</button>
        </div>
      ) : (<>
      <div className="imp-tabs">
        {[['home', 'Home'], ['insert', 'Insert'], ['design', 'Design'], ['show', 'Slide Show']].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="imp-ribbon">
        {tab === 'home' && (
          <>
            <select title="New Slide" value="" onChange={(e) => { if (e.target.value) addSlide(e.target.value); }}>
              <option value="">➕ New Slide</option>
              <option value="title">Title Slide</option><option value="content">Title and Content</option><option value="two">Two Content</option>
              <option value="section">Section Header</option><option value="titleonly">Title Only</option><option value="blank">Blank</option>
            </select>
            <button onClick={dupSlide} title="Duplicate slide">⧉ Slide</button>
            <button onClick={delSlide} title="Delete slide">🗑 Slide</button>
            <span className="sep" />
            <button onClick={undo} title="Undo (Ctrl+Z)">↶</button>
            <button onClick={redo} title="Redo (Ctrl+Y)">↷</button>
            <span className="sep" />
            <select disabled={!isText} value={sel?.fontFamily || ''} onChange={(e) => setProp('fontFamily', e.target.value)} title="Font">
              <option value="" disabled>Font</option>{FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <select disabled={!isText} value={sel?.fontSize || ''} onChange={(e) => setProp('fontSize', Number(e.target.value))} title="Size">
              <option value="" disabled>Size</option>{[12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 54, 66, 80].map((s) => <option key={s}>{s}</option>)}
            </select>
            <button disabled={!isText} className={sel?.fontWeight === 'bold' ? 'on' : ''} onClick={() => toggle('fontWeight', 'bold', 'normal')}><b>B</b></button>
            <button disabled={!isText} className={sel?.fontStyle === 'italic' ? 'on' : ''} onClick={() => toggle('fontStyle', 'italic', 'normal')}><i>I</i></button>
            <button disabled={!isText} className={sel?.underline ? 'on' : ''} onClick={() => toggle('underline', true, false)}><u>U</u></button>
            <button disabled={!isText} className={sel?.linethrough ? 'on' : ''} onClick={() => toggle('linethrough', true, false)}><s>S</s></button>
            <label className="imp-color" title={isText ? 'Font color' : 'Fill color'}>{isText ? 'A' : '🪣'}<input type="color" disabled={!sel} value={typeof sel?.fill === 'string' && sel.fill.startsWith('#') ? sel.fill : '#000000'} onChange={(e) => setProp('fill', e.target.value)} /></label>
            {isText && ['left', 'center', 'right', 'justify'].map((a) => <button key={a} className={sel?.textAlign === a ? 'on' : ''} onClick={() => setProp('textAlign', a)} title={a}>{{ left: '⬅', center: '↔', right: '➡', justify: '☰' }[a]}</button>)}
            {isText && <select value={sel?.lineHeight || 1.16} onChange={(e) => setProp('lineHeight', Number(e.target.value))} title="Line spacing">{[1, 1.16, 1.3, 1.5, 2].map((x) => <option key={x} value={x}>↕ {x}</option>)}</select>}
            <span className="sep" />
            <label className="imp-color" title="Outline color">▭<input type="color" disabled={!sel} value={sel?.stroke && String(sel.stroke).startsWith('#') ? sel.stroke : '#000000'} onChange={(e) => { setProp('stroke', e.target.value); if (!sel?.strokeWidth) setProp('strokeWidth', 2); }} /></label>
            <select disabled={!sel} value={sel?.strokeWidth || 0} onChange={(e) => setProp('strokeWidth', Number(e.target.value))} title="Outline width">{[0, 1, 2, 3, 5, 8].map((w) => <option key={w} value={w}>{w ? `${w}px` : 'No line'}</option>)}</select>
            <select disabled={!sel} value={sel?.opacity ?? 1} onChange={(e) => setProp('opacity', Number(e.target.value))} title="Transparency">{[1, 0.8, 0.6, 0.4, 0.2].map((o) => <option key={o} value={o}>{Math.round(o * 100)}%</option>)}</select>
            <span className="sep" />
            <button disabled={!sel} onClick={() => order('bringObjectForward')} title="Bring forward">⬆</button>
            <button disabled={!sel} onClick={() => order('sendObjectBackwards')} title="Send backward">⬇</button>
            <button disabled={!sel} onClick={dup} title="Duplicate (Ctrl+D)">⧉</button>
            <button disabled={!sel} onClick={removeSel} title="Delete">🗑</button>
          </>
        )}
        {tab === 'insert' && (
          <>
            <button onClick={() => addText(true)}>🅃 Title</button>
            <button onClick={() => addText(false)}>📝 Text Box</button>
            <button onClick={addImage}>🖼 Picture</button>
            <button onClick={addTable}>▦ Table</button>
            <span className="sep" />
            {[['rect', '▭ Rectangle'], ['rounded', '▢ Rounded'], ['circle', '◯ Circle'], ['ellipse', '⬭ Oval'], ['triangle', '△ Triangle'], ['line', '― Line'], ['arrow', '➜ Arrow'], ['star', '★ Star']].map(([k, l]) => (
              <button key={k} onClick={() => add(shapes[k]())}>{l}</button>
            ))}
          </>
        )}
        {tab === 'design' && (
          <>
            {THEMES.map((t) => (
              <button key={t.name} className="imp-theme" style={{ background: t.bg, color: t.title, borderColor: t.accent }} onClick={() => applyTheme(t)}>Aa <small>{t.name}</small></button>
            ))}
            <span className="sep" />
            <label className="imp-color" title="Slide background">Background<input type="color" value={deck.current?.slides[cur.current]?.bg || '#ffffff'} onChange={(e) => setBg(e.target.value, false)} /></label>
            <button onClick={() => setBg(deck.current.slides[cur.current].bg, true)}>Apply to all</button>
          </>
        )}
        {tab === 'show' && (
          <>
            <button onClick={() => present(0)}>▶ From Beginning</button>
            <button onClick={() => present(cur.current)}>▶ From Current Slide</button>
            <span className="small muted">→ / Space पुढे, ← मागे, Esc बाहेर</span>
          </>
        )}
      </div>
      </>)}
      <div className="imp-main">
        <div className="imp-thumbs">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className={'imp-thumb' + (i === cur.current ? ' on' : '')} onClick={() => i !== cur.current && go(i)}>
              <span>{i + 1}</span>{thumbs[i] ? <img src={thumbs[i]} alt="" /> : <div className="ph" />}
            </div>
          ))}
          {!readOnly && <div className="imp-thumb-act">
            <button onClick={() => addSlide('content')} title="New slide">＋</button>
            <button onClick={() => moveSlide(-1)} title="Move up">▲</button>
            <button onClick={() => moveSlide(1)} title="Move down">▼</button>
          </div>}
        </div>
        <div className="imp-stage" ref={host}>
          <div className="imp-canvas"><canvas ref={el} /></div>
          <div className="small muted imp-hint">Slide {cur.current + 1} / {n}{readOnly ? ' · नमुना (फक्त पाहण्यासाठी)' : ' · मजकूर बदलण्यासाठी text box वर double-click करा · Delete = काढा · Ctrl+Z = Undo'}</div>
        </div>
      </div>
      {show && <SlideShow images={show.imgs} start={show.from} onClose={() => setShow(null)} />}
    </div>
  );
}
