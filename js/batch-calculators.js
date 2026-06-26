(()=> {
  const t = document.body.dataset.batch;
  if(!t) return;
  const root = document.querySelector('#calculator');
  const won = n => Math.round(Number(n)||0).toLocaleString('ko-KR') + '원';
  const num = id => Number(root.querySelector('#'+id)?.value || 0);
  const val = id => root.querySelector('#'+id)?.value || '';
  const result = html => { const r=root.querySelector('.result'); r.innerHTML=html; r.classList.add('show'); };
  const invalid = msg => result(`<strong>입력값을 확인해 주세요</strong><p>${msg}</p>`);
  const field = (id,label,ex,type='number') => `<label><span>${label}</span><input id="${id}" type="${type}" placeholder="예: ${ex}" inputmode="decimal"></label>`;
  const select = (id,label,opts) => `<label><span>${label}</span><select id="${id}">${opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label>`;
  const card = (label,value) => `<div><span>${label}</span><b>${value}</b></div>`;
  const shell = (title,lead,inputs,note,guide) => {
    root.innerHTML = `<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>${title}</h1><p class="lead">${lead}</p>
    <section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${inputs}</div><button class="primary-btn" id="bc" type="button">계산하기</button></div><div class="result" id="br"></div><p class="calculator-note">${note}</p></section>
    <section class="content-block">${guide}</section>`;
  };

  if(t==='income-tax'){
    const brackets = [
      [14000000,.06,0],[50000000,.15,1260000],[88000000,.24,5760000],[150000000,.35,15440000],
      [300000000,.38,19940000],[500000000,.40,25940000],[1000000000,.42,35940000],[Infinity,.45,65940000]
    ];
    const table = '<table class="rate-table"><thead><tr><th>과세표준</th><th>세율</th><th>누진공제</th></tr></thead><tbody><tr><td>1,400만원 이하</td><td>6%</td><td>0원</td></tr><tr><td>5,000만원 이하</td><td>15%</td><td>1,260,000원</td></tr><tr><td>8,800만원 이하</td><td>24%</td><td>5,760,000원</td></tr><tr><td>1억 5,000만원 이하</td><td>35%</td><td>15,440,000원</td></tr><tr><td>3억원 이하</td><td>38%</td><td>19,940,000원</td></tr><tr><td>5억원 이하</td><td>40%</td><td>25,940,000원</td></tr><tr><td>10억원 이하</td><td>42%</td><td>35,940,000원</td></tr><tr><td>10억원 초과</td><td>45%</td><td>65,940,000원</td></tr></tbody></table>';
    shell('근로소득 세금 간편 계산기','연봉과 공제액을 입력하면 과세표준 구간, 예상 소득세, 지방소득세를 보여줍니다.',
      field('salary','연간 총급여(세전, 원)','50000000') + field('deduct','예상 소득공제·근로소득공제 합계(원)','15000000') + field('credit','예상 세액공제(원)','700000') + field('paid','이미 낸 세금(원)','1500000'),
      '간편 계산입니다. 근로소득공제, 인적공제, 특별공제, 세액공제는 개인별로 달라 실제 연말정산 결과와 차이가 날 수 있습니다.',
      `<h2>근로소득세율 예상 표</h2>${table}<p>총급여에서 각종 공제를 뺀 과세표준에 기본세율과 누진공제를 적용합니다.</p>`);
    root.querySelector('#bc').onclick=()=>{
      const salary=num('salary'), deduct=num('deduct'), credit=num('credit'), paid=num('paid');
      if(!salary) return invalid('연간 총급여를 입력해 주세요.');
      const base=Math.max(0,salary-deduct), row=brackets.find(r=>base<=r[0]);
      const incomeTax=Math.max(0,base*row[1]-row[2]-credit), local=incomeTax*.1, due=incomeTax+local-paid;
      result(`<div class="savings-result-grid">${card(due>=0?'예상 추가 납부':'환급 예상액',won(Math.abs(due)))}${card('과세표준',won(base))}${card('적용 세율',Math.round(row[1]*100)+'%')}${card('지방소득세',won(local))}</div><p>소득세 ${won(incomeTax)} + 지방소득세 ${won(local)} - 기납부세액 ${won(paid)} 기준입니다.</p>`);
    };
    return;
  }

  if(t==='electricity'){
    shell('전기요금 계산기','월 사용량과 계약 구분을 입력하면 주택용 누진 구간을 적용해 예상 전기요금을 계산합니다.',
      field('kwh','월 사용량(kWh)','350') + select('season','계절/구간',[['normal','기타 계절'],['summer','하계 7~8월']]) + field('vat','부가세·기금 등 가산율(%)','13.7'),
      '주택용 저압의 기본요금·전력량요금 누진 구조를 간편 반영합니다. 실제 고지액은 복지할인, 기후환경요금, 연료비조정액 등에 따라 달라집니다.',
      '<h2>주택용 전기요금 기준</h2><p>사용량이 늘수록 높은 단가가 적용되는 누진 구조입니다. 하계에는 일부 구간 한도가 완화됩니다.</p>');
    root.querySelector('#bc').onclick=()=>{
      const k=num('kwh'), add=(num('vat')||13.7)/100; if(!k) return invalid('월 사용량을 입력해 주세요.');
      const summer=val('season')==='summer';
      const limits=summer?[300,450,Infinity]:[200,400,Infinity];
      const rates=[120,214.6,307.3], basics=summer?(k<=300?910:k<=450?1600:7300):(k<=200?910:k<=400?1600:7300);
      let remain=k, energy=0, prev=0;
      limits.forEach((limit,i)=>{const qty=Math.max(0,Math.min(k,limit)-prev); energy+=qty*rates[i]; prev=limit;});
      const subtotal=basics+energy,total=subtotal*(1+add);
      result(`<div class="savings-result-grid">${card('예상 전기요금',won(total))}${card('기본요금',won(basics))}${card('전력량요금',won(energy))}${card('가산 추정',won(total-subtotal))}</div><p>${k.toLocaleString()}kWh 사용 기준입니다.</p>`);
    };
    return;
  }

  if(t==='travel-budget'){
    shell('여행 경비 계산기','항공·숙박·식비·교통비를 나눠 입력해 총 예산과 1인/1일 예산을 계산합니다.',
      field('people','인원 수','2') + field('days','여행 일수','3') + field('flight','항공·교통 총액(원)','400000') + field('hotel','숙박 총액(원)','300000') + field('food','1인 1일 식비(원)','50000') + field('local','현지 교통·입장료 총액(원)','150000') + field('extra','예비비(%)','10'),
      '여행 전 예산 배분용 계산입니다. 환율, 성수기 요금, 현지 결제 수수료는 별도로 고려하세요.',
      '<h2>추천 예산 구성</h2><p>교통·숙박 같은 고정비와 식비·현지비 같은 변동비를 분리하면 초과 지출을 보기 쉽습니다.</p>');
    root.querySelector('#bc').onclick=()=>{
      const p=num('people'),d=num('days'); if(!p||!d) return invalid('인원 수와 여행 일수를 입력해 주세요.');
      const base=num('flight')+num('hotel')+num('food')*p*d+num('local'), extra=base*(num('extra')||0)/100,total=base+extra;
      result(`<div class="savings-result-grid">${card('총 예상 경비',won(total))}${card('1인 총 경비',won(total/p))}${card('1인 1일 경비',won(total/p/d))}${card('예비비',won(extra))}</div>`);
    };
    return;
  }

  if(t==='shipping-split'){
    shell('배송비 분할 계산기','상품별 금액·수량 기준으로 배송비를 공정하게 배분합니다.',
      field('shipping','총 배송비(원)','12000') + field('totalAmount','전체 상품금액(원)','80000') + field('itemAmount','해당 상품금액(원)','30000') + field('totalQty','전체 수량','8') + field('itemQty','해당 상품 수량','3') + select('mode','분배 기준',[['amount','상품금액 비례'],['qty','수량 비례']]),
      '공동구매, 합배송 정산용 계산입니다. 무게·부피 기준 배송비라면 금액 기준보다 수량 또는 별도 무게 기준이 더 적절할 수 있습니다.',
      '<h2>분배 기준 선택</h2><p>상품 가격 차이가 크면 금액 비례, 비슷한 상품 여러 개라면 수량 비례가 이해하기 쉽습니다.</p>');
    root.querySelector('#bc').onclick=()=>{
      const ship=num('shipping'); if(!ship) return invalid('총 배송비를 입력해 주세요.');
      const ratio=val('mode')==='amount' ? num('itemAmount')/num('totalAmount') : num('itemQty')/num('totalQty');
      if(!Number.isFinite(ratio)||ratio<0) return invalid('전체 기준값과 해당 상품 값을 올바르게 입력해 주세요.');
      result(`<div class="savings-result-grid">${card('해당 상품 배송비',won(ship*ratio))}${card('분배 비율',(ratio*100).toFixed(1)+'%')}${card('상품당 배송비',won(ship*ratio/(num('itemQty')||1)))}${card('남은 배송비',won(ship*(1-ratio)))}</div>`);
    };
    return;
  }

  if(t==='break-even'){
    shell('손익분기점 계산기','고정비, 판매가, 변동비를 입력해 필요한 판매수량과 목표이익 수량을 계산합니다.',
      field('fixed','월 고정비(원)','3000000') + field('price','개당 판매가(원)','30000') + field('variable','개당 변동비(원)','12000') + field('target','목표 이익(원)','1000000'),
      '판매가에서 변동비를 뺀 공헌이익으로 고정비를 회수하는 구조입니다. 광고비, 플랫폼 수수료, 반품률도 변동비에 포함하면 더 현실적입니다.',
      '<h2>계산 기준</h2><p>손익분기 수량 = 고정비 ÷ (판매가 − 변동비). 목표 이익이 있으면 고정비에 목표 이익을 더해 계산합니다.</p>');
    root.querySelector('#bc').onclick=()=>{
      const fixed=num('fixed'), price=num('price'), variable=num('variable'), target=num('target');
      const margin=price-variable; if(!fixed||!price||margin<=0) return invalid('판매가는 변동비보다 커야 합니다.');
      result(`<div class="savings-result-grid">${card('손익분기 수량',Math.ceil(fixed/margin).toLocaleString()+'개')}${card('목표이익 필요 수량',Math.ceil((fixed+target)/margin).toLocaleString()+'개')}${card('개당 공헌이익',won(margin))}${card('공헌이익률',(margin/price*100).toFixed(1)+'%')}</div>`);
    };
    return;
  }

  if(t==='roi'){
    shell('ROI 계산기','투자금, 회수금, 기간을 입력해 수익률과 연환산 수익률을 계산합니다.',
      field('invest','초기 투자금(원)','10000000') + field('return','최종 회수금(원)','12000000') + field('months','투자 기간(개월)','12') + field('cost','추가 비용(원)','0'),
      '단순 ROI와 기간을 반영한 연환산 수익률을 함께 보여줍니다. 세금, 환율, 배당 재투자 여부는 별도 고려가 필요합니다.',
      '<h2>ROI 해석</h2><p>ROI는 총수익률이고, 연환산 수익률은 기간이 다른 투자안을 비교할 때 더 유용합니다.</p>');
    root.querySelector('#bc').onclick=()=>{
      const invest=num('invest'), ret=num('return'), months=num('months')||12, cost=num('cost'); if(!invest||!ret) return invalid('투자금과 회수금을 입력해 주세요.');
      const net=ret-invest-cost, roi=net/(invest+cost)*100, annual=(Math.pow(ret/(invest+cost),12/months)-1)*100;
      result(`<div class="savings-result-grid">${card('ROI',roi.toFixed(2)+'%')}${card('연환산 수익률',annual.toFixed(2)+'%')}${card('순이익',won(net))}${card('총 투입액',won(invest+cost))}</div>`);
    };
    return;
  }

  if(t==='exchange'){
    shell('환율 계산기','환율, 환전 수수료, 우대율을 반영해 실제 환전 예상액을 계산합니다.',
      field('foreign','외화 금액','1000') + field('rate','매매기준율(원)','1350') + field('spread','환전 수수료율(%)','1.75') + field('discount','환율 우대율(%)','90'),
      '은행·카드사·환전 방식에 따라 적용 환율이 다를 수 있습니다. 수수료 우대율을 반영한 예상 원화 금액입니다.',
      '<h2>환율 우대 계산</h2><p>수수료율 중 우대받지 못하는 부분만 매매기준율에 더해 실제 적용 환율을 추정합니다.</p>');
    root.querySelector('#bc').onclick=()=>{
      const foreign=num('foreign'), rate=num('rate'), spread=num('spread'), disc=num('discount'); if(!foreign||!rate) return invalid('외화 금액과 환율을 입력해 주세요.');
      const applied=rate*(1+spread/100*(1-disc/100)), krw=foreign*applied;
      result(`<div class="savings-result-grid">${card('예상 원화 금액',won(krw))}${card('적용 환율',applied.toFixed(2)+'원')}${card('우대 후 수수료율',(spread*(1-disc/100)).toFixed(3)+'%')}${card('우대 절감액',won(foreign*(rate*spread/100*disc/100)))}</div>`);
    };
    return;
  }

  if(t==='percent-change'){
    shell('퍼센트 증가율·감소율 계산기','이전값과 현재값을 입력해 변화율, 차이, 배수를 계산합니다.',
      field('before','이전 값','100000') + field('after','현재 값','120000'),
      '가격, 방문자 수, 매출 변화 등을 비교할 때 쓰는 계산기입니다.',
      '<h2>변화율 공식</h2><p>(현재값 − 이전값) ÷ 이전값 × 100으로 계산합니다.</p>');
    root.querySelector('#bc').onclick=()=>{
      const b=num('before'), a=num('after'); if(!b) return invalid('이전 값은 0보다 커야 합니다.');
      const diff=a-b, pct=diff/b*100;
      result(`<div class="savings-result-grid">${card('변화율',pct.toFixed(2)+'%')}${card('차이',diff.toLocaleString())}${card('현재/이전 배수',(a/b).toFixed(3)+'배')}${card('방향',diff>=0?'증가':'감소')}</div>`);
    };
    return;
  }

  if(t==='calorie-deficit'){
    shell('칼로리 적자 계산기','유지 칼로리, 섭취 칼로리, 목표 기간으로 예상 체중 변화를 계산합니다.',
      field('maintain','하루 유지 칼로리(kcal)','2200') + field('eat','하루 섭취 칼로리(kcal)','1700') + field('days','목표 기간(일)','30'),
      '체지방 1kg을 약 7,700kcal로 보는 단순 추정입니다. 실제 체중 변화는 수분, 운동, 대사 적응에 따라 달라질 수 있습니다.',
      '<h2>건강한 적자 범위</h2><p>너무 큰 칼로리 적자는 지속하기 어렵고 건강에 부담이 될 수 있습니다. 의료·영양 전문가 조언을 우선하세요.</p>');
    root.querySelector('#bc').onclick=()=>{
      const m=num('maintain'), e=num('eat'), d=num('days'); if(!m||!d) return invalid('유지 칼로리와 기간을 입력해 주세요.');
      const daily=m-e,total=daily*d,kg=total/7700;
      result(`<div class="savings-result-grid">${card('예상 변화',kg.toFixed(2)+'kg')}${card('하루 적자',Math.round(daily).toLocaleString()+'kcal')}${card('총 적자',Math.round(total).toLocaleString()+'kcal')}${card('주간 환산',(kg/d*7).toFixed(2)+'kg/주')}</div>`);
    };
    return;
  }

  if(t==='exam-target'){
    shell('시험 성적 목표 계산기','현재 점수와 반영비율을 입력해 남은 시험에서 필요한 점수를 계산합니다.',
      field('current','현재까지 반영 점수','45') + field('currentRate','현재 반영비율(%)','50') + field('remainRate','남은 시험 반영비율(%)','50') + field('target','최종 목표 점수','80'),
      '수행평가, 중간고사, 기말고사처럼 반영비율이 나뉜 과목에서 사용할 수 있습니다.',
      '<h2>계산 방식</h2><p>최종 목표 점수에서 현재 기여 점수를 뺀 뒤 남은 반영비율로 나눠 필요한 시험 점수를 구합니다.</p>');
    root.querySelector('#bc').onclick=()=>{
      const cur=num('current'), cr=num('currentRate')/100, rr=num('remainRate')/100, target=num('target'); if(!rr) return invalid('남은 시험 반영비율을 입력해 주세요.');
      const currentContribution=cur*cr, need=(target-currentContribution)/rr;
      result(`<div class="savings-result-grid">${card('남은 시험 필요 점수',need.toFixed(1)+'점')}${card('현재 기여 점수',currentContribution.toFixed(1)+'점')}${card('목표 달성 가능성',need<=100?'가능 범위':'100점 초과')}${card('여유/부족',(100-need).toFixed(1)+'점')}</div>`);
    };
  }
})();
