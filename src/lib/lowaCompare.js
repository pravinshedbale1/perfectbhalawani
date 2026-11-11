// LibreOffice मधून वाचलेल्या माहितीची (office_thread.js → info) संदर्भाशी तुलना — आपोआप गुणांसाठी.
import { compareWords, words } from './practice';

const ALIGN = { 0: 'Left', 1: 'Right', 2: 'Justify', 3: 'Center', 4: 'Justify' };
const normT = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();

// परिच्छेदाचे प्रमुख formatting (सर्वाधिक अक्षरांचे)
function dominant(runs) {
  if (!runs?.length) return null;
  const by = {};
  runs.forEach((r) => { const k = JSON.stringify([r.font, r.size, r.bold, r.italic, r.ul]); by[k] = (by[k] || 0) + r.n; });
  const [font, size, bold, italic, ul] = JSON.parse(Object.entries(by).sort((a, b) => b[1] - a[1])[0][0]);
  return { font, size, bold, italic, ul };
}
const overlap = (a, b) => {
  const A = new Set(words(normT(a))), B = words(normT(b));
  if (!A.size || !B.length) return 0;
  return B.filter((w) => A.has(w)).length / Math.max(A.size, B.length);
};

// ---------------- Writer ----------------
export function compareWriter(ref, got) {
  const rParas = (ref?.paras || []).filter((p) => p.text?.trim());
  const gParas = (got?.paras || []).filter((p) => p.text?.trim());
  const t = compareWords(words(rParas.map((p) => p.text).join(' ')), words(gParas.map((p) => p.text).join(' ')));
  // प्रत्येक संदर्भ परिच्छेदासाठी सर्वात जुळणारा विद्यार्थ्याचा परिच्छेद (क्रम राखून)
  let total = 0, ok = 0, from = 0;
  const miss = {};
  const bad = (k) => { miss[k] = (miss[k] || 0) + 1; };
  rParas.forEach((rp) => {
    let best = -1, bs = 0.5;
    for (let i = from; i < gParas.length; i++) { const s = overlap(rp.text, gParas[i].text); if (s > bs) { bs = s; best = i; } if (s > 0.95) break; }
    const rd = dominant(rp.runs);
    const checks = [['align', rp.adjust !== 0]];
    if (rd) {
      checks.push(['font', true], ['size', true]);
      if (rd.bold) checks.push(['bold', true]);
      if (rd.italic) checks.push(['italic', true]);
      if (rd.ul) checks.push(['underline', true]);
    }
    if (/heading/i.test(rp.style)) checks.push(['heading', true]);
    const need = checks.filter(([, n]) => n).map(([k]) => k);
    total += need.length;
    if (best < 0) { need.forEach(bad); return; }
    from = best + 1;
    const gp = gParas[best], gd = dominant(gp.runs) || {};
    need.forEach((k) => {
      const pass = {
        align: (ALIGN[gp.adjust] || 'Left') === (ALIGN[rp.adjust] || 'Left'),
        font: normT(gd.font) === normT(rd.font),
        size: Math.abs((gd.size || 0) - rd.size) <= 0.5,
        bold: !!gd.bold, italic: !!gd.italic, underline: !!gd.ul,
        heading: /heading/i.test(gp.style),
      }[k];
      if (pass) ok++; else bad(k);
    });
  });
  // तक्ते, चित्रे, पान (margins / orientation / border)
  let extraTot = 0, extraOk = 0;
  if (ref?.tables) { extraTot++; if ((got?.tables || 0) >= ref.tables) extraOk++; else bad('table'); }
  if (ref?.images) { extraTot++; if ((got?.images || 0) >= ref.images) extraOk++; else bad('picture'); }
  if (ref?.page && got?.page) {
    const near = (a, b) => Math.abs(a - b) <= 200; // 2 mm
    const defaultMargins = [ref.page.left, ref.page.right, ref.page.top, ref.page.bottom].every((m) => near(m, 2000));
    if (ref.page.landscape) { extraTot++; if (got.page.landscape) extraOk++; else bad('landscape'); }
    if (!defaultMargins) { extraTot++; if (['left', 'right', 'top', 'bottom'].every((k) => near(got.page[k], ref.page[k]))) extraOk++; else bad('margins'); }
    if (ref.page.border) { extraTot++; if (got.page.border) extraOk++; else bad('page border'); }
  }
  const LABEL = { align: 'Alignment', font: 'Font', size: 'Font size', bold: 'Bold', italic: 'Italic', underline: 'Underline', heading: 'Heading style', table: 'Table', picture: 'चित्र', landscape: 'Landscape page', margins: 'Page margins', 'page border': 'Page border' };
  const fTot = total + extraTot, fOk = ok + extraOk;
  const fmtScore = fTot ? fOk / fTot : 1;
  const accuracy = rParas.length ? Math.round(t.accuracy * 0.6 + fmtScore * 100 * 0.4) : null;
  return {
    accuracy, textAccuracy: t.accuracy, errors: t.errors, correctWords: t.correct, wrongWords: t.wrong, missedWords: t.missed, extraWords: t.extra,
    typedWords: words(gParas.map((p) => p.text).join(' ')).length, totalWords: words(rParas.map((p) => p.text).join(' ')).length,
    formatting: { total: fTot, matched: fOk, missing: Object.entries(miss).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${LABEL[k] || k}${n > 1 ? ' ×' + n : ''}`).slice(0, 8), score: Math.round(fmtScore * 100) },
  };
}

// ---------------- Calc ----------------
const colName = (c) => { let s = ''; c += 1; while (c) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
const cellNorm = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').replace(/,/g, '').toLowerCase();
export function compareCalc2(ref, got) {
  let vTot = 0, vOk = 0, fTot = 0, fOk = 0, sTot = 0, sOk = 0;
  const bad = [];
  (ref?.sheets || []).forEach((rs, si) => {
    const gs = got?.sheets?.[si] || { cells: [] };
    const gm = new Map(gs.cells.map((c) => [`${c.r}_${c.c}`, c]));
    rs.cells.forEach((rc) => {
      const g = gm.get(`${rc.r}_${rc.c}`);
      const addr = ((ref.sheets.length > 1 ? rs.name + '!' : '') + colName(rc.c) + (rc.r + 1));
      if (rc.s !== '') { vTot++; if (g && cellNorm(g.s) === cellNorm(rc.s)) vOk++; else bad.push(addr); }
      if (rc.f) { fTot++; if (g?.f) fOk++; else if (!bad.includes(addr)) bad.push(addr + ' (सूत्र)'); }
      [['bold', rc.bold], ['italic', rc.italic], ['bg', rc.bg !== -1 && rc.bg !== 16777215], ['align', !/STANDARD|^0$/.test(rc.align)], ['merged', rc.merged]].forEach(([k, need]) => {
        if (!need) return;
        sTot++;
        if (g && String(g[k]) === String(rc[k])) sOk++;
      });
    });
  });
  const parts = [[vTot ? vOk / vTot : null, 0.7], [fTot ? fOk / fTot : null, 0.2], [sTot ? sOk / sTot : null, 0.1]].filter(([p]) => p !== null);
  const w = parts.reduce((a, [, x]) => a + x, 0);
  const accuracy = w ? Math.round((parts.reduce((a, [p, x]) => a + p * x, 0) / w) * 100) : null;
  return { accuracy, values: { ok: vOk, total: vTot }, formulas: { ok: fOk, total: fTot }, format: { ok: sOk, total: sTot }, badCells: bad.slice(0, 40), errors: vTot - vOk + fTot - fOk };
}

// ---------------- Impress ----------------
export function compareImpress(ref, got) {
  const rs = ref?.slides || [], gs = got?.slides || [];
  const rText = rs.flatMap((s) => s.shapes.map((x) => x.text)).join(' ');
  const gText = gs.flatMap((s) => s.shapes.map((x) => x.text)).join(' ');
  const t = compareWords(words(rText), words(gText));
  const count = (sl, re) => sl.reduce((a, s) => a + s.shapes.filter((x) => re.test(x.type)).length, 0);
  const IMG = /Graphic/i, SHP = /Rectangle|Ellipse|Polygon|Line|Custom|Connector/i;
  const rImg = count(rs, IMG), gImg = count(gs, IMG), rShp = count(rs, SHP), gShp = count(gs, SHP);
  const slidesScore = rs.length ? Math.min(gs.length, rs.length) / rs.length : 1;
  const objScore = rImg + rShp ? Math.min(1, (Math.min(gImg, rImg) + Math.min(gShp, rShp)) / (rImg + rShp)) : 1;
  // शीर्षकांचे font / size / bold
  let fTot = 0, fOk = 0;
  rs.forEach((s, i) => s.shapes.filter((x) => x.ch && x.text?.trim()).forEach((x) => {
    const g = gs[i]?.shapes.find((y) => y.ch && overlap(x.text, y.text) > 0.5);
    fTot += 3;
    if (g) { if (normT(g.ch.font) === normT(x.ch.font)) fOk++; if (Math.abs(g.ch.size - x.ch.size) <= 2) fOk++; if (g.ch.bold === x.ch.bold) fOk++; }
  }));
  const fmt = fTot ? fOk / fTot : 1;
  const accuracy = rs.length ? Math.round((rText.trim() ? t.accuracy * 0.45 : 45) + slidesScore * 25 + objScore * 15 + fmt * 15) : null;
  return { accuracy: accuracy === null ? null : Math.min(100, accuracy), slides: gs.length, refSlides: rs.length, textAccuracy: rText.trim() ? t.accuracy : null, images: gImg, refImages: rImg, shapes: gShp, refShapes: rShp, errors: t.errors, formatting: { total: fTot, matched: fOk, missing: [], score: Math.round(fmt * 100) } };
}

export const compareOffice = (kind, ref, got) => (kind === 'calc' ? compareCalc2(ref, got) : kind === 'impress' ? compareImpress(ref, got) : compareWriter(ref, got));
