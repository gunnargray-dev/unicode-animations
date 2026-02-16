#!/usr/bin/env node

const fs = require('fs');
const tty = require('tty');

const ci = process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.GITHUB_ACTIONS;
if (ci) process.exit(0);

let out;
try {
  const fd = fs.openSync('/dev/tty', 'w');
  out = new tty.WriteStream(fd);
} catch {
  process.exit(0);
}

try {
  const W = 60;

  const d = '\x1B[2m';
  const b = '\x1B[1m';
  const r = '\x1B[0m';
  const c = '\x1B[36m';
  const m = '\x1B[35m';
  const w = '\x1B[37m';

  function row(ansiStr) {
    const vis = ansiStr.replace(/\x1B\[[0-9;]*m/g, '');
    return `${d}  │${r}${ansiStr}${' '.repeat(Math.max(0, W - vis.length))}${d}│${r}`;
  }

  const top = `${d}  ╭${'─'.repeat(W)}╮${r}`;
  const bot = `${d}  ╰${'─'.repeat(W)}╯${r}`;
  const blank = row('');

  const lines = [
    '',
    top,
    blank,
    row(`${b}${w}   ██╗   ██╗███╗   ██╗██╗ ██████╗ ██████╗ ██████╗ ███████╗${r}`),
    row(`${b}${w}   ██║   ██║████╗  ██║██║██╔════╝██╔═══██╗██╔══██╗██╔════╝${r}`),
    row(`${b}${w}   ██║   ██║██╔██╗ ██║██║██║     ██║   ██║██║  ██║█████╗${r}`),
    row(`${b}${w}   ██║   ██║██║╚██╗██║██║██║     ██║   ██║██║  ██║██╔══╝${r}`),
    row(`${b}${w}   ╚██████╔╝██║ ╚████║██║╚██████╗╚██████╔╝██████╔╝███████╗${r}`),
    row(`${d}    ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝${r}`),
    row(`${b}${c}            a n i m a t i o n s${r}`),
    blank,
    row(`${d}   ─────────────────────────────────────────────────────${r}`),
    blank,
    row(`   ${m}⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏${r}            ${d}braille${r}`),
    row(`   ${m}⠁⠂⠄⡀⢀⠠⠐⠈${r}                        ${d}braillewave${r}`),
    row(`   ${m}⠋⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄${r}                    ${d}dna${r}`),
    row(`   ${m}◜ ◠ ◝ ◞ ◡ ◟${r}                      ${d}arc${r}`),
    row(`   ${m}◐ ◓ ◑ ◒${r}                            ${d}halfmoon${r}`),
    row(`   ${m}| / — \\${r}                             ${d}line${r}`),
    row(`   ${m}▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂${r}      ${d}blocks${r}`),
    blank,
    row(`   ${d}+ 15 more braille grid spinners (22 total)${r}`),
    blank,
    row(`   ${d}─────────────────────────────────────────────────────${r}`),
    blank,
    row(`   ${c}npm install unicode-animations${r}`),
    row(`   ${d}https://github.com/gunnargray-dev/unicode-animations${r}`),
    blank,
    bot,
    '',
  ];

  out.write(lines.join('\n') + '\n');
} catch {
  process.exit(0);
}
