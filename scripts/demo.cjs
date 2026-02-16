#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const tty = require('tty');

let S;
try {
  S = require(path.join(__dirname, '..', 'dist', 'index.cjs'));
  S = S.spinners || S.default;
} catch {
  console.error('Run `npm run build` first.');
  process.exit(1);
}

const names = Object.keys(S);
const args = process.argv.slice(2);

// --web: open browser demo
if (args[0] === '--web' || args[0] === '-w') {
  const { exec } = require('child_process');
  const demoPath = path.join(__dirname, 'demo.html');
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${demoPath}"`);
  console.log(`Opening ${demoPath}`);
  process.exit(0);
}

// Get a writable TTY stream — stdout if it's a TTY, otherwise /dev/tty
let out = process.stdout;
if (!out.isTTY) {
  try {
    const fd = fs.openSync('/dev/tty', 'w');
    out = new tty.WriteStream(fd);
  } catch {
    // Fallback: no TTY available, just list and exit
    console.log('22 spinners: ' + names.join(', '));
    process.exit(0);
  }
}

const hide = '\x1B[?25l';
const show = '\x1B[?25h';
const bold = '\x1B[1m';
const dim = '\x1B[2m';
const magenta = '\x1B[35m';
const reset = '\x1B[0m';

out.write(hide);
const cleanup = () => { try { out.write(show); } catch {} };
process.on('SIGINT', () => { cleanup(); out.write('\n'); process.exit(0); });
process.on('exit', cleanup);

if (args[0] === '--list' || args[0] === '-l') {
  cleanup();
  out.write(`\n${bold}22 spinners available:${reset}\n\n`);
  for (const name of names) {
    const s = S[name];
    out.write(`  ${magenta}${s.frames[0]}${reset}  ${name} ${dim}(${s.frames.length} frames, ${s.interval}ms)${reset}\n`);
  }
  out.write('\n');
  process.exit(0);
}

if (args[0] && !names.includes(args[0])) {
  cleanup();
  out.write(`Unknown spinner: "${args[0]}"\nRun with --list to see all spinners.\n`);
  process.exit(1);
}

let current = args[0] ? names.indexOf(args[0]) : 0;
const single = !!args[0];
let i = 0;
let ticksOnCurrent = 0;

const TICKS_PER_SPINNER = 40;

const timer = setInterval(() => {
  const name = names[current];
  const s = S[name];
  const frame = s.frames[i % s.frames.length];
  const count = single ? '' : `${dim}[${current + 1}/${names.length}]${reset}`;

  out.write(`\r\x1B[2K  ${magenta}${frame}${reset}  ${bold}${name}${reset} ${dim}${s.interval}ms${reset}  ${count}`);

  i++;
  ticksOnCurrent++;

  if (!single && ticksOnCurrent >= TICKS_PER_SPINNER) {
    ticksOnCurrent = 0;
    i = 0;
    current = (current + 1) % names.length;
  }
}, 80);
