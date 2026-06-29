(function(){
  const root = document.querySelector('#calculator');
  const type = document.body.dataset.customCalculator;
  if(!root || !['electricity','fuel-cost'].includes(type)) return;

  const num = id => Number(root.querySelector('#' + id)?.value || 0);
  const val = id => root.querySelector('#' + id)?.value || '';
  const won = n => Math.round(Number(n) || 0).toLocaleString('ko-KR') + '원';
  const fmt = (n, digits = 1) => (Number(n) || 0).toLocaleString('ko-KR', {maximumFractionDigits: digits});
  const card = (label, value, note = '') => `<div><span>${label}</span><b>${value}</b>${note ? `<small>${note}</small>` : ''}</div>`;
  const show = html => {
    const result = root.querySelector('.result');
    result.innerHTML = html;
    result.classList.add('show');
  };

  function renderElectricity(){
    root.innerHTML = `
      <a class="calculator-home" href="/">계산페이지 홈</a>
      <h1>에어컨 전기세 계산기</h1>
      <p class="lead">에어컨 소비전력, 하루 사용시간, 사용일수만 입력해 월 예상 전기세와 절약 효과를 간단히 확인하세요.</p>
      <section class="calculator-box utility-box readable-calc-box">
        <div class="readable-intro">
          <h2>이번 달 에어컨 전기세가 얼마나 나올까요?</h2>
          <p>복잡한 누진 구간을 직접 고르지 않아도, 에어컨이 추가로 쓰는 전력량을 기준으로 대략적인 전기세를 계산합니다. 실제 청구액은 기존 전기 사용량, 누진 구간, 계약종별, 할인 여부에 따라 달라질 수 있습니다.</p>
        </div>
        <div class="utility-form">
          <div class="utility-fields">
            <label><span>에어컨 소비전력(kW)</span><input id="ac-kw" type="number" min="0" step="0.01" placeholder="예: 1.8"></label>
            <label><span>하루 사용시간</span><input id="ac-hours" type="number" min="0" step="0.1" placeholder="예: 8"></label>
            <label><span>월 사용일수</span><input id="ac-days" type="number" min="0" step="1" placeholder="예: 30"></label>
          </div>
          <button class="primary-btn" id="ac-calc" type="button">전기세 계산하기</button>
        </div>
        <div class="result" aria-live="polite"></div>
        <p class="calculator-note">간편 계산을 위해 kWh당 200원 기준으로 추정합니다. 실제 전기요금은 누진 구간, 계약종별, 부가요금, 할인 여부에 따라 달라질 수 있습니다.</p>
      </section>
      <section class="content-block">
        <h2>입력값 고르는 법</h2>
        <ul>
          <li><strong>소비전력</strong>: 제품 라벨의 정격 소비전력을 kW 단위로 입력합니다. 1800W라면 1.8을 입력하세요.</li>
          <li><strong>하루 사용시간</strong>: 실제로 켜두는 평균 시간을 입력하세요. 밤에만 켜면 6~8시간처럼 잡으면 됩니다.</li>
          <li><strong>월 사용일수</strong>: 한 달 내내 쓰면 30일, 주말만 쓰면 8~10일처럼 입력하세요.</li>
        </ul>
      </section>
      <section class="content-block">
        <h2>왜 실제 요금과 다를 수 있나요?</h2>
        <p>전기요금은 에어컨만 따로 청구되는 것이 아니라 집 전체 전력 사용량에 합산됩니다. 이미 사용량이 많은 집은 누진 구간 때문에 같은 에어컨 사용량도 더 비싸질 수 있고, 인버터 에어컨은 설정온도에 도달하면 실제 소비전력이 낮아질 수 있습니다. 이 계산기는 월 예산을 빠르게 잡기 위한 간편 추정으로 봐 주세요.</p>
      </section>
      <section class="content-block">
        <h2>전기세를 줄이는 쉬운 방법</h2>
        <ul>
          <li>필터를 청소하고 실외기 주변 통풍을 막지 마세요.</li>
          <li>처음에는 빠르게 냉방한 뒤 적정 온도로 유지하는 편이 도움이 될 수 있습니다.</li>
          <li>선풍기나 서큘레이터를 함께 쓰면 체감온도를 낮추는 데 유리합니다.</li>
        </ul>
      </section>
      <section class="content-block">
        <h2>관련 계산기</h2>
        <div class="related"><a href="/calculators/budget.html">생활비 예산 계산기</a><a href="/calculators/fuel-cost.html">주유비 계산기</a><a href="/calculators/water.html">물 섭취량 계산기</a></div>
      </section>`;

    root.querySelector('#ac-calc').onclick = () => {
      const kw = num('ac-kw'), hours = num('ac-hours'), days = num('ac-days');
      const rate = 200;
      if(!kw || !hours || !days) return show('<strong>소비전력, 사용시간, 사용일수를 입력해 주세요</strong><p>세 가지만 입력하면 예상 전기세를 계산할 수 있습니다.</p>');
      const kwh = kw * hours * days;
      const cost = kwh * rate;
      const dailyCost = cost / days;
      const saveOneHour = kw * days * rate;
      const shareText = `에어컨 전기세 계산 결과\n- 월 사용량: ${fmt(kwh)}kWh\n- 예상 전기세: ${won(cost)}\n- 하루 평균: ${won(dailyCost)}\n- 1시간 줄이면: 약 ${won(saveOneHour)} 절약`;
      show(`<div class="savings-result-grid">${card('에어컨 월 사용량', fmt(kwh) + 'kWh')}${card('월 예상 전기세', won(cost))}${card('하루 평균 전기세', won(dailyCost))}${card('하루 1시간 절약 시', won(saveOneHour))}</div><div class="switch-verdict"><b>간편 추정 결과</b><p>kWh당 ${won(rate)} 기준으로 계산했습니다. 하루 사용시간을 1시간 줄이면 월 기준 약 ${won(saveOneHour)} 정도를 줄일 수 있습니다.</p></div><table class="rate-table"><tbody><tr><td>계산식</td><td>${kw}kW × ${hours}시간 × ${days}일 = ${fmt(kwh)}kWh</td></tr><tr><td>간편 단가</td><td>${won(rate)} / kWh</td></tr><tr><td>주의</td><td>실제 청구액은 집 전체 사용량과 누진 구간에 따라 달라질 수 있습니다.</td></tr></tbody></table><div class="result-share-actions"><button class="result-share-btn" type="button" data-share-result="${shareText.replace(/"/g,'&quot;')}">결과 공유</button></div>`);
    };
  }

  function renderFuelCost(){
    root.innerHTML = `
      <a class="calculator-home" href="/">계산페이지 홈</a>
      <h1>주유비 계산기</h1>
      <p class="lead">주행거리, 연비, 유가, 반복 횟수를 입력해 1회·월간·1인당 예상 주유비를 계산하세요.</p>
      <section class="calculator-box utility-box readable-calc-box">
        <div class="readable-intro">
          <h2>이번 이동에 기름값이 얼마나 들까요?</h2>
          <p>출퇴근, 여행, 모임 이동처럼 반복되는 주행 비용을 계산할 수 있습니다. 톨비와 주차비, 인원수까지 넣으면 실제 부담액을 더 현실적으로 볼 수 있습니다.</p>
        </div>
        <div class="utility-form">
          <div class="utility-fields">
            <label><span>편도 거리(km)</span><input id="fc-distance" type="number" min="0" step="0.1" placeholder="예: 25"></label>
            <label><span>이동 방식</span><select id="fc-trip"><option value="round">왕복</option><option value="oneway">편도</option></select></label>
            <label><span>반복 횟수</span><input id="fc-times" type="number" min="1" step="1" placeholder="예: 20"></label>
            <label><span>차량 연비(km/L)</span><input id="fc-efficiency" type="number" min="0" step="0.1" placeholder="예: 12"></label>
            <label><span>유가(원/L)</span><input id="fc-price" type="number" min="0" step="1" placeholder="예: 1700"></label>
            <label><span>인원수</span><input id="fc-people" type="number" min="1" step="1" placeholder="예: 4"></label>
            <label><span>톨비·주차비(회당)</span><input id="fc-extra" type="number" min="0" step="1" placeholder="예: 5000"></label>
          </div>
          <button class="primary-btn" id="fc-calc" type="button">주유비 계산하기</button>
        </div>
        <div class="result" aria-live="polite"></div>
        <p class="calculator-note">실제 주유비는 교통 체증, 공회전, 냉난방 사용, 타이어 상태, 실제 주유 단가에 따라 달라질 수 있습니다. 결과는 이동 예산을 잡기 위한 참고값입니다.</p>
      </section>
      <section class="content-block">
        <h2>주유비 계산 방식</h2>
        <p>총 주행거리 = 편도 거리 × 이동 방식 × 반복 횟수입니다. 필요 연료량은 총 주행거리를 연비로 나눠 계산하고, 유가와 톨비·주차비를 더해 총 이동 비용을 추정합니다.</p>
      </section>
      <section class="content-block">
        <h2>관련 계산기</h2>
        <div class="related"><a href="/calculators/travel-budget.html">여행 경비 계산기</a><a href="/calculators/dutch-pay.html">더치페이 계산기</a><a href="/calculators/electricity.html">에어컨 전기세 계산기</a></div>
      </section>`;

    root.querySelector('#fc-calc').onclick = () => {
      const distance = num('fc-distance'), times = num('fc-times') || 1, efficiency = num('fc-efficiency'), price = num('fc-price');
      const multiplier = val('fc-trip') === 'round' ? 2 : 1;
      const people = Math.max(1, Math.floor(num('fc-people') || 1));
      const extra = num('fc-extra') || 0;
      if(!distance || !efficiency || !price) return show('<strong>거리, 연비, 유가를 입력해 주세요</strong><p>반복 횟수와 인원수는 비워두면 1로 계산합니다.</p>');
      const km = distance * multiplier * times;
      const liters = km / efficiency;
      const fuel = liters * price;
      const extras = extra * times;
      const total = fuel + extras;
      const perTrip = total / times;
      const perPerson = total / people;
      const shareText = `주유비 계산 결과\n- 총 주행거리: ${fmt(km)}km\n- 필요 연료량: ${fmt(liters)}L\n- 총 예상 비용: ${won(total)}\n- 1인당 부담액: ${won(perPerson)}`;
      show(`<div class="savings-result-grid">${card('총 예상 비용', won(total))}${card('1회 이동 비용', won(perTrip))}${card('1인당 부담액', won(perPerson))}${card('총 주행거리', fmt(km) + 'km')}${card('필요 연료량', fmt(liters) + 'L')}${card('순수 주유비', won(fuel))}</div><div class="switch-verdict"><b>계산 결과</b><p>입력한 거리, 연비, 유가 기준의 예상 비용입니다. 카풀이나 여행 정산에는 1인당 부담액을 활용하세요.</p></div><table class="rate-table"><tbody><tr><td>주유비 계산식</td><td>${fmt(km)}km ÷ ${efficiency}km/L × ${won(price)} = ${won(fuel)}</td></tr><tr><td>톨비·주차비</td><td>${won(extra)} × ${times}회 = ${won(extras)}</td></tr><tr><td>총 비용</td><td>주유비 ${won(fuel)} + 톨비·주차비 ${won(extras)} = ${won(total)}</td></tr></tbody></table><div class="result-share-actions"><button class="result-share-btn" type="button" data-share-result="${shareText.replace(/"/g,'&quot;')}">결과 공유</button></div>`);
    };
  }

  if(type === 'electricity') renderElectricity();
  if(type === 'fuel-cost') renderFuelCost();
})();
