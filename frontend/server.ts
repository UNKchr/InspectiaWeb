import express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import compression from 'compression';
import 'zone.js/node';
import '@angular/compiler';

// Angular server bundle export (bootstrap function)
// Utilizamos import dinámico para soportar ESM/CJS según build.

async function createServer() {
  const app = express();
  app.use(compression());
  app.use(express.json());

    const distFolder = join(process.cwd(), 'build/inspectia-web');
    const browserFolder = join(distFolder, 'browser');
    const serverFolder = join(distFolder, 'server');

    // index.server.html (Angular la genera para SSR)
    const indexHtml = readFileSync(join(serverFolder, 'index.server.html'), 'utf-8');

  // Archivos estáticos con caching
  app.use(express.static(browserFolder, {
    maxAge: '1h'
  }));

  // SSR route handler
  // Catch-all SSR usando regex para evitar conflictos con path-to-regexp en Express 5
  app.get(/.*/, async (req, res) => {
    try {
      // Import relativo al root del proyecto frontend
      const { default: bootstrap } = await import('./build/inspectia-web/server/main.server.mjs');
      const html = await renderAngular(bootstrap, req.url, indexHtml);
      res.status(200).send(html);
    } catch (err) {
      console.error('[SSR] Error rendering', err);
      res.status(500).send(indexHtml); // fallback
    }
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`SSR server listening on http://localhost:${port}`);
  });
}

// Render helper usando el API de @angular/platform-server dynamic
async function renderAngular(bootstrap: any, url: string, indexHtml: string): Promise<string> {
  // Import tardío para no cargar en arranque si no se usa.
  const { renderApplication } = await import('@angular/platform-server');
  return await renderApplication(bootstrap, { document: indexHtml, url });
}

createServer();
