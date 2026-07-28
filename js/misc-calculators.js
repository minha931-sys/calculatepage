(()=>{
  const type=document.body.dataset.misc;
  if(!type)return;
  const root=document.querySelector('#calculator');

  if(type==='daily-proration'){
    if(!root.hasAttribute('data-static-rendered')) root.innerHTML=`
      <a class="calculator-home" href="/">← 계산페이지 홈</a>
      <h1>일할 계산기</h1>
      <p class="lead">월 금액을 사용자가 정한 월 기준 일수로 나눈 뒤 실제 적용 일수만큼 계산합니다.</p>
      <section class="calculator-box utility-box">
        <div class="utility-form">
          <div class="utility-fields">
            <label><span>월 금액(원)</span><input id="dp-amount" type="text" inputmode="decimal" placeholder="예: 3000000"></label>
            <label><span>월 기준 일수</span><input id="dp-days" type="number" min="1" max="31" step="1" inputmode="numeric" placeholder="예: 30"></label>
            <label><span>적용 일수</span><input id="dp-used" type="number" min="0" max="31" step="any" inputmode="decimal" placeholder="예: 15"></label>
          </div>
          <button class="primary-btn" id="misc-calc" type="button">일할 계산하기</button>
        </div>
        <div class="result" id="misc-result" aria-live="polite"></div>
        <p class="calculator-note">달력일 기준의 단순 배분 결과입니다. 급여는 근로계약·취업규칙, 월세와 구독료는 계약서의 일할 기준 및 시작·종료일 포함 여부를 먼저 확인하세요.</p>
      </section>`;
    root.querySelector('#misc-calc').onclick=()=>{
      const amountText=root.querySelector('#dp-amount').value.trim().replaceAll(',','');
      const daysText=root.querySelector('#dp-days').value.trim();
      const usedText=root.querySelector('#dp-used').value.trim();
      const amount=Number(amountText),days=Number(daysText),used=Number(usedText),result=root.querySelector('#misc-result');
      if(!amountText||!daysText||!usedText||!Number.isFinite(amount)||!Number.isFinite(days)||!Number.isFinite(used)||amount<=0||!Number.isInteger(days)||days<1||days>31||used<0||used>days){
        result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>월 금액은 0보다 크게, 월 기준 일수는 1~31의 정수로, 적용 일수는 0 이상 기준 일수 이하로 입력해 주세요.</p>';
        result.classList.add('show');
        return;
      }
      const daily=amount/days,prorated=daily*used;
      result.innerHTML=`<strong>${Math.round(prorated).toLocaleString('ko-KR')}원</strong><p>1일 금액 ${Math.round(daily).toLocaleString('ko-KR')}원 × ${used.toLocaleString('ko-KR')}일이며, 최종 금액은 원 단위로 반올림했습니다.</p>`;
      result.classList.add('show');
    };
  }

  if(type==='expected-value'){
    if(!root.hasAttribute('data-static-rendered')) root.innerHTML=`
      <a class="calculator-home" href="/">← 계산페이지 홈</a>
      <h1>기댓값 계산기</h1>
      <p class="lead">가능한 결과값과 각 결과의 발생 확률을 입력해 같은 상황을 반복했을 때의 장기 평균을 계산하세요.</p>
      <section class="calculator-box estimate-box">
        <div class="estimate-toolbar"><div><h2>결과 시나리오</h2><p>각 확률은 백분율(%)로 입력하고 합계를 100%로 맞추세요.</p></div><button class="add-course" id="ev-add" type="button">+ 결과 추가</button></div>
        <div class="estimate-table-wrap"><table class="estimate-table"><thead><tr><th>결과 이름</th><th>발생 확률(%)</th><th>결과값</th><th aria-label="행 삭제"></th></tr></thead><tbody id="ev-rows"></tbody></table></div>
        <div class="estimate-actions"><button class="primary-btn" id="misc-calc" type="button">기댓값 계산하기</button></div>
        <div class="result" id="misc-result" aria-live="polite"></div>
        <p class="calculator-note">기댓값은 한 번의 실제 결과를 예측하거나 이익을 보장하는 값이 아닙니다. 결과의 변동 폭과 최악의 손실 가능성은 별도로 판단하세요.</p>
      </section>`;
    const body=root.querySelector('#ev-rows');
    const row=()=>`<tr><td><input class="ev-name" aria-label="결과 이름" placeholder="예: 이익"></td><td><input class="ev-prob" aria-label="발생 확률" type="number" min="0" max="100" step="any" inputmode="decimal" placeholder="예: 50"></td><td><input class="ev-value" aria-label="결과값" type="number" step="any" inputmode="decimal" placeholder="예: 10000"></td><td><button class="row-delete" type="button" aria-label="이 결과 행 삭제">×</button></td></tr>`;
    body.innerHTML=row()+row();
    root.querySelector('#ev-add').onclick=()=>body.insertAdjacentHTML('beforeend',row());
    body.onclick=event=>{if(event.target.closest('.row-delete')&&body.children.length>2)event.target.closest('tr').remove()};
    root.querySelector('#misc-calc').onclick=()=>{
      let probabilitySum=0,expectedValue=0,valid=true;
      body.querySelectorAll('tr').forEach(tr=>{
        const probabilityText=tr.querySelector('.ev-prob').value.trim();
        const valueText=tr.querySelector('.ev-value').value.trim();
        const probability=Number(probabilityText),value=Number(valueText);
        if(!probabilityText||!valueText||!Number.isFinite(probability)||!Number.isFinite(value)||probability<0||probability>100)valid=false;
        probabilitySum+=probability;
        expectedValue+=probability/100*value;
      });
      const result=root.querySelector('#misc-result');
      if(!valid||!Number.isFinite(probabilitySum)||!Number.isFinite(expectedValue)||Math.abs(probabilitySum-100)>.01){
        const shown=Number.isFinite(probabilitySum)?probabilitySum.toFixed(2):'확인 불가';
        result.innerHTML=`<strong>확률과 결과값을 확인해 주세요</strong><p>모든 행을 입력하고 확률 합계를 100%로 맞춰야 합니다. 현재 합계: ${shown}%</p>`;
        result.classList.add('show');
        return;
      }
      const tone=expectedValue>0?'양수이므로 장기 평균은 이익 방향입니다.':expectedValue<0?'음수이므로 장기 평균은 손실 방향입니다.':'0이므로 장기 평균 손익은 같습니다.';
      result.innerHTML=`<strong>${Math.round(expectedValue).toLocaleString('ko-KR')}</strong><p>확률 합계 100% 기준의 1회당 장기 평균입니다. ${tone} 개별 시행의 결과와 위험 크기는 이 값만으로 알 수 없습니다.</p>`;
      result.classList.add('show');
    };
  }
})();
