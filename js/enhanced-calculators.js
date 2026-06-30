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
    'compound-interest':'복리 계산기',
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
    root.innerHTML = `${top}<h1>${title}</h1><p class="lead">${lead}</p>${body}<p class="calculator-note">${note}</p>${guide}<section class="content-block"><h2>관련 계산기</h2><div class="related">${relatedHtml}</div></section>`;
  };
  const show = (id,html) => {
    const result = root.querySelector('#' + id);
    result.innerHTML = html;
    result.classList.add('show');
  };
  const invalid = (id,msg) => show(id,`<strong>입력값을 확인해 주세요</strong><p>${msg}</p>`);

  const insuranceRates = {
    2026:{pension:.0475,health:.03595,care:.1314,employment:.009,label:'2026년 기준'},
    2025:{pension:.045,health:.03545,care:.1295,employment:.009,label:'2025년 기준'}
  };
  const calcInsurance = (gross,nontax,year='2026') => {
    const rates = insuranceRates[year] || insuranceRates[2026];
    const base = Math.max(0,gross - nontax);
    const pension = base * rates.pension;
    const health = base * rates.health;
    const care = health * rates.care;
    const employment = base * rates.employment;
    return {rates,base,pension,health,care,employment,total:pension+health+care+employment};
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
      '월 세전 급여와 비과세액만 입력하면 4대보험, 소득세, 지방소득세를 나눠 예상 실수령액을 계산합니다.',
      `<section class="calculator-box utility-box salary-simple-box"><div class="salary-quick"><h2>급여 정보</h2><p>기본값은 2026년 직장가입자 기준으로 계산합니다.</p><div class="utility-fields">${field('ep-gross','월 세전 급여(원)','3000000')}${field('ep-nontax','월 비과세액(원)','200000')}<label><span>계산 기준</span><select id="ep-year"><option value="2026">2026년 기준</option><option value="2025">2025년 기준</option></select></label>${field('ep-deduct','연 환산 추가 소득공제(원)','1500000')}</div></div><div class="salary-actions"><button class="primary-btn" id="ep-calc" type="button">실수령액 계산하기</button></div><div class="result" id="ep-result" aria-live="polite"></div></section>`,
      '급여 계산 결과는 입력값 기준의 참고용입니다. 실제 소득세는 간이세액표, 부양가족 수, 회사 급여 규정, 비과세 항목에 따라 달라질 수 있습니다.',
      '<section class="content-block"><h2>소득공제 예시</h2><p>소득공제에는 근로소득공제, 인적공제, 국민연금 등 공적연금 보험료, 건강보험료·고용보험료, 주택자금 공제, 신용카드 등 사용금액 공제 등이 포함될 수 있습니다. 정확한 적용 여부는 개인 조건과 연말정산 자료에 따라 달라집니다.</p></section>'
    );
    root.querySelector('#ep-calc').onclick = () => {
      const gross = num('ep-gross');
      const nontax = num('ep-nontax');
      const year = val('ep-year');
      if(!gross) return invalid('ep-result','월 세전 급여를 입력해 주세요.');
      const ins = calcInsurance(gross,nontax,year);
      const annualTaxable = Math.max(0,ins.base*12 - num('ep-deduct'));
      const tax = calcAnnualTax(annualTaxable,0,0);
      const monthlyIncomeTax = tax.income / 12;
      const monthlyLocal = tax.local / 12;
      const totalDeduct = ins.total + monthlyIncomeTax + monthlyLocal;
      const net = gross - totalDeduct;
      show('ep-result',`<div class="savings-result-grid salary-result-grid">${card('예상 월 실수령액',money(net))}${card('월 총 공제액',money(totalDeduct))}${card('공제 후 비율',pct(net/gross*100))}${card('과세 기준 월급',money(ins.base))}</div><details class="salary-deduction-detail" open><summary>공제 항목 자세히 보기</summary><table class="rate-table"><tbody><tr><td>국민연금</td><td>${money(ins.pension)}</td></tr><tr><td>건강보험</td><td>${money(ins.health)}</td></tr><tr><td>장기요양보험</td><td>${money(ins.care)}</td></tr><tr><td>고용보험</td><td>${money(ins.employment)}</td></tr><tr><td>간편 소득세</td><td>${money(monthlyIncomeTax)}</td></tr><tr><td>지방소득세</td><td>${money(monthlyLocal)}</td></tr></tbody></table></details><p>${ins.rates.label} 요율과 연 환산 과세표준 ${money(annualTaxable)} 기준으로 계산했습니다.</p>`);
    };
  }

  if(slug === 'four-insurance'){
    renderShell(
      '4대보험 계산기',
      '월 급여와 비과세액을 입력해 국민연금, 건강보험, 장기요양보험, 고용보험을 근로자 부담과 회사 부담으로 나눠 계산합니다.',
      `<section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('ei-gross','월 세전 급여(원)','3000000')}${field('ei-nontax','월 비과세액(원)','200000')}<label><span>계산 기준</span><select id="ei-year"><option value="2026">2026년 기준</option><option value="2025">2025년 기준</option></select></label><label><span>회사 부담분</span><select id="ei-employer"><option value="yes">함께 보기</option><option value="no">근로자 부담만 보기</option></select></label></div><button class="primary-btn" id="ei-calc" type="button">4대보험 계산하기</button></div><div class="result" id="ei-result" aria-live="polite"></div></section>`,
      '산재보험은 업종별로 다르고 사업주 부담이므로 이 계산기에는 포함하지 않았습니다. 국민연금 상·하한액, 정산, 감면 조건에 따라 실제 공제액은 달라질 수 있습니다.',
      '<section class="content-block"><h2>기본 요율</h2><p>2026년 기준 국민연금 근로자 부담 4.75%, 건강보험 근로자 부담 3.595%, 장기요양보험은 건강보험료의 13.14%, 고용보험 근로자 부담 0.9%로 계산합니다.</p></section>'
    );
    root.querySelector('#ei-calc').onclick = () => {
      const gross = num('ei-gross');
      if(!gross) return invalid('ei-result','월 세전 급여를 입력해 주세요.');
      const ins = calcInsurance(gross,num('ei-nontax'),val('ei-year'));
      const employerHtml = val('ei-employer') === 'yes' ? card('회사 부담 추정',money(ins.total),'산재보험 제외') : '';
      show('ei-result',`<div class="savings-result-grid">${card('근로자 부담 합계',money(ins.total))}${card('국민연금',money(ins.pension))}${card('건강+장기요양',money(ins.health+ins.care))}${card('고용보험',money(ins.employment))}${employerHtml}</div><table class="rate-table"><tbody><tr><td>보험료 산정 기준</td><td>${money(ins.base)}</td></tr><tr><td>월 급여</td><td>${money(gross)}</td></tr><tr><td>비과세액</td><td>${money(num('ei-nontax'))}</td></tr><tr><td>적용 기준</td><td>${ins.rates.label}</td></tr></tbody></table>`);
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
      if(!principal || !months) return invalid('el-result','대출 원금과 상환 기간을 입력해 주세요.');
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
      '복리 계산기',
      '초기 원금, 월 추가 납입액, 수익률, 기간을 입력해 복리 투자 결과를 계산합니다.',
      `<section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('ci-start','초기 원금(원)','10000000')}${field('ci-monthly','월 추가 납입액(원)','300000')}${field('ci-rate','연 수익률(%)','6')}${field('ci-years','투자 기간(년)','10','1')}</div><button class="primary-btn" id="ci-calc" type="button">복리 계산하기</button></div><div class="result" id="ci-result" aria-live="polite"></div></section>`,
      '수익률이 매월 동일하게 적용된다고 가정한 단순 시뮬레이션입니다. 실제 투자는 가격 변동, 세금, 수수료, 환율, 중도 입출금에 따라 달라질 수 있습니다.',
      '<section class="content-block"><h2>복리 결과를 보는 방법</h2><p>최종 금액뿐 아니라 총 납입 원금, 예상 수익, 연도별 잔액을 함께 보면 장기 투자 흐름을 이해하기 쉽습니다.</p></section>'
    );
    root.querySelector('#ci-calc').onclick = () => {
      const start = num('ci-start');
      const monthly = num('ci-monthly');
      const years = Math.round(num('ci-years'));
      const annual = num('ci-rate') / 100;
      if(!years) return invalid('ci-result','투자 기간을 입력해 주세요.');
      const monthlyRate = Math.pow(1+annual,1/12) - 1;
      let balance = start;
      let principal = start;
      const rows = [];
      for(let m=1;m<=years*12;m++){
        balance = balance * (1+monthlyRate) + monthly;
        principal += monthly;
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
