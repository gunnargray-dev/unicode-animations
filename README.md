# unicode-animations

Unicode spinner animations as raw frame data — no dependencies, works everywhere.

## Preview

```
braille   ⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏
arc       ◜ ◠ ◝ ◞ ◡ ◟
halfmoon  ◐ ◓ ◑ ◒
blocks    ▁ ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▃ ▂
line      | / — \
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

## Terminal example

```js
import spinners from 'unicode-animations';

const { frames, interval } = spinners.braille;
let i = 0;

const timer = setInterval(() => {
  process.stdout.write(`\r${frames[i++ % frames.length]} Loading...`);
}, interval);

// Stop after 3s
setTimeout(() => {
  clearInterval(timer);
  process.stdout.write('\r✔ Done!     \n');
}, 3000);
```

## Browser example

```js
import spinners from 'unicode-animations';

const el = document.getElementById('spinner');
const { frames, interval } = spinners.arc;
let i = 0;

setInterval(() => {
  el.textContent = frames[i++ % frames.length];
}, interval);
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
