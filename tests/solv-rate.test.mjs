// Teste v2.2.0 — rata măsurată de găsire a unui plan („Doar înțelegeri rezolvabile”): afișare, 8 limbi, plafon de încercări, reproducere pe probe.
// Rulare: node tests/solv-rate.test.mjs
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
const ctx = await browser.newContext({viewport: {width: 1280, height: 900}, locale: 'ro-RO'});
await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
const page = await ctx.newPage();
page.on('pageerror', e => errs.push(e.message));
await page.goto(URL_APP + '#play');
console.log('Solitaire — rata măsurată de găsire a unui plan');
const base = await page.evaluate(() => ({games: __sol.SOL.GAMES, rate: __sol.SOLV_RATE, k: Object.keys(__sol.SOLV_RATE)}));
ok(base.games.every(g => typeof base.rate[g] === 'number' && base.rate[g] >= 0 && base.rate[g] <= 100) && base.k.length === base.games.length, 'tabela acoperă toate cele ' + base.games.length + ' jocuri, valori 0–100', base);
ok(await page.evaluate(() => __sol.solvTriesFor('spider') === 8 && __sol.solvTriesFor('golf') === 8 && __sol.solvTriesFor('forty') === 8 && __sol.solvTriesFor('klondike') === 60 && __sol.solvTriesFor('freecell') === 60), 'plafon de 8 încercări doar la jocurile cu rată măsurată 0 %; 60 în rest');
// afișare
async function setGame(g) { await page.evaluate(g => { const gs = document.getElementById('gameSel'); gs.value = g; gs.dispatchEvent(new Event('change')); }, g); await page.waitForTimeout(150); }
await setGame('klondike');
let tx = await page.textContent('#solvRate');
ok(/47 %/.test(tx) && /30/.test(tx) && /nu este rata reală|Nu este rata reală/i.test(tx), 'klondike: afișează ~47 % din 30 și precizarea că nu e rata reală', tx);
await setGame('spider');
tx = await page.textContent('#solvRate');
ok(/niciun plan/.test(tx) && /8 încercări/.test(tx) && !/\{/.test(tx), 'spider: „niciun plan”, 8 încercări', tx);
// limbi
const langs = await page.evaluate(() => { const ls = document.getElementById('langSel'); return Array.from(ls.options).map(o => o.value); });
const bad = [];
for (const l of langs) {
  await page.selectOption('#langSel', l); await page.waitForTimeout(100);
  const a = await page.textContent('#solvRate'); await setGame('klondike'); const b = await page.textContent('#solvRate'); await setGame('spider');
  if (/\{|solv_rate/.test(a + b) || !a.trim() || !b.trim() || !/47/.test(b)) bad.push(l);
}
ok(langs.length === 8 && bad.length === 0, 'mesajele există în toate cele 8 limbi, fără substituenți', {langs, bad});
await page.selectOption('#langSel', 'ro');
// reproducere pe probe mici (aceleași seed-uri ca în măsurătoare: 1001…)
const probe = await page.evaluate(async () => {
  const S = __sol.SOL, out = {};
  for (const [g, n] of [['freecell', 8], ['eightoff', 8], ['spider', 2], ['golf', 2]]) {
    let win = 0;
    for (let s = 1001; s < 1001 + n; s++) {
      const st = S.newGame(g, S.defaultOpts(g), s), pf = new S.Portfolio(st, {maxNodes: 40000, ws: [1, 0.5]}), t0 = Date.now(); let r;
      for (;;) { r = pf.run(50); if (r !== 'running') break; if (Date.now() - t0 > 2500) { r = 'time'; break; } }
      if (r === 'win') win++;
    }
    out[g] = win + '/' + n;
  }
  return out;
});
const [f1] = probe.freecell.split('/').map(Number), [e1] = probe.eightoff.split('/').map(Number);
ok(f1 >= 6 && e1 >= 6, 'FreeCell și Eight Off: planuri găsite pe ≥ 6 din 8 probe (tabel: 97 %)', probe);
ok(probe.spider.startsWith('0/') && probe.golf.startsWith('0/'), 'Spider și Golf: niciun plan pe probe (tabel: 0 %)', probe);
ok(errs.length === 0, 'fără erori JS', errs); ok(net.length === 0, '0 cereri de rețea', net);
await browser.close();
console.log(`${pass} ok, ${fail} fail`); process.exit(fail ? 1 : 0);
