// Renders the screenshots in docs/img from the fictional "Voorbeeldhuis" (fake data, no real home).
// Usage: cd scripts/screenshots && npm i && node shoot.mjs [name-filter]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = path.join(root, 'docs/img');
fs.mkdirSync(out, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url.startsWith('/api/camera_proxy')) { res.writeHead(200, { 'content-type': 'image/svg+xml' }); return res.end(fs.readFileSync(path.join(here, 'camera.svg'))); }
  const file = path.join(root, url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/scripts/screenshots/demo.html`;

const browser = await chromium.launch();
const errors = [];
const filter = process.argv[2];

/** name, query, viewport, optional action inside the page before the shot */
const SHOTS = [
  ['dashboard', 'theme=warm&side=1&people=1&tiles=1&smart=1', [1440, 860]],
  ['thuis', 'theme=warm&home=1&side=1&people=1&smart=1&set=binary_sensor.beweging_keuken=on', [1440, 800]],
  ['kaart-warm', 'theme=warm', [1100, 820]],
  ['kaart-zon', 'theme=sun', [1100, 820]],
  ['kaart-hightech', 'theme=hightech', [1100, 820]],
  ['kaart-rock', 'theme=rock', [1100, 820]],
  ['kaart-blueprint', 'theme=blueprint', [1100, 820]],
  ['kaart-glass', 'theme=glass', [1100, 820]],
  ['kaart-eenvoudig', 'theme=warm&mode=simple', [1100, 820]],
  ['ruimte-zoom', 'theme=warm&people=1', [1100, 820], async (p) => { await p.evaluate(() => demo.el._zoom(demo.plan.rooms.find((r) => r.id === 'r_woon'))); await p.waitForTimeout(900); }],
  ['camera', 'theme=warm', [1100, 820], async (p) => { await p.evaluate(() => demo.el._showCamera('camera.voordeur')); await p.waitForTimeout(500); }],
  ['temperatuur', 'theme=warm&temp=1', [1100, 820]],
  ['aanwezigheid', 'theme=warm&people=1&set=binary_sensor.beweging_keuken=on', [1100, 820]],
  ['melding-rook', 'theme=warm&set=binary_sensor.rookmelder_keuken=on,binary_sensor.achterdeur=on', [1100, 820], async (p) => { await p.waitForTimeout(300); }],
  ['melding-deur', 'theme=warm&set=binary_sensor.achterdeur=on', [1100, 820]],
  ['stofzuiger-live', 'theme=warm&bg=0.5&set=vacuum.robotstofzuiger=cleaning', [1100, 820], async (p) => { await p.waitForTimeout(6500); }],
  ['kiosk-menu', 'theme=hightech&kiosk=1', [1100, 880]],
  ['ruimte-pagina', 'theme=warm&room=keuken&people=1', [1100, 820], async (p) => { await p.waitForTimeout(900); }],
  ['tekstblok-menu', 'theme=warm', [1100, 820], async (p) => {
    const box = await p.locator('floorplan-studio-card-impl').locator('.rinfo[data-room="r_slaap"]').boundingBox();
    await p.mouse.move(box.x + 30, box.y + 10); await p.mouse.down(); await p.waitForTimeout(800); await p.mouse.up(); await p.waitForTimeout(300);
  }],
  ['telefoon-overzicht', 'theme=warm&people=1', [360, 640]],
  ['telefoon-ruimte', 'theme=warm', [360, 760], async (p) => { await p.locator('floorplan-studio-card-impl').locator('[data-croom="r_woon"]').click(); await p.waitForTimeout(900); }],
  ['stofzuiger-ruimte', 'theme=warm', [1100, 820], async (p) => { await p.evaluate(() => demo.el._zoom(demo.plan.rooms.find((r) => r.id === 'r_keuken'))); await p.waitForTimeout(900); }],
  // editor (panel), step by step
  ['stap1-achtergrond', 'view=panel&bg=0.55&empty=1', [1400, 860], async (p) => { await p.waitForTimeout(400); }],
  ['stap2-ruimtes', 'view=panel&bg=0.35&noitems=1&noopen=1', [1400, 860], async (p) => { await step(p, 1); await p.evaluate(() => { const el = demo.el; el.tool = 'select'; el.sel = { type: 'room', id: 'r_woon', part: 0 }; el.render(); }); }],
  ['stap3-deuren', 'view=panel&noitems=1', [1400, 860], async (p) => { await step(p, 2); }],
  ['stap4-apparaten', 'view=panel', [1400, 860], async (p) => { await step(p, 3); }],
  ['stap5-instellingen', 'view=panel', [1400, 2400], async (p) => { await step(p, 4); }],
  ['stap6-klaar', 'view=panel', [1400, 860], async (p) => { await step(p, 5); await p.waitForTimeout(800); }],
];
async function step(p, n) {
  await p.evaluate((n) => { demo.el.step = n; demo.el.render(); }, n);
  await p.waitForTimeout(500);
}

for (const [name, query, [w, h], act] of SHOTS) {
  if (filter && !name.includes(filter)) continue;
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5, colorScheme: 'dark' });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|ERR_TUNNEL/.test(m.text())) errors.push(`${name}: ${m.text()}`); });
  await page.goto(`${base}?${query}&w=${(query.includes('side') ? w : Math.min(w, 1100)) - 32}`);
  await page.waitForFunction(() => window.demoReady, null, { timeout: 8000 }).catch((e) => { console.error(errors.join("\n")); throw e; });
  await page.waitForTimeout(700);
  if (act) await act(page);
  const target = query.includes('view=panel') ? page : page.locator('#wrap > *');
  await target.screenshot({ path: path.join(out, `${name}.png`) });
  await page.close();
  console.log('shot', name);
}
await browser.close();
server.close();
if (errors.length) { console.error('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; }
