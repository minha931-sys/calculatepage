(function(){
  const type = document.body.dataset.taxCalculator;
  if(!type) return;
  const root = document.querySelector('#calculator');
  const W = n => Math.round(Number(n) || 0).toLocaleString('ko-KR') + '원';
  const N = id => Number(String(root.querySelector('#'+id)?.value || '').replace(/,/g,'')) || 0;
  const V = id => root.querySelector('#'+id)?.value || '';
  const C = id => !!root.querySelector('#'+id)?.checked;

  const incomeBrackets = [
    [14000000,.06,0],
    [50000000,.15,1260000],
    [88000000,.24,5760000],
    [150000000,.35,15440000],
    [300000000,.38,19940000],
    [500000000,.40,25940000],
    [1000000000,.42,35940000],
    [Infinity,.45,65940000]
  ];
  const giftBrackets = [
    [100000000,.10,0],
    [500000000,.20,10000000],
    [1000000000,.30,60000000],
    [3000000000,.40,160000000],
    [Infinity,.50,460000000]
  ];
  const progressive = (base, table) => {
    base = Math.max(0, base);
    const row = table.find(r => base <= r[0]);
    return Math.max(0, base * row[1] - row[2]);
  };
  const field = (id,label,ex,type='number') => `<label><span>${label}</span><input id="${id}" type="${type}" placeholder="예: ${ex}" inputmode="decimal"></label>`;
  const select = (id,label,opts) => `<label><span>${label}</span><select id="${id}">${opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label>`;
  const check = (id,label,checked=false) => `<label class="tax-check"><input id="${id}" type="checkbox" ${checked?'checked':''}> ${label}</label>`;
  const result = html => {
    const box = root.querySelector('.result');
    box.innerHTML = html;
    box.classList.add('show');
  };
  const invalid = msg => result(`<strong>입력값을 확인해 주세요</strong><p>${msg}</p>`);
  const card = (label,value) => `<div><span>${label}</span><b>${value}</b></div>`;
  const box = (title, desc, inputs, note, guide, related='') => {
    root.innerHTML = `<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>${title}</h1><p class="lead">${desc}</p>
    <section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${inputs}</div><button class="primary-btn" id="tax-calc" type="button">계산하기</button></div><div class="result" aria-live="polite"></div><p class="calculator-note">${note}</p></section>
    <section class="content-block"><h2>${title} 사용 방법</h2>${guide}</section>
    <section class="content-block"><h2>계산 전 꼭 확인하세요</h2><p>이 페이지는 사용자가 입력한 값으로 빠르게 확인하는 간편 계산기입니다. 세법, 보험료율, 정책 지원 조건은 적용 시점과 개인 상황에 따라 달라질 수 있으므로 신고·납부·가입 결정 전에는 국세청, 위택스, 국민건강보험공단, 국민연금공단 등 공식 안내를 함께 확인해 주세요.</p></section>
    ${related}`;
  };

  if(type === 'capital-gains-tax'){
    box('양도소득세 계산기','양도가액, 취득가액, 필요경비, 보유기간 공제를 입력해 양도소득세 예상액을 계산합니다.',
      field('sale','양도가액(원)','800000000') + field('buy','취득가액(원)','500000000') + field('cost','필요경비(원)','20000000') + field('lt','장기보유특별공제율(%)','0') + field('basic','연간 기본공제(원)','2500000'),
      '국세청 계산 흐름인 양도차익 − 장기보유특별공제 − 기본공제 구조를 간편 반영합니다. 1세대 1주택 비과세, 다주택 중과, 조정대상지역, 감면·특례는 별도 판단이 필요합니다.',
      '<ol><li>실제 양도가액과 취득가액을 입력하세요.</li><li>중개수수료, 취득세 등 필요경비를 입력하세요.</li><li>특례 판단이 어렵다면 장기보유특별공제율은 0으로 두고 보수적으로 확인하세요.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const sale=N('sale'), buy=N('buy'), cost=N('cost'), lt=N('lt'), basic=N('basic') || 2500000;
      if(!sale || !buy || sale <= buy) return invalid('양도가액은 취득가액보다 커야 계산할 수 있습니다.');
      const gain = Math.max(0, sale - buy - cost);
      const longDed = gain * Math.min(Math.max(lt,0),80) / 100;
      const base = Math.max(0, gain - longDed - basic);
      const tax = progressive(base, incomeBrackets);
      const local = tax * .1;
      result(`<div class="savings-result-grid">${card('예상 납부세액',W(tax+local))}${card('양도차익',W(gain))}${card('과세표준',W(base))}${card('지방소득세',W(local))}</div><p>소득세 ${W(tax)} + 지방소득세 ${W(local)} 기준의 간편 추정입니다.</p>`);
    };
  }

  if(type === 'gift-tax'){
    box('증여세 계산기','증여재산가액과 증여자 관계를 기준으로 증여세 예상 납부액을 계산합니다.',
      field('amount','증여재산가액(원)','100000000') + field('debt','인수 채무액(원)','0') + field('prior','10년 이내 동일인 증여액(원)','0') +
      select('relation','증여자와의 관계',[['spouse','배우자'],['asc-adult','직계존속→성년'],['asc-minor','직계존속→미성년'],['desc','직계비속'],['relative','기타 친족'],['other','그 외']]) +
      select('skip','세대생략 할증',[['none','없음'],['30','30%'],['40','40%']]) + check('file-credit','신고세액공제 3% 반영',true),
      '증여재산공제와 기본세율을 적용한 간편 계산입니다. 부담부증여, 비거주자, 재차증여 합산, 감정평가수수료, 납부세액공제 등은 실제 신고에서 달라질 수 있습니다.',
      '<ol><li>증여받는 재산가액을 입력하세요.</li><li>채무를 함께 인수한다면 인수 채무액을 입력하세요.</li><li>증여자와의 관계를 선택하면 10년 합산 공제 한도가 자동 반영됩니다.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const amount=N('amount'), debt=N('debt'), prior=N('prior');
      if(!amount) return invalid('증여재산가액을 입력해 주세요.');
      const limits={spouse:600000000,'asc-adult':50000000,'asc-minor':20000000,desc:50000000,relative:10000000,other:0};
      const limit = limits[V('relation')] || 0;
      const remainingDed = Math.max(0, limit - prior);
      const taxable = Math.max(0, amount - debt - remainingDed);
      let tax = progressive(taxable, giftBrackets);
      const skip = Number(V('skip')) || 0;
      const surcharge = tax * skip / 100;
      tax += surcharge;
      const credit = C('file-credit') ? tax * .03 : 0;
      const finalTax = Math.max(0, tax - credit);
      result(`<div class="savings-result-grid">${card('예상 증여세',W(finalTax))}${card('과세표준',W(taxable))}${card('남은 공제액',W(remainingDed))}${card('신고세액공제',W(credit))}</div><p>산출세액 ${W(tax)}${skip?` · 세대생략 할증 ${W(surcharge)}`:''} 기준입니다.</p>`);
    };
  }

  if(type === 'car-tax'){
    box('자동차세 계산기','배기량, 최초등록연도, 차종 조건으로 자동차세와 연납 예상액을 계산합니다.',
      select('kind','차량 구분',[['passenger','비영업용 승용차'],['business','영업용 승용차'],['electric','전기차·수소차']]) + field('cc','배기량(cc)','1998') + field('year','최초등록연도','2020') + select('prepay','연납 신청월',[['0','연납 없음'],['1','1월'],['3','3월'],['6','6월'],['9','9월']]),
      '비영업용 승용차는 배기량별 세액과 차령 경감, 지방교육세를 간편 반영합니다. 승합·화물·특수차, 지자체 고지, 연납 실제 공제율은 달라질 수 있습니다.',
      '<ol><li>승용차 기준으로 차량 구분과 배기량을 입력하세요.</li><li>최초등록연도를 입력하면 3년 차부터의 차령 경감을 반영합니다.</li><li>연납 신청월을 선택하면 예상 할인 후 금액을 함께 보여줍니다.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const kind=V('kind'), cc=N('cc'), year=N('year'), now=new Date().getFullYear();
      if(kind!=='electric' && !cc) return invalid('배기량을 입력해 주세요.');
      let base = 0;
      if(kind==='electric') base = 100000;
      else {
        const rates = kind==='business' ? [[1000,18],[1600,18],[2000,19],[2500,19],[Infinity,24]] : [[1000,80],[1600,140],[Infinity,200]];
        base = cc * rates.find(r=>cc<=r[0])[1];
      }
      const age = year ? Math.max(1, now - year + 1) : 1;
      const discount = kind==='passenger' ? Math.min(Math.max(age-2,0)*.05,.5) : 0;
      const afterAge = base * (1 - discount);
      const edu = kind==='passenger' ? afterAge * .3 : 0;
      const annual = afterAge + edu;
      const prepayRate = ({1:.046,3:.038,6:.025,9:.0125}[V('prepay')] || 0);
      result(`<div class="savings-result-grid">${card('연간 예상 자동차세',W(annual))}${card('차령 경감',Math.round(discount*100)+'%')}${card('지방교육세',W(edu))}${card('연납 후 예상',W(annual*(1-prepayRate)))}</div><p>연납 공제율은 시기별 실공제율을 간편 적용한 값입니다.</p>`);
    };
  }

  if(type === 'national-pension'){
    box('국민연금 예상수령액 계산기','월 납입보험료와 예상 가입기간으로 노령연금 월 수령액을 간편 추정합니다.',
      field('premium','월 납입보험료(원)','270000') + field('years','예상 가입기간(년)','20') + field('avg','전체 가입자 평균소득월액 A값(원)','3000000'),
      '국민연금은 가입 이력, 연도별 소득, A값, 수급연령, 부양가족연금 등에 따라 달라집니다. 이 계산기는 월 보험료를 기준소득월액으로 환산한 간편 추정입니다.',
      '<ol><li>현재 또는 예상 월 납입보험료를 입력하세요.</li><li>총 가입기간을 10년 이상으로 입력하세요.</li><li>정확한 금액은 국민연금공단 예상연금 조회를 이용하세요.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const premium=N('premium'), years=N('years'), A=N('avg') || 3000000;
      if(!premium || years < 10) return invalid('월 납입보험료와 10년 이상의 가입기간을 입력해 주세요.');
      const B = premium / .09;
      const annualBase = 1.2 * (A + B) * (years / 40);
      const monthly = annualBase / 12;
      result(`<div class="savings-result-grid">${card('월 예상 노령연금',W(monthly))}${card('환산 기준소득월액',W(B))}${card('예상 가입기간',years+'년')}${card('연 예상액',W(monthly*12))}</div><p>공식 산식 전체를 대체하지 않는 간편 추정입니다. 실제 예상연금은 국민연금공단 조회값을 우선하세요.</p>`);
    };
  }

  if(type === 'local-health-insurance'){
    box('지역가입자 건강보험료 계산기','지역가입자의 소득과 재산 과세표준을 입력해 월 건강보험료를 간편 추정합니다.',
      field('income','연 소득금액(원)','30000000') + field('property','재산 과세표준 합계(원)','200000000') + field('rate','건강보험료율(%)','7.09') + field('ltc','장기요양보험료율: 건강보험료 대비(%)','12.95'),
      '사용자가 입력한 보험료율과 재산 기준을 바탕으로 한 간편 추정입니다. 실제 지역보험료는 공단의 소득·재산 산정 방식, 감면 조건, 적용 시점에 따라 다릅니다.',
      '<ol><li>종합소득 신고 기준 연 소득금액을 입력하세요.</li><li>재산은 공시가격이 아니라 재산세 과세표준에 가까운 값을 입력하는 것이 안전합니다.</li><li>고지 보험료와 다르면 국민건강보험공단 모의계산을 우선하세요.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const income=N('income'), property=N('property'), rate=(N('rate')||7.09)/100, ltc=(N('ltc')||12.95)/100;
      if(income < 0 || property < 0) return invalid('소득과 재산은 0 이상으로 입력해 주세요.');
      const incomePremium = income / 12 * rate;
      const propertyBase = Math.max(0, property - 100000000);
      const propertyPremium = propertyBase * .0000018;
      const health = incomePremium + propertyPremium;
      const care = health * ltc;
      result(`<div class="savings-result-grid">${card('월 예상 보험료',W(health+care))}${card('건강보험료',W(health))}${card('장기요양보험료',W(care))}${card('재산 반영액',W(propertyPremium))}</div><p>공단 점수표를 완전 대체하지 않는 간편 추정입니다. 자동차 보험료는 반영하지 않았습니다.</p>`);
    };
  }

  if(type === 'comprehensive-income-tax'){
    box('종합소득세 계산기','연 수입, 필요경비, 소득공제, 기납부세액으로 종합소득세 예상액을 계산합니다.',
      field('revenue','연 수입금액(원)','60000000') + field('expense','필요경비(원)','20000000') + field('deduction','소득공제(원)','3000000') + field('prepaid','기납부세액(원)','1000000'),
      '국세청 종합소득세 기본세율과 지방소득세 10%를 간편 반영합니다. 세액공제, 감면, 가산세, 업종별 필요경비율은 별도 확인이 필요합니다.',
      '<ol><li>프리랜서·사업소득 등 연 수입금액을 입력하세요.</li><li>장부 또는 추정 필요경비를 입력하세요.</li><li>3.3% 원천징수 등 이미 낸 세금은 기납부세액에 입력하세요.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const revenue=N('revenue'), expense=N('expense'), deduction=N('deduction'), prepaid=N('prepaid');
      if(!revenue) return invalid('연 수입금액을 입력해 주세요.');
      const taxable = Math.max(0, revenue - expense - deduction);
      const tax = progressive(taxable, incomeBrackets);
      const local = tax * .1;
      const due = tax + local - prepaid;
      result(`<div class="savings-result-grid">${card(due>=0?'예상 납부액':'예상 환급액',W(Math.abs(due)))}${card('과세표준',W(taxable))}${card('소득세',W(tax))}${card('지방소득세',W(local))}</div><p>기납부세액 ${W(prepaid)}을 반영한 간편 결과입니다.</p>`);
    };
  }

  if(type === 'withholding-33'){
    box('원천징수 3.3% 계산기','프리랜서 사업소득의 3.3% 원천징수액과 실수령액을 계산하거나 역산합니다.',
      select('mode','계산 방식',[['gross','세전 금액 → 실수령액'],['net','실수령액 → 세전 금액']]) + field('amount','금액(원)','1000000'),
      '인적용역 사업소득 원천징수 관행인 소득세 3% + 지방소득세 0.3%를 반영합니다. 실제 종합소득세 신고 시 환급 또는 추가 납부가 발생할 수 있습니다.',
      '<ol><li>세전 계약금액 또는 실제 받은 금액을 입력하세요.</li><li>계산 방식을 선택하세요.</li><li>연말 종합소득세 정산용으로 기납부세액도 확인해 두세요.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const mode=V('mode'), amount=N('amount');
      if(!amount) return invalid('금액을 입력해 주세요.');
      const gross = mode==='gross' ? amount : amount / .967;
      const tax = gross * .03, local = gross * .003, net = gross - tax - local;
      result(`<div class="savings-result-grid">${card('세전 금액',W(gross))}${card('실수령액',W(net))}${card('소득세 3%',W(tax))}${card('지방소득세 0.3%',W(local))}</div><p>총 원천징수액은 ${W(tax+local)}입니다.</p>`);
    };
  }

  if(type === 'property-tax'){
    box('재산세 계산기','주택 공시가격과 보유 조건으로 재산세, 지방교육세, 도시지역분을 간편 계산합니다.',
      field('official','주택 공시가격(원)','600000000') + select('owner','보유 구분',[['one','1세대 1주택'],['normal','그 외 주택']]) + check('urban','도시지역분 0.14% 반영',true),
      '주택 재산세 과세표준은 공시가격에 공정시장가액비율을 곱해 계산합니다. 공정시장가액비율과 특례 적용 여부는 적용 시점과 보유 조건에 따라 달라질 수 있습니다.',
      '<ol><li>주택 공시가격을 입력하세요.</li><li>1세대 1주택 여부를 선택하세요.</li><li>도시지역분은 고지서에 별도 표시되는 항목으로 필요 시 체크하세요.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const official=N('official'); if(!official) return invalid('공시가격을 입력해 주세요.');
      let ratio = .6;
      if(V('owner')==='one') ratio = official <= 300000000 ? .43 : official <= 600000000 ? .44 : .45;
      const base = official * ratio;
      let tax = base<=60000000 ? base*.001 : base<=150000000 ? 60000+(base-60000000)*.0015 : base<=300000000 ? 195000+(base-150000000)*.0025 : 570000+(base-300000000)*.004;
      const edu = tax * .2;
      const urban = C('urban') ? base * .0014 : 0;
      result(`<div class="savings-result-grid">${card('예상 재산세 합계',W(tax+edu+urban))}${card('과세표준',W(base))}${card('재산세',W(tax))}${card('지방교육세·도시지역분',W(edu+urban))}</div><p>공정시장가액비율 ${Math.round(ratio*100)}%를 적용했습니다.</p>`);
    };
  }

  if(type === 'youth-leap-account'){
    const money = value => Math.round(Number(value)||0).toLocaleString('ko-KR') + '원';
    root.innerHTML = `<a class="calculator-home" href="/">← 계산페이지 홈</a>
      <h1>청년미래적금 계산기</h1>
      <p class="lead">청년미래적금을 처음 보는 사람도 월 납입액, 상품 유형, 예상 금리를 넣어 3년 만기 수령액과 정부기여금을 쉽게 확인할 수 있습니다.</p>
      <section class="calculator-box utility-box youth-future-box">
        <div class="content-block youth-intro">
          <h2>청년미래적금이란?</h2>
          <p>청년미래적금은 청년도약계좌 후속으로 추진되는 청년 자산형성 적금입니다. 기본 구조는 <strong>3년 동안 매달 적금</strong>을 넣고, 조건을 충족하면 은행 이자와 정부기여금을 함께 받는 방식입니다.</p>
          <ul>
            <li>월 납입 한도는 최대 50만원 기준으로 계산합니다.</li>
            <li>일반형은 납입액의 6%, 우대형은 납입액의 12%를 정부기여금으로 가정합니다.</li>
            <li>비과세만 적용되는 경우는 정부기여금 없이 은행 이자만 계산합니다.</li>
          </ul>
          <h2>일반형·우대형 기준을 쉽게 보면</h2>
          <div class="youth-type-grid">
            <article><b>일반형</b><strong>정부기여금 6%</strong><p>청년미래적금 가입 대상에 해당하고 기본 지원을 받는 경우로 가정합니다.</p></article>
            <article><b>우대형</b><strong>정부기여금 12%</strong><p>중소기업 신규 취업 청년 등 우대 지원 대상에 해당하는 경우로 가정합니다.</p></article>
            <article><b>비과세만 적용</b><strong>정부기여금 0원</strong><p>대상 여부가 불확실하거나 보수적으로 보고 싶을 때 선택하세요.</p></article>
          </div>
        </div>
        <div class="utility-form">
          <h2>1. 나는 어떤 유형으로 볼까요?</h2>
          <div class="utility-fields">
            <label><span>상품 유형</span><select id="yf-type">
              <option value="general">일반형 · 정부기여금 6%</option>
              <option value="preferential">우대형 · 정부기여금 12%</option>
              <option value="taxfree">비과세만 적용 · 정부기여금 없음</option>
            </select></label>
            <label><span>월 납입액(원)</span><input id="yf-monthly" type="number" min="0" max="500000" step="10000" placeholder="예: 500000" inputmode="decimal"></label>
            <label><span>예상 연 금리(%)</span><input id="yf-rate" type="number" min="0" step="0.1" placeholder="예: 5" inputmode="decimal"></label>
            <div class="field full"><span>금리를 잘 모르겠다면</span><div class="search-keywords youth-rate-presets"><button type="button" data-rate="3.5">보수적 3.5%</button><button type="button" data-rate="5">기본 예시 5%</button><button type="button" data-rate="6">우대금리 포함 6%</button></div></div>
            <label><span>가입 기간</span><select id="yf-months">
              <option value="36">3년 만기(36개월)</option>
              <option value="24">2년 유지 가정</option>
              <option value="12">1년 유지 가정</option>
            </select></label>
          </div>
          <button class="primary-btn" id="tax-calc" type="button">만기 예상액 계산하기</button>
        </div>
        <div class="result" aria-live="polite"></div>
        <p class="calculator-note">이 계산기는 월 납입액과 입력 금리를 기준으로 한 참고용 추정입니다. 실제 가입 가능 여부, 기여금 지급 요건, 비과세 요건, 중도해지 기준, 은행별 우대금리는 공식 상품 안내를 확인해야 합니다.</p>
      </section>
      <section class="content-block">
        <h2>청년미래적금 계산 방법</h2>
        <ol>
          <li><strong>상품 유형</strong>을 고르세요. 조건을 잘 모르겠다면 일반형으로 먼저 계산해도 됩니다.</li>
          <li><strong>월 납입액</strong>은 매달 넣을 수 있는 금액을 입력하세요. 현재 계산기는 최대 50만원까지만 반영합니다.</li>
          <li><strong>예상 연 금리</strong>는 은행 기본금리와 우대금리를 합친 값을 입력하세요. 아직 금리를 모르면 3.5%, 5%, 6% 버튼으로 먼저 비교해 보세요.</li>
          <li>결과에서 내가 넣은 원금, 예상 은행 이자, 정부기여금을 나눠 확인하세요.</li>
        </ol>
      </section>
      <section class="content-block">
        <h2>결과를 볼 때 꼭 알아둘 점</h2>
        <ul>
          <li>정부기여금은 상품 유형과 자격 조건을 충족한다는 가정으로 계산합니다.</li>
          <li>중도해지, 납입 중단, 소득 기준 미충족, 은행별 우대금리 미충족 시 실제 수령액은 줄어들 수 있습니다.</li>
          <li>비과세는 세금이 없다는 뜻이지, 모든 가입자가 정부기여금을 받는다는 뜻은 아닙니다.</li>
        </ul>
      </section>
      <section class="content-block">
        <h2>자주 묻는 질문</h2>
        <details><summary>청년미래적금은 청년도약계좌와 같은 상품인가요?</summary><p>같은 상품명은 아닙니다. 청년미래적금은 청년도약계좌 후속 성격으로 추진되는 적금으로 알려져 있으며, 세부 가입 조건과 출시 일정은 공식 안내를 확인해야 합니다.</p></details>
        <details><summary>일반형과 우대형은 무엇이 다른가요?</summary><p>이 계산기에서는 일반형은 납입액의 6%, 우대형은 12%를 정부기여금으로 가정합니다. 우대형은 중소기업 신규 취업 청년 등 우대 지원 대상에 해당하는 경우로 보고 계산합니다.</p></details>
        <details><summary>금리를 모르면 어떻게 입력하나요?</summary><p>아직 가입할 은행을 정하지 않았다면 4~5%처럼 보수적인 금리를 넣어 먼저 비교하고, 실제 상품 금리가 나오면 다시 계산하는 방식이 좋습니다.</p></details>
      </section>`;

    root.querySelectorAll('.youth-rate-presets button').forEach(button=>{
      button.onclick=()=>{root.querySelector('#yf-rate').value=button.dataset.rate;};
    });

    root.querySelector('#tax-calc').onclick = () => {
      const monthlyRaw = N('yf-monthly');
      const monthly = Math.min(Math.max(monthlyRaw,0),500000);
      const months = N('yf-months') || 36;
      const annualRate = Math.max(0,N('yf-rate'));
      const monthlyRate = annualRate / 100 / 12;
      const typeValue = V('yf-type');
      if(!monthly) return invalid('월 납입액을 입력해 주세요. 예: 500000');
      const contributionRate = typeValue === 'preferential' ? .12 : typeValue === 'general' ? .06 : 0;
      const principal = monthly * months;
      const interest = monthlyRate ? monthly * (((1 + monthlyRate) ** months - 1) / monthlyRate) - principal : 0;
      const contribution = monthly * contributionRate * months;
      const total = principal + interest + contribution;
      const capNotice = monthlyRaw > 500000 ? '<p>월 납입액은 최대 50만원까지만 반영했습니다.</p>' : '';
      const typeLabel = typeValue === 'preferential' ? '우대형 12%' : typeValue === 'general' ? '일반형 6%' : '비과세만 적용';
      result(`<div class="savings-result-grid">${card('만기 예상 수령액',money(total))}${card('내가 넣은 원금',money(principal))}${card('예상 은행 이자',money(interest))}${card('예상 정부기여금',money(contribution))}</div><table class="rate-table"><tbody><tr><td>선택 유형</td><td>${typeLabel}</td></tr><tr><td>월 납입액</td><td>${money(monthly)}</td></tr><tr><td>가입 기간</td><td>${months}개월</td></tr><tr><td>입력 금리</td><td>연 ${annualRate.toFixed(2).replace(/\.00$/,'')}%</td></tr></tbody></table>${capNotice}<p>정부기여금과 비과세는 자격 요건을 충족한다는 가정의 참고용 추정입니다.</p>`);
    };
    return;
  }

  if(type === 'lotto-tax'){
    box('로또 세금 계산기','복권 당첨금의 비과세 구간과 원천징수세율을 반영해 실수령액을 계산합니다.',
      field('prize','당첨금(원)','1000000000'),
      '복권 당첨금의 비과세 구간과 원천징수 세율을 간편 반영합니다. 세율과 과세 기준은 적용 시점의 공식 안내를 확인하세요.',
      '<ol><li>세전 당첨금을 입력하세요.</li><li>200만원 이하는 세금이 없는 것으로 계산합니다.</li><li>3억원 초과 당첨금은 구간별 누진 방식으로 계산합니다.</li></ol>');
    root.querySelector('#tax-calc').onclick = () => {
      const prize=N('prize'); if(!prize) return invalid('당첨금을 입력해 주세요.');
      const taxable = Math.max(0, prize - 2000000);
      const first = Math.min(taxable, 300000000 - 2000000) * .22;
      const second = Math.max(0, prize - 300000000) * .33;
      const tax = first + second;
      result(`<div class="savings-result-grid">${card('예상 실수령액',W(prize-tax))}${card('원천징수세액',W(tax))}${card('비과세 금액',W(Math.min(prize,2000000)))}${card('세전 당첨금',W(prize))}</div><p>복권 당첨금은 분리과세 원천징수 기준의 간편 계산입니다.</p>`);
    };
  }
})();
