(() => {
  'use strict';
  const root = document.querySelector('#report-builder');
  if (!root) return;
  const select = root.querySelector('#report-calculator');
  const index = window.CP_SEARCH_INDEX || [];
  for (const item of index) {
    const option = document.createElement('option'); option.value = item.slug; option.textContent = item.name; select.append(option);
  }
  const requested = new URLSearchParams(location.search).get('calculator');
  if (index.some(item => item.slug === requested)) select.value = requested;
  const preview = root.querySelector('#report-preview');
  const actions = root.querySelector('#report-actions');
  const status = root.querySelector('#report-status');
  const email = root.querySelector('#report-email');
  function invalidate() { actions.hidden = true; preview.value = ''; email.removeAttribute('href'); }
  root.addEventListener('input', event => { if (event.target !== preview) invalidate(); });
  root.addEventListener('change', invalidate);
  root.querySelector('#report-build').addEventListener('click', () => {
    const item = index.find(item => item.slug === select.value);
    const steps = root.querySelector('#report-steps').value.trim();
    if (!item || !steps) { status.textContent = '계산기와 오류가 발생한 순서를 입력해 주세요.'; (item ? root.querySelector('#report-steps') : select).focus(); return; }
    preview.value = ['[계산페이지 오류 제보]', '계산기: ' + item.name, '주소: https://calculatepage.com/calculators/' + item.slug + '.html', '작성일: ' + new Date().toLocaleDateString('ko-KR'), '', '재현 순서·익명화한 입력값:', steps, '', '실제 결과:', root.querySelector('#report-actual').value.trim() || '(미입력)', '', '기대한 결과·근거:', root.querySelector('#report-expected').value.trim() || '(미입력)', '', '기기·브라우저 (선택): ' + (root.querySelector('#report-browser').value.trim() || '(미입력)')].join('\n');
    email.href = 'mailto:min9pages@gmail.com?subject=' + encodeURIComponent('[계산기 오류] ' + item.name) + '&body=' + encodeURIComponent(preview.value);
    actions.hidden = false;
    status.textContent = '제보 초안을 만들었습니다. 아직 전송되지 않았습니다. 개인정보를 확인한 뒤 복사하거나 이메일 앱을 여세요.';
  });
  root.querySelector('#report-copy').addEventListener('click', async () => {
    if (!preview.value) return;
    try { await navigator.clipboard.writeText(preview.value); status.textContent = '초안을 복사했습니다. 이메일에 붙여 넣어 직접 보내 주세요.'; }
    catch { preview.focus(); preview.select(); status.textContent = '초안을 선택했습니다. 직접 복사해 min9pages@gmail.com으로 보내 주세요.'; }
  });
})();
