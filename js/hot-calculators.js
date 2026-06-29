(function(){
  const root = document.querySelector('#calculator');
  if(!root) return;

  const won = n => Math.round(Number(n) || 0).toLocaleString('ko-KR') + '원';
  const num = id => Number(document.querySelector('#' + id)?.value || 0);
  const val = id => document.querySelector('#' + id)?.value || '';
  const card = (label, value, note = '') => `<div><span>${label}</span><b>${value}</b>${note ? `<small>${note}</small>` : ''}</div>`;
  const show = html => {
    const result = root.querySelector('.result');
    result.innerHTML = html;
    result.classList.add('show');
  };

  function renderPetAge(){
    if(document.body.dataset.hotCalculator !== 'pet-age') return;
    root.innerHTML = `
      <a class="calculator-home" href="/">계산페이지 홈</a>
      <h1>반려동물 나이 계산기</h1>
      <p class="lead">강아지와 고양이의 실제 나이를 사람 나이로 환산하고 생애 단계와 관리 포인트를 확인하세요.</p>
      <section class="calculator-box utility-box pet-age-box">
        <div class="readable-intro">
          <h2>우리 아이 나이, 사람 나이로 보면?</h2>
          <p>반려동물의 나이는 단순히 7을 곱하는 방식보다 종, 크기, 생애 초기 성장 속도를 함께 보는 것이 더 자연스럽습니다. 이 계산기는 일반적인 환산표를 바탕으로 사람 나이, 생애 단계, 검진 주기, 생활 관리 포인트를 함께 보여줍니다.</p>
        </div>
        <div class="utility-form">
          <div class="utility-fields">
            <label><span>반려동물 종류</span><select id="pet-type"><option value="dog">강아지</option><option value="cat">고양이</option></select></label>
            <label><span>크기</span><select id="pet-size"><option value="small">소형</option><option value="medium">중형</option><option value="large">대형</option></select></label>
            <label><span>나이(년)</span><input id="pet-years" type="number" min="0" step="1" placeholder="예: 4"></label>
            <label><span>추가 개월</span><input id="pet-months" type="number" min="0" max="11" step="1" placeholder="예: 6"></label>
            <label><span>현재 체중(kg)</span><input id="pet-weight" type="number" min="0" step="0.1" placeholder="예: 6.5"></label>
            <label><span>중성화 여부</span><select id="pet-neutered"><option value="unknown">잘 모르겠음</option><option value="yes">했음</option><option value="no">안 했음</option></select></label>
          </div>
          <button class="primary-btn" id="pet-calc" type="button">나이 계산하기</button>
        </div>
        <div class="result" aria-live="polite"></div>
        <p class="calculator-note">품종, 체중, 건강 상태에 따라 노화 속도는 달라질 수 있습니다. 건강 이상이 있거나 예방접종·검진 시기가 궁금하다면 수의사 상담을 우선하세요.</p>
      </section>
      <section class="content-block">
        <h2>계산 기준</h2>
        <ul>
          <li><strong>강아지</strong>: 첫 1년은 약 15세, 2년은 약 24세로 보고 이후에는 크기에 따라 다른 속도로 더합니다.</li>
          <li><strong>고양이</strong>: 첫 1년은 약 15세, 2년은 약 24세로 보고 이후에는 매년 약 4세씩 더합니다.</li>
          <li><strong>생애 단계</strong>: 환산 나이를 기준으로 유년기, 성년기, 중년기, 노령기로 나눠 보여줍니다.</li>
        </ul>
      </section>
      <section class="content-block">
        <h2>나이대별로 챙기면 좋은 것</h2>
        <table class="rate-table"><tbody><tr><td>유년기</td><td>예방접종, 사회화, 배변 습관, 기초 훈련을 확인하세요.</td></tr><tr><td>성년기</td><td>체중 관리, 산책·놀이 루틴, 치아 관리를 꾸준히 유지하세요.</td></tr><tr><td>중년기</td><td>치석, 관절, 피부, 식욕 변화처럼 작은 변화를 기록해 두면 좋습니다.</td></tr><tr><td>노령기</td><td>검진 주기를 짧게 잡고 활동량, 배변, 음수량 변화를 세심하게 보세요.</td></tr></tbody></table>
      </section>
      <section class="content-block readable-faq">
        <h2>자주 묻는 질문</h2>
        <details open><summary>강아지는 왜 크기를 선택하나요?</summary><p>대형견은 성견 이후 노화 속도가 소형견보다 빠른 편이라 같은 실제 나이라도 사람 나이 환산값이 달라질 수 있습니다.</p></details>
        <details><summary>정확한 건강 나이인가요?</summary><p>아니요. 이 계산기는 일반적인 환산 기준입니다. 체중, 품종, 중성화 여부, 질병 이력에 따라 실제 건강 상태는 달라집니다.</p></details>
        <details><summary>몇 살부터 노령기로 보면 되나요?</summary><p>소형견과 고양이는 대략 7세 전후, 대형견은 그보다 조금 빠른 시기부터 노령기 관리가 필요할 수 있습니다. 실제 기준은 품종과 건강 상태에 따라 달라집니다.</p></details>
      </section>
      <section class="content-block">
        <h2>관련 계산기</h2>
        <div class="related"><a href="/calculators/age.html">나이 계산기</a><a href="/calculators/d-day.html">디데이 계산기</a><a href="/calculators/water.html">물 섭취량 계산기</a></div>
      </section>`;

    root.querySelector('#pet-calc').onclick = () => {
      const type = val('pet-type');
      const size = val('pet-size');
      const years = Math.max(0, Math.floor(num('pet-years')));
      const months = Math.min(11, Math.max(0, Math.floor(num('pet-months'))));
      const weight = Math.max(0, num('pet-weight'));
      const neutered = val('pet-neutered');
      const age = years + months / 12;
      if(!age) return show('<strong>반려동물의 나이를 입력해 주세요</strong><p>년 또는 개월 중 하나 이상 입력하면 계산할 수 있습니다.</p>');

      let humanAge;
      if(age < 1){
        humanAge = age * 15;
      } else if(age < 2){
        humanAge = 15 + (age - 1) * 9;
      } else {
        const add = type === 'cat' ? 4 : ({small:4, medium:5, large:6}[size] || 4);
        humanAge = 24 + (age - 2) * add;
      }
      humanAge = Math.max(1, Math.round(humanAge));
      const stage = humanAge < 18 ? '유년기' : humanAge < 45 ? '성년기' : humanAge < 65 ? '중년기' : '노령기';
      const realStage = age < 1 ? '성장기' : age < 7 ? '성견·성묘기' : age < 11 ? '시니어 초입' : '노령기';
      const checkup = stage === '노령기' ? '6개월마다 정기 검진 권장' : stage === '중년기' ? '6~12개월마다 검진 권장' : '1년에 1회 이상 검진 권장';
      const care = stage === '유년기' ? '사회화, 예방접종, 기초 훈련을 챙기기 좋은 시기입니다.'
        : stage === '성년기' ? '체중 관리와 규칙적인 운동 습관을 잡기 좋은 시기입니다.'
        : stage === '중년기' ? '치아, 관절, 체중 변화를 정기적으로 확인하면 좋습니다.'
        : '정기 검진 주기를 짧게 잡고 식욕, 활동량, 배변 변화를 살피세요.';
      const sizeLabel = type === 'cat' ? '고양이' : ({small:'소형견', medium:'중형견', large:'대형견'}[size] || '강아지');
      const weightNote = weight ? (type === 'dog' ? `${weight.toLocaleString('ko-KR')}kg 입력 · 같은 크기 안에서도 체형과 품종에 따라 적정 체중은 달라집니다.` : `${weight.toLocaleString('ko-KR')}kg 입력 · 고양이는 체형 점수와 복부 지방 변화를 함께 보는 것이 좋습니다.`) : '체중을 입력하면 체중 관리 메모까지 함께 확인할 수 있습니다.';
      const neuteredNote = neutered === 'yes' ? '중성화 후에는 식욕과 체중이 늘 수 있어 급여량과 간식량을 주기적으로 확인하세요.' : neutered === 'no' ? '중성화 여부는 질환 위험과 생활 관리에 영향을 줄 수 있으니 병원 상담을 참고하세요.' : '중성화 여부를 모르면 다음 검진 때 병원 기록을 확인해 보세요.';
      const checklist = stage === '유년기'
        ? ['예방접종 일정 확인', '사회화 경험 늘리기', '배변·기초 훈련 점검']
        : stage === '성년기'
          ? ['체중과 간식량 기록', '치아 관리 루틴 만들기', '운동·놀이 시간 유지']
          : stage === '중년기'
            ? ['치석·입냄새 확인', '관절 움직임 관찰', '피부·식욕 변화 기록']
            : ['검진 주기 단축', '음수량·배변 변화 확인', '미끄럼 방지와 휴식 공간 점검'];
      const shareText = `반려동물 나이 계산 결과\n- 기준: ${sizeLabel}\n- 실제 나이: ${years}년 ${months}개월\n- 사람 나이 환산: 약 ${humanAge}세\n- 생애 단계: ${stage}\n- 검진 주기: ${checkup}`;
      const shareButton = `<div class="result-share-actions"><button class="result-share-btn" type="button" data-share-result="${shareText.replace(/"/g,'&quot;')}">결과 공유</button></div>`;

      show(`<div class="savings-result-grid">${card('사람 나이 환산', humanAge + '세')}${card('생애 단계', stage)}${card('실제 나이', `${years}년 ${months}개월`)}${card('검진 주기', checkup)}${card('기준', sizeLabel)}${card('실제 생애 구간', realStage)}</div><div class="switch-verdict"><b>${stage} 관리 포인트</b><p>${care}</p></div><table class="rate-table"><tbody><tr><td>체중 메모</td><td>${weightNote}</td></tr><tr><td>중성화 메모</td><td>${neuteredNote}</td></tr><tr><td>이번 달 체크</td><td>${checklist.join(' · ')}</td></tr></tbody></table><p>반려동물 나이 환산은 건강 상태를 진단하는 기준이 아니라, 생활 관리와 검진 시기를 가늠하는 참고값입니다.</p>${shareButton}`);
    };
  }

  function renderMonthlyRentDeduction(){
    if(document.body.dataset.advancedCalculator !== 'monthly-rent-deduction') return;
    root.innerHTML = `
      <a class="calculator-home" href="/">계산페이지 홈</a>
      <h1>월세 세액공제 계산기</h1>
      <p class="lead">월세, 거주 개월, 총급여와 주택 조건을 입력해 예상 월세 세액공제액과 공제 가능성을 확인하세요.</p>
      <section class="calculator-box utility-box readable-calc-box">
        <div class="readable-intro">
          <h2>월세 세액공제, 얼마나 돌려받을 수 있을까요?</h2>
          <p>총급여 8,000만 원 이하 무주택 근로자가 요건을 충족하면 연 월세액 1,000만 원 한도에서 15% 또는 17%를 세액공제로 받을 수 있습니다. 이 계산기는 입력 조건을 바탕으로 예상 공제액을 간단히 보여줍니다.</p>
        </div>
        <div class="utility-form">
          <h2>1. 월세와 소득을 입력하세요</h2>
          <div class="utility-fields">
            <label><span>월세(원)</span><input id="mr-rent" type="number" placeholder="예: 600000"></label>
            <label><span>거주 개월</span><input id="mr-months" type="number" min="1" max="12" placeholder="예: 12"></label>
            <label><span>연 총급여(원)</span><input id="mr-salary" type="number" placeholder="예: 50000000"></label>
            <label><span>무주택 여부</span><select id="mr-house"><option value="yes">무주택</option><option value="no">무주택 아님</option></select></label>
            <label><span>주택 요건</span><select id="mr-home"><option value="yes">85㎡ 이하 또는 기준시가 4억 이하</option><option value="no">요건 불충족</option></select></label>
            <label><span>전입·증빙</span><select id="mr-proof"><option value="yes">전입신고와 납부증빙 가능</option><option value="no">확인 필요</option></select></label>
          </div>
          <button class="primary-btn" id="mr-calc" type="button">세액공제 계산하기</button>
        </div>
        <div class="result" aria-live="polite"></div>
        <p class="calculator-note">월세 세액공제는 총급여, 무주택 여부, 주택 기준, 계약자와 전입신고 주소, 납부 증빙 등 요건에 따라 달라집니다. 신고 전에는 국세청 안내와 실제 증빙자료를 확인하세요.</p>
      </section>
      <section class="content-block">
        <h2>월세 세액공제 기준</h2>
        <table class="rate-table"><tbody><tr><td>총급여 5,500만 원 이하</td><td>월세액의 17%</td></tr><tr><td>총급여 5,500만 원 초과 8,000만 원 이하</td><td>월세액의 15%</td></tr><tr><td>연 월세 인정 한도</td><td>1,000만 원</td></tr><tr><td>주택 기준</td><td>국민주택규모 85㎡ 이하 또는 기준시가 4억 원 이하</td></tr></tbody></table>
      </section>
      <section class="content-block readable-faq">
        <h2>신청 전 체크리스트</h2>
        <details open><summary>집주인 동의가 필요한가요?</summary><p>월세 세액공제는 임대인의 동의보다 임대차계약서, 주민등록등본, 월세 납부 증빙 등 요건 확인이 중요합니다.</p></details>
        <details><summary>총급여가 8,000만 원을 넘으면 어떻게 계산되나요?</summary><p>이 계산기에서는 공제 대상이 아닌 것으로 보고 예상 공제액을 0원으로 계산합니다.</p></details>
        <details><summary>월세를 많이 내면 전액 공제되나요?</summary><p>아니요. 연 월세액 중 1,000만 원까지만 공제 대상 월세로 계산합니다.</p></details>
      </section>
      <section class="content-block">
        <h2>관련 계산기</h2>
        <div class="related"><a href="/calculators/salary.html">월급 실수령액 계산기</a><a href="/calculators/income-tax.html">소득세 계산기</a><a href="/calculators/rent-conversion.html">전월세 전환 계산기</a></div>
      </section>`;

    root.querySelector('#mr-calc').onclick = () => {
      const rent = num('mr-rent');
      const months = Math.min(12, Math.max(0, num('mr-months')));
      const salary = num('mr-salary');
      if(!rent || !months || !salary) return show('<strong>월세, 거주 개월, 연 총급여를 입력해 주세요</strong><p>세 항목을 입력하면 예상 공제액을 계산할 수 있습니다.</p>');
      const annualRent = rent * months;
      const eligibleRent = Math.min(annualRent, 10000000);
      const conditionOk = val('mr-house') === 'yes' && val('mr-home') === 'yes' && val('mr-proof') === 'yes';
      const rate = conditionOk ? (salary <= 55000000 ? 0.17 : salary <= 80000000 ? 0.15 : 0) : 0;
      const credit = eligibleRent * rate;
      const reason = !conditionOk ? '입력한 주택·무주택·증빙 조건 중 확인이 필요한 항목이 있어 0원으로 계산했습니다.'
        : salary > 80000000 ? '총급여 8,000만 원 초과 구간이라 공제 대상이 아닌 것으로 계산했습니다.'
        : '입력 조건 기준으로 공제 가능성이 있는 구간입니다.';
      const maxCredit = salary <= 55000000 ? 1700000 : salary <= 80000000 ? 1500000 : 0;
      show(`<div class="savings-result-grid">${card('예상 세액공제', won(credit))}${card('적용 공제율', Math.round(rate * 100) + '%')}${card('연간 납부 월세', won(annualRent))}${card('인정 월세액', won(eligibleRent))}</div><div class="switch-verdict"><b>${credit ? '공제 가능성 있음' : '조건 확인 필요'}</b><p>${reason}</p></div><table class="rate-table"><tbody><tr><td>최대 공제 가능액</td><td>${won(maxCredit)}</td></tr><tr><td>월세 인정 한도</td><td>연 10,000,000원</td></tr><tr><td>증빙 체크</td><td>임대차계약서, 주민등록등본, 월세 납부 내역을 확인하세요.</td></tr></tbody></table>`);
    };
  }

  renderPetAge();
  renderMonthlyRentDeduction();
})();
