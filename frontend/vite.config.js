import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (err && err.code === 'ECONNREFUSED') {
              if (res && res.writeHead && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'Backend API on port 5000 is offline or starting up',
                  code: 'ECONNREFUSED'
                }));
              }
            }
          });
        }
      },
      '/widget.js': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (err && err.code === 'ECONNREFUSED') {
              if (res && res.writeHead && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/javascript' });
                res.end('// Backend API on port 5000 is offline or starting up');
              }
            }
          });
        }
      }
    }
  }
});
