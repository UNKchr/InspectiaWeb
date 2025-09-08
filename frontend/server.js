import 'zone.js/node'; // Necesario para SSR Angular
import '@angular/compiler'; // Asegura disponibilidad del compilador en caso de necesitar JIT fallback
import express from 'express';
import compression from 'compression';
import { readFileSync } from 'fs';
import { join } from 'path';

const distFolder = join(process.cwd(), 'build/inspectia-web');
const browserFolder = join(distFolder, 'browser');
const serverFolder = join(distFolder, 'server');
const indexHtml = readFileSync(join(serverFolder, 'index.server.html'), 'utf-8');

async function start() {
		// Import AOT bootstrap del bundle server generado por ng build --ssr
		const { default: bootstrap } = await import('./build/inspectia-web/server/main.server.mjs');
		const { renderApplication } = await import('@angular/platform-server');

	const app = express();
	app.use(compression());
	app.use(express.json());
	app.use(express.static(browserFolder, { maxAge: '1h' }));

	app.get(/.*/, async (req, res) => {
		try {
			const html = await renderApplication(bootstrap, { document: indexHtml, url: req.url });
			res.status(200).send(html);
		} catch (err) {
			console.error('[SSR] Render error', err);
			res.status(500).send(indexHtml);
		}
	});

	const port = process.env.PORT || 4000;
	app.listen(port, () => console.log(`SSR server listening on http://localhost:${port}`));
}

start().catch(e => {
	console.error('Failed to start SSR server', e);
	process.exit(1);
});
