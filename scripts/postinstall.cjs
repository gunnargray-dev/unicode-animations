#!/usr/bin/env node

const fs = require('fs');
const tty = require('tty');
const path = require('path');

const ci = process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.GITHUB_ACTIONS;
if (ci) process.exit(0);

// Skip postinstall when run via npx (temporary install for CLI usage)
if (__dirname.includes('_npx')) process.exit(0);

let out;
try {
  const fd = fs.openSync('/dev/tty', 'w');
  out = new tty.WriteStream(fd);
} catch {
  process.exit(0);
}

let S;
try {
  const mod = require(path.join(__dirname, '..', 'dist', 'index.cjs'));
  S = mod.spinners || mod.default;
  if (!S || !S.braille) throw new Error();
} catch {
  process.exit(0);
}

try {
  const DURATION = 3000;
  const INTERVAL = 80;

  const B = '\x1B[1m';
  const D = '\x1B[2m';
  const R = '\x1B[0m';
  const HIDE = '\x1B[?25l';
  const SHOW = '\x1B[?25h';

  out.write(HIDE);
  const cleanup = () => { try { out.write(SHOW); } catch {} };
  process.on('SIGINT', () => { cleanup(); process.exit(0); });

  // Narrow terminal fallback
  const termCols = out.columns || 80;
  if (termCols < 60) {
    out.write(`\n  ${B}unicode-animations${R} ${D}— 18 braille spinners${R}\n\n`);
    cleanup();
    return;
  }

  function pad(str, n) { return str + ' '.repeat(Math.max(0, n - str.length)); }

  // ─── Title (box-drawing art) ───
  const titleLines = [
    '██╗   ██╗███╗   ██╗██╗ ██████╗ ██████╗ ██████╗ ███████╗',
    '██║   ██║████╗  ██║██║██╔════╝██╔═══██╗██╔══██╗██╔════╝',
    '██║   ██║██╔██╗ ██║██║██║     ██║   ██║██║  ██║█████╗  ',
    '██║   ██║██║╚██╗██║██║██║     ██║   ██║██║  ██║██╔══╝  ',
    '╚██████╔╝██║ ╚████║██║╚██████╗╚██████╔╝██████╔╝███████╗',
    ' ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝',
  ];
  const titleW = 57;

  // ─── Spinner grid: 3 cols × 6 rows ───
  const layout = [
    ['braille',   'scan',         'rain'],
    ['orbit',     'pulse',        'sparkle'],
    ['breathe',   'cascade',      'waverows'],
    ['snake',     'columns',      'helix'],
    ['fillsweep', 'scanline',     'braillewave'],
    ['diagswipe', 'checkerboard', 'dna'],
  ];
  const NPAD = 13;

  // Compute max frame width per column for consistent spacing
  const colFPad = [0, 1, 2].map(c => {
    let max = 0;
    for (const row of layout) {
      const sp = S[row[c]];
      for (const f of sp.frames) max = Math.max(max, [...f].length);
    }
    return max;
  });
  const GRID_W = colFPad.reduce((sum, fp) => sum + fp + 1 + NPAD, 0) + 4;
  const CONTENT_W = Math.max(GRID_W, titleW) + 4;

  // ─── Crop marks ───
  const ARM = 1;
  const inner = Math.max(0, CONTENT_W - 2 - ARM * 2);
  const cropPad = '  ';
  const topCrop  = cropPad + '\u280F' + '\u2809'.repeat(ARM) + ' '.repeat(inner) + '\u2809'.repeat(ARM) + '\u28B9';
  const botCrop  = cropPad + '\u28C7' + '\u28C0'.repeat(ARM) + ' '.repeat(inner) + '\u28C0'.repeat(ARM) + '\u28F8';

  // Center each element within the crop frame
  function centerPad(w) {
    return cropPad + ' '.repeat(Math.max(0, Math.floor((CONTENT_W - w) / 2)));
  }
  // Left-align all content to the same column, centered as a block within crops
  const contentW = Math.max(GRID_W, titleW);
  const contentPad = cropPad + ' '.repeat(Math.max(0, Math.floor((CONTENT_W - contentW) / 2)));

  // ─── Render spinner grid ───
  const ROWS = layout.length;

  function renderGrid(tick) {
    let buf = '';
    for (const row of layout) {
      let line = contentPad;
      for (let c = 0; c < 3; c++) {
        const name = row[c];
        const sp = S[name];
        const frame = sp.frames[tick % sp.frames.length];
        line += B + pad(frame, colFPad[c]) + R + ' ' + D + pad(name, NPAD) + R;
        if (c < 2) line += '  ';
      }
      buf += line + '\n';
    }
    return buf;
  }

  // ─── Print static top ───
  let top = '\n';
  top += topCrop + '\n';
  top += '\n';
  for (let i = 0; i < titleLines.length; i++) {
    const style = i === titleLines.length - 1 ? D : B;
    top += contentPad + style + titleLines[i] + R + '\n';
  }
  top += contentPad + D + 'BRAILLE ANIMATIONS' + R + '\n';
  top += '\n';
  out.write(top);

  // ─── Print first frame of spinners ───
  out.write(renderGrid(0));

  // ─── Animate ───
  let tick = 1;
  const start = Date.now();

  const timer = setInterval(() => {
    if (Date.now() - start >= DURATION) {
      clearInterval(timer);
      // Print static bottom
      let bot = '\n';
      const cmds = [
        ['npx unicode-animations',        'demo all spinners'],
        ['npx unicode-animations --list',  'list all spinners'],
        ['npx unicode-animations --web',   'open in browser'],
      ];
      for (const [left, right] of cmds) {
        const gap = ' '.repeat(Math.max(2, contentW - left.length - right.length));
        bot += contentPad + D + left + R + gap + D + right + R + '\n';
      }
      bot += '\n';
      bot += botCrop + '\n\n';
      out.write(bot);
      cleanup();
      return;
    }
    out.write(`\x1B[${ROWS}A`);
    out.write(renderGrid(tick));
    tick++;
  }, INTERVAL);

} catch {
  try { out.write('\x1B[?25h'); } catch {}
  process.exit(0);
}
