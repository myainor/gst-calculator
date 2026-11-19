/**
 * After `vite build` and the SSR build: pre-render the page into dist/index.html and write
 * the generated SEO files. Run by `npm run build`.
 */
import { readFile, writeFile, rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { jsonLd, llmsTxt, llmsFullTxt, ratesJson, robotsTxt, sitemapXml } from './site.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const ssr = path.join(root, 'dist-ssr');

const lastmod = (() => {
  try {
    return execSync('git log -1 --format=%cs', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch { /* not a git checkout */ }
  return new Date().toISOString().slice(0, 10);
})() || new Date().toISOString().slice(0, 10);

const { render } = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href);
const html = await readFile(path.join(dist, 'index.html'), 'utf8');

if (!html.includes('<div id="root"></div>')) throw new Error('index.html is missing the empty #root to render into');
if (!html.includes('<!--JSON-LD-->')) throw new Error('index.html is missing the <!--JSON-LD--> marker');

const out = html
  .replace('<div id="root"></div>', () => `<div id="root">${render()}</div>`)
  .replace('<!--JSON-LD-->', () => `<script type="application/ld+json">\n${jsonLd()}\n    </script>`);

await writeFile(path.join(dist, 'index.html'), out);
await writeFile(path.join(dist, 'llms.txt'), llmsTxt());
await writeFile(path.join(dist, 'llms-full.txt'), llmsFullTxt());
await writeFile(path.join(dist, 'gst-rates.json'), `${JSON.stringify(ratesJson(), null, 2)}\n`);
await writeFile(path.join(dist, 'robots.txt'), robotsTxt());
await writeFile(path.join(dist, 'sitemap.xml'), sitemapXml(lastmod));
await rm(ssr, { recursive: true, force: true });

console.log(`pre-rendered index.html (${(out.length / 1024).toFixed(1)} kB), wrote llms.txt, llms-full.txt, gst-rates.json, robots.txt, sitemap.xml (lastmod ${lastmod})`);
