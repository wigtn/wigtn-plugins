#!/usr/bin/env node
// Diagram renderer: JSON spec -> fonts subset + measured text -> ELK layout -> SVG (sketch | clean) -> PNG + layout checks.
// Run through render.sh, which installs elkjs / roughjs / puppeteer / subset-font, downloads fonts and sets NODE_PATH.
'use strict';

const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error(`render: ${msg}`);
  process.exit(2);
}

const [specPath, outArg] = process.argv.slice(2);
if (!specPath) fail('usage: render.sh <spec.json> [out-basename]');

let spec;
try {
  spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
} catch (e) {
  fail(`cannot read spec ${specPath}: ${e.message}`);
}
const outBase = outArg || specPath.replace(/\.json$/i, '');

// ---- spec validation (fail fast, before launching a browser) ----
// Every malformed input must end in exit 2 with a readable message: exit 1 means "layout check failed",
// and a model reading that would start moving boxes around instead of fixing the spec.
const SHAPES = ['box', 'db', 'external', 'actor', 'queue', 'decision'];
const TONES = ['gray', 'slate', 'blue', 'green', 'yellow', 'amber', 'orange', 'violet', 'red', 'rose', 'teal'];
const LEGEND_KINDS = ['emphasis', 'dashed', 'external', 'edge'];
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isText = (v) => typeof v === 'string' && v.trim() !== '';
if (!isObj(spec)) fail('invalid spec: the top level must be a JSON object');
const errors = [];
const list = (key) => {
  const v = spec[key];
  if (v === undefined) return [];
  if (!Array.isArray(v) || !v.every(isObj)) {
    errors.push(`${key} must be an array of objects`);
    return [];
  }
  return v;
};
const groups = list('groups');
const nodes = list('nodes');
const edges = list('edges');
const legend = list('legend');
const ids = new Set();
for (const x of [...groups, ...nodes]) {
  const id = x.id;
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(id)) errors.push(`invalid id: ${JSON.stringify(id)} (letters, digits, _ - only)`);
  else if (ids.has(id)) errors.push(`duplicate id: ${id}`);
  ids.add(id);
  if (!isText(x.label)) errors.push(`${id}: label must be non-empty text`);
  if (x.sub !== undefined && typeof x.sub !== 'string') errors.push(`${id}: sub must be text`);
  if (x.tone !== undefined && !TONES.includes(x.tone)) errors.push(`${id}: tone must be one of ${TONES.join(', ')}`);
}
const groupById = new Map(groups.map((g) => [g.id, g]));
const nodeIds = new Set(nodes.map((n) => n.id));
for (const g of groups) {
  if (g.parent === undefined) continue;
  if (!groupById.has(g.parent)) {
    errors.push(`group ${g.id}: unknown parent ${g.parent}`);
    continue;
  }
  const seen = new Set([g.id]);
  for (let p = groupById.get(g.parent); p; p = groupById.get(p.parent)) {
    if (seen.has(p.id)) {
      errors.push(`group ${g.id}: parent chain loops (${[...seen, p.id].join(' -> ')})`);
      break;
    }
    seen.add(p.id);
  }
}
for (const n of nodes) {
  if (n.group !== undefined && !groupById.has(n.group)) errors.push(`node ${n.id}: unknown group ${n.group}`);
  if (n.shape !== undefined && !SHAPES.includes(n.shape)) errors.push(`node ${n.id}: shape must be one of ${SHAPES.join(', ')}`);
}
edges.forEach((e, i) => {
  if (!nodeIds.has(e.from)) errors.push(`edge #${i}: unknown from ${JSON.stringify(e.from)}`);
  if (!nodeIds.has(e.to)) errors.push(`edge #${i}: unknown to ${JSON.stringify(e.to)}`);
  if (e.from === e.to) errors.push(`edge #${i}: self-loop ${e.from} -> ${e.to} is not supported (use a note in the node's sub instead)`);
  if (e.label !== undefined && typeof e.label !== 'string') errors.push(`edge #${i}: label must be text`);
});
legend.forEach((l, i) => {
  if (!isText(l.label)) errors.push(`legend #${i}: label must be non-empty text`);
  if (l.kind !== undefined && !LEGEND_KINDS.includes(l.kind)) errors.push(`legend #${i}: kind must be one of ${LEGEND_KINDS.join(', ')}`);
});
for (const k of ['title', 'subtitle']) if (spec[k] !== undefined && typeof spec[k] !== 'string') errors.push(`${k} must be text`);
if (!nodes.length) errors.push('spec has no nodes');
if (spec.direction !== undefined && !['RIGHT', 'DOWN'].includes(spec.direction)) errors.push('direction must be RIGHT or DOWN');
if (spec.style !== undefined && !['sketch', 'clean'].includes(spec.style)) errors.push('style must be sketch or clean');
if (spec.font !== undefined && !['mixed', 'hand', 'plain'].includes(spec.font)) errors.push('font must be mixed, hand or plain');
if (spec.tone !== undefined && !TONES.includes(spec.tone)) errors.push(`tone must be one of ${TONES.join(', ')}`);
if (spec.background !== undefined && !/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(spec.background)) errors.push('background must be a hex color like #fdfcf8');
if (errors.length) fail(`invalid spec:\n  - ${errors.join('\n  - ')}`);

let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  fail('puppeteer not found — run through render.sh so dependencies are installed');
}
const elkBundle = require.resolve('elkjs/lib/elk.bundled.js');
const roughBundle = require.resolve('roughjs/bundled/rough.js');

// ---- fonts: subset to the characters actually used, embed as woff2 data URLs ----
async function loadFonts() {
  const dir = process.env.WIGTN_DIAGRAM_FONTS || '';
  let subsetFont;
  try {
    subsetFont = require('subset-font');
  } catch (e) {
    subsetFont = null;
  }
  const texts = [spec.title, spec.subtitle, ...groups.map((g) => g.label), ...nodes.flatMap((n) => [n.label, n.sub]), ...edges.map((e) => e.label), ...legend.map((l) => l.label)];
  const chars = Array.from(new Set([...texts.filter(Boolean).join(''), ...' 0123456789.,-_/:()→·?'])).join('');
  const faces = [
    { family: 'WDHand', weight: 400, file: 'PoorStory-Regular.ttf' },
    { family: 'WDBody', weight: 400, file: 'Pretendard-Regular.otf' },
    { family: 'WDBody', weight: 600, file: 'Pretendard-SemiBold.otf' },
  ];
  const out = [];
  const missing = [];
  for (const f of faces) {
    const p = path.join(dir, f.file);
    if (!dir || !fs.existsSync(p)) {
      missing.push(f.file);
      continue;
    }
    const buf = fs.readFileSync(p);
    let data = buf;
    let format = f.file.endsWith('.otf') ? 'opentype' : 'truetype';
    let mime = f.file.endsWith('.otf') ? 'font/otf' : 'font/ttf';
    if (subsetFont) {
      try {
        data = await subsetFont(buf, chars, { targetFormat: 'woff2' });
        format = 'woff2';
        mime = 'font/woff2';
      } catch (e) {
        missing.push(`${f.file} (unreadable: ${e.message})`);
        continue;
      }
    }
    out.push({ family: f.family, weight: f.weight, src: `data:${mime};base64,${data.toString('base64')}`, format });
  }
  return { faces: out, missing };
}

// ---- in-page renderer ----
// Runs inside Chromium: fonts resolve exactly as in the PNG, so measured sizes are the rendered sizes.
async function renderInPage(spec, fonts) {
  const NS = 'http://www.w3.org/2000/svg';
  const sketch = (spec.style || 'sketch') === 'sketch';
  const fontMode = spec.font || (sketch ? 'mixed' : 'plain');
  const direction = spec.direction || 'RIGHT';

  const HAND = "WDHand, 'Poor Story', WDBody, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
  const BODY = "WDBody, Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Noto Sans CJK KR', 'Malgun Gothic', 'Segoe UI', system-ui, sans-serif";

  // open-color: [0] lightest ... [4] darkest (shades 0/2/4/6/8), as Excalidraw uses them
  const OC = {
    gray: ['#f8f9fa', '#e9ecef', '#ced4da', '#868e96', '#343a40'],
    blue: ['#e7f5ff', '#a5d8ff', '#4dabf7', '#228be6', '#1971c2'],
    green: ['#ebfbee', '#b2f2bb', '#69db7c', '#40c057', '#2f9e44'],
    yellow: ['#fff9db', '#ffec99', '#ffd43b', '#fab005', '#f08c00'],
    orange: ['#fff4e6', '#ffd8a8', '#ffa94d', '#fd7e14', '#e8590c'],
    violet: ['#f3f0ff', '#d0bfff', '#9775fa', '#7950f2', '#6741d9'],
    red: ['#fff5f5', '#ffc9c9', '#ff8787', '#fa5252', '#e03131'],
    teal: ['#e6fcf5', '#96f2d7', '#38d9a9', '#12b886', '#099268'],
  };
  const ALIAS = { slate: 'gray', amber: 'orange', rose: 'red' };
  const pal = (tone) => OC[ALIAS[tone] || tone] || OC.gray;

  const INK = '#1e1e1e';
  const MUTED = '#6c757d';
  const PAPER = spec.background || (sketch ? '#fdfcf8' : '#ffffff');
  const EDGE = sketch ? '#868e96' : '#7a8394';
  const EDGE_EMPH = sketch ? INK : '#3b5bdb';

  // typography per role
  const T = (family, weight, size, lineH) => ({ font: `${weight} ${size}px ${family}`, family, weight, size, lineH });
  const hand = fontMode !== 'plain';
  const handNodes = fontMode === 'hand';
  const F = {
    label: handNodes ? T(HAND, 400, 18, 22) : T(BODY, 600, 14, 20),
    sub: handNodes ? T(HAND, 400, 15, 18) : T(BODY, 400, 12, 16),
    group: hand ? T(HAND, 400, 20, 24) : T(BODY, 600, 13, 18),
    edge: hand ? T(HAND, 400, 16, 20) : T(BODY, 400, 12, 16),
    title: hand ? T(HAND, 400, 36, 42) : T(BODY, 700, 20, 28),
    subtitle: hand ? T(HAND, 400, 19, 24) : T(BODY, 400, 13, 18),
    legend: hand ? T(HAND, 400, 16, 20) : T(BODY, 400, 12, 16),
  };
  const NODE_MAX_TEXT_W = 210;
  const PAD_X = 20;
  const PAD_Y = 14;
  const MIN_NODE_W = 128;
  const GROUP_PAD = 20;

  // ---- fonts ----
  const css = fonts.faces.map((f) => `@font-face{font-family:${f.family};font-weight:${f.weight};src:url(${f.src}) format('${f.format}');}`).join('\n');
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
  await Promise.all(fonts.faces.map((f) => document.fonts.load(`${f.weight} 16px ${f.family}`)));
  await document.fonts.ready;

  const ctx = document.createElement('canvas').getContext('2d');
  const measure = (text, f) => {
    ctx.font = f.font;
    return ctx.measureText(text).width;
  };
  // Word-level wrapping only: never breaks inside a word, so "품질" can't become "품 / 질".
  const wrap = (text, f, maxW) => {
    const out = [];
    for (const para of String(text).split('\n')) {
      const words = para.split(/\s+/).filter(Boolean);
      let line = '';
      for (const w of words) {
        const cand = line ? `${line} ${w}` : w;
        if (line && measure(cand, f) > maxW) {
          out.push(line);
          line = w;
        } else line = cand;
      }
      out.push(line);
    }
    return out;
  };
  const maxLineW = (lines, f) => Math.max(0, ...lines.map((l) => measure(l, f)));
  const hash = (s) => {
    let h = 2166136261;
    for (const c of String(s)) h = Math.imul(h ^ c.codePointAt(0), 16777619);
    return (h >>> 0) % 2147483647 || 1;
  };

  const groupInfo = {};
  for (const g of spec.groups || []) {
    const titleLines = wrap(g.label, F.group, 10000);
    groupInfo[g.id] = { ...g, titleLines, titleW: maxLineW(titleLines, F.group), titleH: titleLines.length * F.group.lineH };
  }
  // Default node color is lavender (Mermaid's look, close to the WIGTN purple); actors and external systems stay neutral.
  const toneOf = (n) =>
    n.tone || (n.shape === 'decision' ? 'yellow' : null) || (n.group && groupInfo[n.group].tone) || (['actor', 'external'].includes(n.shape) ? 'gray' : spec.tone || 'violet');

  // ---- sizes ----
  const nodeInfo = {};
  for (const n of spec.nodes) {
    const shape = n.shape || 'box';
    const labelLines = wrap(n.label, F.label, NODE_MAX_TEXT_W);
    const subLines = n.sub ? wrap(n.sub, F.sub, NODE_MAX_TEXT_W) : [];
    const textW = Math.max(maxLineW(labelLines, F.label), maxLineW(subLines, F.sub));
    const textH = labelLines.length * F.label.lineH + (subLines.length ? 4 + subLines.length * F.sub.lineH : 0);
    const capExtra = shape === 'db' ? 14 : 0;
    const padX = shape === 'actor' ? PAD_X + 10 : shape === 'queue' ? PAD_X + 8 : shape === 'decision' ? PAD_X + 20 : PAD_X;
    const w = Math.ceil(Math.max(MIN_NODE_W, textW + padX * 2));
    const h = Math.ceil(textH + PAD_Y * 2 + capExtra);
    nodeInfo[n.id] = { ...n, shape, labelLines, subLines, textH, capExtra, w, h, tone: toneOf(n) };
  }

  // ---- ELK graph ----
  const elkNode = {};
  const root = {
    id: '__root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.spacing.nodeNodeBetweenLayers': '72',
      'elk.spacing.nodeNode': '36',
      'elk.spacing.edgeNode': '26',
      'elk.spacing.edgeEdge': '16',
      'elk.layered.spacing.edgeNodeBetweenLayers': '26',
      'elk.spacing.edgeLabel': '8',
      'elk.spacing.componentComponent': '56',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      // keep the spec's node order inside each layer, so a column reads top-to-bottom in the order it was written
      'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
      'elk.padding': '[top=0,left=0,bottom=0,right=0]',
    },
    children: [],
    edges: [],
  };
  for (const g of spec.groups || []) {
    const gi = groupInfo[g.id];
    elkNode[g.id] = {
      id: g.id,
      children: [],
      layoutOptions: {
        'elk.padding': `[top=${Math.ceil(GROUP_PAD + gi.titleH + 14)},left=${GROUP_PAD},bottom=${GROUP_PAD},right=${GROUP_PAD}]`,
        'elk.nodeSize.constraints': 'MINIMUM_SIZE',
        'elk.nodeSize.minimum': `(${Math.ceil(gi.titleW + GROUP_PAD * 2)}, ${Math.ceil(gi.titleH + GROUP_PAD * 2 + 14)})`,
      },
    };
  }
  for (const n of spec.nodes) elkNode[n.id] = { id: n.id, width: nodeInfo[n.id].w, height: nodeInfo[n.id].h };
  // Insert each group at the position of its first node so the model order follows the spec's node order.
  const placed = new Set();
  const place = (id, isGroup) => {
    if (placed.has(id)) return;
    const parentId = isGroup ? groupInfo[id].parent : nodeInfo[id].group;
    if (parentId) place(parentId, true);
    (parentId ? elkNode[parentId].children : root.children).push(elkNode[id]);
    placed.add(id);
  };
  for (const n of spec.nodes) place(n.id, false);
  for (const g of spec.groups || []) place(g.id, true);
  const edgeLabelLines = {};
  (spec.edges || []).forEach((e, i) => {
    // back edges (retry / feedback loops) are laid out forward and drawn reversed, so a loop never flips the main flow
    const edge = e.back ? { id: `e${i}`, sources: [e.to], targets: [e.from] } : { id: `e${i}`, sources: [e.from], targets: [e.to] };
    if (e.label) {
      const lines = wrap(e.label, F.edge, 170);
      edgeLabelLines[i] = lines;
      edge.labels = [{ text: e.label, width: Math.ceil(maxLineW(lines, F.edge) + 14), height: lines.length * F.edge.lineH + 8 }];
      edge.layoutOptions = { 'elk.edgeLabels.placement': 'CENTER' };
    }
    root.edges.push(edge);
  });

  const laid = await new ELK().layout(root);

  const abs = { __root: { x: 0, y: 0 } };
  const walk = (node, ox, oy) => {
    for (const c of node.children || []) {
      abs[c.id] = { x: ox + c.x, y: oy + c.y, w: c.width, h: c.height };
      walk(c, ox + c.x, oy + c.y);
    }
  };
  walk(laid, 0, 0);
  const depth = (gid) => {
    let d = 0;
    let g = groupInfo[gid];
    while (g && g.parent) {
      d++;
      g = groupInfo[g.parent];
    }
    return d;
  };

  // ---- SVG ----
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('xmlns', NS);
  svg.setAttribute('font-family', BODY);
  document.body.appendChild(svg);
  const el = (tag, attrs, parent = svg) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== undefined) e.setAttribute(k, v);
    parent.appendChild(e);
    return e;
  };
  if (css) el('style', {}, el('defs', {})).textContent = css; // self-contained SVG: subset fonts travel with it
  const layer = (name) => el('g', { 'data-layer': name });
  const bg = layer('background');
  const gGroups = layer('groups');
  const gEdges = layer('edges');
  const gNodes = layer('nodes');
  const gTitles = layer('group-titles');
  const gLabels = layer('edge-labels');
  const gTitle = layer('title');
  const rc = rough.svg(svg);

  // Hand-drawn recipe (Mermaid look:handDrawn / Excalidraw): shapes rougher than lines, dense hachure reads as textured pastel.
  const drawPath = (parent, d, o) => {
    if (!sketch) {
      return el('path', { d, fill: o.fill || 'none', stroke: o.stroke, 'stroke-width': o.strokeWidth, 'stroke-dasharray': o.dash ? o.dash.join(' ') : undefined, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, parent);
    }
    const g = rc.path(d, {
      seed: o.seed,
      roughness: o.roughness ?? 0.9,
      bowing: o.bowing ?? 1,
      stroke: o.stroke,
      strokeWidth: o.strokeWidth,
      fill: o.fill,
      fillStyle: o.fillStyle || 'hachure',
      hachureGap: o.hachureGap ?? 3.2,
      fillWeight: o.fillWeight ?? 1.1,
      hachureAngle: o.hachureAngle ?? -41,
      strokeLineDash: o.dash,
      disableMultiStroke: !!o.dash,
      preserveVertices: true,
    });
    parent.appendChild(g);
    return g;
  };
  const roundRect = (x, y, w, h, r) =>
    `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y} Z`;
  const text = (parent, lines, f, cx, top, fill, anchor = 'middle') => {
    const t = el('text', { 'font-family': f.family, 'font-size': f.size, 'font-weight': f.weight, fill, 'text-anchor': anchor }, parent);
    lines.forEach((line, i) => {
      el('tspan', { x: cx, y: top + f.lineH * i + f.lineH / 2, 'dominant-baseline': 'central' }, t).textContent = line;
    });
    return t;
  };
  const checks = [];

  // groups
  for (const g of [...(spec.groups || [])].sort((a, b) => depth(a.id) - depth(b.id))) {
    const gi = groupInfo[g.id];
    const a = abs[g.id];
    const p = pal(g.tone || 'gray');
    const wrapG = el('g', { 'data-group': g.id }, gGroups);
    drawPath(wrapG, roundRect(a.x, a.y, a.w, a.h, 18), {
      seed: hash(g.id), fill: p[0], fillStyle: 'solid', stroke: sketch ? p[2] : p[1], strokeWidth: sketch ? 1.4 : 1.25, roughness: 1.1, bowing: 1.2,
    });
    const plate = el('rect', {}, gTitles);
    const t = text(gTitles, gi.titleLines, F.group, a.x + GROUP_PAD, a.y + GROUP_PAD - 4, p[4], 'start');
    const tb = t.getBBox();
    for (const [k, v] of Object.entries({ x: tb.x - 6, y: tb.y - 2, width: tb.width + 12, height: tb.height + 4, rx: 4, fill: p[0] })) plate.setAttribute(k, v);
    checks.push(['group-title', g.id, a, t]);
  }

  // nodes
  for (const n of spec.nodes) {
    const ni = nodeInfo[n.id];
    const { x, y, w, h } = abs[n.id];
    const p = pal(ni.tone);
    const emph = !!n.emphasis;
    const external = ni.shape === 'external';
    const o = {
      seed: hash(n.id),
      stroke: external ? OC.gray[3] : p[4],
      strokeWidth: emph ? (sketch ? 2.8 : 2.25) : 1.5,
      fill: external ? (sketch ? undefined : '#fafafa') : sketch ? p[1] : emph ? p[0] : '#ffffff',
      hachureGap: 3.4,
      fillWeight: 1,
      roughness: 0.8,
      dash: external ? [8, 7] : undefined,
    };
    if (!sketch) o.stroke = emph ? '#3b5bdb' : external ? '#9aa3b2' : ni.shape === 'decision' ? '#c98a1b' : '#9aa3b2';
    const wrapN = el('g', { 'data-node': n.id }, gNodes);
    if (ni.shape === 'db') {
      const ry = 7;
      drawPath(wrapN, `M${x},${y + ry} C${x},${y - ry / 3} ${x + w},${y - ry / 3} ${x + w},${y + ry} V${y + h - ry} C${x + w},${y + h + ry / 3} ${x},${y + h + ry / 3} ${x},${y + h - ry} Z`, o);
      drawPath(wrapN, `M${x},${y + ry} C${x},${y + ry * 2.3} ${x + w},${y + ry * 2.3} ${x + w},${y + ry}`, { ...o, fill: undefined, seed: o.seed + 1 });
    } else if (ni.shape === 'actor') {
      drawPath(wrapN, roundRect(x, y, w, h, h / 2), o);
    } else if (ni.shape === 'decision') {
      const k = Math.min(20, h / 2);
      drawPath(wrapN, `M${x + k},${y} H${x + w - k} L${x + w},${y + h / 2} L${x + w - k},${y + h} H${x + k} L${x},${y + h / 2} Z`, o);
    } else if (ni.shape === 'queue') {
      drawPath(wrapN, roundRect(x, y, w, h, 8), o);
      drawPath(wrapN, `M${x + 11},${y + 7} V${y + h - 7} M${x + w - 11},${y + 7} V${y + h - 7}`, { ...o, fill: undefined, strokeWidth: 1.1, seed: o.seed + 1 });
    } else {
      drawPath(wrapN, roundRect(x, y, w, h, 12), o);
    }
    const top = y + ni.capExtra + (h - ni.capExtra - ni.textH) / 2;
    const t = el('g', {}, wrapN);
    if (sketch && !external) {
      t.setAttribute('stroke', p[0]);
      t.setAttribute('stroke-width', 4);
      t.setAttribute('stroke-linejoin', 'round');
      t.setAttribute('paint-order', 'stroke');
    }
    text(t, ni.labelLines, F.label, x + w / 2, top, INK);
    if (ni.subLines.length) text(t, ni.subLines, F.sub, x + w / 2, top + ni.labelLines.length * F.label.lineH + 4, sketch ? '#495057' : MUTED);
    checks.push(['node', n.id, abs[n.id], t]);
  }

  // edges
  const edgeById = {};
  for (const e of laid.edges || []) edgeById[e.id] = e;
  const routes = [];
  (spec.edges || []).forEach((e, i) => {
    const le = edgeById[`e${i}`];
    if (!le || !le.sections) return;
    const off = abs[le.container || '__root'] || { x: 0, y: 0 };
    const color = e.emphasis ? EDGE_EMPH : EDGE;
    const sw = e.emphasis ? (sketch ? 2.2 : 2.25) : sketch ? 1.4 : 1.5;
    const dash = e.dashed ? (sketch ? [8, 8] : [6, 5]) : undefined;
    le.sections.forEach((s, si) => {
      const finalSection = si === le.sections.length - 1;
      const pts = [s.startPoint, ...(s.bendPoints || []), s.endPoint].map((p) => ({ x: p.x + off.x, y: p.y + off.y }));
      if (e.back) pts.reverse();
      // ELK leaves sub-pixel drift on straight runs (151.7 vs 152). Snap from the arrowhead backwards so every
      // segment is exactly axis-aligned and the tip stays on the target's border; only the tail may shift <2px.
      for (let k = pts.length - 1; k > 0; k--) {
        if (Math.abs(pts[k].x - pts[k - 1].x) < 2) pts[k - 1].x = pts[k].x;
        if (Math.abs(pts[k].y - pts[k - 1].y) < 2) pts[k - 1].y = pts[k].y;
      }
      for (let k = pts.length - 2; k > 0; k--) {
        const a = pts[k - 1], b = pts[k], c = pts[k + 1];
        const same = (u, v) => u.x === v.x && u.y === v.y;
        if (same(a, b) || same(b, c) || (a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)) pts.splice(k, 1);
      }
      const last = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      const len = Math.hypot(last.x - prev.x, last.y - prev.y) || 1;
      const ux = (last.x - prev.x) / len;
      const uy = (last.y - prev.y) / len;
      const AH = sketch ? 12 : 9;
      const pull = finalSection ? (sketch ? 1.5 : AH * 0.8) : 0;
      const shaft = pts.slice(0, -1).concat([{ x: last.x - ux * pull, y: last.y - uy * pull }]);
      routes.push({ id: `${e.from}->${e.to}`, from: e.from, to: e.to, pts });
      // rounded orthogonal route; hand-drawn diagrams use generous corners
      const R = sketch ? 16 : 6;
      let d = `M${shaft[0].x},${shaft[0].y}`;
      for (let k = 1; k < shaft.length - 1; k++) {
        const p0 = shaft[k - 1], p1 = shaft[k], p2 = shaft[k + 1];
        const r = Math.min(R, Math.hypot(p1.x - p0.x, p1.y - p0.y) / 2, Math.hypot(p2.x - p1.x, p2.y - p1.y) / 2);
        const a1 = { x: p1.x - Math.sign(p1.x - p0.x) * r, y: p1.y - Math.sign(p1.y - p0.y) * r };
        const a2 = { x: p1.x + Math.sign(p2.x - p1.x) * r, y: p1.y + Math.sign(p2.y - p1.y) * r };
        d += ` L${a1.x},${a1.y} Q${p1.x},${p1.y} ${a2.x},${a2.y}`;
      }
      d += ` L${shaft[shaft.length - 1].x},${shaft[shaft.length - 1].y}`;
      const wrapE = el('g', { 'data-edge': `${e.from}->${e.to}` }, gEdges);
      drawPath(wrapE, d, { seed: hash(`${e.from}>${e.to}`), stroke: color, strokeWidth: sw, roughness: 0.35, bowing: 0.6, dash });
      const px = -uy, py = ux;
      if (!finalSection) return;
      if (sketch) {
        // open chevron head, like Excalidraw's default arrowhead
        const ang = (25 * Math.PI) / 180;
        const bx = last.x - ux * AH * Math.cos(ang), by = last.y - uy * AH * Math.cos(ang);
        const s1 = { x: bx + px * AH * Math.sin(ang), y: by + py * AH * Math.sin(ang) };
        const s2 = { x: bx - px * AH * Math.sin(ang), y: by - py * AH * Math.sin(ang) };
        drawPath(wrapE, `M${s1.x},${s1.y} L${last.x},${last.y} L${s2.x},${s2.y}`, { seed: hash(`${e.from}>${e.to}h`), stroke: color, strokeWidth: sw, roughness: 0.4, bowing: 0.3 });
      } else {
        el('path', { d: `M${last.x},${last.y} L${last.x - ux * AH + px * AH * 0.5},${last.y - uy * AH + py * AH * 0.5} L${last.x - ux * AH - px * AH * 0.5},${last.y - uy * AH - py * AH * 0.5} Z`, fill: color, stroke: color, 'stroke-width': 1, 'stroke-linejoin': 'round' }, wrapE);
      }
    });
    for (const lb of le.labels || []) {
      const x = lb.x + off.x, y = lb.y + off.y;
      const wrapL = el('g', { 'data-edge-label': `${e.from}->${e.to}` }, gLabels);
      el('rect', { x, y, width: lb.width, height: lb.height, rx: 6, fill: PAPER, 'fill-opacity': 0.9 }, wrapL);
      const t = text(wrapL, edgeLabelLines[i], F.edge, x + lb.width / 2, y + 4, e.emphasis ? INK : '#495057');
      checks.push(['edge-label', `${e.from}->${e.to}`, { x, y, w: lb.width, h: lb.height }, t]);
    }
  });

  // title block above the diagram
  const content = svg.getBBox();
  if (spec.title) {
    const tTop = content.y - 28 - (spec.subtitle ? F.subtitle.lineH + 4 : 0) - F.title.lineH;
    text(gTitle, [spec.title], F.title, content.x, tTop, INK, 'start');
    if (spec.subtitle) text(gTitle, [spec.subtitle], F.subtitle, content.x, tTop + F.title.lineH + 4, MUTED, 'start');
  }

  // legend below the diagram
  if (spec.legend && spec.legend.length) {
    const c2 = svg.getBBox();
    let lx = c2.x;
    const ly = c2.y + c2.height + 28;
    const gL = el('g', { 'data-layer': 'legend' });
    spec.legend.forEach((item, i) => {
      const kind = item.kind || 'edge';
      const seed = 900 + i;
      const mid = ly + F.legend.lineH / 2;
      if (kind === 'emphasis') drawPath(gL, `M${lx},${mid} H${lx + 34}`, { seed, stroke: EDGE_EMPH, strokeWidth: sketch ? 2.2 : 2.25, roughness: 0.35 });
      else if (kind === 'dashed') drawPath(gL, `M${lx},${mid} H${lx + 34}`, { seed, stroke: EDGE, strokeWidth: 1.4, roughness: 0.35, dash: sketch ? [8, 8] : [6, 5] });
      else if (kind === 'external') drawPath(gL, roundRect(lx, mid - 9, 34, 18, 5), { seed, stroke: OC.gray[3], strokeWidth: 1.3, dash: [5, 4], roughness: 0.8 });
      else drawPath(gL, `M${lx},${mid} H${lx + 34}`, { seed, stroke: EDGE, strokeWidth: 1.4, roughness: 0.35 });
      const t = text(gL, [item.label], F.legend, lx + 44, ly, MUTED, 'start');
      lx += 44 + t.getBBox().width + 32;
    });
  }

  // ---- canvas: fit to content so nothing can fall outside ----
  const M = 40;
  const all = svg.getBBox();
  const vb = { x: Math.floor(all.x - M), y: Math.floor(all.y - M), w: Math.ceil(all.width + M * 2), h: Math.ceil(all.height + M * 2) };
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  svg.setAttribute('width', vb.w);
  svg.setAttribute('height', vb.h);
  el('rect', { x: vb.x, y: vb.y, width: vb.w, height: vb.h, fill: PAPER }, bg);

  // ---- layout checks (deterministic) ----
  const problems = [];
  const TOL = 1;
  const inside = (b, r) => b.x >= r.x - TOL && b.y >= r.y - TOL && b.x + b.width <= r.x + r.w + TOL && b.y + b.height <= r.y + r.h + TOL;
  for (const [kind, id, rect, t] of checks) {
    const b = t.getBBox();
    if (!inside(b, rect)) problems.push(`${kind} "${id}": text overflows its box (text ${Math.round(b.width)}x${Math.round(b.height)}, box ${Math.round(rect.w)}x${Math.round(rect.h)})`);
  }
  const nodeRects = spec.nodes.map((n) => ({ id: n.id, ...abs[n.id] }));
  const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  for (let i = 0; i < nodeRects.length; i++)
    for (let j = i + 1; j < nodeRects.length; j++) if (overlap(nodeRects[i], nodeRects[j])) problems.push(`nodes "${nodeRects[i].id}" and "${nodeRects[j].id}" overlap`);
  for (const [kind, id, rect] of checks) {
    if (kind !== 'edge-label') continue;
    for (const nr of nodeRects) if (overlap(rect, nr)) problems.push(`edge label "${id}" overlaps node "${nr.id}"`);
  }
  // Routes are axis-aligned polylines: flag any that pass through a node other than their own ends,
  // or through another edge's label. Both read as a wrong connection.
  const hits = (a, b, r, pad) => {
    const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x), y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y);
    return x1 < r.x + r.w - pad && x2 > r.x + pad && y1 < r.y + r.h - pad && y2 > r.y + pad;
  };
  const labelRects = checks.filter(([kind]) => kind === 'edge-label').map(([, id, rect]) => ({ id, ...rect }));
  for (const rt of routes) {
    const crossed = new Set();
    for (let k = 1; k < rt.pts.length; k++) {
      for (const nr of nodeRects) if (nr.id !== rt.from && nr.id !== rt.to && hits(rt.pts[k - 1], rt.pts[k], nr, 3)) crossed.add(`node "${nr.id}"`);
      for (const lr of labelRects) if (lr.id !== rt.id && hits(rt.pts[k - 1], rt.pts[k], lr, 2)) crossed.add(`label of "${lr.id}"`);
    }
    for (const c of crossed) problems.push(`edge "${rt.id}" runs through ${c}`);
  }

  return {
    debug: spec.__debug ? laid.edges : undefined,
    svg: svg.outerHTML,
    width: vb.w,
    height: vb.h,
    problems,
    stats: { nodes: spec.nodes.length, edges: (spec.edges || []).length, groups: (spec.groups || []).length },
  };
}

(async () => {
  const fonts = await loadFonts();
  if (fonts.missing.length) console.error(`render: fonts missing (${fonts.missing.join(', ')}) — using system fonts; the SVG will not be self-contained`);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}svg{display:block}</style></head><body></body></html>');
    await page.addScriptTag({ path: elkBundle });
    await page.addScriptTag({ path: roughBundle });
    const result = await page.evaluate(renderInPage, { ...spec, __debug: !!process.env.WIGTN_DIAGRAM_DEBUG }, fonts);
    if (result.debug) console.error(JSON.stringify(result.debug, null, 1));

    fs.writeFileSync(`${outBase}.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n${result.svg}\n`);
    await page.setViewport({ width: result.width, height: result.height, deviceScaleFactor: 2 });
    const handle = await page.$('svg');
    await handle.screenshot({ path: `${outBase}.png` });

    const kb = Math.round(fs.statSync(`${outBase}.svg`).size / 1024);
    console.log(`wrote ${path.resolve(outBase)}.svg (${kb} KB) and .png (${result.width}x${result.height}, ${result.stats.nodes} nodes, ${result.stats.edges} edges, ${result.stats.groups} groups)`);
    if (result.problems.length) {
      console.log(`LAYOUT CHECK FAILED (${result.problems.length}):`);
      for (const p of result.problems) console.log(`  - ${p}`);
      process.exitCode = 1;
    } else {
      console.log('layout checks passed: no text overflow, no overlaps, no edge through a node or label');
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(`render: ${e.stack || e.message}`);
  process.exit(2);
});
