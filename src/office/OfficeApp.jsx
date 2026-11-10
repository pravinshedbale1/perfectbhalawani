import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../lib/auth';
import { KINDS, submitPractice, fmtClock } from '../lib/practice';
import { uploadWorkFile } from '../lib/api';
import { compareOffice } from '../lib/lowaCompare';
import { parseDeck } from '../lib/office';
import { ResultCard } from '../components/practice/Shell';
import { MetricsTable } from '../components/practice';
import { startLowa, checkDevice, ask, b64FromBytes, bytesFromB64, DOWNLOAD_MB } from './lowa';

const EXT = { writer: 'odt', calc: 'ods', impress: 'odp' };
const MIME = { odt: 'application/vnd.oasis.opendocument.text', ods: 'application/vnd.oasis.opendocument.spreadsheet', odp: 'application/vnd.oasis.opendocument.presentation' };
const HTML_FILTER = { writer: 'HTML (StarWriter)', calc: 'HTML (StarCalc)', impress: 'HTML (StarWriter)' };
const MAX_FIRESTORE = 700 * 1024;
const BAR_H = 52;
const q = new URLSearchParams(location.search);
const MODE = q.get('mode') || 'practice'; // practice | ref | view

// ---------- अपूर्ण कामाचा मसुदा (या संगणकावर, IndexedDB) ----------
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('lo-drafts', 1); r.onupgradeneeded = () => r.result.createObjectStore('d'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const draftOp = async (mode, key, val) => {
  try {
    const db = await idb();
    return await new Promise((res, rej) => {
      const tx = db.transaction('d', mode === 'get' ? 'readonly' : 'readwrite');
      const st = tx.objectStore('d');
      const r = mode === 'get' ? st.get(key) : mode === 'put' ? st.put(val, key) : st.delete(key);
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  } catch { return null; }
};

function download(bytes, name, ext) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([bytes], { type: MIME[ext] }));
  a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export default function OfficeApp() {
  const auth = useAuth();
  const canvas = useRef(null);
  const lowa = useRef(null);
  const [ex, setEx] = useState(null);
  const [sub, setSub] = useState(null);
  const [mod, setMod] = useState(null);
  const [phase, setPhase] = useState('auth'); // auth | data | check | load | open | ready | error
  const [prog, setProg] = useState(null);
  const [err, setErr] = useState('');
  const [warn, setWarn] = useState([]);
  const [hasRef, setHasRef] = useState(false);
  const [showRef, setShowRef] = useState(MODE !== 'ref');
  const [sec, setSec] = useState(0);
  const [result, setResult] = useState(null); // { metrics, rows, info }
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [saveErr, setSaveErr] = useState('');
  const [busy, setBusy] = useState('');
  const t0 = useRef(0);
  const snapT = useRef(null);
  const relayoutRef = useRef(null);
  const [lastDraft, setLastDraft] = useState(null);
  const draftKey = () => `${auth.user?.uid}|${ex?.id}`;

  const exId = q.get('ex'), subId = q.get('sub');
  const kind = ex?.kind;

  // ---------- माहिती ----------
  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) { setErr('कृपया आधी लॉगिन करा.'); setPhase('error'); return; }
    if (MODE === 'ref' && auth.role !== 'admin') { setErr('फक्त Admin संदर्भ बदलू शकतो.'); setPhase('error'); return; }
    (async () => {
      setPhase('data');
      let s = null, e;
      if (MODE === 'view') {
        const sd = await getDoc(doc(db, 'submissions', subId));
        if (!sd.exists()) throw new Error('सादरीकरण सापडले नाही.');
        s = { id: sd.id, ...sd.data() };
      }
      const ed = await getDoc(doc(db, 'exercises', exId || s?.exerciseId));
      if (!ed.exists()) throw new Error('सराव सापडला नाही.');
      e = { id: ed.id, ...ed.data() };
      if (!['writer', 'calc', 'impress'].includes(e.kind)) throw new Error('हा सराव LibreOffice प्रकाराचा नाही.');
      if (MODE === 'practice' && auth.role === 'student') {
        const pd = await getDoc(doc(db, 'submissions', `${auth.profile.id}_${e.id}`)).catch(() => null);
        if (pd?.exists()) s = { id: pd.id, ...pd.data() };
        if (e.moduleId) { const md = await getDoc(doc(db, 'modules', e.moduleId)).catch(() => null); if (md?.exists()) setMod({ id: md.id, ...md.data() }); }
      }
      setEx(e); setSub(s);
      document.title = `${e.title} — LibreOffice`;
      const d = checkDevice();
      setWarn(d.warn);
      if (!d.ok) { setErr(d.issues.join(' ')); setPhase('error'); return; }
      sessionStorage.removeItem('coiReload');
      setPhase('load');
    })().catch((x) => { setErr(x.message); setPhase('error'); });
  }, [auth.loading, auth.user, auth.role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- LibreOffice सुरू ----------
  useEffect(() => {
    if (phase !== 'load' || !ex) return;
    (async () => {
      const L = await startLowa(canvas.current, setProg);
      lowa.current = L;
      setPhase('open');
      const ext = EXT[ex.kind];
      let ref = null;
      if (ex.refFile) {
        L.FS.writeFile(`/tmp/office/ref.${ext}`, bytesFromB64(ex.refFile));
        ref = { url: `file:///tmp/office/ref.${ext}` };
      } else if (ex.kind === 'calc' && ex.refBook) {
        ref = { build: 'calc', data: JSON.parse(ex.refBook) };
      } else if (ex.kind === 'impress' && parseDeck(ex.refDeck).slides.length) {
        ref = { build: 'impress', data: parseDeck(ex.refDeck) };
      } else if (ex.sampleHtml) {
        L.FS.writeFile('/tmp/office/ref.html', new TextEncoder().encode(`<html><head><meta charset="utf-8"></head><body>${ex.sampleHtml}</body></html>`));
        ref = { url: 'file:///tmp/office/ref.html', filter: HTML_FILTER[ex.kind] };
      }
      let work = null;
      if (MODE === 'practice') {
        const dr = await draftOp('get', `${auth.user.uid}|${ex.id}`);
        if (dr?.bytes && confirm(`या सरावाचे तुमचे अपूर्ण काम या संगणकावर जतन आहे (${new Date(dr.at).toLocaleString('en-IN')}).\nते पुढे चालू करायचे?\n\n"Cancel" दाबल्यास नवीन रिकामा दस्तऐवज उघडेल.`)) {
          L.FS.writeFile(`/tmp/office/work.${ext}`, dr.bytes);
          work = { url: `file:///tmp/office/work.${ext}` };
          setLastDraft(dr.at);
        }
      }
      if (MODE === 'view') {
        if (!sub?.work?.file) throw new Error('या सादरीकरणाची फाइल Drive मध्ये आहे — मूल्यांकन पानावरील Drive लिंकने उघडा.');
        L.FS.writeFile(`/tmp/office/work.${ext}`, bytesFromB64(sub.work.file));
        work = { url: `file:///tmp/office/work.${ext}` };
      }
      // LibreOffice कडून येणारे संदेश: मसुदा जतन (Ctrl+S / File → Save), खिडकी बंद
      L.port.addEventListener('message', (e) => {
        if (e.data.cmd === 'draft') onDraft.current?.();
        if (e.data.cmd === 'closed' && !e.data.isRef) alert('दस्तऐवज बंद झाला — पान पुन्हा उघडा (Reload).');
        if (e.data.cmd === 'error') console.error('LibreOffice:', e.data.msg);
        if (e.data.cmd === 'snap') { clearTimeout(snapT.current); snapT.current = setTimeout(() => relayoutRef.current?.(), 350); }
      });
      const r = await ask(L.port, { cmd: 'open', mode: MODE, kind: ex.kind, ref, work, showRef: MODE !== 'ref', split: ex.kind === 'impress' ? 0.5 : 0.42, dpr: window.devicePixelRatio || 1, w: canvas.current.clientWidth, h: canvas.current.clientHeight }, 'ui_ready', 180000);
      setHasRef(r.hasRef);
      // Qt सुरुवातीला खिडक्यांचा आकार बदलतो — थोड्या वेळाने पुन्हा मांडणी
      [400, 1200, 3000].forEach((t) => setTimeout(() => window.dispatchEvent(new Event('resize')), t));
      t0.current = Date.now();
      setPhase('ready');
    })().catch((x) => { setErr(x.message); setPhase('error'); });
  }, [phase, ex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- वेळ / आकार ----------
  useEffect(() => {
    if (phase !== 'ready' || MODE !== 'practice') return;
    const t = setInterval(() => setSec(Math.floor((Date.now() - t0.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);
  const split = () => (ex?.kind === 'impress' ? 0.5 : 0.42);
  // (relayoutRef — LibreOffice ने खिडकी हलल्याचे कळवल्यावर ताज्या स्थितीने मांडणी)
  const relayout = (sr = showRef) => lowa.current?.port.postMessage({ cmd: 'layout', showRef: sr, split: split(), dpr: window.devicePixelRatio || 1, w: canvas.current.clientWidth, h: canvas.current.clientHeight });

  relayoutRef.current = () => relayout();

  // Ctrl+S / File → Save / "जतन" बटण: विद्यार्थी → मसुदा (या संगणकावर); Admin → संदर्भ जतन
  const onDraft = useRef(null);
  onDraft.current = async () => {
    if (MODE === 'ref') { saveRef(); return; }
    if (MODE !== 'practice') return;
    try {
      const bytes = lowa.current.FS.readFile(`/tmp/office/draft.${EXT[kind]}`);
      const at = Date.now();
      await draftOp('put', draftKey(), { bytes, at });
      setLastDraft(at);
    } catch { /* ignore */ }
  };
  const saveDraft = () => lowa.current?.port.postMessage({ cmd: 'save_draft' });
  useEffect(() => {
    if (phase !== 'ready' || MODE !== 'practice' || saved) return;
    const t = setInterval(saveDraft, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, [phase, saved]);
  useEffect(() => {
    if (phase !== 'ready') return;
    let tm;
    const on = () => { clearTimeout(tm); tm = setTimeout(() => relayout(), 250); };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleRef = () => { const n = !showRef; setShowRef(n); relayout(n); };

  // ---------- पूर्ण करा (विद्यार्थी) ----------
  const finish = async () => {
    setBusy('तपासत आहे…');
    try {
      const L = lowa.current;
      const inf = await ask(L.port, { cmd: 'extract', kind }, 'extracted', 60000);
      const seconds = Math.max(1, Math.round((Date.now() - t0.current) / 1000));
      const cmp = inf.ref ? compareOffice(kind, inf.ref, inf.work) : { accuracy: null };
      const metrics = { ...cmp, seconds, engine: 'libreoffice' };
      if (kind === 'impress') metrics.slides = inf.work?.slides?.length ?? metrics.slides;
      if (kind === 'writer' && metrics.typedWords === undefined) metrics.typedWords = (inf.work?.paras || []).reduce((a, p) => a + String(p.text || '').split(/\s+/).filter(Boolean).length, 0);
      const rows = [['एकूण अचूकता', metrics.accuracy != null ? metrics.accuracy + '%' : 'शिक्षक तपासतील']];
      if (kind === 'writer') rows.push(['मजकूर अचूकता', metrics.textAccuracy != null ? metrics.textAccuracy + '%' : '—'], ['Formatting', metrics.formatting?.total ? `${metrics.formatting.matched}/${metrics.formatting.total}` : '—'], ['शब्द', `${metrics.typedWords ?? 0}${metrics.totalWords ? '/' + metrics.totalWords : ''}`]);
      if (kind === 'calc' && metrics.values) rows.push(['मूल्ये', `${metrics.values.ok}/${metrics.values.total}`], ['सूत्रे', metrics.formulas.total ? `${metrics.formulas.ok}/${metrics.formulas.total}` : '—'], ['Formatting', metrics.format.total ? `${metrics.format.ok}/${metrics.format.total}` : '—']);
      if (kind === 'impress') rows.push(['Slides', metrics.refSlides ? `${metrics.slides}/${metrics.refSlides}` : metrics.slides]);
      rows.push(['वेळ', fmtClock(seconds)]);
      setSaved(null); setSaveErr('');
      setResult({ metrics, rows });
    } catch (x) { alert('तपासणी झाली नाही: ' + x.message); }
    finally { setBusy(''); }
  };
  const note = result?.metrics?.formatting?.missing?.length ? 'राहिलेले formatting: ' + result.metrics.formatting.missing.join(', ')
    : result?.metrics?.badCells?.length ? 'तपासा: ' + result.metrics.badCells.join(', ') : '';

  const submit = async () => {
    setSaving(true); setSaveErr('');
    try {
      const L = lowa.current, ext = EXT[kind];
      await ask(L.port, { cmd: 'save', kind, url: `file:///tmp/office/out.${ext}` }, 'saved', 60000);
      const bytes = L.FS.readFile(`/tmp/office/out.${ext}`);
      const fileName = `${auth.profile.loginId || 'student'}_${ex.title}`.replace(/[^\wऀ-ॿ-]+/g, '_').slice(0, 70) + '.' + ext;
      const b64 = b64FromBytes(bytes);
      const work = { ext, fileName, size: bytes.length };
      if (b64.length <= MAX_FIRESTORE) work.file = b64;
      else {
        const up = await uploadWorkFile({ student: auth.profile, exercise: ex, base64: b64, fileName, mimeType: MIME[ext] });
        work.driveUrl = up.url; work.driveId = up.fileId;
      }
      const r = await submitPractice({ student: auth.profile, exercise: ex, module: mod, metrics: result.metrics, work, prev: sub });
      setSaved(r);
      draftOp('del', draftKey());
    } catch (x) { setSaveErr('सादर झाले नाही: ' + x.message); }
    finally { setSaving(false); }
  };

  // ---------- संदर्भ जतन (Admin) ----------
  const saveRef = async () => {
    setBusy('जतन होत आहे…');
    try {
      const L = lowa.current, ext = EXT[kind];
      await ask(L.port, { cmd: 'save', kind, url: `file:///tmp/office/out.${ext}` }, 'saved', 60000);
      const b64 = b64FromBytes(L.FS.readFile(`/tmp/office/out.${ext}`));
      if (b64.length > MAX_FIRESTORE) throw new Error('संदर्भ फाइल खूप मोठी आहे (700 KB पेक्षा जास्त). मोठी चित्रे लहान करा.');
      await updateDoc(doc(db, 'exercises', ex.id), { refFile: b64, refFileExt: ext, refUpdatedAt: serverTimestamp() });
      alert('संदर्भ जतन झाला ✅ विद्यार्थ्यांना हाच नमुना दिसेल व याच्याशी तुलना करून गुण मिळतील.');
    } catch (x) { alert(x.message); }
    finally { setBusy(''); }
  };
  const dl = async () => {
    const L = lowa.current, ext = EXT[kind];
    await ask(L.port, { cmd: 'save', kind, url: `file:///tmp/office/dl.${ext}` }, 'saved', 60000);
    download(L.FS.readFile(`/tmp/office/dl.${ext}`), `${ex.title}.${ext}`.replace(/[^\wऀ-ॿ.-]+/g, '_'), ext);
  };

  const exit = () => {
    if (MODE === 'practice' && phase === 'ready' && !saved && !confirm('सादर न करता बाहेर जायचे? केलेले काम जतन होणार नाही.')) return;
    if (MODE === 'practice') location.href = '/student/exercises' + (ex ? '?ex=' + ex.id : '');
    else if (MODE === 'ref') { if (window.opener) window.close(); else location.href = '/admin/exercises'; }
    else history.length > 1 ? history.back() : window.close();
  };
  const canSubmit = !(sub?.status === 'evaluated' && sub.auto !== true);
  const k = KINDS[kind] || { icon: '🖥️', short: 'LibreOffice' };

  return (
    <div className="lo-app">
      <header className="lo-bar" style={{ height: BAR_H }}>
        <button className="px-exit" onClick={exit}>← बाहेर</button>
        <div className="px-title">
          <b>{ex?.title || 'LibreOffice'}</b>
          <span>{k.icon} {k.short} · {MODE === 'ref' ? 'संदर्भ / नमुना संपादन (Admin)' : MODE === 'view' ? `${sub?.studentName || ''} — सादरीकरण (फक्त पाहणे)` : 'LibreOffice सराव'}</span>
        </div>
        {phase === 'ready' && hasRef && <button className="px-btn ghost" onClick={toggleRef}>{showRef ? '📘 नमुना लपवा' : '📘 नमुना दाखवा'}</button>}
        {phase === 'ready' && MODE === 'practice' && (
          <button className="px-btn ghost" onClick={saveDraft} title="Ctrl+S — काम या संगणकावर जतन होते (सादर होत नाही)">
            💾 जतन{lastDraft ? ` · ${new Date(lastDraft).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </button>
        )}
        {phase === 'ready' && MODE === 'practice' && <div className="px-clock"><span>वेळ</span><b>{fmtClock(sec)}</b></div>}
        {phase === 'ready' && MODE !== 'practice' && <button className="px-btn ghost" onClick={dl}>⬇️ डाउनलोड</button>}
        {phase === 'ready' && MODE === 'practice' && <button className="px-btn" disabled={!!busy} onClick={finish}>{busy || '✓ पूर्ण करा'}</button>}
        {phase === 'ready' && MODE === 'ref' && <button className="px-btn" disabled={!!busy} onClick={saveRef}>{busy || '💾 संदर्भ जतन करा'}</button>}
      </header>

      <div className="lo-stage" style={{ height: `calc(100vh - ${BAR_H}px)` }}>
        <canvas id="qtcanvas" ref={canvas} contentEditable suppressContentEditableWarning
          onContextMenu={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()}
          style={{ visibility: phase === 'ready' ? 'visible' : 'hidden' }} />
        {phase !== 'ready' && (
          <div className="lo-load">
            {phase === 'error' ? (
              <div className="lo-card">
                <h2>⚠️ LibreOffice सुरू झाले नाही</h2>
                <p>{err}</p>
                <div className="row" style={{ justifyContent: 'center' }}>
                  <button className="btn" onClick={() => location.reload()}>🔁 पुन्हा प्रयत्न</button>
                  <button className="btn light" onClick={exit}>← बाहेर</button>
                </div>
              </div>
            ) : (
              <div className="lo-card">
                <img src="/logo.png" alt="" width="90" height="90" />
                <h2>LibreOffice सुरू होत आहे…</h2>
                {prog?.phase === 'download' && (
                  <>
                    <div className="px-progress"><div style={{ width: Math.min(100, (prog.loaded / prog.total) * 100) + '%' }} /></div>
                    <p className="small">पहिल्यांदा LibreOffice डाउनलोड होत आहे: {Math.round(prog.loaded / 1048576)} / {DOWNLOAD_MB} MB. पुढच्या वेळी हे लगेच उघडेल.</p>
                  </>
                )}
                {prog?.phase === 'cache' && <p className="small">संगणकात जतन केलेले LibreOffice उघडत आहे…</p>}
                {prog?.phase === 'unpack' && <p className="small">फाइल्स उघडत आहे…</p>}
                {(prog?.phase === 'start' || phase === 'open') && <p className="small">Writer / Calc / Impress सुरू होत आहे… (10–30 सेकंद)</p>}
                {(phase === 'auth' || phase === 'data') && <p className="small">माहिती लोड होत आहे…</p>}
                {warn.map((w) => <p key={w} className="small" style={{ color: 'var(--warn)' }}>⚠ {w}</p>)}
                <div className="spinner" />
              </div>
            )}
          </div>
        )}
        {result && (
          <ResultCard maxMarks={ex.maxMarks || 10} rows={result.rows} note={note} saved={saved} saving={saving} error={saveErr}
            canSubmit={canSubmit} onSubmit={submit} onAgain={() => setResult(null)} onExit={exit} />
        )}
        {MODE === 'view' && sub?.metrics && phase === 'ready' && (
          <details className="lo-metrics"><summary>📊 आकडे</summary><MetricsTable kind={sub.kind} m={sub.metrics} /></details>
        )}
      </div>
    </div>
  );
}
