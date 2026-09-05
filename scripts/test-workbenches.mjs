import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = {};
vm.runInNewContext(await readFile(new URL('../js/workbench-math.js', import.meta.url), 'utf8'), context);
const math = context.CP_WORKBENCH_MATH;
let checks = 0;
function test(name, check) { check(); checks++; }
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7);

test('Sequential discounts, capped coupon, shipping', () => {
  const result = math.discount(100000, 20, 10, 5000, 3000);
  assert.equal(result.total, 70000);
  close(result.effective, 33);
});
test('Coupon cannot make product price negative', () => assert.equal(math.discount(100, 0, 0, 200, 10).total, 10));
test('Zero discounts are explicit valid values', () => assert.equal(math.discount(100, 0, 0, 0, 0).total, 100));
test('Percent versus percentage points', () => {
  assert.equal(math.points(20, 25).points, 5);
  assert.equal(math.points(20, 25).relative, 25);
});
test('Relative change from zero is undefined', () => assert.equal(math.points(0, 10).relative, null));
test('Deduplicate holidays; ignore weekends and out-of-range holidays', () => {
  const result = math.weekdays('2026-09-01', '2026-09-10', true, true, ['2026-09-03', '2026-09-03', '2026-09-06', '2026-08-31']);
  assert.equal(result.calendar, 10);
  assert.equal(result.weekends, 2);
  assert.equal(result.holidayCount, 1);
  assert.equal(result.workdays, 7);
});
test('Same day with excluded start', () => assert.equal(math.weekdays('2026-09-01', '2026-09-01', false, true, []).workdays, 0));
test('Leap day', () => assert.equal(math.weekdays('2024-02-28', '2024-03-01', true, true, []).calendar, 3));
test('Reject nonexistent date', () => assert.throws(() => math.weekdays('2026-02-30', '2026-03-01', true, true, [])));
test('Reject reversed dates', () => assert.throws(() => math.weekdays('2026-09-10', '2026-09-01', true, true, [])));
test('5:30/km gives 55:00 over 10 km', () => assert.equal(math.pace(5, 30)[2].seconds, 3300));
test('Reject 60 seconds in minute-second input', () => assert.throws(() => math.pace(5, 60)));
test('Mean, median, population deviation and bands', () => {
  const result = math.score([60, 70, 80, 90, 100]);
  assert.equal(result.mean, 80);
  assert.equal(result.median, 80);
  close(result.deviation, Math.sqrt(200));
  assert.equal(result.bands[4].count, 2);
});
test('Even-numbered median', () => assert.equal(math.score([80, 60, 100, 70]).median, 75));
test('Reject scores outside 0–100', () => assert.throws(() => math.score([20, 101])));
test('Discount impact and quantity needed to keep profit', () => {
  const result = math.saleProfit(1000000, 100, 20000, 8000, 10);
  assert.equal(result.before, 200000);
  assert.equal(result.after, 0);
  assert.equal(result.difference, -200000);
  assert.equal(result.sameProfit, 120);
  assert.equal(result.breakEven, 100);
});
test('No break-even when discounted contribution is zero', () => assert.equal(math.saleProfit(100, 100, 10, 5, 50).breakEven, null));
test('Fuel budget to distance', () => close(math.fuel(50000, 12, 1700).distance, 50000 / 1700 * 12));
test('Selling price rounded upward to meet target', () => assert.equal(math.priceTarget(10000, 10, 20).price, 14286));
test('Reject fee + margin at 100%', () => assert.throws(() => math.priceTarget(10000, 50, 50)));
test('Reject negative discount', () => assert.throws(() => math.discount(100, -1, 0, 0, 0)));
test('Reject overflowing relative percentage', () => assert.throws(() => math.points(1e-320, 100)));
test('Reject nonfinite inputs', () => assert.throws(() => math.fuel(Infinity, 1, 1)));

// Cross-check the optimized weekday formula against direct day-by-day counting.
for (let offset = 0; offset < 7; offset++) {
  for (const length of [0, 1, 6, 7, 8, 20, 31, 365]) {
    for (const includeStart of [false, true]) {
      for (const includeEnd of [false, true]) {
        test('Weekday boundary permutation', () => {
          const start = Date.UTC(2026, 0, 1 + offset), end = start + length * 86400000;
          const iso = value => new Date(value).toISOString().slice(0, 10);
          let expected = 0;
          for (let day = start + (includeStart ? 0 : 86400000); day <= end - (includeEnd ? 0 : 86400000); day += 86400000) {
            const weekday = new Date(day).getUTCDay();
            if (weekday !== 0 && weekday !== 6) expected++;
          }
          assert.equal(math.weekdays(iso(start), iso(end), includeStart, includeEnd, []).workdays, expected);
        });
      }
    }
  }
}

export const workbenchTestResult = { checks, failures: 0 };
console.log(`Practical tools: ${checks} checks passed.`);
