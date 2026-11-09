// Office सराव (Writer / Calc / Impress) — जतन, तुलना व डाउनलोड
import { api } from '@fortune-sheet/core';
import { compareWords, words } from './practice';

// ---------------- Calc workbook ----------------
const KEEP = ['name', 'order', 'config', 'frozen', 'images', 'luckysheet_conditionformat_save', 'hyperlink', 'dataVerification', 'calcChain', 'zoomRatio', 'color'];

export function parseBook(json) {
  let sheets = [];
  try { sheets = json ? JSON.parse(json) : []; } catch { sheets = []; }
  if (!Array.isArray(sheets) || !sheets.length) sheets = [{ name: 'Sheet1', celldata: [], order: 0 }];
  return sheets.map((s, i) => ({ ...s, id: s.id || `s${i + 1}`, order: s.order ?? i, status: i === 0 ? 1 : 0 }));
}

// Workbook (data matrix) → लहान JSON (फक्त भरलेले cells)
export function serializeBook(sheets) {
  const out = (sheets || []).map((s, i) => {
    const o = {};
    KEEP.forEach((k) => { if (s[k] !== undefined && s[k] !== null) o[k] = s[k]; });
    o.order = s.order ?? i;
    o.celldata = s.data ? api.dataToCelldata(s.data).filter((c) => c.v !== null && c.v !== undefined) : (s.celldata || []);
    return o;
  });
  return JSON.stringify(out);
}

const cellText = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'object') return String(v);
  if (v.m !== undefined && v.m !== null) return String(v.m);
  if (v.v !== undefined && v.v !== null) return String(v.v);
  if (v.ct?.s) return v.ct.s.map((x) => x.v).join('');
  return '';
};
const normCell = (s) => String(s).trim().replace(/\s+/g, ' ').replace(/,/g, '').toLowerCase();
const colName = (c) => { let s = ''; c += 1; while (c) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };

// संदर्भ workbook शी तुलना: मूल्ये (70%), सूत्रे (20%), formatting (10%)
export function compareCalc(refJson, gotJson) {
  const ref = parseBook(refJson), got = parseBook(gotJson);
  let vTot = 0, vOk = 0, fTot = 0, fOk = 0, sTot = 0, sOk = 0;
  const bad = [];
  ref.forEach((rs, si) => {
    const gs = got[si] || { celldata: [] };
    const gmap = new Map((gs.celldata || []).map((c) => [`${c.r}_${c.c}`, c.v]));
    (rs.celldata || []).forEach(({ r, c, v }) => {
      const t = cellText(v);
      const g = gmap.get(`${r}_${c}`);
      const addr = (ref.length > 1 ? `${rs.name}!` : '') + colName(c) + (r + 1);
      if (t !== '') {
        vTot++;
        if (normCell(cellText(g)) === normCell(t)) vOk++; else bad.push(addr);
      }
      if (v && typeof v === 'object') {
        if (v.f) { fTot++; if (g && typeof g === 'object' && g.f) fOk++; else if (!bad.includes(addr)) bad.push(addr + ' (सूत्र)'); }
        ['bl', 'it', 'un', 'fc', 'bg', 'ht'].forEach((k) => {
          if (v[k] !== undefined && v[k] !== null && v[k] !== 0 && v[k] !== '#000000' && v[k] !== '') {
            sTot++;
            if (g && typeof g === 'object' && String(g[k]) === String(v[k])) sOk++;
          }
        });
      }
    });
    const rm = Object.keys(rs.config?.merge || {}), gm = gs.config?.merge || {};
    rm.forEach((k) => { sTot++; if (gm[k]) sOk++; });
    if (rs.config?.borderInfo?.length) { sTot++; if (gs.config?.borderInfo?.length) sOk++; }
  });
  const part = (ok, tot) => (tot ? ok / tot : null);
  const parts = [[part(vOk, vTot), 0.7], [part(fOk, fTot), 0.2], [part(sOk, sTot), 0.1]].filter(([p]) => p !== null);
  const wsum = parts.reduce((a, [, w]) => a + w, 0);
  const accuracy = wsum ? Math.round((parts.reduce((a, [p, w]) => a + p * w, 0) / wsum) * 100) : 100;
  return { accuracy, values: { ok: vOk, total: vTot }, formulas: { ok: fOk, total: fTot }, format: { ok: sOk, total: sTot }, bad: bad.slice(0, 40), errors: vTot - vOk + (fTot - fOk) };
}

// .xlsx म्हणून डाउनलोड (मूल्ये + सूत्रे)
export async function downloadXlsx(json, name) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  parseBook(json).forEach((s) => {
    const ws = {};
    let maxR = 0, maxC = 0;
    (s.celldata || []).forEach(({ r, c, v }) => {
      if (!v) return;
      const val = typeof v === 'object' ? v.v : v;
      const cell = { t: typeof val === 'number' ? 'n' : 'string' === typeof val ? 's' : 's', v: val ?? cellText(v) };
      if (typeof v === 'object' && v.f) cell.f = String(v.f).replace(/^=/, '');
      ws[XLSX.utils.encode_cell({ r, c })] = cell;
      maxR = Math.max(maxR, r); maxC = Math.max(maxC, c);
    });
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
    const merges = Object.values(s.config?.merge || {}).map((m) => ({ s: { r: m.r, c: m.c }, e: { r: m.r + m.rs - 1, c: m.c + m.cs - 1 } }));
    if (merges.length) ws['!merges'] = merges;
    XLSX.utils.book_append_sheet(wb, ws, String(s.name || 'Sheet').slice(0, 31));
  });
  XLSX.writeFile(wb, `${name}.xlsx`);
}

// Writer → .doc (Word मध्ये उघडते)
export function downloadDoc(html, name) {
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${name}</title></head><body>${html || ''}</body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿', doc], { type: 'application/msword' }));
  a.download = `${name}.doc`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// ---------------- Impress (slides) ----------------
export const SLIDE_W = 960, SLIDE_H = 540;
export function parseDeck(json) {
  try { const d = JSON.parse(json || ''); if (d?.slides?.length) return d; } catch { /* ignore */ }
  return { w: SLIDE_W, h: SLIDE_H, slides: [] };
}
const slideTexts = (s) => (s.json?.objects || []).filter((o) => /text/i.test(o.type)).map((o) => o.text || '').join(' ');
const countType = (s, re) => (s.json?.objects || []).filter((o) => re.test(o.type)).length;

// संदर्भाशी तुलना: slides संख्या, मजकूर (शब्दानुसार), चित्रे/आकार
export function compareDeck(refJson, gotJson) {
  const ref = parseDeck(refJson), got = parseDeck(gotJson);
  const rw = words(ref.slides.map(slideTexts).join(' ')), gw = words(got.slides.map(slideTexts).join(' '));
  const t = compareWords(rw, gw);
  const slidesScore = ref.slides.length ? Math.min(got.slides.length, ref.slides.length) / ref.slides.length : 1;
  const rImg = ref.slides.reduce((a, s) => a + countType(s, /image/i), 0), gImg = got.slides.reduce((a, s) => a + countType(s, /image/i), 0);
  const rShp = ref.slides.reduce((a, s) => a + countType(s, /rect|circle|triangle|ellipse|polygon|line|path/i), 0);
  const gShp = got.slides.reduce((a, s) => a + countType(s, /rect|circle|triangle|ellipse|polygon|line|path/i), 0);
  const objScore = rImg + rShp ? Math.min(1, (Math.min(gImg, rImg) + Math.min(gShp, rShp)) / (rImg + rShp)) : 1;
  const accuracy = Math.round((rw.length ? t.accuracy * 0.6 : 60) + slidesScore * 25 + objScore * 15);
  return { accuracy: Math.min(100, accuracy), slides: got.slides.length, refSlides: ref.slides.length, textAccuracy: rw.length ? t.accuracy : null, images: gImg, refImages: rImg, shapes: gShp, refShapes: rShp, errors: t.errors };
}

// ---------------- अंदाजे तुलना: संदर्भ file नसल्यास नमुना (HTML) वरून ----------------
const sampleDom = (html) => new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');

// Calc: नमुन्यातील table मधील मूल्ये विद्यार्थ्याच्या sheet मध्ये कुठेही आहेत का + सूत्रे वापरली का
export function compareCalcSample(sampleHtml, gotJson) {
  const d = sampleDom(sampleHtml);
  const want = [];
  let formulasWanted = 0;
  d.querySelectorAll('td,th').forEach((td) => {
    const t = (td.textContent || '').trim();
    if (!t) return;
    if (t.includes('=')) {
      formulasWanted++;
      const m = t.match(/=\s*([-\d.,]+)\s*$/); // "=D2*E2 = 7500" → 7500
      if (m && /\S\s*=/.test(t)) want.push(m[1]); // फक्त "सूत्र = उत्तर" प्रकारात उत्तर तपासा
      return;
    }
    want.push(t);
  });
  const cells = parseBook(gotJson).flatMap((s) => s.celldata || []);
  const have = new Map();
  cells.forEach(({ v }) => { const k = normCell(cellText(v)); if (k) have.set(k, (have.get(k) || 0) + 1); });
  let ok = 0;
  want.forEach((w) => { const k = normCell(w); const n = have.get(k); if (n) { ok++; have.set(k, n - 1); } });
  const fUsed = cells.filter(({ v }) => v && typeof v === 'object' && v.f).length;
  const vScore = want.length ? ok / want.length : 0;
  const fScore = formulasWanted ? Math.min(1, fUsed / formulasWanted) : null;
  const accuracy = Math.round((fScore === null ? vScore : vScore * 0.75 + fScore * 0.25) * 100);
  return { accuracy, approx: true, values: { ok, total: want.length }, formulas: { ok: Math.min(fUsed, formulasWanted), total: formulasWanted }, format: { ok: 0, total: 0 }, bad: [], errors: want.length - ok };
}

// Impress: नमुन्यातील महत्त्वाचे शब्द slides मध्ये आहेत का, slides संख्या, चित्रे/आकार
export function compareDeckSample(sampleHtml, gotJson) {
  const text = sampleDom(sampleHtml).body.textContent || '';
  const key = [...new Set(words(text.toLowerCase()).map((w) => w.replace(/[^\p{L}\p{N}]/gu, '')).filter((w) => w.length >= 4))];
  const got = parseDeck(gotJson);
  const gtext = new Set(words(got.slides.map(slideTexts).join(' ').toLowerCase()).map((w) => w.replace(/[^\p{L}\p{N}]/gu, '')));
  const hit = key.filter((w) => gtext.has(w)).length;
  const nums = [...text.matchAll(/slide\s*(\d+)/gi)].map((m) => Number(m[1]));
  const expected = Math.max(3, ...nums.filter((n) => n < 40), 0);
  const slidesScore = Math.min(1, got.slides.length / expected);
  const imgs = got.slides.reduce((a, s) => a + countType(s, /image/i), 0);
  const shapes = got.slides.reduce((a, s) => a + countType(s, /rect|circle|triangle|ellipse|polygon|line|path/i), 0);
  const textScore = key.length ? Math.min(1, hit / Math.max(8, key.length * 0.6)) : 1;
  const accuracy = Math.round((textScore * 0.5 + slidesScore * 0.35 + (imgs + shapes ? 0.15 : 0.05)) * 100);
  return { accuracy: Math.min(100, accuracy), approx: true, slides: got.slides.length, refSlides: expected, textAccuracy: Math.round(textScore * 100), images: imgs, refImages: 0, shapes, refShapes: 0, errors: 0 };
}
