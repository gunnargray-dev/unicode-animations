import { describe, it, expect } from 'vitest';
import { spinners, gridToBraille, makeGrid } from './braille';
import type { BrailleSpinnerName } from './braille';

describe('makeGrid', () => {
  it('creates grid with correct dimensions', () => {
    const g = makeGrid(4, 8);
    expect(g.length).toBe(4);
    expect(g[0].length).toBe(8);
    expect(g.every(row => row.every(cell => cell === false))).toBe(true);
  });

  it('returns empty array for zero dimensions', () => {
    expect(makeGrid(0, 5)).toEqual([]);
    expect(makeGrid(5, 0)).toEqual([]);
  });

  it('returns empty array for negative dimensions', () => {
    expect(makeGrid(-1, 5)).toEqual([]);
    expect(makeGrid(5, -1)).toEqual([]);
  });
});

describe('gridToBraille', () => {
  it('returns empty string for empty grid', () => {
    expect(gridToBraille([])).toBe('');
  });

  it('returns blank braille char for all-false 4x2 grid', () => {
    const g = makeGrid(4, 2);
    expect(gridToBraille(g)).toBe('\u2800');
  });

  it('returns full braille char for all-true 4x2 grid', () => {
    const g = makeGrid(4, 2);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) g[r][c] = true;
    expect(gridToBraille(g)).toBe('\u28FF');
  });

  it('encodes individual dots correctly', () => {
    // dot1 (row0, col0) = 0x01
    const g1 = makeGrid(4, 2);
    g1[0][0] = true;
    expect(gridToBraille(g1)).toBe('\u2801');

    // dot4 (row0, col1) = 0x08
    const g2 = makeGrid(4, 2);
    g2[0][1] = true;
    expect(gridToBraille(g2)).toBe('\u2808');

    // dot2 (row1, col0) = 0x02
    const g3 = makeGrid(4, 2);
    g3[1][0] = true;
    expect(gridToBraille(g3)).toBe('\u2802');

    // dot5 (row1, col1) = 0x10
    const g4 = makeGrid(4, 2);
    g4[1][1] = true;
    expect(gridToBraille(g4)).toBe('\u2810');

    // dot3 (row2, col0) = 0x04
    const g5 = makeGrid(4, 2);
    g5[2][0] = true;
    expect(gridToBraille(g5)).toBe('\u2804');

    // dot6 (row2, col1) = 0x20
    const g6 = makeGrid(4, 2);
    g6[2][1] = true;
    expect(gridToBraille(g6)).toBe('\u2820');

    // dot7 (row3, col0) = 0x40
    const g7 = makeGrid(4, 2);
    g7[3][0] = true;
    expect(gridToBraille(g7)).toBe('\u2840');

    // dot8 (row3, col1) = 0x80
    const g8 = makeGrid(4, 2);
    g8[3][1] = true;
    expect(gridToBraille(g8)).toBe('\u2880');
  });

  it('produces multiple characters for wider grids', () => {
    const g = makeGrid(4, 4);
    g[0][0] = true;
    g[0][2] = true;
    const result = gridToBraille(g);
    expect(result.length).toBe(2);
    expect(result).toBe('\u2801\u2801');
  });

  it('handles odd-width grids', () => {
    const g = makeGrid(4, 3);
    g[0][0] = true;
    g[0][2] = true;
    const result = gridToBraille(g);
    expect(result.length).toBe(2);
  });
});

describe('spinners', () => {
  const allNames: BrailleSpinnerName[] = [
    'braille', 'braillewave', 'dna',
    'scan', 'rain', 'scanline', 'pulse', 'snake',
    'sparkle', 'cascade', 'columns', 'orbit', 'breathe',
    'waverows', 'checkerboard', 'helix', 'fillsweep', 'diagswipe',
  ];

  it('exports all 18 spinners', () => {
    expect(Object.keys(spinners).sort()).toEqual([...allNames].sort());
  });

  for (const name of allNames) {
    describe(name, () => {
      it('has non-empty frames', () => {
        expect(spinners[name].frames.length).toBeGreaterThan(0);
      });

      it('has positive interval', () => {
        expect(spinners[name].interval).toBeGreaterThan(0);
      });

      it('has consistent frame widths', () => {
        const widths = spinners[name].frames.map(f => [...f].length);
        expect(new Set(widths).size).toBe(1);
      });

      it('frames match snapshot', () => {
        expect(spinners[name]).toMatchSnapshot();
      });
    });
  }
});
