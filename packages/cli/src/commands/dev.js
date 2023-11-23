import { fileURLToPath } from 'url';
import { join } from 'path';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const dev = async () => {
  const server = await createServer({
    configFile: false,
    root: join(__dirname, '..', 'app'),
    publicDir: join(__dirname, '..', 'app', 'public'),
    clearScreen: false,
    server: {
      port: 3000,
      host: true,
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@sketches': join(process.cwd(), 'sketches'),
      },
    },
  });

  console.log('Starting dev server...');
  console.log('http://localhost:3000');

  await server.listen();
};

export default dev;
