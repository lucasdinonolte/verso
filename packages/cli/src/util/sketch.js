import { basename, dirname, join } from 'node:path';
import { mkdir, stat } from 'node:fs/promises';

import { build } from 'vite';

import { versoVitePlugin } from '../lib/compiler.js';

export const outName = (outPath) => {
  const name = basename(outPath);
  const dir = dirname(outPath);
  const ext = name.split('.').pop();

  return {
    name: name.replace(`.${ext}`, ''),
    path: join(process.cwd(), dir),
    extension: ext,
  };
};

export const ensureOutputDir = async (path) => {
  try {
    const outDirStats = await stat(path);

    if (!outDirStats.isDirectory()) {
      throw new Error(`Output path ${path} is not a directory`);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }

    await mkdir(path, { recursive: true });
  }
};

const randomHash = () => {
  return Math.random().toString(36).slice(2);
};

export const buildSketch = async (
  entry,
  { tempDir = join(process.cwd(), '.tmp') } = {}
) => {
  const outName = randomHash();

  await build({
    configFile: false,
    mode: 'production',
    logLevel: 'error',
    build: {
      lib: {
        entry: join(process.cwd(), entry),
        formats: ['es'],
        name: outName,
        fileName: outName,
      },
      minify: false,
      outDir: tempDir,
    },
    plugins: [versoVitePlugin()],
  });

  return join(tempDir, `${outName}.js`);
};
