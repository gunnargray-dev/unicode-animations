#!/usr/bin/env node

// Postinstall animation — showcases a few spinners side-by-side for ~1.5s
// Skips gracefully in non-TTY environments (CI, piped output)

if (!process.stdout.isTTY) process.exit(0);

try {
  const DURATION = 1500;
  const INTERVAL = 80;

  // Inline a few single-char spinners to avoid importing dist (may not exist yet)
  const spinners = [
    { frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] }, // braille
    { frames: ['◜', '◠', '◝', '◞', '◡', '◟'] },                           // arc
    { frames: ['◐', '◓', '◑', '◒'] },                                       // halfmoon
    { frames: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▂'] }, // blocks
    { frames: ['|', '/', '—', '\\'] },                                        // line
  ];

  const hide = '\x1B[?25l';
  const show = '\x1B[?25h';
  const clearLine = '\x1B[2K\r';
  const bold = '\x1B[1m';
  const green = '\x1B[32m';
  const reset = '\x1B[0m';

  process.stdout.write(hide);

  const cleanup = () => process.stdout.write(show);
  process.on('SIGINT', () => { cleanup(); process.exit(0); });

  let tick = 0;
  const start = Date.now();

  const timer = setInterval(() => {
    if (Date.now() - start >= DURATION) {
      clearInterval(timer);
      const done = `${clearLine}  ${green}${bold}✔${reset} ${bold}unicode-animations${reset} — 22 spinners ready\n`;
      process.stdout.write(done);
      cleanup();
      return;
    }

    const chars = spinners.map(s => s.frames[tick % s.frames.length]);
    process.stdout.write(`${clearLine}  ${chars.join('  ')}`);
    tick++;
  }, INTERVAL);
} catch {
  // Never block install
  process.exit(0);
}
