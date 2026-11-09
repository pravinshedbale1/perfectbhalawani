import { useEffect, useRef, useState } from 'react';
import { SAMPLE_CSS } from '../seed/sampleCss';

// नमुना (Ready-Made Sample) सुरक्षितपणे दाखवा: sandboxed iframe (scripts बंद), स्वतःची CSS, उंची आपोआप
export const sampleDoc = (html) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>
body{margin:0;padding:14px;font-family:"Noto Sans Devanagari","Mukta",Arial,sans-serif;color:#172b45;background:#fff;line-height:1.5;overflow-wrap:anywhere}
img{max-width:100%;height:auto} table{border-collapse:collapse;max-width:100%} td,th{border:1px solid #b9c6d4;padding:6px 8px}
${SAMPLE_CSS}
</style></head><body>${html || ''}</body></html>`;

export default function SampleView({ html, maxHeight }) {
  const ref = useRef(null);
  const [h, setH] = useState(200);

  useEffect(() => {
    const f = ref.current;
    if (!f) return;
    let ro;
    const fit = () => {
      try {
        const b = f.contentDocument?.documentElement;
        if (b) setH(Math.max(120, b.scrollHeight + 4));
      } catch { /* ignore */ }
    };
    const onLoad = () => {
      fit();
      try {
        ro = new ResizeObserver(fit);
        ro.observe(f.contentDocument.body);
      } catch { /* ignore */ }
    };
    f.addEventListener('load', onLoad);
    return () => { f.removeEventListener('load', onLoad); ro?.disconnect(); };
  }, [html]);

  const print = () => {
    const w = window.open('', '_blank');
    if (!w) return alert('Print साठी browser popup परवानगी द्या.');
    w.document.write(sampleDoc(html).replace('</body>', '<script>onload=()=>print()<\/script></body>'));
    w.document.close();
  };

  return (
    <div className="sample-view">
      <iframe
        ref={ref}
        title="नमुना"
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        srcDoc={sampleDoc(html)}
        style={{ height: maxHeight ? Math.min(h, maxHeight) : h }}
      />
      <div className="sample-tools">
        <button type="button" className="btn sm light" onClick={print}>🖨️ Print / मोठा पहा</button>
      </div>
    </div>
  );
}
