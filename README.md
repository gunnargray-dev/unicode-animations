# unicode-animations

Unicode spinner animations as raw frame data — no dependencies, works everywhere.

## Demo

See all 22 spinners animating live:

```bash
npx unicode-animations --web     # open browser demo
npx unicode-animations           # cycle through all in terminal
npx unicode-animations helix     # preview a specific spinner
npx unicode-animations --list    # list all spinners
```

## Install

```bash
npm install unicode-animations
```

## Quick start

```js
// ESM
import spinners from 'unicode-animations';

// CJS
const spinners = require('unicode-animations');
```

Each spinner is a `{ frames: string[], interval: number }` object.

## Examples

### CLI tool — spinner during async work

```js
import spinners from 'unicode-animations';

const { frames, interval } = spinners.braille;
let i = 0;

const spinner = setInterval(() => {
  process.stdout.write(`\r\x1B[2K  ${frames[i++ % frames.length]} Deploying to production...`);
}, interval);

await deploy();

clearInterval(spinner);
process.stdout.write('\r\x1B[2K  ✔ Deployed.\n');
```

### Reusable spinner helper

```js
import spinners from 'unicode-animations';

function createSpinner(msg, name = 'braille') {
  const { frames, interval } = spinners[name];
  let i = 0, text = msg;
  const timer = setInterval(() => {
    process.stdout.write(`\r\x1B[2K  ${frames[i++ % frames.length]} ${text}`);
  }, interval);

  return {
    update(msg) { text = msg; },
    stop(msg) { clearInterval(timer); process.stdout.write(`\r\x1B[2K  ✔ ${msg}\n`); },
  };
}

const s = createSpinner('Connecting to database...');
const db = await connect();
s.update(`Running ${migrations.length} migrations...`);
await db.migrate(migrations);
s.stop('Database ready.');
```

### Multi-step pipeline

```js
import spinners from 'unicode-animations';

async function runWithSpinner(label, fn, name = 'braille') {
  const { frames, interval } = spinners[name];
  let i = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r\x1B[2K  ${frames[i++ % frames.length]} ${label}`);
  }, interval);
  const result = await fn();
  clearInterval(timer);
  process.stdout.write(`\r\x1B[2K  ✔ ${label}\n`);
  return result;
}

await runWithSpinner('Linting...', lint, 'scan');
await runWithSpinner('Running tests...', test, 'helix');
await runWithSpinner('Building...', build, 'cascade');
await runWithSpinner('Publishing...', publish, 'braille');
```

### React component

```jsx
import { useState, useEffect } from 'react';
import spinners from 'unicode-animations';

function Spinner({ name = 'braille', children }) {
  const [frame, setFrame] = useState(0);
  const s = spinners[name];

  useEffect(() => {
    const timer = setInterval(
      () => setFrame(f => (f + 1) % s.frames.length),
      s.interval
    );
    return () => clearInterval(timer);
  }, [name]);

  return <span style={{ fontFamily: 'monospace' }}>{s.frames[frame]} {children}</span>;
}

// Usage: <Spinner name="helix">Generating response...</Spinner>
```

### Browser — status indicator

```js
import spinners from 'unicode-animations';

const el = document.getElementById('status');
const { frames, interval } = spinners.orbit;
let i = 0;

const spinner = setInterval(() => {
  el.textContent = `${frames[i++ % frames.length]} Syncing...`;
}, interval);

await sync();
clearInterval(spinner);
el.textContent = '✔ Synced';
```

## All spinners

### Classic braille

| Name | Preview | Interval |
|------|---------|----------|
| `braille` | `⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏` | 80ms |
| `braillewave` | `⠁⠂⠄⡀⢀⠠⠐⠈` → `⠂⠄⡀⢀⠠⠐⠈⠁` | 100ms |
| `dna` | `⠋⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄` → `⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠠` | 80ms |

### Grid animations (braille)

| Name | Frames | Interval |
|------|--------|----------|
| `scan` | 10 | 70ms |
| `rain` | 12 | 100ms |
| `scanline` | 6 | 120ms |
| `pulse` | 5 | 180ms |
| `snake` | 16 | 80ms |
| `sparkle` | 6 | 150ms |
| `cascade` | 12 | 60ms |
| `columns` | 26 | 60ms |
| `orbit` | 8 | 100ms |
| `breathe` | 17 | 100ms |
| `waverows` | 16 | 90ms |
| `checkerboard` | 4 | 250ms |
| `helix` | 16 | 80ms |
| `fillsweep` | 11 | 100ms |
| `diagswipe` | 16 | 60ms |

### Non-braille classics

| Name | Preview | Interval |
|------|---------|----------|
| `arc` | `◜ ◠ ◝ ◞ ◡ ◟` | 100ms |
| `halfmoon` | `◐ ◓ ◑ ◒` | 180ms |
| `line` | `\| / — \` | 100ms |
| `blocks` | `▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂` | 100ms |

## Custom spinners

Create your own braille spinners using the grid utilities:

```js
import { gridToBraille, makeGrid } from 'unicode-animations';

// Create a 4-row × 4-col grid
const grid = makeGrid(4, 4);
grid[0][0] = true;
grid[1][1] = true;
grid[2][2] = true;
grid[3][3] = true;

console.log(gridToBraille(grid)); // diagonal braille pattern
```

`makeGrid(rows, cols)` returns a `boolean[][]`. Set cells to `true` to raise dots. `gridToBraille(grid)` converts it to a braille string (2 dot-columns per character).

## API

### `Spinner`

```ts
interface Spinner {
  readonly frames: readonly string[];
  readonly interval: number;
}
```

### Exports from `'unicode-animations'`

| Export | Type |
|--------|------|
| `default` / `spinners` | `Record<BrailleSpinnerName, Spinner>` |
| `gridToBraille(grid)` | `(boolean[][]) => string` |
| `makeGrid(rows, cols)` | `(number, number) => boolean[][]` |
| `Spinner` | TypeScript interface |
| `BrailleSpinnerName` | Union type of all 22 spinner names |

### Exports from `'unicode-animations/braille'`

Same as above — the main entrypoint re-exports everything from the braille module.

## License

MIT
