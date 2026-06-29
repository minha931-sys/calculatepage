(function(){
  const key=document.body.dataset.category;
  const root=document.querySelector('#category');
  if(!key||!root||typeof cats==='undefined'||typeof calculators==='undefined'||!cats[key])return;

  const href=id=>`/calculators/${id}.html`;
  const unique=ids=>[...new Set(String(ids||'').trim().split(/\s+/).filter(Boolean))];
  const card=id=>calculators[id]?`<a class="calc-card" href="${href(id)}"><b>${calculators[id].n}</b><span>${calculators[id].d||'필요한 값을 입력해 바로 계산하세요.'}</span></a>`:'';
  const link=id=>calculators[id]?`<a href="${href(id)}"><b>${calculators[id].n}</b><span>${calculators[id].d||'필요한 값을 입력해 바로 계산하세요.'}</span></a>`:'';
  const groupBlock=g=>{
    const links=g.ids.map(link).filter(Boolean).join('');
    return links?`<article class="category-purpose-card"><h3>${g.title}</h3><p>${g.desc}</p><div class="category-purpose-links">${links}</div></article>`:'';
  };
  const faqBlock=items=>items.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');

  const data={
    money:{
      eyebrow:'대출·저축·세금·투자',
      title:'금융 계산기',
      lead:'대출 이자, 예금 이자, 월급 실수령액, 세금, 투자 계산까지 생활에 필요한 금융 계산기를 한곳에 모았습니다.',
      recommend:['loan-interest','savings-interest','salary','unemployment-benefit','stock-leverage'],
      groups:[
        {title:'대출 / 이자',desc:'월 이자, 총 상환액, 대출 부담률을 먼저 확인할 때 사용하세요.',ids:['loan-interest','loan-schedule','jeonse-loan','prepayment-fee','dsr']},
        {title:'예금 / 적금',desc:'저축 만기 금액과 세후 이자를 비교할 때 유용합니다.',ids:['savings-interest','installment','compound-interest','youth-leap-account']},
        {title:'월급 / 생활비',desc:'월 실수령액과 건강보험료, 생활 예산, 퇴직·실업 상황의 현금흐름을 점검하세요.',ids:['salary','employee-health-insurance','budget','unemployment-benefit','daily-proration','rent-conversion']},
        {title:'부동산 / 임대',desc:'복비, 취득세, 종부세, 임대수익률처럼 부동산 거래와 보유 비용을 점검하세요.',ids:['real-estate-brokerage','real-estate-acquisition-tax','comprehensive-real-estate-tax','rental-yield','property-tax']},
        {title:'세금 / 공제',desc:'세금과 공제 예상액을 빠르게 보고 신고 전 체크리스트로 활용하세요.',ids:['capital-gains-tax','gift-tax','monthly-rent-deduction','property-tax','car-acquisition-tax','lotto-tax']},
        {title:'투자 / 주식',desc:'매수 단가, 수익률, 연평균 성장률, 레버리지 위험을 계산해 투자 판단을 보조합니다.',ids:['average-price','averaging-down','stock-return','stock-leverage','cagr','roi','percent-change']}
      ],
      guide:'금융 계산기는 실제 계약이나 신청 전에 대략적인 부담과 수익을 빠르게 파악하는 데 도움이 됩니다. 다만 금리, 세율, 수수료, 지원 조건은 금융기관·정부 제도·적용 시점에 따라 달라질 수 있으므로 최종 결정 전 공식 안내를 함께 확인하는 것이 좋습니다.',
      faq:[['계산 결과가 실제 금액과 같나요?','입력값을 기준으로 한 예상 결과입니다. 실제 금액은 상품 조건, 세율, 우대금리, 수수료에 따라 달라질 수 있습니다.'],['금융 계산기는 어떤 순서로 보면 좋나요?','대출은 월 상환액과 총 이자를 먼저 보고, 예금·적금은 세후 이자와 만기 금액을 함께 확인하는 것이 좋습니다.'],['입력한 금융 정보가 저장되나요?','이 사이트의 계산기는 브라우저에서 즉시 계산하는 용도이며, 별도 저장 기능이 없는 입력값은 서버에 저장되지 않습니다.']]
    },
    education:{
      eyebrow:'학점·성적·시험 일정',
      title:'교육 계산기',
      lead:'학점, 목표 평점, 내신 등급, 평균 점수, 시험 D-day 계산에 필요한 도구를 모았습니다.',
      recommend:['gpa','target-gpa','school-grade','average-score','exam-dday'],
      groups:[{title:'대학교 학점',desc:'이번 학기 평점, 목표 평점, 재수강 후 변화를 확인하세요.',ids:['gpa','target-gpa','retake']},{title:'시험 / 성적',desc:'평균 점수, 목표 점수, 내신 등급을 계산해 학습 계획에 활용하세요.',ids:['average-score','exam-target','school-grade']},{title:'일정 관리',desc:'시험까지 남은 날짜를 확인하고 준비 기간을 나눠 보세요.',ids:['exam-dday','d-day','date']},{title:'확률 / 판단',desc:'기댓값처럼 선택지를 비교해야 할 때 참고할 수 있습니다.',ids:['expected-value']}],
      guide:'교육 계산기는 성적을 예측하거나 학습 계획을 세우는 데 유용합니다. 학교별 학점 환산 기준, 내신 산출 방식, 시험 반영 비율은 다를 수 있으므로 최종 성적 판단에는 학교 기준을 함께 확인하세요.',
      faq:[['학점 계산 결과가 학교 성적표와 다를 수 있나요?','학교마다 A+, P/F, 재수강 처리 방식이 다를 수 있어 실제 성적표와 차이가 날 수 있습니다.'],['목표 학점 계산기는 언제 쓰면 좋나요?','다음 학기에 몇 점을 받아야 누적 평점을 맞출 수 있는지 확인할 때 유용합니다.'],['내신 등급은 정확한가요?','일반적인 석차 누적 비율 기준의 예상값입니다. 과목별 반영 방식은 학교 기준을 확인해야 합니다.']]
    },
    health:{
      eyebrow:'체중·칼로리·운동',
      title:'건강 계산기',
      lead:'BMI, 기초대사량, 권장 칼로리, 운동 칼로리, 생리 주기 등 건강 관리를 위한 계산기를 모았습니다.',
      recommend:['bmi','bmr','calorie','exercise-calorie','body-fat'],
      groups:[{title:'체중 / 체형',desc:'현재 상태와 목표 체중을 숫자로 확인해 관리 방향을 잡아보세요.',ids:['bmi','target-weight','body-fat']},{title:'칼로리 / 식단',desc:'하루 필요 열량, 칼로리 적자, 물 섭취량을 계산합니다.',ids:['bmr','calorie','calorie-deficit','water']},{title:'운동',desc:'운동별 예상 소모 칼로리와 러닝 페이스를 확인하세요.',ids:['exercise-calorie','running-pace']},{title:'여성 건강 / 날짜',desc:'생리 주기, 배란일, 임신 주수를 날짜 기준으로 계산합니다.',ids:['ovulation','menstrual-cycle','pregnancy-week']}],
      guide:'건강 계산기는 생활 관리에 참고할 수 있는 일반 계산 도구입니다. 신체 상태를 진단하거나 치료 방향을 결정하는 의료 도구가 아니므로, 통증·질환·임신·영양 문제처럼 중요한 상황에서는 의료 전문가와 상담하세요.',
      faq:[['BMI만으로 건강 상태를 판단해도 되나요?','BMI는 키와 몸무게만 반영하므로 근육량, 체지방률, 질환 여부를 함께 고려해야 합니다.'],['권장 칼로리는 매일 같게 먹으면 되나요?','활동량, 운동량, 목표 체중, 건강 상태에 따라 달라질 수 있어 참고값으로 보는 것이 좋습니다.'],['생리 주기 계산은 정확한가요?','최근 주기를 바탕으로 한 예상 날짜입니다. 주기가 불규칙하거나 건강 이슈가 있으면 전문 상담이 필요합니다.']]
    },
    life:{
      eyebrow:'날짜·시간·단위·생활비',
      title:'생활 계산기',
      lead:'날짜, 시간, 나이, 더치페이, 단위 변환, 배송·부피 계산 등 일상에서 자주 쓰는 계산기를 모았습니다.',
      recommend:['d-day','date','age','dutch-pay','unit'],
      groups:[{title:'날짜 / 시간',desc:'기준일, 디데이, 일수, 경과 시간을 빠르게 확인합니다.',ids:['date','d-day','day-count','time']},{title:'나이 / 생일',desc:'한국식 나이와 만나이를 함께 비교해 서류나 일정 확인에 활용하세요.',ids:['age','international-age']},{title:'비용 나누기 / 이동',desc:'더치페이, 여행 예산, 연료비처럼 일상 비용을 나눠 봅니다.',ids:['dutch-pay','travel-budget','fuel-cost']},{title:'면적 / 변환 / 물류',desc:'평수, 단위, 스케일, CBM, 부피무게처럼 규격 계산이 필요할 때 사용합니다.',ids:['area-conversion','unit','scale','cbm','volumetric-weight']},{title:'생활 공과금',desc:'전기요금처럼 월별 생활비를 추정할 때 참고하세요.',ids:['electricity','car-tax']}],
      guide:'생활 계산기는 반복적으로 찾아보는 작은 계산을 줄이는 데 초점을 둡니다. 날짜와 시간은 포함 기준에 따라 결과가 달라질 수 있고, 배송·요금 계산은 업체별 기준이 다를 수 있으므로 실제 청구 기준을 함께 확인하세요.',
      faq:[['일수 계산은 시작일과 종료일 포함 여부가 중요한가요?','네. 계약 기간, 근무일, 여행 일정 계산에서는 포함 기준에 따라 결과가 1일 이상 달라질 수 있습니다.'],['나이 계산과 만나이 계산은 다른가요?','한국식 나이는 연도 기준, 만나이는 생일 경과 여부 기준이므로 같은 생년월일도 결과가 다를 수 있습니다.'],['CBM이나 부피무게는 실제 배송비와 같나요?','운송사별 분모와 반올림 기준이 달라 실제 청구 중량과 차이가 날 수 있습니다.']]
    },
    business:{
      eyebrow:'사업·업무·급여',
      title:'업무 계산기',
      lead:'부가세, 마진율, 견적, 프리랜서 단가, 근무시간, 퇴직금 등 실무에 필요한 계산기를 모았습니다.',
      recommend:['vat','margin','estimate','freelance-rate','severance'],
      groups:[{title:'사업 / 판매',desc:'판매가, 원가, 세금, 손익분기점과 견적을 함께 확인해 의사결정에 활용하세요.',ids:['vat','margin','break-even','estimate','interior-estimate']},{title:'프리랜서 / 인건비',desc:'시간당 단가, 시급, 근무시간, 연차 등 인건비 관련 계산을 모았습니다.',ids:['freelance-rate','wage','work-hours','annual-leave','weekly-holiday-pay','overtime-pay']},{title:'급여 / 퇴직',desc:'퇴직금, 4대보험, 통상임금, 평균임금처럼 근로 관련 금액을 추정합니다.',ids:['severance','four-insurance','annual-salary','ordinary-wage','average-wage','annual-leave-pay','parental-leave','income-tax','withholding-33']},{title:'배송 / 정산',desc:'배송비 분담과 물류 규격 계산으로 견적·정산을 보조합니다.',ids:['shipping-split','cbm','volumetric-weight']}],
      guide:'업무 계산기는 견적, 정산, 급여, 판매 전략을 빠르게 검토하는 데 유용합니다. 실제 세금 신고, 근로계약, 거래 조건은 업종과 계약서에 따라 달라질 수 있으므로 중요한 업무에는 세무·노무·계약 기준을 확인하세요.',
      faq:[['부가세와 마진율은 같이 봐야 하나요?','네. 부가세 포함 판매가인지, 공급가액 기준인지에 따라 실제 이익률 판단이 달라질 수 있습니다.'],['프리랜서 단가는 어떻게 정하는 게 좋나요?','목표 순수입뿐 아니라 영업·미팅·수정 시간, 세금, 장비비, 플랫폼 수수료까지 반영하는 것이 좋습니다.'],['퇴직금이나 4대보험 계산은 확정 금액인가요?','근속기간, 평균임금, 보수월액, 요율, 상한액에 따라 실제 금액이 달라질 수 있는 예상값입니다.']]
    }
  }[key];

  if(!data)return;
  const all=unique(cats[key][3]).map(card).filter(Boolean).join('');
  const recommended=data.recommend.map(card).filter(Boolean).join('');
  document.title=`${data.title} | 계산페이지`;
  document.querySelector('meta[name="description"]')?.setAttribute('content',data.lead);
  root.innerHTML=`
    <p class="eyebrow">${data.eyebrow}</p>
    <h1>${data.title}</h1>
    <p class="lead">${data.lead}</p>
    <section class="category-featured">
      <div class="section-heading"><h2>추천 ${data.title}</h2><p>이 카테고리에서 먼저 확인하면 좋은 계산기입니다.</p></div>
      <div class="card-grid">${recommended}</div>
    </section>
    <section class="category-purpose">
      <div class="section-heading"><h2>어떤 계산기가 필요하세요?</h2><p>목적에 맞는 계산기를 빠르게 고를 수 있게 묶었습니다.</p></div>
      <div class="category-purpose-grid">${data.groups.map(groupBlock).join('')}</div>
    </section>
    <section class="category-all">
      <div class="section-heading"><h2>전체 ${data.title} 목록</h2><p>현재 제공 중인 모든 계산기입니다.</p></div>
      <div class="card-grid">${all}</div>
    </section>
    <section class="content-block category-guide"><h2>${data.title}를 사용할 때 알아두세요</h2><p>${data.guide}</p></section>
    <section class="content-block category-faq"><h2>자주 묻는 질문</h2>${faqBlock(data.faq)}</section>`;
})();

(function(){
  const key=document.body.dataset.category;
  const root=document.querySelector('#category');
  if(key!=='conversion'||!root||typeof calculators==='undefined')return;

  const href=id=>`/calculators/${id}.html`;
  const card=id=>calculators[id]?`<a class="calc-card" href="${href(id)}"><b>${calculators[id].n}</b><span>${calculators[id].d||'필요한 값을 입력해 바로 계산하세요.'}</span></a>`:'';
  const link=id=>calculators[id]?`<a href="${href(id)}"><b>${calculators[id].n}</b><span>${calculators[id].d||'필요한 값을 입력해 바로 계산하세요.'}</span></a>`:'';
  const groupBlock=group=>{
    const links=group.ids.map(link).filter(Boolean).join('');
    return links?`<article class="category-purpose-card"><h3>${group.title}</h3><p>${group.desc}</p><div class="category-purpose-links">${links}</div></article>`:'';
  };
  const faq=items=>items.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  const allIds=['length-conversion','area-unit-conversion','weight-conversion','temperature-conversion','volume-conversion','speed-conversion','area-conversion','scale','cbm','volumetric-weight'];
  const recommend=['length-conversion','area-unit-conversion','temperature-conversion','weight-conversion','volume-conversion','speed-conversion'];
  const groups=[
    {title:'범용 단위 변환',desc:'길이, 넓이, 무게, 온도, 부피, 속도처럼 기본 단위를 바로 변환합니다.',ids:['length-conversion','area-unit-conversion','weight-conversion','temperature-conversion','volume-conversion','speed-conversion']},
    {title:'부동산 면적',desc:'제곱미터와 평처럼 부동산에서 자주 쓰는 면적 기준을 확인합니다.',ids:['area-conversion']},
    {title:'도면 / 비율',desc:'도면, 모형, 지도처럼 축척과 실제 크기를 비교할 때 사용합니다.',ids:['scale']},
    {title:'물류 / 배송',desc:'박스 부피, CBM, 부피무게처럼 배송비와 화물 규격 계산에 활용합니다.',ids:['cbm','volumetric-weight']}
  ];

  document.title='단위환산 계산기 | 계산페이지';
  document.querySelector('meta[name="description"]')?.setAttribute('content','길이, 넓이, 무게, 온도, 부피, 속도 등 자주 쓰는 단위 변환 계산기를 한곳에서 빠르게 이용하세요.');
  root.innerHTML=`
    <p class="eyebrow">길이·넓이·무게·온도·부피·속도</p>
    <h1>단위환산 계산기</h1>
    <p class="lead">생활, 업무, 공부, 해외 단위 확인에 필요한 변환 계산기를 모았습니다. 값을 입력하고 기준 단위와 변환 단위를 선택하면 바로 결과를 확인할 수 있습니다.</p>
    <section class="category-featured">
      <div class="section-heading"><h2>추천 단위환산 계산기</h2><p>가장 자주 쓰는 단위 변환부터 시작해 보세요.</p></div>
      <div class="card-grid">${recommend.map(card).filter(Boolean).join('')}</div>
    </section>
    <section class="category-purpose">
      <div class="section-heading"><h2>어떤 단위를 바꾸세요?</h2><p>목적에 맞는 변환 계산기를 빠르게 고를 수 있게 묶었습니다.</p></div>
      <div class="category-purpose-grid">${groups.map(groupBlock).join('')}</div>
    </section>
    <section class="category-all">
      <div class="section-heading"><h2>전체 단위환산 계산기 목록</h2><p>범용 변환과 특화 계산기를 역할별로 정리했습니다.</p></div>
      <div class="card-grid">${allIds.map(card).filter(Boolean).join('')}</div>
    </section>
    <section class="content-block category-guide"><h2>단위환산 계산기를 사용할 때 알아두세요</h2><p>대부분의 단위 변환은 표준 환산 계수를 기준으로 계산합니다. 다만 업체, 학교, 기관, 물류사마다 반올림 단위나 표기 관행이 다를 수 있으므로 공식 문서 제출이나 비용 정산에는 해당 기관 기준을 함께 확인하는 것이 좋습니다.</p></section>
    <section class="content-block category-faq"><h2>자주 묻는 질문</h2>${faq([
      ['평과 제곱미터 변환은 정확한가요?','1평을 3.305785㎡로 두고 계산합니다. 부동산 표기에서는 전용면적과 공급면적 기준이 다를 수 있습니다.'],
      ['온도 변환은 어떤 공식을 쓰나요?','섭씨와 화씨는 °F = °C × 9 ÷ 5 + 32, 켈빈은 K = °C + 273.15 기준으로 변환합니다.'],
      ['배송 무게와 부피무게는 단위 변환만으로 충분한가요?','배송비는 운송사별 분모, 반올림, 최소 청구 중량 기준이 있어 실제 운임 기준을 함께 확인해야 합니다.']
    ])}</section>`;
})();
