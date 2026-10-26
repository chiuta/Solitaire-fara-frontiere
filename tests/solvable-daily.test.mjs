// Teste v2.0.0 — înțelegeri rezolvabile verificate + provocarea zilei. Rulare: node tests/solvable-daily.test.mjs
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
console.log('Solitaire — înțelegeri rezolvabile + provocarea zilei');
ok(await page.locator('#solvChk').count() === 1 && await page.locator('#dailyBtn').count() === 1, 'controalele noi există');
// provocarea zilei: determinist, aceeași înțelegere de două ori, depinde de joc
const d1 = await page.evaluate(() => [__sol.dailySeed('klondike'), __sol.dailySeed('klondike'), __sol.dailySeed('freecell')]);
ok(d1[0] === d1[1] && d1[0] !== d1[2] && d1[0] >= 1, 'seed zilnic stabil și diferit pe joc', d1);
await page.locator('#dailyBtn').click();
ok((await page.locator('#stDeal').textContent()) === '#' + d1[0], 'butonul pornește înțelegerea zilei');
ok(/#\d+/.test(await page.locator('#msg').textContent()), 'mesajul zilei conține numărul');
// rezolvabile: pentru fiecare joc, înțelegerea găsită trebuie să fie câștigată de planul verificat
for (const g of ['freecell', 'klondike', 'eightoff']) {
  await page.evaluate(g => { const gs = document.getElementById('gameSel'); gs.value = g; gs.dispatchEvent(new Event('change')); }, g);
  await page.locator('#solvChk').check();
  await page.locator('#newBtn').click();
  await page.waitForFunction(() => !document.getElementById('newBtn').disabled, null, {timeout: 120000});
  const r = await page.evaluate(() => { const G = __sol.G; return {plan: !!G.plan && G.plan.length, sv: G.solvableSeed, seed: G.seed, msg: document.getElementById('msg').className}; });
  ok(r.plan > 0 && r.sv === r.seed && r.msg.includes('good'), `${g}: înțelegere rezolvabilă găsită (#${r.seed}, ${r.plan} mutări)`, r);
  const won = await page.evaluate(() => { const S = __sol.SOL; let cur = __sol.G.ses.st; for (const m of __sol.G.plan) { const lm = S.legal(cur, m); if (!lm) return false; cur = S.apply(cur, lm); } return S.won(cur); });
  ok(won, `${g}: planul chiar câștigă jocul din poziția inițială`);
}
// „Rezolvă automat” folosește planul
await page.locator('#solveBtn').click();
await page.waitForFunction(() => __sol.SOL.won(__sol.G.ses.st), null, {timeout: 60000}).catch(() => {});
ok(await page.evaluate(() => __sol.SOL.won(__sol.G.ses.st)), 'rezolvarea automată duce la victorie');
ok(await page.evaluate(() => JSON.parse(localStorage.getItem('sol.prefs.v1')).solvOnly === true), 'preferința se salvează');
ok(errs.length === 0, 'fără erori JS', errs); ok(net.length === 0, '0 cereri de rețea', net);
await browser.close();
console.log(`${pass} ok, ${fail} fail`); process.exit(fail ? 1 : 0);
