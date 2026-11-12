import { defineConfig } from 'vite';

/** Library build: one ES module + one stylesheet to drop into any site (Webflow, an LMS page, a static html file). */
export default defineConfig({
  publicDir: false,
  build: {
    target: 'es2022',
    outDir: 'dist-lib',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      // fork.js: the skin for <video>/<hls-video>; fork-mux.js: the same plus <mux-video>.
      entry: { fork: 'src/fork/lib.ts', 'fork-mux': 'src/fork/lib-mux.ts' },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    rollupOptions: {
      output: { assetFileNames: 'fork.[ext]', chunkFileNames: 'chunks/[name]-[hash].js' },
    },
  },
  resolve: { conditions: ['default'] },
});
