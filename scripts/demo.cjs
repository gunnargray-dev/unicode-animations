#!/usr/bin/env node

const path = require('path');

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

// Usage: npx unicode-animations [name]
// No args = cycle through all spinners
// With name = show that specific spinner

const hide = '\x1B[?25l';
const show = '\x1B[?25h';
const clear = '\x1B[2K\r';
const bold = '\x1B[1m';
const dim = '\x1B[2m';
const cyan = '\x1B[36m';
const magenta = '\x1B[35m';
const reset = '\x1B[0m';

process.stdout.write(hide);
const cleanup = () => process.stdout.write(show);
process.on('SIGINT', () => { cleanup(); console.log(); process.exit(0); });
process.on('exit', cleanup);

if (args[0] === '--list' || args[0] === '-l') {
  cleanup();
  console.log(`\n${bold}22 spinners available:${reset}\n`);
  for (const name of names) {
    const s = S[name];
    console.log(`  ${magenta}${s.frames[0]}${reset}  ${name} ${dim}(${s.frames.length} frames, ${s.interval}ms)${reset}`);
  }
  console.log();
  process.exit(0);
}

if (args[0] && !names.includes(args[0])) {
  cleanup();
  console.error(`Unknown spinner: "${args[0]}"\nRun with --list to see all spinners.`);
  process.exit(1);
}

let current = args[0] ? names.indexOf(args[0]) : 0;
const single = !!args[0];
let i = 0;
let ticksOnCurrent = 0;

const TICKS_PER_SPINNER = 40; // ~3.2s per spinner when cycling

const timer = setInterval(() => {
  const name = names[current];
  const s = S[name];
  const frame = s.frames[i % s.frames.length];
  const count = `${dim}[${current + 1}/${names.length}]${reset}`;

  process.stdout.write(`${clear}  ${magenta}${frame}${reset}  ${bold}${name}${reset} ${dim}${s.interval}ms${reset}  ${single ? '' : count}`);

  i++;
  ticksOnCurrent++;

  if (!single && ticksOnCurrent >= TICKS_PER_SPINNER) {
    ticksOnCurrent = 0;
    i = 0;
    current = (current + 1) % names.length;
  }
}, 80);
