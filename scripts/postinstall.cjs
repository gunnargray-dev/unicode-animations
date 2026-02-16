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

  const d = '\x1B[2m';
  const b = '\x1B[1m';
  const r = '\x1B[0m';
  const c = '\x1B[36m';
  const g = '\x1B[32m';
  const w = '\x1B[37m';
  const m = '\x1B[35m';
  const hide = '\x1B[?25l';
  const show = '\x1B[?25h';

  out.write(hide);
  const cleanup = () => { try { out.write(show); } catch {} };
  process.on('SIGINT', () => { cleanup(); process.exit(0); });

  // Static header
  out.write(`
${b}${w}  ██╗   ██╗███╗   ██╗██╗ ██████╗ ██████╗ ██████╗ ███████╗${r}
${b}${w}  ██║   ██║████╗  ██║██║██╔════╝██╔═══██╗██╔══██╗██╔════╝${r}
${b}${w}  ██║   ██║██╔██╗ ██║██║██║     ██║   ██║██║  ██║█████╗${r}
${b}${w}  ██║   ██║██║╚██╗██║██║██║     ██║   ██║██║  ██║██╔══╝${r}
${b}${w}  ╚██████╔╝██║ ╚████║██║╚██████╗╚██████╔╝██████╔╝███████╗${r}
${d}   ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝${r}
${b}${c}            a n i m a t i o n s${r}

`);

  // Two-column spinner grid
  const left = [
    ['braille',    S.braille],
    ['arc',        S.arc],
    ['halfmoon',   S.halfmoon],
    ['line',       S.line],
    ['blocks',     S.blocks],
    ['orbit',      S.orbit],
    ['breathe',    S.breathe],
    ['snake',      S.snake],
    ['fillsweep',  S.fillsweep],
    ['diagswipe',  S.diagswipe],
    ['pulse',      S.pulse],
  ];

  const right = [
    ['scan',         S.scan],
    ['rain',         S.rain],
    ['scanline',     S.scanline],
    ['sparkle',      S.sparkle],
    ['cascade',      S.cascade],
    ['columns',      S.columns],
    ['waverows',     S.waverows],
    ['checkerboard', S.checkerboard],
    ['helix',        S.helix],
    ['braillewave',  S.braillewave],
    ['dna',          S.dna],
  ];

  const ROWS = left.length;
  const LF = 3;   // left frame pad width
  const RF = 12;   // right frame pad width

  function pad(str, n) { return str + ' '.repeat(Math.max(0, n - str.length)); }

  function renderGrid(tick) {
    let buf = '';
    for (let i = 0; i < ROWS; i++) {
      const [ln, ls] = left[i];
      const [rn, rs] = right[i];
      const lf = ls.frames[tick % ls.frames.length];
      const rf = rs.frames[tick % rs.frames.length];
      buf += `  ${m}${pad(lf, LF)}${r}  ${pad(ln, 12)}  ${m}${pad(rf, RF)}${r}  ${d}${rn}${r}\n`;
    }
    return buf;
  }

  out.write(renderGrid(0));

  let tick = 1;
  const start = Date.now();

  const timer = setInterval(() => {
    if (Date.now() - start >= DURATION) {
      clearInterval(timer);
      out.write(`\n  ${g}${b}✔${r} ${b}unicode-animations${r} ${d}— 22 spinners ready${r}\n\n`);
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
