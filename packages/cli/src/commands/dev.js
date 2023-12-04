import { fileURLToPath } from 'url';
import { join } from 'path';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

import { getIPAddress } from '../util/network.js';
import { logger, logServerUrl } from '../util/logger.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const dev = async ({ port, sketchDir }) => {
  logger.info('Starting Dev Server');
  const server = await createServer({
    configFile: false,
    root: join(__dirname, '..', 'app'),
    publicDir: join(__dirname, '..', 'app', 'public'),
    clearScreen: false,
    server: {
      port,
      host: true,
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@sketches': join(process.cwd(), sketchDir),
      },
    },
  });

  await server.listen();

  logServerUrl({
    port: server.config.server.port,
    ip: getIPAddress(),
  });
};

export default dev;
