// LibreOffice (LOWA) लोडर: एकदाच डाउनलोड (Cache Storage मध्ये जतन), gzip उघडणे, मराठी fonts, सुरू करणे.
const BASE = '/lowa/';
const CACHE = 'lowa-24.2-efaf0670';
const FONTS = ['NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari-Bold.ttf', 'NotoSerifDevanagari-Regular.ttf', 'NotoSerifDevanagari-Bold.ttf'];
export const DOWNLOAD_MB = 82;

// संगणक LibreOffice चालवू शकतो का?
export function checkDevice() {
  const issues = [];
  if (!window.crossOriginIsolated) issues.push('ब्राउझर isolation सुरू झाले नाही — पान पुन्हा उघडा (Chrome / Edge वापरा).');
  if (typeof WebAssembly === 'undefined') issues.push('हा ब्राउझर WebAssembly चालवत नाही.');
  if (!('DecompressionStream' in window)) issues.push('ब्राउझर जुना आहे — Chrome / Edge अद्ययावत करा.');
  const mem = navigator.deviceMemory;
  const warn = [];
  if (mem && mem < 4) warn.push(`या संगणकात RAM कमी आहे (${mem} GB). LibreOffice संथ चालू शकते.`);
  if (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) warn.push('मोबाईलवर LibreOffice नीट चालत नाही — संगणक / laptop वापरा.');
  return { ok: !issues.length, issues, warn };
}

async function fetchCached(url, onBytes) {
  let cache = null;
  try { cache = await caches.open(CACHE); } catch { /* private mode */ }
  let res = cache ? await cache.match(url) : null;
  if (res) { const b = await res.arrayBuffer(); onBytes?.(b.byteLength, true); return b; }
  res = await fetch(url);
  if (!res.ok) throw new Error(`${url} — ${res.status}`);
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length;
    onBytes?.(value.length, false);
  }
  const buf = await new Blob(chunks).arrayBuffer();
  if (cache) { try { await cache.put(url, new Response(buf)); } catch { /* जागा नाही */ } }
  return buf;
}

async function gunzip(buf) {
  const u = new Uint8Array(buf, 0, 2);
  if (u[0] !== 0x1f || u[1] !== 0x8b) return buf; // आधीच उघडलेले (server ने decode केले)
  return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
}

// जुन्या आवृत्तीचे cache काढा
async function cleanOld() {
  try { for (const k of await caches.keys()) if (k.startsWith('lowa-') && k !== CACHE) await caches.delete(k); } catch { /* ignore */ }
}

/**
 * LibreOffice सुरू करा. onProgress({ phase, loaded, total }) — total MB अंदाजे.
 * परत: { port, FS } — port वर office_thread.js शी संदेश.
 */
export async function startLowa(canvas, onProgress) {
  cleanOld();
  const total = DOWNLOAD_MB * 1024 * 1024;
  let loaded = 0;
  const tick = (n, cached) => { loaded += n; onProgress?.({ phase: cached ? 'cache' : 'download', loaded, total }); };
  const [wasmGz, dataGz, ...fonts] = await Promise.all([
    fetchCached(BASE + 'soffice.wasm.gz', tick),
    fetchCached(BASE + 'soffice.data.gz', tick),
    ...FONTS.map((f) => fetchCached(BASE + 'fonts/' + f)),
  ]);
  onProgress?.({ phase: 'unpack', loaded: total, total });
  const [wasmBuf, dataBuf] = await Promise.all([gunzip(wasmGz), gunzip(dataGz)]);
  onProgress?.({ phase: 'start', loaded: total, total });

  return new Promise((resolve, reject) => {
    const origin = location.origin;
    window.Module = {
      canvas,
      uno_scripts: [origin + BASE + 'zeta.js', origin + BASE + 'office_thread.js?v=14'],
      locateFile: (p) => origin + BASE + p,
      mainScriptUrlOrBlob: new Blob([`importScripts('${origin}${BASE}soffice.js');`], { type: 'text/javascript' }),
      getPreloadedPackage: () => dataBuf,
      instantiateWasm: (imports, receive) => {
        WebAssembly.instantiate(wasmBuf, imports).then((r) => receive(r.instance, r.module)).catch(reject);
        return {};
      },
      preRun: [() => {
        // मराठी (देवनागरी) fonts — मूळ build मध्ये नाहीत
        window.FS.mkdirTree('/usr/share/fonts/truetype');
        FONTS.forEach((f, i) => window.FS.writeFile('/usr/share/fonts/truetype/' + f, new Uint8Array(fonts[i])));
        window.FS.mkdirTree('/tmp/office');
      }],
      onAbort: (w) => reject(new Error('LibreOffice थांबले: ' + w)),
    };
    const s = document.createElement('script');
    s.src = BASE + 'soffice.js';
    s.onerror = () => reject(new Error('soffice.js लोड झाले नाही'));
    s.onload = () => window.Module.uno_main.then((port) => {
      port.addEventListener('message', function first(e) {
        if (e.data.cmd === 'thr_running') { port.removeEventListener('message', first); resolve({ port, FS: window.FS }); }
      });
      port.start();
    }, reject);
    document.body.appendChild(s);
  });
}

// thread ला आदेश पाठवून उत्तराची वाट पहा
export function ask(port, msg, replyCmd, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => { port.removeEventListener('message', h); reject(new Error('LibreOffice ने उत्तर दिले नाही')); }, timeout);
    function h(e) {
      if (e.data.cmd === 'error') { clearTimeout(t); port.removeEventListener('message', h); reject(new Error(e.data.msg)); }
      else if (e.data.cmd === replyCmd) { clearTimeout(t); port.removeEventListener('message', h); resolve(e.data); }
    }
    port.addEventListener('message', h);
    port.postMessage(msg);
  });
}

export const b64FromBytes = (u8) => {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
};
export const bytesFromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
