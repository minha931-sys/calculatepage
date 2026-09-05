import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.CP_PLAYWRIGHT_PACKAGE || 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
    const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
    const content = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}); res.end(content);
  } catch {res.writeHead(404);res.end();}
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const base = 'http://127.0.0.1:' + server.address().port;
let browser, checks = 0;
const errors = [];
function check(value, message) {assert.ok(value, message);checks++;}
try {
  browser = await chromium.launch({headless:true, ...(process.env.CP_BROWSER_EXECUTABLE ? {executablePath:process.env.CP_BROWSER_EXECUTABLE} : {})});
  const context = await browser.newContext({viewport:{width:1365,height:1000},locale:'ko-KR',acceptDownloads:true});
  await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(base+'/calculators/work-hours.html');
  await page.locator('#shift-week').fill('2026-09-07');
  let rows = page.locator('.shift-row');
  const fill = async (row, values) => {
    await row.locator('[data-shift-field="start"]').fill(values[0]); await row.locator('[data-shift-field="end"]').fill(values[1]); await row.locator('[data-shift-field="break"]').fill(values[2]);
  };
  await fill(rows.nth(0),['09:00','18:00','60']);
  await page.locator('#shift-add').click();
  await fill(rows.nth(1),['22:00','06:00','30']); await rows.nth(1).locator('[data-shift-field="next-day"]').check();
  await page.getByRole('button',{name:'주간 합계 계산',exact:true}).click();
  await page.locator('#shift-result strong').waitFor();
  check((await page.locator('#shift-result').innerText()).includes('15시간 30분'),'Combined shift total');
  check((await page.locator('#shift-result tbody tr').count())===7,'Seven daily summaries');
  const saved = page.waitForEvent('download'); await page.locator('#shift-download').click(); const download = await saved;
  check(download.suggestedFilename()==='근무기록-2026-09-07.csv','CSV filename');
  const csv = await readFile(await download.path(),'utf8');
  check(csv.includes('"930","15.50"'),'CSV exact total');
  await rows.nth(1).locator('[data-shift-field="break"]').fill('60');
  check(await page.locator('#shift-download').isDisabled(),'Invalidate stale CSV');
  check(await page.locator('#shift-result').innerText()==='','Do not show stale totals');
  await rows.nth(1).locator('[data-shift-field="day"]').selectOption('0');
  await rows.nth(1).locator('[data-shift-field="next-day"]').uncheck();
  await fill(rows.nth(1),['10:00','12:00','0']);
  await page.getByRole('button',{name:'주간 합계 계산',exact:true}).click();
  check((await page.locator('#shift-result').innerText()).includes('겹칩니다'),'Overlap is an error');
  check(await page.locator('#shift-download').isDisabled(),'No CSV on error');
  await rows.nth(1).locator('[data-shift-remove]').click();
  await page.getByRole('button',{name:'주간 합계 계산',exact:true}).click();
  check((await page.locator('#shift-result').innerText()).includes('8시간 0분'),'Delete and recalculate');
  await page.locator('[data-save]').click();
  check((await page.locator('.history-card').count())===1,'Shared result history works');
  await page.locator('[data-copy]').click();
  check(!(await page.locator('.result-tools-status').innerText()).includes('오류'),'Copy or accessible clipboard fallback');
  await page.setViewportSize({width:390,height:844});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'No horizontal mobile overflow');
  if(process.env.CP_QA_OUTPUT){await mkdir(process.env.CP_QA_OUTPUT,{recursive:true});await page.screenshot({path:path.join(process.env.CP_QA_OUTPUT,'weekly-mobile.png'),fullPage:true});}
  await page.locator('footer a[href*="contact.html"]').click();
  check(await page.locator('#report-calculator').inputValue()==='work-hours','Calculator selected in report');
  check(!new URL(page.url()).search.includes('09:00'),'Report URL excludes input values');
  await page.locator('#report-build').click();
  check((await page.locator('#report-status').innerText()).includes('입력해 주세요'),'Require report reproduction steps');
  await page.locator('#report-steps').fill('출근 09:00, 퇴근 18:00, 휴게 60분으로 계산합니다.');
  await page.locator('#report-actual').fill('8시간');
  await page.locator('#report-expected').fill('직접 검산 8시간');
  await page.locator('#report-build').click();
  check((await page.locator('#report-preview').inputValue()).includes('주간 근무시간 계산기'),'Report preview has correct calculator');
  check((await page.locator('#report-status').innerText()).includes('아직 전송되지 않았습니다'),'No false submitted confirmation');
  check((await page.locator('#report-email').getAttribute('href')).startsWith('mailto:min9pages@gmail.com?'),'Email draft uses configured contact');
  await page.locator('#report-copy').click();
  check((await page.locator('#report-status').innerText()).includes('복사'),'Report copy');
  if(process.env.CP_QA_OUTPUT)await page.screenshot({path:path.join(process.env.CP_QA_OUTPUT,'report-mobile.png'),fullPage:true});
  await page.locator('#report-steps').fill('내용 수정');
  check(await page.locator('#report-actions').isHidden(),'Outdated email draft invalidated');
  await page.reload();
  check(await page.locator('#report-steps').inputValue()==='','Report values not persisted');
  await page.goto(base+'/pages/contact.html?calculator=%3Cscript%3E');
  check(await page.locator('#report-calculator').inputValue()==='','Unknown report identifier ignored');
  await page.goto(base+'/calculators/time.html');
  await page.locator('#lt-start').fill('22:30');await page.locator('#lt-end').fill('01:15');await page.locator('#lt-break').fill('15');await page.locator('#lt-calc').click();
  check((await page.locator('#lt-result').innerText()).includes('2시간 30분'),'Existing single-day tool preserved');
  await page.goto(base+'/');await page.locator('#calculator-search').fill('주간 근무');
  check((await page.locator('#search-results').innerText()).includes('주간 근무시간 계산기'),'Home search exposes weekly tool');
  await page.goto(base+'/pages/methodology.html#reproducible-checks');
  check(await page.locator('#reproducible-checks tbody tr').count()===6,'Public verification examples');
  check(errors.length===0,'No browser exceptions: '+errors.join('; '));
  console.log(JSON.stringify({checks,failures:0,browserErrors:errors}));
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
