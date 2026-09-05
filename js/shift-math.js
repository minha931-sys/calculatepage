/* Wall-clock minutes only: no payroll rules, time zones or automatic breaks. */
(() => {
  'use strict';
  const DAY = 1440;
  function date(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1900) throw new Error('시작 날짜를 올바르게 선택해 주세요.');
    const stamp = Date.parse(value + 'T00:00:00Z');
    if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== value) throw new Error('존재하는 시작 날짜를 선택해 주세요.');
    if (stamp > Date.UTC(9999, 11, 24)) throw new Error('시작 날짜는 9999년 12월 24일 이전으로 선택해 주세요.');
    return stamp;
  }
  function clock(value) {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('출근·퇴근 시각을 모두 입력해 주세요.');
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }
  function duration(minutes) { return Math.floor(minutes / 60) + '시간 ' + minutes % 60 + '분'; }
  function summarize(startDate, rows) {
    const stamp = date(startDate);
    if (!Array.isArray(rows) || rows.length > 21) throw new Error('근무 기록은 최대 21개까지 입력할 수 있습니다.');
    const records = [];
    rows.forEach((row, index) => {
      const prefix = (index + 1) + '번 기록: ';
      if (![row.start, row.end, row.breakMinutes].some(value => String(value ?? '').trim())) return;
      try {
        const day = Number(row.day);
        if (!Number.isInteger(day) || day < 0 || day > 6) throw new Error('근무일을 선택해 주세요.');
        if (typeof row.nextDay !== 'boolean') throw new Error('퇴근일을 선택해 주세요.');
        const start = day * DAY + clock(row.start);
        const end = day * DAY + clock(row.end) + (row.nextDay ? DAY : 0);
        const elapsed = end - start;
        if (elapsed <= 0 || elapsed > DAY) throw new Error('근무 구간은 0분 초과 24시간 이하여야 합니다. 자정을 넘기면 다음 날 퇴근을 선택하세요.');
        const rawBreak = String(row.breakMinutes ?? '').trim();
        if (!/^\d+$/.test(rawBreak)) throw new Error('휴게시간은 분 단위 정수로 입력하세요. 휴게가 없으면 0을 입력하세요.');
        const rest = Number(rawBreak);
        if (!Number.isSafeInteger(rest) || rest > elapsed) throw new Error('휴게시간이 전체 근무 구간보다 깁니다.');
        records.push({index: index + 1, day, date: new Date(stamp + day * 86400000).toISOString().slice(0, 10), start, end, startTime: row.start, endTime: row.end, nextDay: row.nextDay, elapsed, rest, net: elapsed - rest});
      } catch (error) { throw new Error(prefix + error.message); }
    });
    if (!records.length) throw new Error('출근·퇴근 시각과 휴게시간을 한 줄 이상 입력해 주세요.');
    records.sort((a, b) => a.start - b.start);
    for (let i = 1; i < records.length; i++) {
      if (records[i].start < records[i - 1].end) throw new Error(records[i - 1].index + '번과 ' + records[i].index + '번 기록의 근무 구간이 겹칩니다. 휴게 중 별도 근무라면 구간을 나눠 입력하세요.');
    }
    const days = Array.from({length: 7}, (_, day) => ({date: new Date(stamp + day * 86400000).toISOString().slice(0, 10), count: 0, elapsed: 0, rest: 0, net: 0}));
    const totals = {elapsed: 0, rest: 0, net: 0};
    for (const record of records) {
      days[record.day].count++;
      for (const key of Object.keys(totals)) { days[record.day][key] += record[key]; totals[key] += record[key]; }
    }
    return {startDate, records, days, totals, workdays: days.filter(day => day.count).length};
  }
  function csv(result) {
    const rows = [['근무 시작일', '출근', '퇴근', '퇴근일 구분', '경과 분', '휴게 분', '근무 분', '근무 시간(소수)']];
    result.records.forEach(row => rows.push([row.date, row.startTime, row.endTime, row.nextDay ? '다음 날' : '당일', row.elapsed, row.rest, row.net, (row.net / 60).toFixed(2)]));
    rows.push(['합계', '', '', '', result.totals.elapsed, result.totals.rest, result.totals.net, (result.totals.net / 60).toFixed(2)]);
    rows.push(['기준: 시작일에 귀속. 분 단위 합산 후 소수 시간 반올림. 수당·법정 근로시간 판정 아님.']);
    return '\uFEFF' + rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  }
  globalThis.CP_SHIFT_MATH = Object.freeze({summarize, duration, csv});
})();
