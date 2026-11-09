import { useCallback, useEffect, useRef, useState } from 'react';
import { KINDS, fmtClock } from '../../lib/practice';

// वेळ: limit दिल्यास उलटी मोजणी (वेळ संपल्यावर onUp), नाहीतर वाढती
export function useClock(limit, onUp) {
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);
  const startAt = useRef(0);
  const upRef = useRef(onUp);
  upRef.current = onUp;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - startAt.current) / 1000);
      if (limit && s >= limit) { setSec(limit); setRunning(false); upRef.current?.(); }
      else setSec(s);
    }, 250);
    return () => clearInterval(t);
  }, [running, limit]);
  const start = useCallback(() => { setRunning((r) => { if (!r) startAt.current = Date.now() - sec * 1000; return true; }); }, [sec]);
  const stop = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => { setRunning(false); setSec(0); }, []);
  // अचूक सेकंद (सादर करताना)
  const exact = () => (running ? (Date.now() - startAt.current) / 1000 : sec);
  return { sec, running, start, stop, reset, exact, display: fmtClock(limit ? Math.max(0, limit - sec) : sec) };
}

// पूर्ण स्क्रीन सराव: वरची पट्टी (बाहेर, शीर्षक, आकडे, वेळ, Reset, सादर करा) + काम
export default function Shell({ ex, clock, countdown, stats = [], onExit, onReset, onSubmit, submitLabel = 'सादर करा', canSubmit = true, submitNote, children, result }) {
  useEffect(() => {
    const o = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = o; };
  }, []);
  const k = KINDS[ex.kind] || {};
  return (
    <div className={'px-shell px-' + ex.kind} role="dialog" aria-modal="true">
      <header className="px-bar">
        <button className="px-exit" onClick={onExit}>← बाहेर</button>
        <div className="px-title"><b>{ex.title}</b><span>{k.icon} {k.short}</span></div>
        <div className="px-stats">
          {stats.map(([l, v]) => <div key={l}><span>{l}</span><b>{v}</b></div>)}
          {clock && <div className="px-clock"><span>{countdown ? 'शिल्लक वेळ' : 'वेळ'}</span><b>{clock.display}</b></div>}
        </div>
        {onReset && <button className="px-btn ghost" onClick={onReset}>↺ Reset</button>}
        {onSubmit && <button className="px-btn" disabled={!canSubmit} title={submitNote || ''} onClick={onSubmit}>{submitLabel}</button>}
      </header>
      <div className="px-body">{children}</div>
      {result}
    </div>
  );
}

// निकाल: आकडे + सुचवलेले गुण; पुन्हा सराव / बाहेर
export function ResultCard({ title = 'सराव पूर्ण 🎉', rows, saved, saving, error, canSubmit, onSubmit, onAgain, onExit, note }) {
  return (
    <div className="px-result-bg">
      <div className="px-result">
        <h2>{title}</h2>
        <div className="px-result-grid">
          {rows.map(([l, v]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
        </div>
        {note && <p className="small muted">{note}</p>}
        {error && <div className="alert err">{error}</div>}
        {saved ? (
          <div className="alert ok">✅ सादर झाले! शिक्षक तपासून गुण देतील. तुम्ही पुन्हा सराव करून सुधारित निकाल परत सादर करू शकता.</div>
        ) : canSubmit ? (
          <p className="small">हा निकाल शिक्षकांकडे तपासणीसाठी पाठवायचा?</p>
        ) : (
          <p className="small muted">हा सराव शिक्षकांनी आधीच तपासला आहे — हा निकाल फक्त तुमच्या सरावासाठी.</p>
        )}
        <div className="row" style={{ justifyContent: 'center' }}>
          {!saved && canSubmit && <button className="btn saffron" disabled={saving} onClick={onSubmit}>{saving ? 'पाठवत आहे…' : '📤 शिक्षकांकडे सादर करा'}</button>}
          <button className="btn light" onClick={onAgain}>🔁 पुन्हा सराव</button>
          <button className="btn light" onClick={onExit}>← बाहेर</button>
        </div>
      </div>
    </div>
  );
}

// सराव संपल्यावर निकाल दाखवणे व सादर करणे — सर्व प्रकारांसाठी एकच
export function useFinish({ onSubmit }) {
  const [res, setRes] = useState(null); // { metrics, work, rows }
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const finish = (r) => { setRes(r); setSaved(false); setError(''); };
  const submit = async () => {
    setSaving(true); setError('');
    try { await onSubmit(res.metrics, res.work); setSaved(true); } catch (e) { setError('सादर झाले नाही: ' + e.message); }
    finally { setSaving(false); }
  };
  return { res, finish, clear: () => setRes(null), submit, saving, saved, error };
}
