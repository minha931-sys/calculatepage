(function(){
  const root = document.querySelector('#calculator');
  if(!root || document.body.dataset.customCalculator !== 'mortgage-loan') return;

  const money = value => Math.round(Number(value) || 0).toLocaleString('ko-KR') + '원';
  const pct = value => (Number.isFinite(value) ? value : 0).toFixed(2) + '%';
  const num = id => Number(root.querySelector('#' + id)?.value || 0);
  const val = id => root.querySelector('#' + id)?.value || '';
  const field = (id,label,placeholder,extra='') => `<label><span>${label}</span><input id="${id}" type="number" min="0" step="any" inputmode="decimal" placeholder="예: ${placeholder}" ${extra}></label>`;
  const card = (label,value,sub='') => `<div><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;

  if(!root.hasAttribute('data-static-rendered')) root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/money.html">금융 카테고리 더보기</a>
    <h1>주택담보대출 계산기</h1>
    <p class="lead">주택가격, 대출희망액, 금리, 상환기간을 입력해 주담대 월 상환액, 총 이자, LTV, 첫해 예상 DSR을 함께 확인합니다.</p>
    <section class="calculator-box utility-box readable-calc-box">
      <div class="readable-intro">
        <h2>주담대 계산 전에 먼저 보는 핵심</h2>
        <p>주택담보대출은 단순히 “얼마까지 빌릴 수 있는지”보다 매달 버틸 수 있는 상환액이 더 중요합니다. 이 계산기는 대출희망액 기준으로 월 부담, 총 이자, 주택가격 대비 대출비율을 한 번에 보여줍니다.</p>
        <div class="readable-guide-grid">
          <article><b>LTV</b><p>주택가격 대비 대출금 비율입니다. 규제지역, 주택가격, 보유주택 수, 대출 목적에 따라 실제 기준은 달라질 수 있습니다.</p></article>
          <article><b>DSR</b><p>연소득 대비 연간 원리금 상환 부담을 보는 지표입니다. 여기서는 입력값 기준 첫해 상환액으로 단순 추정합니다.</p></article>
          <article><b>상환방식</b><p>원리금균등은 월 납입액이 일정하고, 원금균등은 초반 부담이 크지만 총 이자가 줄어드는 편입니다.</p></article>
        </div>
      </div>
      <div class="utility-form">
        <h2>1. 주택과 대출 조건을 입력하세요</h2>
        <div class="utility-fields">
          ${field('ml-house','주택가격(원)','700000000')}
          ${field('ml-loan','대출희망액(원)','300000000')}
          ${field('ml-income','연소득(원, 선택)','60000000')}
          ${field('ml-rate','연 이자율(%)','4.2')}
          ${field('ml-years','상환기간(년)','30')}
          ${field('ml-grace','거치기간(개월, 선택)','12')}
          <label><span>상환방식</span><select id="ml-method"><option value="annuity">원리금균등상환</option><option value="principal">원금균등상환</option><option value="bullet">만기일시상환</option></select></label>
        </div>
        <button class="primary-btn" id="ml-calc" type="button">주담대 계산하기</button>
      </div>
      <div class="result" id="ml-result" aria-live="polite"></div>
      <p class="calculator-note">이 결과는 입력값 기준의 참고용 추정입니다. 실제 대출 가능 여부, LTV·DSR 적용, 금리, 중도상환수수료, 보증료, 인지세, 우대금리, 금리 변동은 금융기관 심사와 상품 약관에 따라 달라집니다.</p>
    </section>
    <section class="content-block">
      <h2>상환방식별 차이</h2>
      <div class="loan-schedule-table-wrap">
        <table class="loan-schedule-table">
          <thead><tr><th>상환방식</th><th>월 부담 흐름</th><th>특징</th></tr></thead>
          <tbody>
            <tr><td>원리금균등상환</td><td>거의 일정</td><td>매달 납입액이 비슷해 가계 예산을 세우기 쉽습니다.</td></tr>
            <tr><td>원금균등상환</td><td>초반 높고 점차 감소</td><td>매달 같은 원금을 갚아 총 이자가 줄어드는 편입니다.</td></tr>
            <tr><td>만기일시상환</td><td>매달 이자만 납부</td><td>만기에 원금을 한 번에 갚아야 하므로 만기 부담이 큽니다.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="content-block">
      <h2>LTV와 DSR은 어떻게 봐야 하나요?</h2>
      <p><strong>LTV</strong>는 주택가격 대비 대출금 비율입니다. 예를 들어 7억원 주택에 3억5천만원을 빌리면 LTV는 50%입니다. 이 계산기는 주택가격과 대출희망액으로 현재 LTV를 자동 계산합니다. 다만 실제 허용 한도는 지역, 주택가격, 무주택·1주택 여부, 생활안정자금인지 주택구입자금인지에 따라 달라질 수 있어 금융기관 안내를 확인해야 합니다.</p>
      <p><strong>DSR</strong>은 연소득에서 대출 원리금 상환액이 차지하는 비율입니다. 이 계산기는 주담대 입력값만 기준으로 첫해 예상 DSR을 보여주므로, 신용대출·자동차할부·카드론 같은 다른 부채가 있으면 실제 DSR은 더 높아질 수 있습니다.</p>
    </section>
    <section class="content-block">
      <h2>계산에 반영하지 않는 항목</h2>
      <ul>
        <li>금리 변동, 우대금리 조건, 고정금리·변동금리 전환 조건</li>
        <li>중도상환수수료, 인지세, 보증료, 근저당 설정비용, 화재보험료</li>
        <li>기존 대출, 신용점수, 소득 인정 방식, 배우자 합산 여부</li>
        <li>정책모기지, 생애최초, 신혼부부, 규제지역 등 개별 우대·제한 조건</li>
      </ul>
    </section>
    <section class="content-block">
      <h2>관련 계산기</h2>
      <div class="related"><a href="/calculators/loan-interest.html">대출 이자 계산기</a><a href="/calculators/loan-schedule.html">대출 상환 스케줄 계산기</a><a href="/calculators/dsr.html">DSR 계산기</a><a href="/calculators/prepayment-fee.html">중도상환수수료 계산기</a></div>
    </section>`;

  function paymentRows(principal, annualRate, totalMonths, method, graceMonths){
    const monthlyRate = annualRate / 100 / 12;
    const rows = [];
    let balance = principal;
    let totalInterest = 0;
    let totalPay = 0;
    const repayMonths = Math.max(totalMonths - graceMonths, 1);
    const annuityPay = monthlyRate ? principal * monthlyRate * Math.pow(1 + monthlyRate, repayMonths) / (Math.pow(1 + monthlyRate, repayMonths) - 1) : principal / repayMonths;
    const principalPart = principal / repayMonths;

    for(let month = 1; month <= totalMonths; month++){
      const interest = balance * monthlyRate;
      let principalPay = 0;
      let pay = interest;
      if(month > graceMonths){
        if(method === 'annuity'){
          pay = annuityPay;
          principalPay = Math.min(balance, pay - interest);
        }else if(method === 'principal'){
          principalPay = Math.min(balance, principalPart);
          pay = principalPay + interest;
        }else{
          principalPay = month === totalMonths ? balance : 0;
          pay = interest + principalPay;
        }
      }
      balance = Math.max(0, balance - principalPay);
      totalInterest += interest;
      totalPay += pay;
      rows.push({month,pay,principal:principalPay,interest,balance});
    }
    return {rows,totalInterest,totalPay};
  }

  function renderRows(rows, limit){
    return rows.slice(0, limit).map(row => `<tr><td>${row.month}개월</td><td>${money(row.pay)}</td><td>${money(row.principal)}</td><td>${money(row.interest)}</td><td>${money(row.balance)}</td></tr>`).join('');
  }

  root.querySelector('#ml-calc').onclick = () => {
    const house = num('ml-house');
    const loan = num('ml-loan');
    const income = num('ml-income');
    const rate = num('ml-rate');
    const years = num('ml-years');
    const grace = num('ml-grace');
    const method = val('ml-method');
    const result = root.querySelector('#ml-result');
    if(![house,loan,income,rate,years,grace].every(Number.isFinite)
        || house<=0 || loan<=0 || income<0 || rate<0
        || !Number.isInteger(years) || years<1 || years>100
        || !Number.isInteger(grace) || grace<0 || grace>=years*12){
      result.innerHTML = '<strong>입력값을 확인해 주세요</strong><p>주택가격·대출금은 0보다 크게, 금리·소득은 0 이상으로 입력하세요. 상환기간은 1~100년의 정수이고 거치기간은 전체 상환기간보다 짧아야 합니다.</p>';
      result.classList.add('show');
      return;
    }

    const months = years * 12;
    const data = paymentRows(loan, rate, months, method, grace);
    const firstAfterGrace = data.rows[Math.min(grace, data.rows.length - 1)];
    const last = data.rows[data.rows.length - 1];
    const firstYearPay = data.rows.slice(0, Math.min(12, data.rows.length)).reduce((sum,row) => sum + row.pay, 0);
    const ltv = house ? loan / house * 100 : 0;
    const ownMoney = Math.max(house - loan, 0);
    const dsr = income ? firstYearPay / income * 100 : null;
    const methodLabel = {annuity:'원리금균등상환',principal:'원금균등상환',bullet:'만기일시상환'}[method];
    const visible = 12;

    result.innerHTML = `<div class="savings-result-grid">
        ${grace ? card('거치 중 월 이자', money(data.rows[0].pay), `${grace}개월 동안`) : ''}
        ${card(grace ? '거치 종료 후 첫 상환액' : method === 'principal' ? '첫 상환월 납입액' : '예상 월 납입액', money(firstAfterGrace.pay), methodLabel)}
        ${card('마지막 달 납입액', money(last.pay), grace ? `거치 ${grace}개월 반영` : '')}
        ${card('총 이자', money(data.totalInterest), `${years}년 기준`)}
        ${card('총 상환액', money(data.totalPay), '원금 + 이자')}
        ${card('현재 LTV', pct(ltv), `자기자금 ${money(ownMoney)}`)}
        ${card('첫해 예상 DSR', dsr === null ? '연소득 입력 필요' : pct(dsr), '첫 12개월·주담대만 단순 반영')}
      </div>
      <div class="switch-verdict"><b>LTV ${pct(ltv)}</b><p>주택가격 ${money(house)} 대비 대출희망액 ${money(loan)} 기준입니다. 실제 대출 가능 한도는 규제지역, 주택 보유 여부, 소득, 금융기관 심사에 따라 달라질 수 있습니다.</p></div>
      <div class="loan-schedule-table-wrap"><table class="loan-schedule-table"><thead><tr><th>회차</th><th>납입액</th><th>원금</th><th>이자</th><th>잔액</th></tr></thead><tbody id="ml-schedule-body">${renderRows(data.rows, visible)}</tbody></table></div>
      ${data.rows.length > visible ? '<button class="secondary-btn loan-more-btn" id="ml-show-all" type="button">상환표 전체 보기</button>' : ''}
      <p class="loan-schedule-note">상환표는 월 단위 단순 계산입니다. 실제 납입일, 일할 이자, 금리 변동, 중도상환은 반영하지 않습니다.</p>`;
    const button = root.querySelector('#ml-show-all');
    if(button){
      let shown = visible;
      button.onclick = () => {
        shown = Math.min(shown + 60, data.rows.length);
        root.querySelector('#ml-schedule-body').innerHTML = renderRows(data.rows, shown);
        if(shown >= data.rows.length)button.remove();
        else button.textContent = `다음 ${Math.min(60,data.rows.length-shown)}개월 보기`;
      };
    }
    result.classList.add('show');
  };
})();
