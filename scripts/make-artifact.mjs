// Turns the Angular build (dist/nauka-rozmowa/browser) into ONE self-contained page that can be
// published as a Claude artifact: the host adds <!doctype>/<html>/<head>/<body> itself and only
// allows inline code (plus a few CDNs), so styles, the app bundle and the question bank are inlined.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'dist', 'nauka-rozmowa', 'browser');
const out = join(root, 'dist', 'artifact');
if (!existsSync(join(src, 'index.html'))) { console.error('Najpierw: npm run build'); process.exit(1); }

const read = (f) => readFileSync(join(src, f), 'utf8');
const html = read('index.html');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
const title = head.match(/<title>[\s\S]*?<\/title>/i)?.[0] ?? '<title>Rozmowa .NET + Angular</title>';
const fonts = [...head.matchAll(/<link[^>]+fonts\.(googleapis|gstatic)[^>]*>/gi)].map((m) => m[0]).join('\n');
const scripts = [...html.matchAll(/<script src="([^"]+)"[^>]*><\/script>/gi)].map((m) => m[1]);
const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+\.css)"[^>]*>/gi)].map((m) => m[1]).filter((h) => !h.startsWith('http'));

const safe = (s) => s.replace(/<\/(script|style)/gi, '<\\/$1');
const page = [
  title,
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<meta name="theme-color" content="#f3f4f7">',
  fonts,
  ...styles.map((f) => `<style>\n${read(f).replace(/<\/style/gi, '<\\/style')}\n</style>`),
  '<app-root></app-root>',
  `<script type="application/json" id="content-data">${safe(read('content/content.json'))}</script>`,
  ...scripts.map((f) => `<script type="module">\n${safe(read(f))}\n</script>`),
].join('\n');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), page);
console.log('Gotowe:', join(out, 'index.html'), `(${Math.round(page.length / 1024)} KB)`);
