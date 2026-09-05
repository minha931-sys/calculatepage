import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context = {};
vm.runInNewContext(await readFile(new URL('../js/shift-math.js', import.meta.url), 'utf8'), context);
const math = context.CP_SHIFT_MATH;
let checks = 0;
function test(name, fn) { try { fn(); checks++; } catch (error) { throw new Error(name + ': ' + error.message); } }
const row = (options = {}) => ({day: '0', start: '09:00', end: '18:00', nextDay: false, breakMinutes: '60', ...options});
const run = rows => math.summarize('2026-09-07', rows);

test('Published example: daytime and overnight total', () => {
  const result = run([row(), row({day:'1', start:'22:00', end:'06:00', nextDay:true, breakMinutes:'30'})]);
  assert.equal(result.totals.elapsed, 1020); assert.equal(result.totals.rest, 90); assert.equal(result.totals.net, 930);
  assert.equal(result.workdays, 2); assert.equal(math.duration(result.totals.net), '15시간 30분');
});
test('Split shift does not subtract the gap twice', () => assert.equal(run([row({end:'12:00',breakMinutes:'0'}),row({start:'13:00',breakMinutes:'0'})]).totals.net, 480));
test('Ignore entirely blank record', () => assert.equal(run([row(),{day:'6',start:'',end:'',nextDay:false,breakMinutes:''}]).records.length, 1));
test('Reject partly filled record', () => assert.throws(() => run([row({end:''})])));
test('Require explicit zero break', () => assert.throws(() => run([row({breakMinutes:''})])));
test('Reject overnight without explicit next-day flag', () => assert.throws(() => run([row({start:'22:00',end:'06:00'})])));
test('Equal times on same day rejected', () => assert.throws(() => run([row({end:'09:00'})])));
test('24-hour interval accepted with next-day flag', () => assert.equal(run([row({end:'09:00',nextDay:true,breakMinutes:'0'})]).totals.net, 1440));
test('Greater than 24 hours rejected', () => assert.throws(() => run([row({end:'10:00',nextDay:true})])));
test('Break equal to elapsed gives zero', () => assert.equal(run([row({breakMinutes:'540'})]).totals.net, 0));
for (const rest of ['541','-1','1.5','Infinity','NaN','1e2']) test('Invalid break: '+rest, () => assert.throws(() => run([row({breakMinutes:rest})])));
for (const time of ['24:00','12:60','9:00','bad']) test('Invalid clock: '+time, () => assert.throws(() => run([row({start:time})])));
test('Overnight overlap rejected', () => assert.throws(() => run([row({start:'22:00',end:'06:00',nextDay:true}),row({day:'1',start:'05:00',end:'09:00'})]), /겹칩니다/));
test('Touching intervals accepted', () => assert.equal(run([row({end:'12:00',breakMinutes:'0'}),row({start:'12:00',breakMinutes:'0'})]).totals.net, 540));
test('Unordered records sorted before overlap check', () => assert.throws(() => run([row({start:'10:00'}),row()]), /겹칩니다/));
test('Week-end overnight assigned to starting day', () => assert.equal(run([row({day:'6',start:'22:00',end:'06:00',nextDay:true,breakMinutes:'0'})]).days[6].net, 480));
test('Leap-year and year boundaries', () => { assert.equal(math.summarize('2024-02-28',[row({day:'1'})]).records[0].date,'2024-02-29'); assert.equal(math.summarize('2026-12-31',[row({day:'1'})]).records[0].date,'2027-01-01'); });
for (const date of ['2026-02-30','2026-2-1','','1899-01-01','9999-12-31']) test('Invalid week: '+date, () => assert.throws(() => math.summarize(date,[row()])));
test('Limit records', () => assert.throws(() => run(Array.from({length:22},()=>row()))));
test('No records', () => assert.throws(() => run([])));
for (const day of ['7','-1','0.5','bad']) test('Invalid day: '+day, () => assert.throws(() => run([row({day})])));
test('Round only after summing minutes', () => { const result=run([0,1,2].map(day=>row({day,start:'09:00',end:'09:01',breakMinutes:'0'})));assert.equal(result.totals.net,3);assert.equal((result.totals.net/60).toFixed(2),'0.05'); });
test('CSV includes BOM, exact minutes, next-day flag and total', () => { const csv=math.csv(run([row({start:'22:00',end:'06:00',nextDay:true,breakMinutes:'30'})])); assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"다음 날","480","30","450","7.50"'));assert.ok(csv.includes('"합계"'));assert.ok(csv.includes('\r\n')); });

const time = minute => String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');
for (const day of [0,6]) for (const start of [0,359,360,720,1319,1320,1439]) for (const elapsed of [1,59,60,479,480,1440]) for (const rest of [0,Math.floor(elapsed/2),elapsed]) {
  test('Minute arithmetic permutation', () => {
    const result=run([row({day,start:time(start),end:time((start+elapsed)%1440),nextDay:start+elapsed>=1440,breakMinutes:String(rest)})]);
    assert.equal(result.totals.elapsed,elapsed);assert.equal(result.totals.net,elapsed-rest);assert.equal(result.days[day].net,elapsed-rest);
  });
}
export const shiftTestResult = {checks, failures:0};
console.log('Weekly work records: '+checks+' checks passed.');
