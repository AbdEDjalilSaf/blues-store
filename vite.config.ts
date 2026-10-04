import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  try {
    // @ts-expect-error - optional dev-only plugin, absent in trimmed installs
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {
    // Element-picker source tags are a preview-only convenience.
  }

  return {
    plugins,
    build: {
      // es2022 lets esbuild drop the downlevelling helpers for optional
      // chaining / nullish coalescing that this codebase uses heavily.
      target: 'es2022',
      cssMinify: true,
      cssCodeSplit: true,
      assetsInlineLimit: 2048,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          /**
           * Only the framework runtime is pinned. `lucide-react` is deliberately
           * NOT listed here: naming the package as a manual chunk pulled its
           * full icon barrel into the graph and defeated tree-shaking. Icons
           * are now split per-import by Rollup and land in the chunk that uses
           * them.
           */
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
                return 'react-vendor';
              }
              // Shared, low-frequency helpers used by more than one lazy chunk.
              if (id.includes('node_modules/lucide-react')) return 'icons';
            }
            return undefined;
          },
        },
      },
    },
  };
})