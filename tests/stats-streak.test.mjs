// Teste v2.1.0 — statistici locale: serii de victorii. Rulare: node tests/stats-streak.test.mjs
import {createRequire} from 'module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL_APP = 'file://' + path.join(HERE, '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 400))); } };
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
const net = [], errs = [];
const ctx = await browser.newContext({viewport: {width: 1280, height: 900}});
await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
const page = await ctx.newPage();
page.on('pageerror', e => errs.push(e.message));
await page.goto(URL_APP + '#play');
console.log('Solitaire — serii de victorii în statistici');
const get = () => page.evaluate(() => { const s = __sol.loadStats(), k = Object.keys(s)[0]; return k ? s[k] : null; });
await page.evaluate(() => localStorage.removeItem('sol.stats.v1'));
// 3 victorii la rând
for (let i = 0; i < 3; i++) await page.evaluate(() => { __sol.recStart(); __sol.recWin(100, 50, 10); });
let r = await get();
ok(r.p === 3 && r.w === 3 && r.cs === 3 && r.bst === 3 && r.o === 0, 'trei victorii: serie curentă 3, cea mai lungă 3', r);
// o partidă începută și abandonată, apoi alta: seria revine la 0, recordul rămâne
await page.evaluate(() => { __sol.recStart(); });
r = await get();
ok(r.cs === 3 && r.o === 1, 'partidă în curs: seria nu se schimbă încă', r);
await page.evaluate(() => { __sol.recStart(); });
r = await get();
ok(r.cs === 0 && r.bst === 3 && r.p === 5, 'abandon (partidă nouă fără victorie): seria revine la 0, recordul rămâne 3', r);
await page.evaluate(() => { __sol.recWin(90, 40, 20); });
r = await get();
ok(r.cs === 1 && r.bst === 3 && r.w === 4 && r.bt === 90 && r.bm === 40 && r.bs === 20, 'o victorie după abandon: seria 1; cele mai bune valori se păstrează', r);
// compatibilitate cu statistici vechi (fără câmpuri de serie)
await page.evaluate(() => { const s = __sol.loadStats(), k = Object.keys(s)[0]; s[k] = {p: 4, w: 2, bt: 200, bm: 90, bs: 5}; localStorage.setItem('sol.stats.v1', JSON.stringify(s)); });
await page.evaluate(() => { __sol.recStart(); __sol.recWin(150, 70, 8); });
r = await get();
ok(r.p === 5 && r.w === 3 && r.cs === 1 && r.bst === 1 && r.bt === 150, 'date vechi (v1) încărcate fără erori; seria începe de la 1', r);
// tabelul din dialog
await page.evaluate(() => __sol.showStats());
const heads = await page.locator('#statsBody th').allTextContents();
ok(heads.length === 9 && /streak|Serie/i.test(heads[7]) && /streak|Serie/i.test(heads[8]), 'tabelul are 9 coloane, ultimele două sunt seriile', heads);
const cells = await page.locator('#statsBody tr:nth-child(2) td').allTextContents();
ok(cells[7] === '1' && cells[8] === '1', 'celulele seriilor afișate', cells);
ok(await page.locator('#statsDlg [data-i18n="stats_streak"]').innerText() !== '', 'nota despre serii este afișată');
ok(errs.length === 0, 'fără erori JS', errs); ok(net.length === 0, '0 cereri de rețea', net);
await browser.close();
console.log(`${pass} ok, ${fail} fail`); process.exit(fail ? 1 : 0);
