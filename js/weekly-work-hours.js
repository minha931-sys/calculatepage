(() => {
  'use strict';
  const form = document.querySelector('#shift-form');
  if (!form) return;
  const math = window.CP_SHIFT_MATH;
  const list = form.querySelector('#shift-list');
  const template = list.firstElementChild.cloneNode(true);
  const output = document.querySelector('#shift-result');
  const startDate = form.querySelector('#shift-week');
  const add = form.querySelector('#shift-add');
  const download = document.querySelector('#shift-download');
  const status = document.querySelector('#shift-status');
  let latest = null;
  function invalidate() {
    if (latest) status.textContent = '입력 조건이 바뀌었습니다. 다시 계산해야 CSV를 저장할 수 있습니다.';
    latest = null;
    download.disabled = true;
    if (output.classList.contains('show')) output.replaceChildren();
    output.classList.remove('show');
  }
  function labels() {
    const rows = [...list.children];
    rows.forEach((row, index) => {
      row.querySelector('legend').textContent = '근무 기록 ' + (index + 1);
      const remove = row.querySelector('[data-shift-remove]');
      remove.disabled = rows.length === 1;
      remove.setAttribute('aria-label', '근무 기록 ' + (index + 1) + ' 삭제');
      row.querySelectorAll('[data-shift-field="day"] option').forEach((option, day) => {
        const stamp = Date.parse(startDate.value + 'T00:00:00Z') + day * 86400000;
        option.textContent = Number.isFinite(stamp) ? new Date(stamp).toISOString().slice(0, 10) + ' (' + ['일','월','화','수','목','금','토'][new Date(stamp).getUTCDay()] + ')' : (day + 1) + '일차';
      });
    });
    add.disabled = rows.length >= 21;
  }
  form.addEventListener('input', invalidate);
  form.addEventListener('change', () => { invalidate(); labels(); });
  add.addEventListener('click', () => {
    if (list.children.length >= 21) return;
    const row = template.cloneNode(true);
    row.querySelector('[data-shift-field="day"]').value = String(Math.min(list.children.length, 6));
    list.append(row); labels(); invalidate();
    row.querySelector('select').focus();
    status.textContent = '빈 근무 기록을 추가했습니다. 분할 근무는 같은 날짜를 선택하세요.';
  });
  list.addEventListener('click', event => {
    const remove = event.target.closest('[data-shift-remove]');
    if (!remove || list.children.length === 1) return;
    remove.closest('fieldset').remove(); labels(); invalidate(); add.focus();
    status.textContent = '기록을 삭제했습니다. 합계를 다시 계산해 주세요.';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    latest = null; download.disabled = true;
    try {
      const rows = [...list.children].map(row => ({day: row.querySelector('[data-shift-field="day"]').value, start: row.querySelector('[data-shift-field="start"]').value, end: row.querySelector('[data-shift-field="end"]').value, nextDay: row.querySelector('[data-shift-field="next-day"]').checked, breakMinutes: row.querySelector('[data-shift-field="break"]').value}));
      latest = math.summarize(startDate.value, rows);
      const {totals, workdays, days, records} = latest;
      output.innerHTML = '<strong>근무 합계 ' + math.duration(totals.net) + '</strong><p>소수 시간 ' + (totals.net / 60).toFixed(2) + '시간 · ' + workdays + '일 / ' + records.length + '개 기록</p><p>경과 ' + math.duration(totals.elapsed) + ' − 휴게 ' + math.duration(totals.rest) + '</p><div class="shift-table-wrap"><table><caption>근무 시작일별 합계 (다음 날 퇴근도 시작일에 합산)</caption><thead><tr><th scope="col">시작일</th><th scope="col">기록</th><th scope="col">휴게</th><th scope="col">근무</th></tr></thead><tbody>' + days.map(day => '<tr><th scope="row">' + day.date + '</th><td>' + day.count + '개</td><td>' + day.rest + '분</td><td>' + math.duration(day.net) + '</td></tr>').join('') + '</tbody></table></div><p>날짜별 근무시간을 분으로 합산한 기록용 결과입니다. 연장·야간·휴일수당이나 법정 근로시간 초과 여부는 판정하지 않습니다.</p>';
      download.disabled = false;
      status.textContent = '계산했습니다. CSV는 사용자가 저장할 때만 파일로 만들어집니다.';
    } catch (error) {
      output.replaceChildren();
      const heading = document.createElement('strong'); heading.textContent = '입력값을 확인해 주세요';
      const detail = document.createElement('p'); detail.textContent = error.message;
      output.append(heading, detail); status.textContent = error.message;
    }
    output.classList.add('show');
  });
  download.addEventListener('click', () => {
    if (!latest) return;
    const url = URL.createObjectURL(new Blob([math.csv(latest)], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = '근무기록-' + latest.startDate + '.csv';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'CSV 저장을 요청했습니다. 공용 기기에서는 내려받은 파일도 정리해 주세요.';
  });
})();
