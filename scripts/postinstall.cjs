#!/usr/bin/env node

const fs = require('fs');
const tty = require('tty');
const path = require('path');

const ci = process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.GITHUB_ACTIONS;
if (ci) process.exit(0);

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
    out.write(`\n  ${B}unicode-animations${R} ${D}— 18 braille spinners + 4 classics${R}\n\n`);
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
  const FPAD = 5;
  const NPAD = 13;
  const COL_W = FPAD + 1 + NPAD;
  const GRID_W = COL_W * 3 + 4;
  const CONTENT_W = Math.max(GRID_W, titleW) + 4;

  // ─── Crop marks ───
  const ARM = 1;
  const inner = Math.max(0, CONTENT_W - 2 - ARM * 2);
  const cropPad = '  ';
  const topCrop  = cropPad + '\u280F' + '\u2809'.repeat(ARM) + ' '.repeat(inner) + '\u2809'.repeat(ARM) + '\u28B9';
  const botCrop  = cropPad + '\u28C7' + '\u28C0'.repeat(ARM) + ' '.repeat(inner) + '\u28C0'.repeat(ARM) + '\u28F8';

  // Indent title and subtitle
  const titlePad = '  ';
  const subtitlePad = ' '.repeat(Math.max(2, Math.floor((titleW - 18) / 2) + 2));

  // ─── Render spinner grid ───
  const ROWS = layout.length;

  function renderGrid(tick) {
    let buf = '';
    for (const row of layout) {
      let line = '     ';
      for (let c = 0; c < 3; c++) {
        const name = row[c];
        const sp = S[name];
        const frame = sp.frames[tick % sp.frames.length];
        line += B + pad(frame, FPAD) + R + ' ' + D + pad(name, NPAD) + R;
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
    top += titlePad + style + titleLines[i] + R + '\n';
  }
  top += subtitlePad + D + 'BRAILLE ANIMATIONS' + R + '\n';
  top += '\n';
  out.write(top);

  // ─── Print first frame of spinners ───
  out.write('\x1B7');
  out.write(renderGrid(0));

  // ─── Print static bottom ───
  let bot = '\n';
  bot += '     ' + D + 'npx unicode-animations' + R + '           ' + D + 'demo all spinners' + R + '\n';
  bot += '     ' + D + 'npx unicode-animations --list' + R + '    ' + D + 'list all spinners' + R + '\n';
  bot += '     ' + D + 'npx unicode-animations --web' + R + '     ' + D + 'open in browser' + R + '\n';
  bot += '\n';
  bot += botCrop + '\n';
  out.write(bot);

  const LINES_BELOW = 6;

  // ─── Animate ───
  let tick = 1;
  const start = Date.now();

  const timer = setInterval(() => {
    if (Date.now() - start >= DURATION) {
      clearInterval(timer);
      out.write('\x1B8');
      out.write(`\x1B[${ROWS + LINES_BELOW}B`);
      out.write('\n');
      cleanup();
      return;
    }
    out.write('\x1B8');
    out.write(renderGrid(tick));
    tick++;
  }, INTERVAL);

} catch {
  try { out.write('\x1B[?25h'); } catch {}
  process.exit(0);
}
