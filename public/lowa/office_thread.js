// LibreOffice (LOWA) worker script — zetajs/UNO द्वारे दस्तऐवज उघडणे, मांडणी, formatting वाचणे, जतन.
// हा कोड LibreOffice च्या worker thread मध्ये चालतो; मुख्य पानाशी zetajs.mainPort ने संवाद.
'use strict';
let zetajs, css, desktop;
let refModel = null, workModel = null;
const P = (Name, Value) => new css.beans.PropertyValue({ Name, Value });
const post = (m) => zetajs.mainPort.postMessage(m);
const num = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v);
const str = (v) => String(num(v));

const FACTORY = { writer: 'swriter', calc: 'scalc', impress: 'simpress' };
const FILTER = { writer: 'writer8', calc: 'calc8', impress: 'impress8' };

function load(url, opts) {
  const props = [];
  if (opts.readOnly) props.push(P('ReadOnly', true));
  if (opts.filter) props.push(P('FilterName', opts.filter));
  return desktop.loadComponentFromURL(url, '_blank', 0, props);
}
function win(model) { return model.getCurrentController().getFrame().getContainerWindow(); }
let DPR = 1;
let L = null; // शेवटची मांडणी { w, h, showRef, split }
let placing = false;
// canvas आमच्या वरच्या पट्टीखाली 26px वर सरकवलेला असतो → खिडक्यांचे title bar (हलवणे/लहान/मोठे/बंद बटणे) दिसत नाहीत
const target = (which) => {
  const rw = Math.round(L.w * (L.split || 0.42));
  if (which === 'ref') return [0, 0, rw, L.h];
  return refModel && L.showRef ? [rw, 0, L.w - rw, L.h] : [0, 0, L.w, L.h];
};
// LibreOffice (Qt) खिडक्यांचे माप device pixels मध्ये — Retina (DPR 2) वर CSS माप × DPR
const settled = new Map(); // model → LibreOffice ने प्रत्यक्ष दिलेले माप (Qt उंची मर्यादित करू शकतो)
const geo = (wnd) => { const r = wnd.getPosSize(); return [r.X, r.Y, r.Width, r.Height]; };
function place(model, [x, y, w, h]) {
  const wnd = win(model);
  wnd.FullScreen = false;
  try { if (wnd.IsMaximized) wnd.IsMaximized = false; } catch (e) { /* ignore */ }
  try { if (wnd.IsMinimized) wnd.IsMinimized = false; } catch (e) { /* ignore */ }
  wnd.setPosSize(Math.round(x * DPR), Math.round(y * DPR), Math.round(w * DPR), Math.round(h * DPR), 15);
  settled.set(model, geo(wnd));
}
function layout(d) {
  if (!workModel) return;
  if (d) { DPR = d.dpr || DPR; L = { w: d.w, h: d.h, showRef: !!d.showRef, split: d.split }; }
  if (!L) return;
  placing = true;
  try {
    // नमुना "लपवणे" = खिडकी लपवत नाही (Qt WASM मध्ये पुन्हा दाखवताना अडकते); कामाची खिडकी पूर्ण रुंद करून पुढे आणतो
    if (refModel && L.showRef) place(refModel, target('ref'));
    place(workModel, target('work'));
    try { win(workModel).toFront(); } catch (e) { /* ignore */ }
    try { workModel.getCurrentController().getFrame().activate(); } catch (e) { /* ignore */ }
  } finally { placing = false; }
}
// आमच्या दोन दस्तऐवजांखेरीज इतर सर्व खिडक्या (Start Center इ.) लपवा
function hideOthers() {
  try {
    const frames = desktop.getFrames();
    for (let i = 0; i < frames.getCount(); i++) {
      const f = frames.getByIndex(i);
      let m = null;
      try { m = f.getController() && f.getController().getModel(); } catch (e) { /* ignore */ }
      const ours = m && ((workModel && zetajs.sameUnoObject(m, workModel)) || (refModel && zetajs.sameUnoObject(m, refModel)));
      if (!ours) { try { f.getContainerWindow().setVisible(false); } catch (e) { /* ignore */ } }
    }
  } catch (e) { /* ignore */ }
}
// विद्यार्थ्याने खिडकी हलवली / आकार बदलला / लहान-मोठी केली तर लगेच मूळ जागी परत
// फक्त खरोखर हलवले / आकार बदलला / लपले असल्यासच परत मांडणी (नाहीतर अनंत loop)
function moved(model) {
  if (!model) return false;
  const wnd = win(model);
  const want = settled.get(model);
  if (model === refModel && !L.showRef) return false; // झाकलेली असताना कुठेही असो
  if (!want) return false;
  const g = geo(wnd);
  return g.some((v, i) => Math.abs(v - want[i]) > 2);
}
// Qt च्या event मध्येच मांडणी केल्यास (ओढत असताना) अडकते — म्हणून मुख्य पानाला कळवा; ते थोड्या वेळाने 'layout' पाठवते
let snapAsked = false;
const snapBack = () => {
  if (placing || !L || snapAsked) return;
  try { if (moved(workModel) || moved(refModel)) { snapAsked = true; post({ cmd: 'snap' }); } } catch (e) { /* ignore */ }
};
function pinWindow(model) {
  const wnd = win(model);
  const wl = zetajs.unoObject([css.awt.XWindowListener], {
    windowResized: snapBack, windowMoved: snapBack, windowShown() {}, windowHidden() {}, disposing() {},
  });
  const tl = zetajs.unoObject([css.awt.XTopWindowListener], {
    windowOpened() {}, windowClosing() {}, windowClosed() {}, windowMinimized: snapBack, windowNormalized: snapBack,
    windowActivated() {}, windowDeactivated() {}, disposing() {},
  });
  try { wnd.addWindowListener(wl); } catch (e) { /* ignore */ }
  try { wnd.addTopWindowListener(tl); } catch (e) { /* ignore */ }
  return [wl, tl];
}

// ---------------- कुलूप: खिडकी बंद करणे / दुसरे app उघडणे / Save As इ. बंद ----------------
const BLOCK = new Set(['.uno:CloseDoc', '.uno:CloseWin', '.uno:Quit', '.uno:Exit', '.uno:NewDoc', '.uno:AddDirect', '.uno:Open',
  '.uno:OpenRemote', '.uno:OpenFromWriter', '.uno:OpenFromCalc', '.uno:OpenFromImpress', '.uno:OpenFromDraw', '.uno:OpenFromMath', '.uno:OpenTemplate',
  '.uno:StartCenter', '.uno:SaveAs', '.uno:SaveACopy', '.uno:SaveAll', '.uno:SaveRemote', '.uno:SaveAsRemote', '.uno:ExportTo', '.uno:ExportToPDF',
  '.uno:ExportDirectToPDF', '.uno:ExportToEPUB', '.uno:ExportDirectToEPUB', '.uno:SendMail', '.uno:SendMailDocAsPDF', '.uno:SendMailDocAsOOo',
  '.uno:SendMailDocAsMS', '.uno:SendToBluetooth', '.uno:NewWindow', '.uno:Reload', '.uno:VersionDialog', '.uno:RecentFileList', '.uno:ClearRecentFileList',
  '.uno:Logout', '.uno:ExtensionManager', '.uno:MacroDialog', '.uno:RunMacro', '.uno:BasicIDEAppear', '.uno:ScriptOrganizer', '.uno:OpenUrl',
  '.uno:WebHtml', '.uno:CloseDocs', '.uno:BackToStartCenter']);
const REF_ONLY_BLOCK = new Set(['.uno:EditDoc', '.uno:Save']);
const blocked = (c, isRef) => BLOCK.has(c) || (isRef && REF_ONLY_BLOCK.has(c)) || /^(private:factory|slot:55[0-9][0-9]|macro:|vnd\.sun\.star\.script:)/.test(c);
let onSave = null;
const saveDispatch = () => zetajs.unoObject([css.frame.XDispatch], {
  dispatch() { try { onSave && onSave(); } catch (e) { post({ cmd: 'error', msg: String(e) }); } },
  addStatusListener(l, url) { try { l.statusChanged(new css.frame.FeatureStateEvent({ FeatureURL: url, IsEnabled: true, Requery: false })); } catch (e) { /* ignore */ } },
  removeStatusListener() {},
});
function lockFrame(model, isRef) {
  const frame = model.getCurrentController().getFrame();
  let slave = null, master = null;
  const sd = saveDispatch();
  const ic = zetajs.unoObject([css.frame.XDispatchProviderInterceptor], {
    getSlaveDispatchProvider() { return slave; },
    setSlaveDispatchProvider(p) { slave = p; },
    getMasterDispatchProvider() { return master; },
    setMasterDispatchProvider(p) { master = p; },
    queryDispatch(url, target, flags) {
      const c = url.Complete;
      if (blocked(c, isRef)) return null;
      if (!isRef && c === '.uno:Save') return sd;
      return slave ? slave.queryDispatch(url, target, flags) : null;
    },
    queryDispatches(reqs) { return reqs.map((r) => (blocked(r.FeatureURL.Complete, isRef) ? null : slave ? slave.queryDispatch(r.FeatureURL, r.FrameName, r.SearchFlags) : null)); },
  });
  frame.registerDispatchProviderInterceptor(ic);
  const veto = zetajs.unoObject([css.util.XCloseListener], {
    queryClosing() { zetajs.throwUnoException(new css.util.CloseVetoException({ Message: 'सराव चालू असताना ही खिडकी बंद करता येत नाही' })); },
    notifyClosing() { post({ cmd: 'closed', isRef }); },
    disposing() {},
  });
  try { model.addCloseListener(veto); } catch (e) { /* ignore */ }
  try { frame.addCloseListener(veto); } catch (e) { /* ignore */ }
  return [ic, veto];
}
const keep = [];

// ---------------- संदर्भ बनवणे: Fortune-sheet JSON → Calc, Fabric JSON → Impress ----------------
const rgb = (hex) => (typeof hex === 'string' && /^#[0-9a-f]{6}$/i.test(hex) ? parseInt(hex.slice(1), 16) : null);
// UNO setFormula ला ';' विभाजक लागतो (अवतरणाबाहेरील ',' → ';')
function apiFormula(f) {
  let out = '', inq = false;
  for (const ch of String(f)) { if (ch === '"') inq = !inq; out += !inq && ch === ',' ? ';' : ch; }
  return out.startsWith('=') ? out : '=' + out;
}
function buildCalc(book) {
  const m = desktop.loadComponentFromURL('private:factory/scalc', '_blank', 0, [P('Hidden', true)]);
  const sheets = m.getSheets();
  (book || []).forEach((s, si) => {
    if (si > 0) sheets.insertNewByName(String(s.name || 'Sheet' + (si + 1)), si);
    const sh = sheets.getByIndex(si);
    if (si === 0 && s.name) { try { sh.setName(String(s.name)); } catch (e) { /* ignore */ } }
    (s.celldata || []).forEach(({ r, c, v }) => {
      if (v === null || v === undefined) return;
      const cell = sh.getCellByPosition(c, r);
      const o = typeof v === 'object' ? v : { v };
      if (o.f) cell.setFormula(apiFormula(o.f));
      else if (typeof o.v === 'number') cell.setValue(o.v);
      else if (o.v !== undefined && o.v !== null) cell.setString(String(o.v));
      else if (o.m !== undefined) cell.setString(String(o.m));
      if (o.bl) cell.setPropertyValue('CharWeight', 150);
      if (o.it) cell.setPropertyValue('CharPosture', css.awt.FontSlant.ITALIC);
      if (o.fs) cell.setPropertyValue('CharHeight', Number(o.fs));
      const bg = rgb(o.bg); if (bg !== null) cell.setPropertyValue('CellBackColor', bg);
      const fc = rgb(o.fc); if (fc !== null) cell.setPropertyValue('CharColor', fc);
      if (o.ht === 0) cell.setPropertyValue('HoriJustify', css.table.CellHoriJustify.CENTER);
      if (o.ht === 2) cell.setPropertyValue('HoriJustify', css.table.CellHoriJustify.RIGHT);
    });
    Object.values((s.config && s.config.merge) || {}).forEach((mg) => {
      try { sh.getCellRangeByPosition(mg.c, mg.r, mg.c + mg.cs - 1, mg.r + mg.rs - 1).merge(true); } catch (e) { /* ignore */ }
    });
    Object.entries((s.config && s.config.columnlen) || {}).forEach(([c, w]) => {
      try { sh.getColumns().getByIndex(Number(c)).setPropertyValue('Width', Math.round(Number(w) * 26.5)); } catch (e) { /* ignore */ }
    });
  });
  m.storeToURL('file:///tmp/office/ref.ods', [P('FilterName', 'calc8'), P('Overwrite', true)]);
  m.close(true);
  return 'file:///tmp/office/ref.ods';
}
function buildImpress(deck) {
  const m = desktop.loadComponentFromURL('private:factory/simpress', '_blank', 0, [P('Hidden', true)]);
  const pages = m.getDrawPages();
  const slides = (deck && deck.slides) || [];
  for (let i = 1; i < slides.length; i++) pages.insertNewByIndex(i - 1);
  slides.forEach((sl, i) => {
    const pg = pages.getByIndex(i);
    // layout मधील रिकामे placeholders काढा
    for (let k = pg.getCount() - 1; k >= 0; k--) pg.remove(pg.getByIndex(k));
    const W = pg.getPropertyValue('Width'), H = pg.getPropertyValue('Height');
    const k = W / 960;
    const add = (type, o, setup) => {
      const sh = m.createInstance('com.sun.star.drawing.' + type);
      pg.add(sh);
      sh.setPosition(new css.awt.Point({ X: Math.round(o.x * k), Y: Math.round(o.y * k) }));
      sh.setSize(new css.awt.Size({ Width: Math.max(10, Math.round(o.w * k)), Height: Math.max(10, Math.round(o.h * k)) }));
      setup(sh);
      return sh;
    };
    const bg = rgb(sl.bg);
    if (bg !== null && bg !== 0xffffff) add('RectangleShape', { x: 0, y: 0, w: 960, h: H / k }, (sh) => { sh.setPropertyValue('FillColor', bg); sh.setPropertyValue('LineStyle', css.drawing.LineStyle.NONE); });
    ((sl.json && sl.json.objects) || []).forEach((o) => {
      const t = String(o.type || '').toLowerCase();
      if (t === 'textbox' || t === 'i-text' || t === 'text') {
        const lines = String(o.text || '').split('\n').length;
        const fs = Number(o.fontSize || 28);
        add('TextShape', { x: o.left || 0, y: o.top || 0, w: o.width || 400, h: fs * (o.lineHeight || 1.16) * lines * 1.25 }, (sh) => {
          sh.setString(String(o.text || ''));
          sh.setPropertyValue('TextAutoGrowHeight', true);
          const cur = sh.getText().createTextCursor();
          cur.gotoStart(false); cur.gotoEnd(true);
          cur.setPropertyValue('CharHeight', Math.round(fs * 0.827));
          if (o.fontFamily) cur.setPropertyValue('CharFontName', String(o.fontFamily));
          if (o.fontWeight === 'bold') cur.setPropertyValue('CharWeight', 150);
          if (o.fontStyle === 'italic') cur.setPropertyValue('CharPosture', css.awt.FontSlant.ITALIC);
          const fc = rgb(o.fill); if (fc !== null) cur.setPropertyValue('CharColor', fc);
          const adj = { center: css.style.ParagraphAdjust.CENTER, right: css.style.ParagraphAdjust.RIGHT, justify: css.style.ParagraphAdjust.BLOCK }[o.textAlign];
          if (adj) cur.setPropertyValue('ParaAdjust', adj);
        });
      } else if (t === 'rect' || t === 'circle' || t === 'ellipse' || t === 'triangle' || t === 'polygon') {
        const w = (o.width || (o.radius || o.rx || 50) * 2) * (o.scaleX || 1), h = (o.height || (o.radius || o.ry || 50) * 2) * (o.scaleY || 1);
        add(t === 'rect' || t === 'polygon' || t === 'triangle' ? 'RectangleShape' : 'EllipseShape', { x: o.left || 0, y: o.top || 0, w, h }, (sh) => {
          const fc = rgb(o.fill); if (fc !== null) sh.setPropertyValue('FillColor', fc);
          if (!o.strokeWidth) sh.setPropertyValue('LineStyle', css.drawing.LineStyle.NONE);
        });
      }
    });
  });
  m.storeToURL('file:///tmp/office/ref.odp', [P('FilterName', 'impress8'), P('Overwrite', true)]);
  m.close(true);
  return 'file:///tmp/office/ref.odp';
}

// ---------------- formatting वाचणे (आपोआप गुणांसाठी) ----------------
const charInfo = (r) => {
  const posture = str(r.getPropertyValue('CharPosture'));
  return {
    font: String(r.getPropertyValue('CharFontName') || ''),
    size: Math.round(Number(r.getPropertyValue('CharHeight')) * 2) / 2,
    bold: Number(r.getPropertyValue('CharWeight')) >= 150,
    italic: !(posture === '0' || posture === 'NONE'),
    ul: Number(num(r.getPropertyValue('CharUnderline'))) !== 0,
    color: Number(r.getPropertyValue('CharColor')),
  };
};
function writerInfo(model) {
  const paras = [];
  let tables = 0;
  const en = model.getText().createEnumeration();
  while (en.hasMoreElements()) {
    const p = en.nextElement();
    if (!p.supportsService('com.sun.star.text.Paragraph')) { tables++; continue; }
    const runs = [];
    const pe = p.createEnumeration();
    while (pe.hasMoreElements()) {
      const r = pe.nextElement();
      const t = r.getString();
      if (!t || !t.trim()) continue;
      runs.push(Object.assign({ n: t.length }, charInfo(r)));
      if (runs.length > 40) break;
    }
    paras.push({ text: p.getString(), adjust: Number(num(p.getPropertyValue('ParaAdjust'))), style: String(p.getPropertyValue('ParaStyleName') || ''), runs });
    if (paras.length > 400) break;
  }
  try { tables = Math.max(tables, model.getTextTables().getCount()); } catch (e) { /* ignore */ }
  let page = null;
  try {
    const ps = model.getStyleFamilies().getByName('PageStyles').getByName('Standard');
    page = {
      landscape: !!ps.getPropertyValue('IsLandscape'),
      left: ps.getPropertyValue('LeftMargin'), right: ps.getPropertyValue('RightMargin'),
      top: ps.getPropertyValue('TopMargin'), bottom: ps.getPropertyValue('BottomMargin'),
      border: Number((ps.getPropertyValue('LeftBorder') || {}).OuterLineWidth || 0) > 0,
    };
  } catch (e) { /* ignore */ }
  let images = 0;
  try { images = model.getGraphicObjects().getCount(); } catch (e) { /* ignore */ }
  return { kind: 'writer', paras, tables, page, images };
}
function calcInfo(model) {
  const out = [];
  const sheets = model.getSheets();
  for (let si = 0; si < Math.min(sheets.getCount(), 5); si++) {
    const sh = sheets.getByIndex(si);
    const cur = sh.createCursor();
    cur.gotoEndOfUsedArea(false);
    const a = cur.getRangeAddress();
    const cells = [];
    for (let r = 0; r <= Math.min(a.EndRow, 120); r++) {
      for (let c = 0; c <= Math.min(a.EndColumn, 30); c++) {
        const cell = sh.getCellByPosition(c, r);
        const s = cell.getString();
        const f = cell.getFormula();
        if (!s && !f) continue;
        let merged = false;
        try { merged = sh.getCellRangeByPosition(c, r, c, r).getIsMerged(); } catch (e) { /* ignore */ }
        cells.push({
          r, c, s, f: f && f.startsWith('=') ? f : '',
          bold: Number(cell.getPropertyValue('CharWeight')) >= 150,
          italic: !(['0', 'NONE'].includes(str(cell.getPropertyValue('CharPosture')))),
          size: Math.round(Number(cell.getPropertyValue('CharHeight')) * 2) / 2,
          bg: Number(cell.getPropertyValue('CellBackColor')),
          align: str(cell.getPropertyValue('HoriJustify')),
          merged,
        });
      }
    }
    out.push({ name: sh.getName(), cells });
  }
  return { kind: 'calc', sheets: out };
}
function impressInfo(model) {
  const slides = [];
  const pages = model.getDrawPages();
  for (let i = 0; i < pages.getCount(); i++) {
    const pg = pages.getByIndex(i);
    const shapes = [];
    for (let k = 0; k < pg.getCount(); k++) {
      const sh = pg.getByIndex(k);
      const type = String(sh.getShapeType()).split('.').pop();
      let text = '', ch = null;
      try { text = sh.getString(); } catch (e) { /* ignore */ }
      if (text) { try { ch = charInfo(sh); } catch (e) { /* ignore */ } }
      shapes.push({ type, text, ch });
    }
    slides.push({ shapes });
  }
  return { kind: 'impress', slides };
}
const info = (kind, model) => (model ? (kind === 'calc' ? calcInfo(model) : kind === 'impress' ? impressInfo(model) : writerInfo(model)) : null);

// ---------------- आदेश ----------------
function onMessage(e) {
  const d = e.data;
  try {
    if (d.cmd === 'open') {
      let refUrl = null;
      if (d.ref) {
        if (d.ref.build === 'calc') refUrl = buildCalc(d.ref.data);
        else if (d.ref.build === 'impress') refUrl = buildImpress(d.ref.data);
        else refUrl = d.ref.url;
      }
      if (refUrl && d.mode !== 'ref') {
        refModel = load(refUrl, { readOnly: true, filter: d.ref.filter });
        // संदर्भ खिडकी अरुंद असते — sidebar / navigator बंद करा म्हणजे दस्तऐवज मोठा दिसेल
        const frame = refModel.getCurrentController().getFrame();
        const dh = css.frame.DispatchHelper.create(zetajs.getUnoComponentContext());
        try { dh.executeDispatch(frame, '.uno:Sidebar', '', 0, []); } catch (e) { /* ignore */ }
      }
      if (d.mode === 'ref') {
        // Admin: संदर्भ संपादन — संदर्भच कामाचा दस्तऐवज
        workModel = refUrl ? load(refUrl, { filter: d.ref.filter }) : desktop.loadComponentFromURL('private:factory/' + FACTORY[d.kind], '_blank', 0, []);
      } else if (d.work) {
        workModel = load(d.work.url, { readOnly: d.mode === 'view' });
      } else {
        workModel = desktop.loadComponentFromURL('private:factory/' + FACTORY[d.kind], '_blank', 0, []);
      }
      layout(d);
      if (refModel) keep.push(...lockFrame(refModel, true), ...pinWindow(refModel));
      keep.push(...lockFrame(workModel, false), ...pinWindow(workModel));
      hideOthers(); // Start Center इ. एकदाच लपवा
      onSave = () => {
        workModel.storeToURL('file:///tmp/office/draft.' + { writer: 'odt', calc: 'ods', impress: 'odp' }[d.kind], [P('FilterName', FILTER[d.kind]), P('Overwrite', true)]);
        post({ cmd: 'draft' });
      };
      post({ cmd: 'ui_ready', hasRef: !!refModel });
    } else if (d.cmd === 'save_draft') {
      if (onSave) onSave();
    } else if (d.cmd === 'layout') {
      snapAsked = false;
      layout(d);

    } else if (d.cmd === 'extract') {
      post({ cmd: 'extracted', ref: info(d.kind, refModel), work: info(d.kind, workModel) });
    } else if (d.cmd === 'save') {
      workModel.storeToURL(d.url, [P('FilterName', FILTER[d.kind]), P('Overwrite', true)]);
      post({ cmd: 'saved', url: d.url });
    }
  } catch (err) {
    post({ cmd: 'error', msg: String((err && (err.message || err.Message)) || err) });
  }
}

Module.zetajs.then(function (z) {
  zetajs = z;
  css = zetajs.uno.com.sun.star;
  desktop = css.frame.Desktop.create(zetajs.getUnoComponentContext());
  zetajs.mainPort.onmessage = onMessage;
  // LibreOffice पूर्ण बंद (Exit) होऊ देऊ नका
  const tl = zetajs.unoObject([css.frame.XTerminateListener], {
    queryTermination() { zetajs.throwUnoException(new css.frame.TerminationVetoException({ Message: 'locked' })); },
    notifyTermination() {}, disposing() {},
  });
  keep.push(tl);
  try { desktop.addTerminateListener(tl); } catch (e) { /* ignore */ }
  post({ cmd: 'thr_running' });
});
