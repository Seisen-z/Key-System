import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react(), {
    name: 'reiya-local-premium-api',
    apply: 'serve',
    async configureServer(server) {
      const root = server.config.root;
      const environment = loadEnv(mode, root, '');
      for (const [key, value] of Object.entries(environment)) process.env[key] = value;
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (!['/api/premium','/api/admin','/api/customer'].includes(url.pathname)) return next();
        req.query = Object.fromEntries(url.searchParams);
        req.premiumLocalTest = true;
        res.status = code => { res.statusCode = code; return res; };
        res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
        server.ssrLoadModule(url.pathname + '.js').then(({ default: handler }) => handler(req, res)).catch(() => { if (!res.headersSent) res.status(500).json({ error: 'Local Premium API failed' }); });
      });
    },
  }],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.admin-access.local'] } },
}))
