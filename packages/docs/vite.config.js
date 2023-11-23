import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mdx(),
    {
      name: 'hex-loader',
      transform(code, id) {
        const [path, query] = id.split('?');
        if (query !== 'raw-hex') return null;

        const data = fs.readFileSync(path);
        const hex = data.toString('hex');

        return `export default '${hex}';`;
      },
    },
  ],
});
