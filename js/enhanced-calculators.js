// Enhanced practical calculators for payroll, loans, and compound interest.
(function(){
  const root = document.querySelector('#calculator');
  if(!root) return;

  const slug = document.body.dataset.calculator || document.body.dataset.customCalculator || document.body.dataset.batch;
  const targets = ['salary','four-insurance','income-tax','loan-interest','jeonse-loan','compound-interest'];
  if(!targets.includes(slug)) return;

  const money = value => Math.round(Number(value) || 0).toLocaleString('ko-KR') + '원';
  const pct = value => (Number(value) || 0).toFixed(2).replace(/\.00$/,'') + '%';
  const num = id => Number(root.querySelector('#' + id)?.value || 0);
  const val = id => root.querySelector('#' + id)?.value || '';
  const field = (id,label,placeholder,step='any') => `<label><span>${label}</span><input id="${id}" type="number" min="0" step="${step}" inputmode="decimal" placeholder="예: ${placeholder}"></label>`;
  const card = (label,value,small='') => `<div><span>${label}</span><b>${value}</b>${small ? `<small>${small}</small>` : ''}</div>`;

  const category = {
    salary:['money','금융'],
    'four-insurance':['business','업무'],
    'income-tax':['business','업무'],
    'loan-interest':['money','금융'],
    'jeonse-loan':['money','금융'],
    'compound-interest':['money','금융']
  }[slug];
  const top = `<a class="calculator-home category-more-link" href="/categories/${category[0]}.html">${category[1]} 카테고리 더보기</a>`;
  const related = {
    salary:['four-insurance','income-tax','annual-salary','employee-health-insurance'],
    'four-insurance':['salary','employee-health-insurance','income-tax','annual-salary'],
    'income-tax':['salary','four-insurance','annual-salary','withholding-33'],
    'loan-interest':['loan-schedule','jeonse-loan','prepayment-fee','dsr'],
    'jeonse-loan':['loan-interest','loan-schedule','dsr','rent-conversion'],
    'compound-interest':['savings-interest','installment','cagr','roi']
  }[slug] || [];
  const names = {
    salary:'월급 실수령액 계산기',
    'four-insurance':'4대보험 계산기',
    'income-tax':'근로소득세 계산기',
    'loan-interest':'대출 이자 계산기',
    'jeonse-loan':'전세대출 이자 계산기',
    'compound-interest':'적립식 복리 계산기',
    'loan-schedule':'대출 상환 스케줄 계산기',
    'employee-health-insurance':'직장인 건강보험료 계산기',
    'annual-salary':'연봉 계산기',
    'withholding-33':'원천징수 3.3% 계산기',
    'prepayment-fee':'중도상환수수료 계산기',
    dsr:'DSR 계산기',
    'rent-conversion':'전월세 전환 계산기',
    'savings-interest':'예금 이자 계산기',
    installment:'적금 계산기',
    cagr:'CAGR 계산기',
    roi:'ROI 계산기'
  };
  const relatedHtml = related.map(id => `<a href="/calculators/${id}.html">${names[id] || id}</a>`).join('');
  const renderShell = (title,lead,body,note,guide='') => {
    if(root.hasAttribute('data-static-rendered')) return;
    root.innerHTML = `${top}<h1>${title}</h1><p class="lead">${lead}</p>${body}<p class="calculator-note">${note}</p>${guide}<section class="content-block"><h2>관련 계산기</h2><div class="related">${relatedHtml}</div></section>`;
  };
  const show = (id,html) => {
    const result = root.querySelector('#' + id);
    result.innerHTML = html;
    result.classList.add('show');
  };
  const invalid = (id,msg) => show(id,`<strong>입력값을 확인해 주세요</strong><p>${msg}</p>`);

  const insuranceRates = {
    '2026-h2':{pension:.0475,pensionMin:410000,pensionMax:6590000,healthTotal:.0719,healthMin:20160,healthMax:9183480,care:.009448/.0719,employment:.009,label:'2026년 7~12월',simple:false},
    '2026-h1':{pension:.0475,pensionMin:400000,pensionMax:6370000,healthTotal:.0719,healthMin:20160,healthMax:9183480,care:.009448/.0719,employment:.009,label:'2026년 1~6월',simple:false},
    2025:{pension:.045,health:.03545,care:.1295,employment:.009,label:'2025년 단순 요율',simple:true}
  };
  const calcInsurance = (gross,nontax,period='2026-h2') => {
    const rates = insuranceRates[period] || insuranceRates['2026-h2'];
    const base = Math.max(0,gross - nontax);
    let pensionBase = base;
    let pension = 0;
    let health = 0;
    if(rates.simple){
      pension = Math.round(base * rates.pension);
      health = Math.round(base * rates.health);
    }else if(base > 0){
      pensionBase = Math.min(rates.pensionMax,Math.max(rates.pensionMin,Math.floor(base/1000)*1000));
      pension = Math.round(pensionBase * rates.pension);
      const healthTotal = Math.min(rates.healthMax,Math.max(rates.healthMin,base * rates.healthTotal));
      health = Math.round(healthTotal / 2);
    }
    const care = Math.round(health * rates.care);
    const employment = Math.round(base * rates.employment);
    return {rates,base,pensionBase,pension,health,care,employment,total:pension+health+care+employment};
  };
  const taxBrackets = [
    [14000000,.06,0],[50000000,.15,1260000],[88000000,.24,5760000],[150000000,.35,15440000],
    [300000000,.38,19940000],[500000000,.40,25940000],[1000000000,.42,35940000],[Infinity,.45,65940000]
  ];
  const calcAnnualTax = (taxBase,credit=0,paid=0) => {
    const row = taxBrackets.find(item => taxBase <= item[0]);
    const income = Math.max(0,taxBase * row[1] - row[2] - credit);
    const local = income * .1;
    return {rate:row[1],income,local,total:income+local,balance:income+local-paid};
  };
  const loanPayment = (principal,annualRate,months,method) => {
    const r = annualRate / 1200;
    if(method === 'annuity'){
      const monthly = r ? principal * r * Math.pow(1+r,months) / (Math.pow(1+r,months)-1) : principal / months;
      return {first:monthly,last:monthly,totalInterest:monthly*months-principal,totalPay:monthly*months};
    }
    if(method === 'principal'){
      const principalPart = principal / months;
      const first = principalPart + principal * r;
      const last = principalPart + principalPart * r;
      const totalInterest = principal * r * (months + 1) / 2;
      return {first,last,totalInterest,totalPay:principal+totalInterest};
    }
    const interest = principal * r;
    return {first:interest,last:interest,totalInterest:interest*months,totalPay:principal+interest*months};
  };
  const loanRows = (principal,annualRate,months,method,limit=12) => {
    const r = annualRate / 1200;
    const count = Math.min(months,limit);
    let balance = principal;
    const fixed = method === 'annuity' ? (r ? principal * r * Math.pow(1+r,months) / (Math.pow(1+r,months)-1) : principal / months) : 0;
    const rows = [];
    for(let i=1;i<=count;i++){
      let principalPart = 0;
      let interest = balance * r;
      let payment = 0;
      if(method === 'annuity'){
        payment = fixed;
        principalPart = payment - interest;
        balance = Math.max(0,balance - principalPart);
      }else if(method === 'principal'){
        principalPart = principal / months;
        payment = principalPart + interest;
        balance = Math.max(0,balance - principalPart);
      }else{
        payment = interest;
        if(i === months){
          payment += principal;
          principalPart = principal;
          balance = 0;
        }
      }
      rows.push(`<tr><td>${i}개월</td><td>${money(payment)}</td><td>${money(principalPart)}</td><td>${money(interest)}</td><td>${money(balance)}</td></tr>`);
    }
    return rows.join('');
  };

  if(slug === 'salary'){
    renderShell(
      '월급 실수령액 계산기',
      '월 세전 급여와 비과세액으로 4대보험을 계산하고, 확인한 월 소득세를 선택 입력해 예상 실수령액을 확인합니다.',
      `<section class="calculator-box utility-box salary-simple-box"><div class="salary-quick"><h2>급여 정보</h2><p>기본값은 2026년 7~12월 직장가입자 기준입니다.</p><div class="utility-fields">${field('ep-gross','월 세전 급여(원)','3000000')}${field('ep-nontax','월 비과세액(원)','200000')}<label><span>보험 계산 기간</span><select id="ep-year"><option value="2026-h2">2026년 7~12월</option><option value="2026-h1">2026년 1~6월</option><option value="2025">2025년 단순 요율</option></select></label>${field('ep-income-tax','월 소득세(국세만, 선택)','127220','1')}</div></div><div class="salary-actions"><button class="primary-btn" id="ep-calc" type="button">실수령액 계산하기</button></div><div class="result" id="ep-result" aria-live="polite"></div></section>`,
      '소득세를 비워 두면 소득세·지방소득세를 제외한 4대보험 후 금액을 표시합니다. 결과는 신고 보수월액, 정산, 감면과 회사 처리에 따라 달라질 수 있는 참고용입니다.',
      '<section class="content-block"><h2>월 소득세 입력 방법</h2><p>급여명세서의 소득세(국세) 또는 국세청 근로소득 간이세액표 조회 결과를 입력하세요. 지방소득세는 입력한 소득세의 10%를 10원 단위로 내려 간편 계산합니다. 부양가족 수, 8~20세 자녀 수와 원천징수 비율 80%·100%·120%에 따라 소득세가 달라지므로 확인액을 모르면 비워 두는 편이 안전합니다.</p></section>'
    );
    root.querySelector('#ep-calc').onclick = () => {
      const gross = num('ep-gross');
      const nontax = num('ep-nontax');
      const year = val('ep-year');
      const incomeTaxRaw = root.querySelector('#ep-income-tax').value.trim();
      const hasIncomeTax = incomeTaxRaw !== '';
      const monthlyIncomeTax = hasIncomeTax ? Number(incomeTaxRaw) : 0;
      if(!Number.isFinite(gross)||gross<=0||!Number.isFinite(nontax)||nontax<0||nontax>gross||!Number.isFinite(monthlyIncomeTax)||monthlyIncomeTax<0) return invalid('ep-result','세전 급여는 0보다 크게, 비과세액과 월 소득세는 0 이상으로 입력하세요. 비과세액은 급여보다 클 수 없습니다.');
      const ins = calcInsurance(gross,nontax,year);
      const monthlyLocal = hasIncomeTax ? Math.floor(monthlyIncomeTax*.1/10)*10 : 0;
      const totalDeduct = ins.total + monthlyIncomeTax + monthlyLocal;
      const net = gross - totalDeduct;
      const taxNotice = hasIncomeTax ? `입력한 월 소득세 ${money(monthlyIncomeTax)}과 지방소득세 간편 추정액을 반영했습니다.` : '<strong>소득세·지방소득세 미반영:</strong> 급여명세서나 국세청 간이세액표에서 확인한 월 소득세를 입력하면 세금까지 반영할 수 있습니다.';
      const pensionBaseText = ins.rates.simple ? `${money(ins.pensionBase)} (상·하한 미반영)` : money(ins.pensionBase);
      show('ep-result',`<div class="savings-result-grid salary-result-grid">${card(hasIncomeTax?'예상 월 실수령액':'소득세 미반영 4대보험 후 금액',money(net))}${card(hasIncomeTax?'월 총 공제액':'월 4대보험 합계',money(totalDeduct))}${card('공제 후 비율',pct(net/gross*100))}${card('보험료 간편 기준 보수',money(ins.base))}</div><details class="salary-deduction-detail" open><summary>공제 항목 자세히 보기</summary><table class="rate-table"><tbody><tr><td>국민연금</td><td>${money(ins.pension)}</td></tr><tr><td>건강보험</td><td>${money(ins.health)}</td></tr><tr><td>장기요양보험</td><td>${money(ins.care)}</td></tr><tr><td>고용보험</td><td>${money(ins.employment)}</td></tr><tr><td>월 소득세(국세)</td><td>${hasIncomeTax?money(monthlyIncomeTax):'미반영'}</td></tr><tr><td>지방소득세</td><td>${hasIncomeTax?money(monthlyLocal):'미반영'}</td></tr><tr><td>국민연금 기준소득월액</td><td>${pensionBaseText}</td></tr></tbody></table></details><p>${taxNotice}</p><p>${ins.rates.label} 보험료 기준으로 계산했습니다.</p>`);
    };
  }

  if(slug === 'four-insurance'){
    renderShell(
      '4대보험 계산기',
      '월 급여와 비과세액을 입력해 국민연금, 건강보험, 장기요양보험, 고용보험을 근로자 부담과 회사 부담으로 나눠 계산합니다.',
      `<section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('ei-gross','월 세전 급여(원)','3000000')}${field('ei-nontax','월 비과세액(원)','200000')}<label><span>보험 계산 기간</span><select id="ei-year"><option value="2026-h2">2026년 7~12월</option><option value="2026-h1">2026년 1~6월</option><option value="2025">2025년 단순 요율</option></select></label><label><span>회사 부담분</span><select id="ei-employer"><option value="yes">함께 보기</option><option value="no">근로자 부담만 보기</option></select></label></div><button class="primary-btn" id="ei-calc" type="button">4대보험 계산하기</button></div><div class="result" id="ei-result" aria-live="polite"></div></section>`,
      '2026년 국민연금 기준소득월액 상·하한과 건강보험료 상·하한을 반영합니다. 실제 신고 보수월액, 정산, 감면에 따라 고지액은 달라질 수 있으며 산재보험은 포함하지 않습니다.',
      '<section class="content-block"><h2>2026년 적용 기준</h2><p>근로자 부담은 국민연금 4.75%, 건강보험 3.595%, 장기요양보험은 건강보험료의 약 13.1405%, 고용보험 0.9%입니다. 국민연금 기준소득월액은 1~6월 40만~637만원, 7~12월 41만~659만원을 적용하고 천원 미만을 버립니다.</p></section>'
    );
    root.querySelector('#ei-calc').onclick = () => {
      const gross = num('ei-gross');
      if(!Number.isFinite(gross)||gross<=0||!Number.isFinite(num('ei-nontax'))||num('ei-nontax')<0||num('ei-nontax')>gross) return invalid('ei-result','세전 급여는 0보다 크게 입력하고 비과세액은 급여 이하의 0 이상 금액으로 입력하세요.');
      const ins = calcInsurance(gross,num('ei-nontax'),val('ei-year'));
      const employerHtml = val('ei-employer') === 'yes' ? card('회사 기본 부담 추정',money(ins.total),'고용안정·직능보험과 산재보험 제외') : '';
      const pensionBaseText = ins.rates.simple ? `${money(ins.pensionBase)} (상·하한 미반영)` : money(ins.pensionBase);
      show('ei-result',`<div class="savings-result-grid">${card('근로자 부담 합계',money(ins.total))}${card('국민연금',money(ins.pension))}${card('건강+장기요양',money(ins.health+ins.care))}${card('고용보험',money(ins.employment))}${employerHtml}</div><table class="rate-table"><tbody><tr><td>국민연금 근로자분</td><td>${money(ins.pension)}</td></tr><tr><td>건강보험 근로자분</td><td>${money(ins.health)}</td></tr><tr><td>장기요양보험 근로자분</td><td>${money(ins.care)}</td></tr><tr><td>고용보험 근로자분</td><td>${money(ins.employment)}</td></tr><tr><td>보험료 간편 기준 보수</td><td>${money(ins.base)}</td></tr><tr><td>국민연금 기준소득월액</td><td>${pensionBaseText}</td></tr><tr><td>월 급여</td><td>${money(gross)}</td></tr><tr><td>비과세액</td><td>${money(num('ei-nontax'))}</td></tr><tr><td>적용 기준</td><td>${ins.rates.label}</td></tr></tbody></table>`);
    };
  }

  if(slug === 'income-tax'){
    renderShell(
      '근로소득세 계산기',
      '연간 총급여, 예상 공제, 세액공제, 이미 낸 세금을 입력해 소득세와 지방소득세 예상액을 계산합니다.',
      `<section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('it-salary','연간 총급여(원)','50000000')}${field('it-deduct','예상 소득공제·근로소득공제 합계(원)','15000000')}${field('it-credit','예상 세액공제(원)','700000')}${field('it-paid','이미 낸 세금(원)','1500000')}</div><button class="primary-btn" id="it-calc" type="button">근로소득세 계산하기</button></div><div class="result" id="it-result" aria-live="polite"></div></section>`,
      '국세청 종합소득세 기본세율을 이용한 참고용 계산입니다. 실제 연말정산은 근로소득공제, 인적공제, 특별공제, 세액공제 요건에 따라 달라집니다.',
      '<section class="content-block"><h2>소득공제 예시</h2><p>입력하는 소득공제 금액에는 근로소득공제, 기본공제·부양가족 인적공제, 국민연금 등 공적연금 보험료, 건강보험료·고용보험료, 주택자금 공제, 신용카드 등 사용금액 공제 등을 참고해 합산할 수 있습니다. 세액공제는 자녀, 연금계좌, 보험료, 의료비, 교육비, 기부금처럼 산출세액에서 직접 차감되는 항목입니다.</p></section>'
    );
    root.querySelector('#it-calc').onclick = () => {
      const salary = num('it-salary');
      if(!salary) return invalid('it-result','연간 총급여를 입력해 주세요.');
      const base = Math.max(0,salary - num('it-deduct'));
      const tax = calcAnnualTax(base,num('it-credit'),num('it-paid'));
      show('it-result',`<div class="savings-result-grid">${card('예상 결정세액',money(tax.total))}${card(tax.balance>=0?'추가 납부 예상':'환급 예상',money(Math.abs(tax.balance)))}${card('과세표준',money(base))}${card('적용 세율',pct(tax.rate*100))}</div><table class="rate-table"><tbody><tr><td>소득세</td><td>${money(tax.income)}</td></tr><tr><td>지방소득세</td><td>${money(tax.local)}</td></tr><tr><td>이미 낸 세금</td><td>${money(num('it-paid'))}</td></tr><tr><td>세액공제</td><td>${money(num('it-credit'))}</td></tr></tbody></table>`);
    };
  }

  if(slug === 'loan-interest' || slug === 'jeonse-loan'){
    const isJeonse = slug === 'jeonse-loan';
    renderShell(
      isJeonse ? '전세대출 이자 계산기' : '대출 이자 계산기',
      isJeonse ? '전세대출 금액, 금리, 기간, 상환 방식을 입력해 월 부담액과 총 이자를 계산합니다.' : '대출 원금, 금리, 기간, 상환 방식을 입력해 월 상환액과 총 이자, 월별 상환표를 확인합니다.',
      `<section class="calculator-box utility-box loan-box"><div class="utility-form"><div class="utility-fields">${isJeonse ? field('el-deposit','전세보증금(원)','300000000') : ''}${field('el-principal',isJeonse?'전세대출금(원)':'대출 원금(원)',isJeonse?'200000000':'100000000')}${field('el-rate','연 이자율(%)','4.5')}${field('el-months','상환 기간(개월)','36','1')}<label><span>상환 방식</span><select id="el-method"><option value="annuity">원리금균등상환</option><option value="principal">원금균등상환</option><option value="bullet">${isJeonse?'만기일시상환(이자만 납부)':'만기일시상환'}</option></select></label></div><button class="primary-btn" id="el-calc" type="button">대출 계산하기</button></div><div class="result" id="el-result" aria-live="polite"></div></section>`,
      '중도상환수수료, 보증료, 인지세, 금리 변동, 실제 납입일별 일할 이자는 반영하지 않은 참고용 계산입니다.',
      '<section class="content-block"><h2>상환 방식 차이</h2><p>원리금균등은 매월 납입액이 일정하고, 원금균등은 시간이 갈수록 월 납입액이 줄어듭니다. 만기일시는 매월 이자만 내고 원금은 만기에 갚는 방식입니다.</p></section>'
    );
    root.querySelector('#el-calc').onclick = () => {
      const principal = num('el-principal');
      const rate = num('el-rate');
      const months = Math.round(num('el-months'));
      const method = val('el-method');
      if(!Number.isFinite(principal)||principal<=0||!Number.isFinite(rate)||rate<0||!Number.isFinite(months)||months<=0||months>1200) return invalid('el-result','대출 원금은 0보다 크게, 금리는 0 이상, 기간은 1~1,200개월로 입력하세요.');
      const calc = loanPayment(principal,rate,months,method);
      const ratio = isJeonse && num('el-deposit') ? principal / num('el-deposit') * 100 : 0;
      const extra = isJeonse ? card('보증금 대비 대출비율',ratio ? pct(ratio) : '-') : '';
      const tbodyId = 'loan-schedule-body';
      const moreButton = months > 12 ? '<button class="secondary-btn loan-more-btn" id="loan-show-all" type="button">상환표 더보기</button>' : '';
      show('el-result',`<div class="savings-result-grid">${card(method==='principal'?'첫 달 납입액':'월 납입액',money(calc.first))}${card(method==='principal'?'마지막 달 납입액':'총 이자',method==='principal'?money(calc.last):money(calc.totalInterest))}${card('총 상환액',money(calc.totalPay))}${card('상환 기간',months+'개월')}${extra}</div><div class="loan-schedule-table-wrap"><table class="loan-schedule-table"><thead><tr><th>회차</th><th>납입액</th><th>원금</th><th>이자</th><th>잔액</th></tr></thead><tbody id="${tbodyId}">${loanRows(principal,rate,months,method,12)}</tbody></table></div>${moreButton}<p class="loan-schedule-note">처음에는 12개월까지만 보여주고, 더보기를 누르면 마지막 회차까지 표시합니다.</p>`);
      const button = root.querySelector('#loan-show-all');
      if(button){
        button.onclick = () => {
          root.querySelector('#' + tbodyId).innerHTML = loanRows(principal,rate,months,method,months);
          button.remove();
          const note = root.querySelector('.loan-schedule-note');
          if(note) note.textContent = '전체 상환 회차를 표시했습니다.';
        };
      }
    };
  }

  if(slug === 'compound-interest'){
    renderShell(
      '적립식 복리 계산기',
      '초기 원금, 월 추가 납입액, 연 수익률, 투자 기간을 입력해 장기 적립식 투자 결과를 계산합니다.',
      `<section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('ci-start','초기 원금(원)','10000000')}${field('ci-monthly','월 추가 납입액(원)','300000')}${field('ci-rate','연 수익률(%)','6')}${field('ci-years','투자 기간(년)','10','1')}</div><button class="primary-btn" id="ci-calc" type="button">적립식 복리 계산하기</button></div><div class="result" id="ci-result" aria-live="polite"></div></section>`,
      '수익률이 매월 동일하게 적용된다고 가정한 단순 시뮬레이션입니다. 실제 투자는 가격 변동, 세금, 수수료, 환율, 중도 입출금에 따라 달라질 수 있습니다.',
      '<section class="content-block"><h2>적립식 복리란?</h2><p>적립식 복리는 처음 넣어둔 원금에 매달 추가 납입액을 더하면서, 이전에 붙은 수익까지 다시 투자된다고 보고 계산하는 방식입니다. 같은 수익률이라도 기간이 길어질수록 원금과 수익이 함께 불어나기 때문에 장기 투자 계획을 세울 때 유용합니다.</p><div class="info-table-wrap"><table class="rate-table"><tbody><tr><th>초기 원금</th><td>처음 투자해 두는 금액입니다. 이미 모아둔 투자금이 없다면 0원으로 입력해도 됩니다.</td></tr><tr><th>월 추가 납입액</th><td>매달 꾸준히 더 넣을 금액입니다. 적립식 투자에서는 이 값이 최종 금액에 큰 영향을 줍니다.</td></tr><tr><th>연 수익률</th><td>1년 동안 기대하는 평균 수익률입니다. 실제 수익률은 매년 달라질 수 있으므로 보수적으로 입력하는 것이 좋습니다.</td></tr><tr><th>투자 기간</th><td>복리 효과는 시간이 길수록 커집니다. 5년, 10년, 20년처럼 여러 기간을 비교해 보세요.</td></tr></tbody></table></div></section><section class="content-block"><h2>결과를 해석하는 방법</h2><p>결과 화면의 총 납입 원금은 직접 넣은 돈의 합계이고, 예상 수익은 최종 금액에서 원금을 뺀 금액입니다. 연도별 표를 보면 언제부터 수익 증가 속도가 커지는지 확인할 수 있습니다.</p><ul><li><strong>저축 목표 점검</strong>: 매달 얼마를 넣어야 목표 금액에 가까워지는지 비교할 수 있습니다.</li><li><strong>수익률 민감도 확인</strong>: 연 수익률을 3%, 5%, 7%처럼 바꿔 보며 기대치 차이를 확인하세요.</li><li><strong>무리한 가정 피하기</strong>: 높은 수익률은 손실 가능성도 커질 수 있으므로 참고용으로만 보세요.</li></ul></section>'
    );
    root.querySelector('#ci-calc').onclick = () => {
      const start = num('ci-start');
      const monthly = num('ci-monthly');
      const years = num('ci-years');
      const annualPercent = num('ci-rate');
      if(![start,monthly,years,annualPercent].every(Number.isFinite)
          || start<0 || monthly<0 || (start===0&&monthly===0)
          || annualPercent<=-100 || !Number.isInteger(years) || years<1 || years>100){
        return invalid('ci-result','초기 원금과 월 납입액은 0 이상으로 하나 이상 입력하고, 수익률은 -100%보다 크게, 기간은 1~100년의 정수로 입력해 주세요.');
      }
      const annual = annualPercent / 100;
      const monthlyRate = Math.pow(1+annual,1/12) - 1;
      if(!Number.isFinite(monthlyRate)) return invalid('ci-result','계산 가능한 수익률 범위를 벗어났습니다.');
      let balance = start;
      let principal = start;
      const rows = [];
      for(let m=1;m<=years*12;m++){
        balance = balance * (1+monthlyRate) + monthly;
        principal += monthly;
        if(!Number.isFinite(balance)||!Number.isFinite(principal)) return invalid('ci-result','계산 범위를 벗어났습니다. 입력 금액이나 수익률을 줄여 주세요.');
        if(m % 12 === 0){
          const y = m / 12;
          rows.push(`<tr><td>${y}년</td><td>${money(balance)}</td><td>${money(principal)}</td><td>${money(balance-principal)}</td></tr>`);
        }
      }
      const gain = balance - principal;
      show('ci-result',`<div class="savings-result-grid">${card('예상 최종 금액',money(balance))}${card('총 납입 원금',money(principal))}${card('예상 수익',money(gain))}${card('투자 기간',years+'년')}</div><div class="loan-schedule-table-wrap"><table class="loan-schedule-table"><thead><tr><th>기간</th><th>예상 잔액</th><th>누적 원금</th><th>누적 수익</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`);
    };
  }
})();
