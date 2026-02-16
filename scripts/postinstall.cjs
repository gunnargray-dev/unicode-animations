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
  const W = 58; // inner width between │ bars

  const d = '\x1B[2m';    // dim
  const b = '\x1B[1m';    // bold
  const r = '\x1B[0m';    // reset
  const c = '\x1B[36m';   // cyan
  const g = '\x1B[32m';   // green
  const y = '\x1B[33m';   // yellow
  const m = '\x1B[35m';   // magenta
  const w = '\x1B[37m';   // white

  // Pad visible text to exactly W chars, preserving ANSI codes
  function row(ansiStr) {
    const vis = ansiStr.replace(/\x1B\[[0-9;]*m/g, '');
    const pad = W - vis.length;
    return `${d}  │${r}${ansiStr}${' '.repeat(Math.max(0, pad))}${d}│${r}`;
  }

  const top = `${d}  ╭${'─'.repeat(W)}╮${r}`;
  const bot = `${d}  ╰${'─'.repeat(W)}╯${r}`;
  const blank = row('');

  const lines = [
    '',
    top,
    blank,
    row(`   ${b}${w}██╗   ██╗${r}${d}██╗${r}  ${d}██╗${r}${b}${w}██╗${r}  ${b}${w}█████╗${r}  `),
    row(`   ${b}${w}██║   ██║${r}${d}███╗ ██║${r}${b}${w}██║${r} ${b}${w}██╔══██╗${r} `),
    row(`   ${b}${w}██║   ██║${r}${d}██╔████║${r}${b}${w}██║${r} ${b}${w}███████║${r} `),
    row(`   ${b}${w}██║   ██║${r}${d}██║╚███║${r}${b}${w}██║${r} ${b}${w}██╔══██║${r} `),
    row(`   ${b}${w}╚██████╔╝${r}${d}██║ ╚██║${r}${b}${w}██║${r} ${b}${w}██║  ██║${r} `),
    row(`    ${d}╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═╝  ╚═╝${r} `),
    row(`         ${b}${c}a n i m a t i o n s${r}`),
    blank,
    row(`   ${d}22 unicode spinners as raw frame data${r}`),
    row(`   ${d}Zero dependencies · ESM + CJS · Node + Browser${r}`),
    blank,
    row(`   ${y}import${r} spinners ${y}from${r} ${g}'unicode-animations'${r}`),
    blank,
    row(`   ${d}const${r} { frames, interval } = spinners.${c}braille${r}`),
    blank,
    row(`   ${m}⠋ ⠙ ⠹ ⠸ ⠼ ⠴${r}  ${d}braille${r}    ${m}◜ ◠ ◝ ◞ ◡ ◟${r}  ${d}arc${r}`),
    row(`   ${m}◐ ◓ ◑ ◒${r}      ${d}halfmoon${r}   ${m}▁ ▂ ▃ ▄ ▅ ▆${r}  ${d}blocks${r}`),
    blank,
    row(`   ${d}+ 18 more braille grid animations${r}`),
    row(`   ${c}https://github.com/gunnargray-dev/unicode-animations${r}`),
    blank,
    bot,
    '',
  ];

  out.write(lines.join('\n') + '\n');
} catch {
  process.exit(0);
}
