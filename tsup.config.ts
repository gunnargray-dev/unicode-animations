import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/braille.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
  },
  {
    entry: ['src/braille.ts'],
    format: ['iife'],
    globalName: 'UnicodeAnimations',
    outDir: 'dist',
  },
]);
