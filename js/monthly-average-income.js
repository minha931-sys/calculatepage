(function(){
  const root = document.querySelector('#calculator');
  if(!root || document.body.dataset.customCalculator !== 'monthly-average-income') return;

  const incomeBase2026 = {
    1: 3813363,
    2: 5866270,
    3: 8168429,
    4: 8802202,
    5: 9326985,
    6: 9906263
  };
  const money = value => Math.round(Number(value) || 0).toLocaleString('ko-KR') + '원';
  const pct = value => (Number.isFinite(value) ? value : 0).toFixed(1) + '%';
  const num = selector => Number(root.querySelector(selector)?.value || 0);
  const checked = selector => !!root.querySelector(selector)?.checked;
  const card = (label,value,sub='') => `<div><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const input = (cls,label,placeholder) => `<label><span>${label}</span><input class="${cls}" type="number" min="0" step="any" inputmode="decimal" placeholder="예: ${placeholder}"></label>`;

  const people = [
    ['self','본인'],
    ['spouse','배우자'],
    ['parent1','부모 1'],
    ['parent2','부모 2']
  ];

  function personCard(id,label,checkedByDefault){
    return `<details class="income-member-card${checkedByDefault ? ' income-included' : ''}" data-person="${id}" ${checkedByDefault ? 'open' : ''}>
      <summary class="income-member-head">
        <span><b>${label}</b><small>펼쳐서 입력하고 포함 여부를 따로 선택하세요</small></span>
        <label class="income-member-action income-member-include-control"><input class="income-member-include" type="checkbox" ${checkedByDefault ? 'checked' : ''}> 소득 포함</label>
      </summary>
      <div class="utility-fields">
        ${input('monthly-salary','월급·고정급(세전)','2500000')}
        ${input('parttime-income','알바·부업 월소득(세전)','500000')}
        ${input('annual-bonus','연 상여금·성과급','2400000')}
        ${input('freelance-income','프리랜서·사업 연소득금액','12000000')}
        ${input('other-monthly','기타 월소득','300000')}
      </div>
    </details>`;
  }

  if(!root.hasAttribute('data-static-rendered')) root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/money.html">금융 카테고리 더보기</a>
    <h1>월평균합산소득 계산기</h1>
    <p class="lead">청년매입임대, 행복주택, 국민임대, 청약 신청 전에 본인·부모·배우자 소득을 월평균으로 합산해 신청서 입력용 추정 금액을 확인합니다.</p>
    <section class="calculator-box utility-box readable-calc-box">
      <div class="readable-intro">
        <h2>신청서에 적을 월평균합산소득을 빠르게 추정</h2>
        <p>월평균합산소득은 통장에 찍히는 실수령액이 아니라 보통 세전 소득자료를 월 단위로 환산한 금액입니다. 월급, 알바비, 프리랜서 소득, 상여금처럼 성격이 다른 소득을 한 달 기준으로 바꾼 뒤 소득 확인 대상자별로 합산합니다.</p>
        <div class="readable-guide-grid">
          <article><b>청년매입임대 2순위</b><p>일반적으로 본인과 부모의 월평균소득 합계를 기준으로 봅니다.</p></article>
          <article><b>청년매입임대 3순위</b><p>일반적으로 본인 1인의 월평균소득을 기준으로 봅니다.</p></article>
          <article><b>최종 판단</b><p>신청 후에는 건강보험, 국세청 등 공적자료 조회 결과가 우선될 수 있습니다.</p></article>
        </div>
      </div>
      <div class="utility-form">
        <h2>1. 신청 유형을 선택하세요</h2>
        <div class="utility-fields">
          <label><span>신청 유형</span><select id="mai-mode">
            <option value="youth-rank-2">청년매입·전세임대 2순위</option>
            <option value="youth-rank-3">청년매입·전세임대 3순위</option>
            <option value="happy-student">행복주택 대학생 계층</option>
            <option value="happy-youth">행복주택 청년·일반 계층</option>
            <option value="custom">직접 선택</option>
          </select></label>
          <label><span>가구원 수/비교 기준</span><select id="mai-household">${Object.keys(incomeBase2026).map(size => `<option value="${size}">${size}인 가구</option>`).join('')}<option value="custom">7인 이상/직접 입력</option></select></label>
          <label><span>소득기준 비율</span><select id="mai-ratio"><option value="50">50%</option><option value="70">70%</option><option value="80">80%</option><option value="100" selected>100%</option><option value="120">120%</option><option value="130">130%</option><option value="140">140%</option><option value="160">160%</option></select></label>
          <label><span>공고문 기준액 직접 입력(선택)</span><input id="mai-custom-limit" type="number" min="0" step="any" inputmode="decimal" placeholder="예: 8168429"></label>
          <label><span>비정기 소득 나눌 개월 수</span><input id="mai-divide-months" type="number" min="1" step="1" inputmode="numeric" placeholder="예: 12"></label>
        </div>
        <label class="inline-check"><input id="mai-small-household" type="checkbox" checked> <span>1인 가구 +20%p, 2인 가구 +10%p 가산 기준 함께 반영</span></label>
      </div>
      <div class="utility-form">
        <h2>2. 포함할 사람과 소득을 입력하세요</h2>
        <div id="mai-people" class="income-member-list">
          ${people.map(([id,label],index) => personCard(id,label,index === 0)).join('')}
        </div>
        <button class="primary-btn" id="mai-calc" type="button">월평균합산소득 계산하기</button>
      </div>
      <div class="result" id="mai-result" aria-live="polite"></div>
      <p class="calculator-note">이 계산기는 신청 전 추정용입니다. 계산페이지는 청약·임대주택 관련 기관의 공식 서비스가 아니며, 어떤 기관의 승인·제휴·보증을 받은 계산기도 아닙니다. 실제 소득 인정 여부, 부모·배우자 포함 범위, 1인·2인 가산 적용 여부, 최종 자격 판단은 반드시 해당 모집공고와 기관의 공적자료 조회 기준을 확인하세요.</p>
    </section>
    <section class="content-block">
      <h2>청약·임대주택 신청 유형별로 누구 소득을 보나요?</h2>
      <div class="loan-schedule-table-wrap">
        <table class="loan-schedule-table">
          <thead><tr><th>유형</th><th>주로 보는 소득 대상</th><th>계산기 기본값</th></tr></thead>
          <tbody>
            <tr><td>청년매입·전세임대 2순위</td><td>본인 + 부모 월평균소득 합계</td><td>본인, 부모 1, 부모 2 포함</td></tr>
            <tr><td>청년매입·전세임대 3순위</td><td>본인 월평균소득</td><td>본인만 포함, 1인 기준</td></tr>
            <tr><td>행복주택 대학생 계층</td><td>본인 및 부모 월평균소득 합계</td><td>본인, 부모 1, 부모 2 포함</td></tr>
            <tr><td>행복주택 청년·일반 계층</td><td>해당 세대 월평균소득 합계</td><td>본인과 배우자 포함</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="content-block">
      <h2>소득 입력 기준</h2>
      <div class="loan-schedule-table-wrap">
        <table class="loan-schedule-table">
          <thead><tr><th>소득 종류</th><th>어떻게 입력하나요?</th><th>계산식</th></tr></thead>
          <tbody>
            <tr><td>월급·알바비</td><td>세전 월 금액을 입력합니다. 실수령액보다 세전 기준이 더 가깝습니다.</td><td>월 금액 그대로 반영</td></tr>
            <tr><td>상여금·성과급</td><td>1년 동안 받은 비정기 금액을 입력합니다.</td><td>연 금액 ÷ 나눌 개월 수</td></tr>
            <tr><td>프리랜서·사업소득</td><td>소득금액증명 등에서 확인한 연 소득금액을 입력합니다.</td><td>연 소득금액 ÷ 나눌 개월 수</td></tr>
            <tr><td>신청서 입력칸</td><td>공고에 따라 추정치 또는 0원을 입력하고, 추후 공적자료로 확인될 수 있습니다.</td><td>최종 판단은 공적자료 기준</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="content-block">
      <h2>2026년 적용 도시근로자 월평균소득 기준</h2>
      <div class="loan-schedule-table-wrap">
        <table class="loan-schedule-table">
          <thead><tr><th>가구원 수</th><th>100% 기준</th><th>110% 기준</th><th>120% 기준</th></tr></thead>
          <tbody>${Object.entries(incomeBase2026).map(([size,base]) => `<tr><td>${size}인</td><td>${money(base)}</td><td>${money(base * 1.1)}</td><td>${money(base * 1.2)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p>1인 가구와 2인 가구는 일부 임대주택 소득기준에서 각각 20%p, 10%p 가산 기준이 붙는 경우가 있습니다. 계산기에서는 체크박스로 함께 반영할 수 있지만, 실제 적용 여부는 모집공고가 우선입니다.</p>
      <p>기준일: 2026년 7월 10일. 이 표는 마이홈포털 국민임대주택 안내의 2026년도 적용 가구원수별 월평균소득 기준을 계산기에 반영한 것입니다. 주택 유형과 공고마다 적용 기준표, 비율, 가구원 인정 범위, 1인·2인 가산 여부가 다를 수 있으므로 계산기의 직접 입력 기능과 실제 모집공고를 우선해 주세요.</p>
      <p class="jlpt-source">참고: <a href="https://m.myhome.go.kr/hws/portal/cont/selectlongTermLeaseHouseView.do" target="_blank" rel="noopener noreferrer">마이홈포털 국민임대주택 소득기준 안내</a></p>
    </section>
    <section class="content-block">
      <h2>예시로 보는 월평균합산소득</h2>
      <p>월급과 상여금이 섞여 있으면 연봉을 단순히 12로 나누는 것보다 소득 종류별로 나눠 보는 편이 이해하기 쉽습니다. 예를 들어 본인 세전 월급이 250만원이고 1년 상여금이 240만원이라면, 월평균합산소득은 250만원 + 240만원 ÷ 12개월 = 270만원으로 추정할 수 있습니다.</p>
      <div class="loan-schedule-table-wrap">
        <table class="loan-schedule-table">
          <thead><tr><th>상황</th><th>입력 예시</th><th>월평균 반영</th><th>해석</th></tr></thead>
          <tbody>
            <tr><td>월급만 있는 경우</td><td>월급·고정급 250만원</td><td>250만원</td><td>매월 같은 세전 금액을 그대로 반영</td></tr>
            <tr><td>상여금이 있는 경우</td><td>연 상여금 240만원</td><td>20만원</td><td>비정기 소득 나눌 개월 수 12개월 기준</td></tr>
            <tr><td>프리랜서 소득이 있는 경우</td><td>연 소득금액 1,200만원</td><td>100만원</td><td>소득금액증명 등 연 단위 자료를 월 단위로 환산</td></tr>
            <tr><td>부모 소득 포함 여부</td><td>신청 유형에 따라 선택</td><td>포함한 사람만 합산</td><td>최종 범위는 모집공고의 소득 확인 대상 기준 우선</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="content-block">
      <h2>월평균합산소득 계산기는 언제 쓰면 좋나요?</h2>
      <p>청약·임대주택 신청 전 본인, 부모, 배우자의 소득을 어느 정도로 합산해야 하는지 감을 잡고 싶을 때 사용하면 좋습니다. 월급처럼 매달 들어오는 소득과 상여금, 프리랜서 소득처럼 기간을 나눠 봐야 하는 소득을 한 달 기준으로 정리할 수 있습니다.</p>
      <p>특히 모집공고에서 가구원 수별 월평균소득 100%, 120% 같은 기준을 확인했지만 내 소득이 그 기준 안에 들어가는지 빠르게 비교하고 싶을 때 참고용으로 활용하세요.</p>
    </section>
    <section class="content-block">
      <h2>공식 서비스가 아닌 참고용 계산기입니다</h2>
      <p>이 페이지는 청약·임대주택 관련 기관과 제휴하거나 승인을 받은 공식 계산기가 아닙니다. 사용자가 모집공고를 읽기 전에 월평균합산소득의 대략적인 구조를 이해하도록 돕는 참고용 도구입니다.</p>
      <p>신청서에 입력한 금액과 최종 심사 금액이 달라질 수 있으며, 실제 자격 판단은 공고문, 제출서류, 건강보험·국세청 등 공적자료 조회 결과를 기준으로 이루어질 수 있습니다.</p>
    </section>
    <section class="content-block">
      <h2>관련 계산기</h2>
      <div class="related"><a href="/calculators/housing-subscription.html">청약 가점 계산기</a><a href="/calculators/monthly-rent-deduction.html">월세 세액공제 계산기</a><a href="/calculators/salary.html">월급 실수령액 계산기</a><a href="/calculators/mortgage-loan.html">주택담보대출 계산기</a></div>
    </section>`;

  root.querySelectorAll('.income-member-card').forEach((area,index) => {
    const action=area.querySelector('.income-member-action');
    let toggle=area.querySelector('.income-member-include');
    if(!toggle&&action){
      action.removeAttribute('aria-hidden');
      action.innerHTML=`<input class="income-member-include" type="checkbox" ${index===0?'checked':''}> 소득 포함`;
      action.classList.add('income-member-include-control');
      toggle=area.querySelector('.income-member-include');
    }
    const sync=()=>area.classList.toggle('income-included',!!toggle?.checked);
    action?.addEventListener('click',event=>event.stopPropagation());
    action?.addEventListener('keydown',event=>event.stopPropagation());
    toggle?.addEventListener('change',sync);
    sync();
  });

  function applyMode(mode){
    const includes = {
      'youth-rank-2':['self','parent1','parent2'],
      'youth-rank-3':['self'],
      'happy-student':['self','parent1','parent2'],
      'happy-youth':['self','spouse'],
      custom:null
    }[mode];
    if(includes){
      people.forEach(([id]) => {
        const box = root.querySelector(`[data-person="${id}"]`);
        if(!box)return;
        const included=includes.includes(id);
        const toggle=box.querySelector('.income-member-include');
        if(toggle)toggle.checked=included;
        box.classList.toggle('income-included',included);
        box.open=included;
      });
    }
    if(mode === 'youth-rank-3'){
      root.querySelector('#mai-household').value = '1';
      root.querySelector('#mai-ratio').value = '100';
    }else if(mode === 'youth-rank-2' || mode === 'happy-student'){
      root.querySelector('#mai-household').value = '3';
      root.querySelector('#mai-ratio').value = '100';
    }else if(mode === 'happy-youth'){
      root.querySelector('#mai-household').value = '2';
      root.querySelector('#mai-ratio').value = '100';
    }
  }

  root.querySelector('#mai-mode').onchange = event => applyMode(event.target.value);
  root.querySelector('#mai-mode').value = 'youth-rank-3';
  applyMode('youth-rank-3');

  root.querySelector('#mai-calc').onclick = () => {
    const sizeValue = root.querySelector('#mai-household').value;
    const size = sizeValue === 'custom' ? null : Number(sizeValue);
    const ratio = Number(root.querySelector('#mai-ratio').value);
    const customLimit = num('#mai-custom-limit');
    const divideMonthsValue = root.querySelector('#mai-divide-months').value;
    const divideMonths = divideMonthsValue === '' ? 12 : Number(divideMonthsValue);
    const smallHouseholdAdd = checked('#mai-small-household');
    const includedAreas=people.map(([id])=>root.querySelector(`[data-person="${id}"]`)).filter(area=>area?.querySelector('.income-member-include')?.checked);
    const numericInputs=[root.querySelector('#mai-custom-limit'),root.querySelector('#mai-divide-months'),...includedAreas.flatMap(area=>[...area.querySelectorAll('input[type="number"]')])].filter(Boolean);
    const invalidInput=numericInputs.find(input=>input.value!==''&&(!Number.isFinite(Number(input.value))||Number(input.value)<0));
    if(invalidInput||!Number.isInteger(divideMonths)||divideMonths<=0){
      const result=root.querySelector('#mai-result');
      result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>포함한 사람의 소득은 0 이상의 숫자, 나눌 개월 수는 1 이상의 정수로 입력해 주세요.</p>';
      result.classList.add('show');
      invalidInput?.closest('details')?.setAttribute('open','');
      (invalidInput||root.querySelector('#mai-divide-months'))?.focus();
      return;
    }
    const effectiveRatio = smallHouseholdAdd && size === 1 ? ratio + 20 : smallHouseholdAdd && size === 2 ? ratio + 10 : ratio;
    const base = size ? incomeBase2026[size] : customLimit ? customLimit / (effectiveRatio / 100) : 0;
    const limit = customLimit || base * effectiveRatio / 100;
    const rows = [];
    let total = 0;
    let includedCount = 0;

    people.forEach(([id,label]) => {
      const area = root.querySelector(`[data-person="${id}"]`);
      if(!area?.querySelector('.income-member-include')?.checked) return;
      includedCount += 1;
      const monthlySalary = Number(area.querySelector('.monthly-salary').value || 0);
      const parttime = Number(area.querySelector('.parttime-income').value || 0);
      const bonusMonthly = Number(area.querySelector('.annual-bonus').value || 0) / divideMonths;
      const freelanceMonthly = Number(area.querySelector('.freelance-income').value || 0) / divideMonths;
      const other = Number(area.querySelector('.other-monthly').value || 0);
      const monthly = monthlySalary + parttime + bonusMonthly + freelanceMonthly + other;
      total += monthly;
      rows.push(`<tr><td>${label}</td><td>${money(monthlySalary + parttime)}</td><td>${money(bonusMonthly)}</td><td>${money(freelanceMonthly)}</td><td>${money(other)}</td><td>${money(monthly)}</td></tr>`);
    });

    const result = root.querySelector('#mai-result');
    if(!includedCount || !limit){
      result.innerHTML = '<strong>입력값을 확인해 주세요</strong><p>소득에 포함할 사람을 한 명 이상 선택해 주세요. 소득이 없다면 0원인 상태로 계산할 수 있습니다. 7인 이상/직접 입력 기준은 공고문 기준액도 함께 입력해야 합니다.</p>';
      result.classList.add('show');
      return;
    }

    const baseRatio = base ? total / base * 100 : null;
    const diff = limit - total;
    const modeText = root.querySelector('#mai-mode').selectedOptions[0].textContent;

    result.innerHTML = `<div class="savings-result-grid">
        ${card('월평균합산소득', money(total), `${includedCount}명 소득 포함`)}
        ${card('연 환산 소득', money(total * 12), '월평균 × 12개월')}
        ${card('기준 대비 비율', baseRatio === null ? '직접 기준' : pct(baseRatio), size ? `${size}인 100% 기준 ${money(base)}` : '공고문 직접 기준')}
        ${card('선택 기준액', money(limit), `적용 기준 ${customLimit ? '직접 입력' : effectiveRatio + '%'}`)}
      </div>
      <div class="switch-verdict"><b>${diff >= 0 ? '선택 기준 이내' : '선택 기준 초과'}</b><p>${modeText} 기준으로 단순 비교하면 ${diff >= 0 ? `기준보다 ${money(diff)} 낮습니다.` : `기준보다 ${money(Math.abs(diff))} 높습니다.`} 신청서 입력값과 최종 심사 금액은 달라질 수 있으므로 실제 제출 전에는 모집공고 안내를 확인하세요.</p></div>
      <div class="loan-schedule-table-wrap"><table class="loan-schedule-table"><thead><tr><th>대상</th><th>월급·알바</th><th>상여 월환산</th><th>프리랜서 월환산</th><th>기타</th><th>합계</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>
      <p class="loan-schedule-note">비정기 소득은 ${divideMonths}개월로 나누어 월평균으로 환산했습니다. 실제 신청 결과는 모집공고의 소득 산정 대상과 공적자료 조회 기준을 따릅니다.</p>`;
    result.classList.add('show');
  };
})();
