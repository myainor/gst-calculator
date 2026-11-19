/**
 * Submit the site's URLs to IndexNow (Bing, Yandex, Naver, Seznam and others).
 * Run after deploying: the key file must already be live at https://<host>/<key>.txt.
 *
 *   npm run indexnow            submit
 *   npm run indexnow -- --dry   show what would be sent
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const HOST = 'gst.freelysta.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

// The key is the name of the one 32-hex-character .txt file in public/, and it must equal that file's contents.
const files = (await readdir(path.join(root, 'public'))).filter((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (files.length !== 1) throw new Error(`Expected one IndexNow key file in public/, found ${files.length}`);
const key = files[0].replace('.txt', '');
if ((await readFile(path.join(root, 'public', files[0]), 'utf8')).trim() !== key) throw new Error('Key file contents do not match its name');

const sitemap = await readFile(path.join(root, 'dist', 'sitemap.xml'), 'utf8').catch(() => {
  throw new Error('dist/sitemap.xml not found. Run `npm run build` first.');
});
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
const body = { host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList };

if (process.argv.includes('--dry')) {
  console.log(JSON.stringify({ ...body, key: `${key.slice(0, 4)}…` }, null, 2));
  process.exit(0);
}

const live = await fetch(body.keyLocation).then((r) => r.text()).catch(() => '');
if (live.trim() !== key) throw new Error(`The key file is not live at ${body.keyLocation}. Deploy first.`);

const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
// 200 = accepted, 202 = accepted and key validation pending. Anything else is a problem.
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (![200, 202].includes(res.status)) {
  console.error(await res.text().catch(() => ''));
  process.exit(1);
}
