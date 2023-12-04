import { join } from 'node:path';

const defaultConfig = {
  port: 9966,
  sketchDir: 'sketches',
  buildDir: 'dist',
};

export const getConfig = async () => {
  try {
    const mod = await import(join(process.cwd(), 'verso.config.js'));
    const config = mod.default;

    return {
      ...defaultConfig,
      ...config,
    };
  } catch (err) {
    return defaultConfig;
  }
};
