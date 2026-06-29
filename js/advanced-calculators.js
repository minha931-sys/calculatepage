(function(){
  const type=document.body.dataset.advancedCalculator;if(!type)return;
  const root=document.querySelector('#calculator');
  const field=(id,label,example)=>`<label><span>${label}</span><input id="${id}" type="number" placeholder="예: ${example}"></label>`;
  if(type==='dsr'){
    root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>DSR 계산기</h1><p class="lead">연소득 대비 모든 대출의 연간 원리금 상환 부담 비율을 계산합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('dsr-income','연소득(원)','50000000')}${field('dsr-payment','기존 대출 연간 상환액(원)','6000000')}${field('dsr-new','신규 대출 연간 상환액(원)','3000000')}</div><button class="primary-btn" id="advanced-calc">DSR 계산하기</button></div><div class="result" id="advanced-result"></div><p class="calculator-note">금융기관별 DSR 산정 방식, 스트레스 금리, 적용 대출 범위는 다를 수 있는 참고용 계산입니다.</p></section>`;
    root.querySelector('#advanced-calc').onclick=()=>{const income=+root.querySelector('#dsr-income').value,old=+root.querySelector('#dsr-payment').value,newPay=+root.querySelector('#dsr-new').value,r=root.querySelector('#advanced-result');if(!income)return;const value=(old+newPay)/income*100;r.innerHTML=`<strong>${value.toFixed(1)}%</strong><p>연간 원리금 상환액 ${Math.round(old+newPay).toLocaleString()}원 기준 DSR입니다.</p>`;r.classList.add('show')};
  }
  if(type==='stock-return'){
    root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>주식 수익률 계산기</h1><p class="lead">매수·매도 단가, 수량, 거래 수수료를 반영해 실현 손익을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('sr-buy','매수 단가(원)','50000')}${field('sr-sell','매도 단가(원)','60000')}${field('sr-qty','수량','10')}${field('sr-fee','왕복 수수료율(%)','0.3')}</div><button class="primary-btn" id="advanced-calc">수익률 계산하기</button></div><div class="result" id="advanced-result"></div></section>`;
    root.querySelector('#advanced-calc').onclick=()=>{const buy=+root.querySelector('#sr-buy').value,sell=+root.querySelector('#sr-sell').value,q=+root.querySelector('#sr-qty').value,fee=+root.querySelector('#sr-fee').value,r=root.querySelector('#advanced-result');if(!buy||!sell||!q)return;const cost=buy*q*(1+fee/200),proceeds=sell*q*(1-fee/200),profit=proceeds-cost,rate=profit/cost*100;r.innerHTML=`<strong>${profit.toLocaleString('ko-KR')}원 (${rate.toFixed(2)}%)</strong><p>수수료 반영 매수금액 ${Math.round(cost).toLocaleString()}원 · 매도금액 ${Math.round(proceeds).toLocaleString()}원</p>`;r.classList.add('show')};
  }
  if(type==='cagr'){
    root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>CAGR 계산기</h1><p class="lead">시작 금액과 현재·종료 금액, 투자 기간을 입력해 연평균 성장률과 총 수익률을 함께 확인하세요.</p><section class="calculator-box utility-box cagr-box"><div class="readable-intro"><h2>연평균 성장률을 한 번에 보기</h2><p>CAGR은 중간 변동을 모두 평평하게 펴서 “매년 같은 비율로 성장했다면 몇 %였는지” 보여주는 지표입니다. 주식, 펀드, 매출, 자산 가치처럼 기간이 다른 성과를 비교할 때 유용합니다.</p><div class="readable-guide-grid"><article><b>기간 비교</b><p>1년 수익률이 아니라 여러 해의 누적 성장을 연 단위로 환산합니다.</p></article><article><b>투자 성과</b><p>원금 대비 최종 금액이 몇 배가 되었는지와 총 수익률을 함께 봅니다.</p></article><article><b>해석 주의</b><p>매년 실제로 같은 수익이 났다는 뜻은 아니며, 변동성은 별도로 확인해야 합니다.</p></article></div></div><div class="utility-form"><div class="utility-fields">${field('cagr-start','시작 금액','10000000')}${field('cagr-end','종료 금액','15000000')}${field('cagr-years','기간(년)','3')}${field('cagr-months','추가 개월 수','6')}</div><button class="primary-btn" id="cagr-calc" type="button">CAGR 계산하기</button></div><div class="result" id="cagr-result" aria-live="polite"></div><p class="calculator-note">CAGR 계산 결과는 입력값 기준의 단순 환산치입니다. 세금, 수수료, 배당, 환율, 중간 입출금, 투자 위험은 반영하지 않으므로 투자 판단의 참고 자료로만 사용하세요.</p></section><section class="content-block"><h2>CAGR 공식</h2><p>CAGR = (종료 금액 ÷ 시작 금액)^(1 ÷ 기간) − 1 입니다. 예를 들어 1,000만원이 3년 뒤 1,331만원이 되었다면 매년 10%씩 성장한 것과 같은 결과로 볼 수 있습니다.</p></section><section class="content-block"><h2>언제 쓰면 좋나요?</h2><ul><li><strong>투자 상품 비교</strong>: 기간이 다른 주식, ETF, 펀드 성과를 같은 연 단위로 맞춰 볼 때</li><li><strong>사업 성장 확인</strong>: 매출, 사용자 수, 자산 규모가 여러 해 동안 얼마나 성장했는지 볼 때</li><li><strong>목표 역산</strong>: 현재 금액이 목표 금액까지 가려면 어느 정도 연평균 성장률이 필요한지 가늠할 때</li></ul></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/compound-interest.html">복리 계산기</a><a href="/calculators/roi.html">ROI 계산기</a><a href="/calculators/stock-return.html">주식 수익률 계산기</a><a href="/calculators/percent-change.html">퍼센트 증가율 계산기</a></div></section>`;
    const result=root.querySelector('#cagr-result');
    const money=n=>Math.round(n).toLocaleString('ko-KR')+'원';
    const pct=n=>(Number.isFinite(n)?n:0).toFixed(2)+'%';
    root.querySelector('#cagr-calc').onclick=()=>{
      const start=+root.querySelector('#cagr-start').value,end=+root.querySelector('#cagr-end').value,years=+root.querySelector('#cagr-years').value,months=+root.querySelector('#cagr-months').value;
      const period=years+(months||0)/12;
      if(!start||!end||period<=0||start<=0||end<=0){
        result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>시작 금액, 종료 금액, 기간은 0보다 큰 값이어야 합니다.</p>';
        result.classList.add('show');
        return;
      }
      const cagr=(end/start)**(1/period)-1,totalReturn=(end/start-1),multiple=end/start,gain=end-start,simpleAnnual=totalReturn/period;
      const yearsToShow=Math.min(10,Math.ceil(period));
      const rows=Array.from({length:yearsToShow},(_,i)=>{
        const y=Math.min(i+1,period),value=start*(1+cagr)**y;
        return `<tr><td>${y===period?period.toFixed(period%1?1:0):i+1}년차</td><td>${money(value)}</td><td>${pct((value/start-1)*100)}</td></tr>`;
      }).join('');
      const tone=cagr>0?'성장':'감소';
      const verdict=cagr>0?`입력한 기간 동안 매년 평균 ${pct(cagr*100)}씩 성장한 것과 같은 결과입니다.`:`입력한 기간 동안 매년 평균 ${pct(Math.abs(cagr)*100)}씩 감소한 것과 같은 결과입니다.`;
      result.innerHTML=`<div class="savings-result-grid cagr-result-grid"><div><span>CAGR</span><strong>${pct(cagr*100)}</strong><small>연평균 ${tone}률</small></div><div><span>총 수익률</span><b>${pct(totalReturn*100)}</b><small>시작 대비 누적 변화</small></div><div><span>평가 차익</span><b>${money(gain)}</b><small>${money(start)} → ${money(end)}</small></div><div><span>투자 배수</span><b>${multiple.toFixed(2)}배</b><small>${period.toFixed(period%1?1:0)}년 기준</small></div></div><div class="switch-verdict"><b>${cagr>=0?'연평균 성장으로 환산하면':'연평균 감소로 환산하면'}</b><p>${verdict} 단순히 총 수익률을 기간으로 나눈 값(${pct(simpleAnnual*100)})과는 다를 수 있습니다.</p></div><div class="loan-schedule-table-wrap cagr-table-wrap"><table class="loan-schedule-table"><thead><tr><th>기간</th><th>같은 CAGR 적용 시 금액</th><th>누적 변화율</th></tr></thead><tbody>${rows}</tbody></table></div><p>CAGR은 결과를 비교하기 쉽게 만드는 지표입니다. 실제 투자에서는 중간 낙폭, 현금흐름, 세금과 수수료까지 함께 보는 것이 좋습니다.</p>`;
      result.classList.add('show');
    };
    return;
  }
  if(type==='employee-health-insurance'){
    root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>직장인 건강보험료 계산기</h1><p class="lead">월 보수액을 입력해 2026년 기준 근로자 부담 건강보험료와 장기요양보험료를 간편하게 계산하세요.</p><section class="calculator-box utility-box readable-calc-box"><div class="readable-intro"><h2>월급에서 빠지는 건보료를 빠르게 확인</h2><p>직장가입자는 건강보험료를 회사와 근로자가 절반씩 부담합니다. 이 계산기는 보수월액 기준으로 근로자 부담분, 회사 부담분, 장기요양보험료, 연간 예상 공제액을 나눠 보여줍니다.</p><div class="readable-guide-grid"><article><b>2026년 건강보험료율</b><p>전체 7.19%, 근로자 부담 3.595% 기준으로 계산합니다.</p></article><article><b>장기요양보험료</b><p>건강보험료의 13.14%, 보수월액 기준 근로자 부담 약 0.4724%로 봅니다.</p></article><article><b>보수월액 기준</b><p>일반적으로 비과세 소득을 제외한 월 급여를 기준으로 입력하면 됩니다.</p></article></div></div><div class="utility-form"><div class="utility-fields">${field('ehi-pay','월 보수액(원)','3000000')}${field('ehi-bonus','월평균 상여·수당(원)','0')}<label><span>계산 기준 연도</span><select id="ehi-year"><option value="2026">2026년 기준</option><option value="2025">2025년 기준</option></select></label><label><span>회사 부담분 표시</span><select id="ehi-employer"><option value="yes">함께 보기</option><option value="no">근로자 부담만 보기</option></select></label></div><button class="primary-btn" id="ehi-calc" type="button">건강보험료 계산하기</button></div><div class="result" id="ehi-result" aria-live="polite"></div><p class="calculator-note">건강보험료 계산 결과는 입력한 보수월액 기준의 예상치입니다. 보수월액 산정, 비과세 급여, 정산, 감면, 상한·하한 적용 여부에 따라 실제 급여 공제액은 달라질 수 있습니다.</p></section><section class="content-block"><h2>계산 기준</h2><table class="rate-table"><tbody><tr><td>2026년 건강보험료율</td><td>보수월액의 7.19%이며 직장가입자는 근로자와 회사가 절반씩 부담합니다.</td></tr><tr><td>2026년 근로자 건강보험료</td><td>보수월액 × 3.595%</td></tr><tr><td>2026년 장기요양보험료</td><td>근로자 건강보험료 × 13.14%로 계산합니다.</td></tr><tr><td>입력 기준</td><td>월급명세서의 과세 보수 또는 회사가 신고한 보수월액과 맞춰 입력하면 가장 가깝습니다.</td></tr></tbody></table></section><section class="content-block readable-faq"><h2>자주 묻는 질문</h2><details open><summary>월급 전체를 넣으면 되나요?</summary><p>급여명세서의 과세 보수에 가까운 금액을 넣는 것이 좋습니다. 식대 등 비과세 항목은 실제 보수월액에서 제외될 수 있습니다.</p></details><details><summary>장기요양보험료는 왜 같이 나오나요?</summary><p>급여에서 건강보험료와 함께 장기요양보험료가 공제되기 때문입니다. 실제 월 공제액을 보려면 두 금액을 함께 보는 것이 자연스럽습니다.</p></details><details><summary>4대보험 전체 공제액과 같은가요?</summary><p>아닙니다. 이 계산기는 건강보험과 장기요양보험만 계산합니다. 국민연금, 고용보험까지 함께 보려면 4대보험 계산기를 이용하세요.</p></details></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/salary.html">월급 실수령액 계산기</a><a href="/calculators/four-insurance.html">4대보험 계산기</a><a href="/calculators/local-health-insurance.html">지역가입자 건강보험료 계산기</a><a href="/calculators/annual-salary.html">연봉 계산기</a></div></section>`;
    const result=root.querySelector('#ehi-result');
    const money=n=>Math.round(n).toLocaleString('ko-KR')+'원';
    root.querySelector('#ehi-calc').onclick=()=>{
      const base=+root.querySelector('#ehi-pay').value,bonus=+root.querySelector('#ehi-bonus').value||0,year=root.querySelector('#ehi-year').value,showEmployer=root.querySelector('#ehi-employer').value==='yes';
      if(!base||base<=0||bonus<0){
        result.innerHTML='<strong>월 보수액을 확인해 주세요</strong><p>월 보수액은 0보다 큰 금액으로 입력해 주세요.</p>';
        result.classList.add('show');
        return;
      }
      const rates=year==='2026'?{health:0.0719,careOnHealth:0.1314,label:'2026년'}:{health:0.0709,careOnHealth:0.1295,label:'2025년'};
      const pay=base+bonus,employeeHealth=pay*rates.health/2,employeeCare=employeeHealth*rates.careOnHealth,employeeTotal=employeeHealth+employeeCare;
      const employerHealth=employeeHealth,employerCare=employeeCare,combined=(employeeTotal+employerHealth+employerCare);
      const yearly=employeeTotal*12;
      const employerHtml=showEmployer?`<div><span>회사 부담 건강보험</span><b>${money(employerHealth)}</b><small>장기요양 ${money(employerCare)} 별도</small></div><div><span>노사 합산 월 보험료</span><b>${money(combined)}</b><small>근로자+회사 부담</small></div>`:'';
      result.innerHTML=`<div class="savings-result-grid"><div><span>근로자 월 부담</span><strong>${money(employeeTotal)}</strong><small>건강보험+장기요양</small></div><div><span>건강보험료</span><b>${money(employeeHealth)}</b><small>근로자 부담 ${((rates.health/2)*100).toFixed(3)}%</small></div><div><span>장기요양보험료</span><b>${money(employeeCare)}</b><small>건강보험료의 ${(rates.careOnHealth*100).toFixed(2)}%</small></div><div><span>연간 예상 공제</span><b>${money(yearly)}</b><small>${rates.label} 기준</small></div>${employerHtml}</div><div class="switch-verdict"><b>월 보수액 ${money(pay)} 기준</b><p>${rates.label} 요율로 계산했습니다. 실제 급여명세서에서는 보수월액 신고, 정산, 비과세 급여, 감면 여부에 따라 차이가 날 수 있습니다.</p></div><table class="rate-table"><tbody><tr><td>계산식</td><td>근로자 건강보험료 = 보수월액 × ${(rates.health/2*100).toFixed(3)}%, 장기요양보험료 = 건강보험료 × ${(rates.careOnHealth*100).toFixed(2)}%</td></tr><tr><td>입력 보수월액</td><td>${money(base)}${bonus?` + 월평균 상여·수당 ${money(bonus)}`:''}</td></tr><tr><td>참고</td><td>국민연금·고용보험·소득세는 포함하지 않은 건강보험 전용 계산입니다.</td></tr></tbody></table>`;
      result.classList.add('show');
    };
    return;
  }
  if(type==='prepayment-fee'){
    root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>중도상환수수료 계산기</h1><p class="lead">상환 예정 원금과 약정 수수료율로 예상 중도상환수수료를 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('pf-principal','상환 예정 원금(원)','10000000')}${field('pf-rate','약정 수수료율(%)','1.2')}${field('pf-remain','수수료 부과 잔여 기간(개월)','12')}</div><button class="primary-btn" id="advanced-calc">수수료 계산하기</button></div><div class="result" id="advanced-result"></div><p class="calculator-note">은행별 면제 조건, 수수료 부과 기간, 일할 계산 방식은 다를 수 있습니다.</p></section>`;
    root.querySelector('#advanced-calc').onclick=()=>{const p=+root.querySelector('#pf-principal').value,r=+root.querySelector('#pf-rate').value,m=+root.querySelector('#pf-remain').value,result=root.querySelector('#advanced-result');if(!p||!r||!m)return;const fee=p*r/100*m/36;result.innerHTML=`<strong>${Math.round(fee).toLocaleString()}원</strong><p>3년 부과 기간을 기준으로 잔여 기간을 일할 반영한 단순 추정입니다.</p>`;result.classList.add('show')};
  }
  if(type==='car-acquisition-tax'){
    root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>자동차 취득세 계산기</h1><p class="lead">차량 가격과 적용 세율을 입력해 예상 취득세를 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('cat-price','차량 과세표준(원)','30000000')}${field('cat-rate','적용 취득세율(%)','7')}</div><button class="primary-btn" id="advanced-calc">취득세 계산하기</button></div><div class="result" id="advanced-result"></div><p class="calculator-note">차종, 친환경차 감면, 등록 지역, 공채 등은 별도로 적용될 수 있습니다.</p></section>`;
    root.querySelector('#advanced-calc').onclick=()=>{const p=+root.querySelector('#cat-price').value,r=+root.querySelector('#cat-rate').value,result=root.querySelector('#advanced-result');if(!p||!r)return;const tax=p*r/100;result.innerHTML=`<strong>${Math.round(tax).toLocaleString()}원</strong><p>차량 가격의 ${r}%를 적용한 예상 취득세입니다.</p>`;result.classList.add('show')};
  }
  if(type==='stock-leverage'){
    root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>주식 레버리지 계산기</h1><p class="lead">기초자산 수익률과 레버리지 배수를 기준으로 예상 손익을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('sl-invest','투자금(원)','1000000')}${field('sl-return','기초자산 수익률(%)','5')}${field('sl-leverage','레버리지 배수','2')}${field('sl-fee','예상 비용률(%)','0')}</div><button class="primary-btn" id="advanced-calc">레버리지 손익 계산하기</button></div><div class="result" id="advanced-result"></div><p class="calculator-note">단순 배수 추정치입니다. 레버리지 ETF·ETN은 일일 리밸런싱, 변동성 손실, 괴리율, 수수료로 인해 장기 성과가 기초자산 수익률의 단순 배수와 달라질 수 있습니다.</p></section>`;
    root.querySelector('#advanced-calc').onclick=()=>{const investment=+root.querySelector('#sl-invest').value,baseReturn=+root.querySelector('#sl-return').value,leverage=+root.querySelector('#sl-leverage').value,fee=+root.querySelector('#sl-fee').value,result=root.querySelector('#advanced-result');if(!investment||!leverage)return;const rate=baseReturn*leverage-fee,profit=investment*rate/100;r.innerHTML=`<strong>${Math.round(profit).toLocaleString()}원</strong><p>예상 수익률 ${rate.toFixed(2)}% · 예상 평가금액 ${Math.round(investment+profit).toLocaleString()}원</p>`;result.classList.add('show')};
  }
  if(type==='loan-schedule'){
    root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>대출 상환 스케줄 계산기</h1><p class="lead">상환방법별로 매월 내야 하는 원금, 이자, 월 상환액, 남은 잔액을 표로 정리합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('ls-principal','대출 원금(원)','100000000')}${field('ls-rate','연 이자율(%)','4.5')}${field('ls-months','상환 기간(개월)','36')}<label><span>상환 방법</span><select id="ls-method"><option value="annuity">원리금균등상환</option><option value="principal">원금균등상환</option><option value="bullet">만기일시상환</option></select></label></div><button class="primary-btn" id="loan-schedule-calc" type="button">상환표 계산하기</button></div><div class="result" id="loan-schedule-result"></div><p class="calculator-note">거치기간, 중도상환수수료, 금리 변동, 실제 납입일별 일할 이자는 반영하지 않은 참고용 상환표입니다.</p></section><section class="content-block"><h2>상환방법별 차이</h2><ul><li><strong>원리금균등상환</strong>: 매월 상환액이 거의 일정해 예산 관리가 쉽습니다.</li><li><strong>원금균등상환</strong>: 매월 갚는 원금이 같고, 시간이 갈수록 이자가 줄어 월 납입액이 감소합니다.</li><li><strong>만기일시상환</strong>: 매월 이자만 내다가 마지막 달에 원금을 한 번에 갚습니다.</li></ul></section>`;
    const money=n=>Math.round(n).toLocaleString('ko-KR')+'원';
    const makeRows=(principal,rate,months,method)=>{
      const r=rate/100/12, rows=[];let balance=principal,totalPay=0,totalInterest=0;
      if(method==='annuity'){
        const monthly=r?principal*r*(1+r)**months/((1+r)**months-1):principal/months;
        for(let m=1;m<=months;m++){const interest=balance*r, principalPay=m===months?balance:monthly-interest, pay=principalPay+interest;balance=Math.max(0,balance-principalPay);totalPay+=pay;totalInterest+=interest;rows.push([m,pay,principalPay,interest,balance]);}
      }else if(method==='principal'){
        const principalPayBase=principal/months;
        for(let m=1;m<=months;m++){const interest=balance*r, principalPay=m===months?balance:principalPayBase, pay=principalPay+interest;balance=Math.max(0,balance-principalPay);totalPay+=pay;totalInterest+=interest;rows.push([m,pay,principalPay,interest,balance]);}
      }else{
        for(let m=1;m<=months;m++){const interest=principal*r, principalPay=m===months?principal:0, pay=interest+principalPay, remain=m===months?0:principal;totalPay+=pay;totalInterest+=interest;rows.push([m,pay,principalPay,interest,remain]);}
      }
      return {rows,totalPay,totalInterest};
    };
    root.querySelector('#loan-schedule-calc').onclick=()=>{
      const principal=+root.querySelector('#ls-principal').value,rate=+root.querySelector('#ls-rate').value,months=Math.round(+root.querySelector('#ls-months').value),method=root.querySelector('#ls-method').value,result=root.querySelector('#loan-schedule-result');
      if(!principal||rate<0||!months){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>대출 원금, 금리, 상환 기간을 올바르게 입력해 주세요.</p>';result.classList.add('show');return}
      const data=makeRows(principal,rate,months,method),label={annuity:'원리금균등상환',principal:'원금균등상환',bullet:'만기일시상환'}[method];
      const visible=data.rows.slice(0,120);
      result.innerHTML=`<div class="savings-result-grid"><div><span>상환방법</span><strong>${label}</strong></div><div><span>첫 달 상환액</span><b>${money(data.rows[0][1])}</b></div><div><span>총 이자</span><b>${money(data.totalInterest)}</b></div><div><span>총 상환액</span><b>${money(data.totalPay)}</b></div></div><div class="loan-schedule-table-wrap"><table class="loan-schedule-table"><thead><tr><th>회차</th><th>월 상환액</th><th>원금</th><th>이자</th><th>남은 잔액</th></tr></thead><tbody>${visible.map(row=>`<tr><td>${row[0]}개월</td><td>${money(row[1])}</td><td>${money(row[2])}</td><td>${money(row[3])}</td><td>${money(row[4])}</td></tr>`).join('')}</tbody></table></div>${data.rows.length>visible.length?`<p class="loan-schedule-note">표가 너무 길어 처음 ${visible.length}개월까지만 표시했습니다. 총액 계산에는 전체 ${months}개월이 반영됐습니다.</p>`:''}`;
      result.classList.add('show');
    };
    return;
  }
  const quick={
    'card-installment':['카드 할부 수수료 계산기',['결제 금액(원)','할부 개월','연 수수료율(%)'],v=>{const r=v[2]/1200,m=r?v[0]*r*(1+r)**v[1]/((1+r)**v[1]-1):v[0]/v[1];return [m,`총 수수료 ${Math.round(m*v[1]-v[0]).toLocaleString()}원`]}],
    'housing-subscription':['청약 가점 계산기',['무주택 기간(년)','부양가족 수','청약통장 가입기간(년)'],v=>[Math.min(32,v[0]*2)+Math.min(35,v[1]*5)+Math.min(17,v[2]),'간편 가점 추정치']],
    'monthly-rent-deduction':['월세 세액공제 계산기',['월세(원)','거주 개월','공제율(%)'],v=>[v[0]*v[1]*v[2]/100,'입력한 공제율 기준 예상 공제액']],
    'loan-schedule':['대출 상환 스케줄 계산기',['대출 원금(원)','연 이자율(%)','기간(개월)'],v=>{const r=v[1]/1200,m=r?v[0]*r*(1+r)**v[2]/((1+r)**v[2]-1):v[0]/v[2];return [m,`총 상환액 ${Math.round(m*v[2]).toLocaleString()}원`]}]
  };
  if(quick[type]){const q=quick[type];root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>${q[0]}</h1><p class="lead">필요한 값을 입력해 예상 결과를 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${q[1].map((x,i)=>field('q'+i,x,i?10:1000000)).join('')}</div><button class="primary-btn" id="quick-calc">계산하기</button></div><div class="result" id="quick-result"></div><p class="calculator-note">개인 조건·상품·해당 연도 제도 기준에 따라 실제 결과는 달라질 수 있습니다.</p></section>`;root.querySelector('#quick-calc').onclick=()=>{const v=q[1].map((_,i)=>+root.querySelector('#q'+i).value),r=root.querySelector('#quick-result');if(v.some(x=>!x))return;const a=q[2](v);r.innerHTML=`<strong>${Math.round(a[0]).toLocaleString()}${type==='housing-subscription'?'점':'원'}</strong><p>${a[1]}</p>`;r.classList.add('show')}}
  if(type==='ovulation'||type==='menstrual-cycle'){const isOvu=type==='ovulation';root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>${isOvu?'배란일·가임기 계산기':'생리 주기 계산기'}</h1><p class="lead">최근 생리 시작일과 평소 주기를 기준으로 예상 날짜를 확인합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><label>최근 생리 시작일 <input id="cycle-date" type="date"></label><label>평소 주기(일) <input id="cycle-length" type="number" placeholder="예: 28"></label><button class="primary-btn" id="cycle-calc">계산하기</button></div><div class="result" id="cycle-result"></div><p class="calculator-note">건강 상태를 판단하는 의료 도구가 아닌 날짜 기준 참고용 계산입니다.</p></section>`;root.querySelector('#cycle-calc').onclick=()=>{const d=new Date(root.querySelector('#cycle-date').value),n=+root.querySelector('#cycle-length').value,r=root.querySelector('#cycle-result');if(isNaN(d)||!n)return;const target=new Date(d);target.setDate(target.getDate()+(isOvu?n-14:n));r.innerHTML=`<strong>${target.toLocaleDateString('ko-KR')}</strong><p>${isOvu?'예상 배란일':'예상 다음 생리 시작일'}입니다.</p>`;r.classList.add('show')}}
  const guides={
    'dsr':['DSR 계산 방법','DSR은 연간 원리금 상환액을 연소득으로 나눈 비율입니다. 금융기관별 산정 범위와 스트레스 금리 적용 여부에 따라 실제 심사 결과는 달라질 수 있습니다.'],
    'stock-return':['주식 수익률 계산 방법','매수·매도 금액에 수수료를 반영한 뒤 실제 손익과 수익률을 계산합니다. 세금과 환전 비용은 별도입니다.'],
    'prepayment-fee':['중도상환수수료 확인 방법','대출 약정서의 수수료율, 면제 조건, 부과 종료일을 먼저 확인하세요. 일부 상품은 수수료가 면제됩니다.'],
    'car-acquisition-tax':['자동차 취득세 계산 전 확인','차종과 친환경차 감면, 등록 지역, 공채 매입 등은 이 계산 결과에 포함되지 않을 수 있습니다.'],
    'stock-leverage':['레버리지 계산기 사용 방법','기초자산 수익률에 레버리지 배수를 곱한 단순 추정입니다. 특히 장기 보유 시 일일 리밸런싱과 변동성 손실을 별도로 고려해야 합니다.']
  };
  if(guides[type])root.insertAdjacentHTML('beforeend',`<section class="content-block"><h2>${guides[type][0]}</h2><p>${guides[type][1]}</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/stock-return.html">주식 수익률 계산기</a><a href="/calculators/compound-interest.html">복리 계산기</a></div></section>`);
})();
