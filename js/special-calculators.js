(() => {
  const type = document.body.dataset.customCalculator || document.body.dataset.calculator;
  if (![
    'annual-salary', 'average-price', 'averaging-down', 'car-installment', 'installment',
    'margin', 'parental-leave', 'running-pace', 'school-grade', 'target-weight'
  ].includes(type)) return;

  const root = document.querySelector('#calculator');
  if (!root) return;

  const field = (id, label, placeholder, options = '') =>
    `<label><span>${label}</span><input id="${id}" type="number" inputmode="decimal" placeholder="예: ${placeholder}" ${options}></label>`;
  const won = value => `${Math.round(value).toLocaleString('ko-KR')}원`;
  const show = html => {
    const result = root.querySelector('.result');
    result.innerHTML = html;
    result.classList.add('show');
  };
  const error = message => show(`<strong>입력값을 확인해 주세요</strong><p>${message}</p>`);
  const value = id => {
    const raw = root.querySelector(`#${id}`)?.value?.trim() ?? '';
    return raw === '' ? NaN : Number(raw.replaceAll(',', ''));
  };

  if (type === 'annual-salary') {
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/business.html">업무 카테고리 더보기</a>
        <h1>연봉 계산기 · 월급 환산</h1>
        <p class="lead">계약 연봉과 별도 상여를 월급·주급·시급으로 환산하고 예상 공제 후 금액도 함께 확인하세요.</p>
        <section class="calculator-box utility-box">
          <div class="utility-form"><div class="utility-fields">
            ${field('as-salary', '계약 연봉(원)', '40000000', 'min="0" step="1"')}
            ${field('as-bonus', '별도 연간 상여금(원)', '3000000', 'min="0" step="1"')}
            ${field('as-payments', '연간 급여 지급 횟수', '12', 'min="1" max="24" step="1" inputmode="numeric"')}
            ${field('as-hours', '월 소정근로시간', '209', 'min="1" step="any"')}
            ${field('as-deduction', '예상 공제율(%)', '10', 'min="0" max="100" step="any"')}
          </div><button class="primary-btn" id="annual-salary-calc" type="button">연봉 환산하기</button></div>
          <div class="result" id="annual-salary-result" aria-live="polite"></div>
          <p class="calculator-note">공제율은 4대보험과 세금을 한 비율로 단순화한 사용자 입력값입니다. 실제 실수령액은 비과세 항목, 보험료 상·하한, 부양가족과 간이세액표에 따라 달라집니다.</p>
        </section>
        <section class="content-block"><h2>연봉 환산 기준</h2><p>세전 총액은 계약 연봉과 별도 상여를 더합니다. 지급 1회 금액은 세전 총액을 지급 횟수로, 주급은 52주로, 시급은 월 소정근로시간×12개월로 나눠 계산합니다.</p></section>
        <section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/salary.html">월급 실수령액 계산기</a><a href="/calculators/wage.html">시급 계산기</a><a href="/calculators/four-insurance.html">4대보험 계산기</a></div></section>`;
    }

    root.querySelector('#annual-salary-calc')?.addEventListener('click', () => {
      const salary = value('as-salary');
      const bonus = value('as-bonus');
      const payments = value('as-payments');
      const hours = value('as-hours');
      const deduction = value('as-deduction');
      if (![salary, bonus, payments, hours, deduction].every(Number.isFinite)
          || salary <= 0 || bonus < 0 || !Number.isInteger(payments) || payments < 1 || payments > 24
          || hours <= 0 || deduction < 0 || deduction > 100) {
        error('연봉은 0보다 크게, 상여금은 0 이상, 지급 횟수는 1~24의 정수, 월 근로시간은 0보다 크게, 공제율은 0~100%로 입력해 주세요.');
        return;
      }
      const gross = salary + bonus;
      const net = gross * (1 - deduction / 100);
      show(`<div class="utility-result-grid"><div><span>세전 연간 총액</span><strong>${won(gross)}</strong></div><div><span>지급 1회 세전 금액</span><b>${won(gross / payments)}</b></div><div><span>예상 월 실수령액</span><b>${won(net / 12)}</b></div><div><span>세전 주급 환산</span><b>${won(gross / 52)}</b></div><div><span>세전 시급 환산</span><b>${won(gross / (hours * 12))}</b></div><div><span>예상 연 공제액</span><b>${won(gross - net)}</b></div></div><p>상여를 포함한 연간 총액과 입력한 공제율 ${deduction.toLocaleString('ko-KR')}%를 적용한 단순 환산 결과입니다.</p>`);
    });
    return;
  }

  if (type === 'car-installment') {
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/money.html">금융 카테고리 더보기</a>
        <h1>자동차 할부 계산기</h1>
        <p class="lead">차량 가격, 선수금, 부대비용, 금리와 기간을 반영해 월 할부금과 총 이자를 계산하세요.</p>
        <section class="calculator-box utility-box">
          <div class="utility-form"><div class="utility-fields">
            ${field('ci-price', '차량 가격(원)', '35000000', 'min="0" step="1"')}
            ${field('ci-down', '선수금(원)', '5000000', 'min="0" step="1"')}
            ${field('ci-cost', '취득·등록 등 부대비용(원)', '2500000', 'min="0" step="1"')}
            ${field('ci-rate', '연 이자율(%)', '5.5', 'min="0" max="100" step="any"')}
            ${field('ci-months', '할부 기간(개월)', '60', 'min="1" max="120" step="1" inputmode="numeric"')}
          </div><button class="primary-btn" id="car-installment-calc" type="button">자동차 할부 계산하기</button></div>
          <div class="result" id="car-installment-result" aria-live="polite"></div>
          <p class="calculator-note">원리금균등 방식의 예상치입니다. 실제 계약의 취급수수료, 선수금 납부 시점, 중도상환 조건과 일 단위 이자는 반영하지 않습니다.</p>
        </section>
        <section class="content-block"><h2>자동차 할부 계산 기준</h2><p>할부 원금은 차량 가격에서 선수금을 뺀 금액입니다. 월 이자율이 0보다 크면 원리금균등상환 공식을 적용하고, 0%이면 원금을 개월 수로 나눕니다. 부대비용은 현금 지출로 보고 할부 원금에는 넣지 않습니다.</p></section>
        <section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/car-acquisition-tax.html">자동차 취득세 계산기</a><a href="/calculators/loan-interest.html">대출 이자 계산기</a><a href="/calculators/fuel-cost.html">연료비 계산기</a></div></section>`;
    }

    root.querySelector('#car-installment-calc')?.addEventListener('click', () => {
      const price = value('ci-price');
      const down = value('ci-down');
      const costs = value('ci-cost');
      const annualRate = value('ci-rate');
      const months = value('ci-months');
      if (![price, down, costs, annualRate, months].every(Number.isFinite)
          || price <= 0 || down < 0 || down > price || costs < 0 || annualRate < 0 || annualRate > 100
          || !Number.isInteger(months) || months < 1 || months > 120) {
        error('차량 가격은 0보다 크게, 선수금은 차량 가격 이하, 비용과 금리는 0 이상, 기간은 1~120개월의 정수로 입력해 주세요.');
        return;
      }
      const principal = price - down;
      const monthlyRate = annualRate / 1200;
      const monthly = principal === 0 ? 0 : monthlyRate === 0
        ? principal / months
        : principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
      const totalInstallment = monthly * months;
      const interest = totalInstallment - principal;
      show(`<div class="utility-result-grid"><div><span>월 예상 할부금</span><strong>${won(monthly)}</strong></div><div><span>할부 원금</span><b>${won(principal)}</b></div><div><span>총 이자</span><b>${won(interest)}</b></div><div><span>할부 총 납입액</span><b>${won(totalInstallment)}</b></div><div><span>초기 현금 지출</span><b>${won(down + costs)}</b></div><div><span>차량 총 부담액</span><b>${won(totalInstallment + down + costs)}</b></div></div><p>${months}개월 원리금균등 상환과 연 ${annualRate.toLocaleString('ko-KR')}% 입력값을 적용한 예상치입니다.</p>`);
    });
    return;
  }

  if (type === 'average-price') {
    const row = () => `<tr><td><input class="ap-qty" type="number" min="0" step="any" inputmode="decimal" placeholder="예: 10" aria-label="매수 수량"></td><td><input class="ap-price" type="number" min="0" step="any" inputmode="decimal" placeholder="예: 50000" aria-label="매수 단가"></td><td class="ap-total">-</td></tr>`;
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/money.html">금융 카테고리 더보기</a><h1>평단가 계산기</h1><p class="lead">여러 차수의 매수 수량과 단가를 합산해 평균 매입 단가와 총 투자금을 계산하세요.</p><section class="calculator-box estimate-box"><div class="estimate-toolbar"><div><h2>매수 내역</h2><p>사용한 행은 수량과 단가를 모두 입력하세요.</p></div><button class="add-course" id="ap-add" type="button">+ 매수 추가</button></div><div class="estimate-table-wrap"><table class="estimate-table"><thead><tr><th>매수 수량</th><th>매수 단가(원)</th><th>매수 금액</th></tr></thead><tbody id="ap-rows">${row()}${row()}${row()}</tbody></table></div><div class="estimate-actions"><button class="primary-btn" id="ap-calc" type="button">평단가 계산하기</button></div><div class="result" id="ap-result" aria-live="polite"></div><p class="calculator-note">수수료, 세금과 환율은 반영하지 않은 수량 가중평균입니다.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/averaging-down.html">물타기 계산기</a><a href="/calculators/stock-return.html">주식 수익률 계산기</a><a href="/calculators/roi.html">ROI 계산기</a></div></section>`;
    }
    const body = root.querySelector('#ap-rows');
    root.querySelector('#ap-add')?.addEventListener('click', () => body.insertAdjacentHTML('beforeend', row()));
    root.querySelector('#ap-calc')?.addEventListener('click', () => {
      let quantity = 0;
      let total = 0;
      let used = 0;
      let invalidRow = false;
      body.querySelectorAll('tr').forEach(tableRow => {
        const quantityRaw = tableRow.querySelector('.ap-qty').value.trim();
        const priceRaw = tableRow.querySelector('.ap-price').value.trim();
        if (!quantityRaw && !priceRaw) {
          tableRow.querySelector('.ap-total').textContent = '-';
          return;
        }
        const rowQuantity = Number(quantityRaw);
        const price = Number(priceRaw);
        if (!Number.isFinite(rowQuantity) || !Number.isFinite(price) || rowQuantity <= 0 || price < 0) {
          invalidRow = true;
          return;
        }
        const rowTotal = rowQuantity * price;
        if (!Number.isFinite(rowTotal)) {
          invalidRow = true;
          return;
        }
        used += 1;
        quantity += rowQuantity;
        total += rowTotal;
        tableRow.querySelector('.ap-total').textContent = won(rowTotal);
      });
      if (invalidRow || !used || !Number.isFinite(quantity) || !Number.isFinite(total)) {
        error('사용할 행마다 0보다 큰 수량과 0 이상의 단가를 모두 입력해 주세요.');
        return;
      }
      show(`<div class="utility-result-grid"><div><span>평균 매입 단가</span><strong>${won(total / quantity)}</strong></div><div><span>총 수량</span><b>${quantity.toLocaleString('ko-KR')}개</b></div><div><span>총 매수 금액</span><b>${won(total)}</b></div><div><span>반영한 매수</span><b>${used}건</b></div></div>`);
    });
    return;
  }

  if (type === 'averaging-down') {
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/money.html">금융 카테고리 더보기</a><h1>물타기 계산기</h1><p class="lead">현재 보유 조건과 추가 매수 조건으로 새 평균 매입가와 평균가 변화 폭을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('ad-qty', '현재 보유 수량', '10', 'min="0" step="any"')}${field('ad-price', '현재 평균 매입가(원)', '50000', 'min="0" step="any"')}${field('ad-newqty', '추가 매수 수량', '5', 'min="0" step="any"')}${field('ad-newprice', '추가 매수 단가(원)', '40000', 'min="0" step="any"')}</div><button class="primary-btn" id="averaging-down-calc" type="button">물타기 후 평단가 계산하기</button></div><div class="result" id="averaging-down-result" aria-live="polite"></div><p class="calculator-note">거래 수수료와 세금은 반영하지 않습니다. 평균단가 하락이 투자 위험 감소를 뜻하지는 않습니다.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/average-price.html">평단가 계산기</a><a href="/calculators/stock-return.html">주식 수익률 계산기</a><a href="/calculators/stock-leverage.html">주식 레버리지 계산기</a></div></section>`;
    }
    root.querySelector('#averaging-down-calc')?.addEventListener('click', () => {
      const currentQuantity = value('ad-qty');
      const currentPrice = value('ad-price');
      const newQuantity = value('ad-newqty');
      const newPrice = value('ad-newprice');
      if (![currentQuantity, currentPrice, newQuantity, newPrice].every(Number.isFinite)
          || currentQuantity <= 0 || currentPrice < 0 || newQuantity <= 0 || newPrice < 0) {
        error('현재·추가 매수 수량은 0보다 크게, 단가는 0 이상으로 입력해 주세요.');
        return;
      }
      const totalQuantity = currentQuantity + newQuantity;
      const total = currentQuantity * currentPrice + newQuantity * newPrice;
      const average = total / totalQuantity;
      if (![totalQuantity, total, average].every(Number.isFinite)) {
        error('계산 범위를 벗어난 값입니다. 입력 자릿수를 줄여 주세요.');
        return;
      }
      const change = average - currentPrice;
      show(`<div class="utility-result-grid"><div><span>새 평균 매입가</span><strong>${won(average)}</strong></div><div><span>기존 평균가 대비</span><b>${change >= 0 ? '+' : ''}${won(change)}</b></div><div><span>총 수량</span><b>${totalQuantity.toLocaleString('ko-KR')}개</b></div><div><span>총 매입 금액</span><b>${won(total)}</b></div></div>`);
    });
    return;
  }

  if (type === 'installment') {
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/money.html">금융 카테고리 더보기</a><h1>적금 계산기 · 만기 이자</h1><p class="lead">월 납입액, 연 금리와 가입 기간으로 적금의 세전·세후 이자와 만기 수령액을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('is-payment', '월 납입액(원)', '300000', 'min="0" step="1"')}${field('is-rate', '연 이자율(%)', '3.5', 'min="0" max="100" step="any"')}${field('is-months', '가입 기간(개월)', '12', 'min="1" max="600" step="1" inputmode="numeric"')}</div><button class="primary-btn" id="installment-calc" type="button">적금 만기액 계산하기</button></div><div class="result" id="installment-result" aria-live="polite"></div><p class="calculator-note">매월 초 납입하는 단리식 적금과 일반과세 15.4%를 가정한 예상치입니다. 실제 납입일과 상품 약관에 따라 달라질 수 있습니다.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/savings-interest.html">예금 이자 계산기</a><a href="/calculators/compound-interest.html">적립식 복리 계산기</a><a href="/calculators/budget.html">생활비 예산 계산기</a></div></section>`;
    }
    root.querySelector('#installment-calc')?.addEventListener('click', () => {
      const payment = value('is-payment');
      const annualRate = value('is-rate');
      const months = value('is-months');
      if (!Number.isFinite(payment) || !Number.isFinite(annualRate) || !Number.isFinite(months)
          || payment <= 0 || annualRate < 0 || annualRate > 100 || !Number.isInteger(months) || months < 1 || months > 600) {
        error('월 납입액은 0보다 크게, 금리는 0~100%, 기간은 1~600개월의 정수로 입력해 주세요.');
        return;
      }
      const principal = payment * months;
      const interest = payment * annualRate / 100 * months * (months + 1) / 24;
      const tax = interest * 0.154;
      const afterTax = principal + interest - tax;
      if (![principal, interest, tax, afterTax].every(Number.isFinite)) {
        error('계산 범위를 벗어난 값입니다. 입력 자릿수를 줄여 주세요.');
        return;
      }
      show(`<div class="utility-result-grid"><div><span>세후 만기 수령액</span><strong>${won(afterTax)}</strong></div><div><span>납입 원금</span><b>${won(principal)}</b></div><div><span>세전 이자</span><b>${won(interest)}</b></div><div><span>예상 이자소득세</span><b>${won(tax)}</b></div></div>`);
    });
    return;
  }

  if (type === 'margin') {
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/business.html">업무 카테고리 더보기</a><h1>마진율 계산기</h1><p class="lead">판매가와 원가뿐 아니라 수수료·배송비·광고비·부가세를 반영해 실제 건당 마진을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('mg-price', '고객 결제 판매가(원)', '50000', 'min="0" step="1"')}${field('mg-cost', '매입 원가(원)', '30000', 'min="0" step="1"')}${field('mg-platform', '플랫폼 수수료율(%)', '8', 'min="0" max="100" step="any"')}${field('mg-payment', '결제 수수료율(%)', '3', 'min="0" max="100" step="any"')}${field('mg-shipping', '배송·포장비(원)', '3000', 'min="0" step="1"')}${field('mg-ad', '광고·쿠폰비(원)', '2000', 'min="0" step="1"')}<label><span>판매가의 부가세 기준</span><select id="mg-vat"><option value="included">부가세 포함 판매가</option><option value="excluded">부가세 별도 공급가액</option></select></label></div><button class="primary-btn" id="margin-calc" type="button">실질 마진 계산하기</button></div><div class="result" id="margin-result" aria-live="polite"></div><p class="calculator-note">플랫폼마다 수수료 부과 기준과 수수료의 부가세 처리가 다릅니다. 실제 정산서를 기준으로 입력하세요.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/vat.html">부가세 계산기</a><a href="/calculators/break-even.html">손익분기점 계산기</a><a href="/calculators/estimate.html">견적 계산기</a></div></section>`;
    }
    root.querySelector('#margin-calc')?.addEventListener('click', () => {
      const price = value('mg-price');
      const cost = value('mg-cost');
      const platformRate = value('mg-platform');
      const paymentRate = value('mg-payment');
      const shipping = value('mg-shipping');
      const advertising = value('mg-ad');
      const rate = (platformRate + paymentRate) / 100;
      if (![price, cost, platformRate, paymentRate, shipping, advertising].every(Number.isFinite)
          || price <= 0 || cost < 0 || platformRate < 0 || paymentRate < 0 || rate >= 1 || shipping < 0 || advertising < 0) {
        error('판매가는 0보다 크게, 비용은 0 이상으로 입력하고 수수료율 합계는 100% 미만으로 설정해 주세요.');
        return;
      }
      const revenueFactor = root.querySelector('#mg-vat').value === 'included' ? 1 / 1.1 : 1;
      const revenue = price * revenueFactor;
      const fees = price * rate;
      const profit = revenue - cost - fees - shipping - advertising;
      const marginRate = profit / revenue * 100;
      const markupRate = cost > 0 ? profit / cost * 100 : null;
      const breakEvenDenominator = revenueFactor - rate;
      const breakEven = breakEvenDenominator > 0 ? (cost + shipping + advertising) / breakEvenDenominator : null;
      show(`<div class="utility-result-grid"><div><span>건당 예상 이익</span><strong>${won(profit)}</strong></div><div><span>실질 마진율</span><b>${marginRate.toFixed(2)}%</b></div><div><span>원가 대비 이익률</span><b>${markupRate === null ? '원가 0원' : `${markupRate.toFixed(2)}%`}</b></div><div><span>수수료 합계</span><b>${won(fees)}</b></div><div><span>매출 기준액</span><b>${won(revenue)}</b></div><div><span>손익분기 판매가 참고</span><b>${breakEven === null ? '산정 불가' : won(breakEven)}</b></div></div>`);
    });
    return;
  }

  if (type === 'running-pace') {
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/health.html">건강 카테고리 더보기</a><h1>러닝 페이스 계산기</h1><p class="lead">달린 거리와 시간을 입력해 1km당 페이스와 평균 속도를 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('rp-distance', '거리(km)', '5', 'min="0" step="any"')}${field('rp-minutes', '전체 시간(분)', '30', 'min="0" step="1" inputmode="numeric"')}${field('rp-seconds', '추가 초(0~59)', '0', 'min="0" max="59" step="1" inputmode="numeric"')}</div><button class="primary-btn" id="running-pace-calc" type="button">러닝 페이스 계산하기</button></div><div class="result" id="running-pace-result" aria-live="polite"></div><p class="calculator-note">휴식 시간을 포함해 입력하면 전체 경과시간 기준 평균 페이스가 계산됩니다.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/speed-conversion.html">속도 단위 변환</a><a href="/calculators/exercise-calorie.html">운동 칼로리 계산기</a><a href="/calculators/bmi.html">BMI 계산기</a></div></section>`;
    }
    root.querySelector('#running-pace-calc')?.addEventListener('click', () => {
      const distance = value('rp-distance');
      const minutes = value('rp-minutes');
      const seconds = value('rp-seconds');
      if (![distance, minutes, seconds].every(Number.isFinite) || distance <= 0 || minutes < 0
          || !Number.isInteger(minutes) || !Number.isInteger(seconds) || seconds < 0 || seconds > 59
          || minutes * 60 + seconds <= 0) {
        error('거리는 0보다 크게, 분은 0 이상의 정수, 추가 초는 0~59의 정수로 입력해 주세요.');
        return;
      }
      const totalSeconds = minutes * 60 + seconds;
      const secondsPerKm = Math.round(totalSeconds / distance);
      const paceMinutes = Math.floor(secondsPerKm / 60);
      const paceSeconds = secondsPerKm % 60;
      const speed = distance / (totalSeconds / 3600);
      if (!Number.isFinite(speed)) {
        error('계산 범위를 벗어난 값입니다. 입력값을 다시 확인해 주세요.');
        return;
      }
      show(`<div class="utility-result-grid"><div><span>1km 평균 페이스</span><strong>${paceMinutes}분 ${String(paceSeconds).padStart(2, '0')}초</strong></div><div><span>평균 속도</span><b>${speed.toFixed(2)}km/h</b></div><div><span>입력한 총 시간</span><b>${minutes}분 ${seconds}초</b></div><div><span>거리</span><b>${distance.toLocaleString('ko-KR')}km</b></div></div>`);
    });
    return;
  }

  if (type === 'school-grade') {
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/education.html">교육 카테고리 더보기</a><h1>내신 등급 계산기</h1><p class="lead">내 석차와 과목 수강 인원으로 9등급제 누적 비율 기준 예상 등급을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('sg-rank', '내 석차', '20', 'min="1" step="1" inputmode="numeric"')}${field('sg-total', '전체 수강 인원', '200', 'min="1" step="1" inputmode="numeric"')}</div><button class="primary-btn" id="school-grade-calc" type="button">예상 내신 등급 계산하기</button></div><div class="result" id="school-grade-result" aria-live="polite"></div><p class="calculator-note">단순 석차 백분율 기준의 참고값입니다. 동점자와 중간석차, 적용 교육과정은 학교 성적 처리 기준을 확인하세요.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/grade-cutoff.html">등급컷 계산기</a><a href="/calculators/average-score.html">평균 점수 계산기</a><a href="/calculators/gpa.html">학점 계산기</a></div></section>`;
    }
    root.querySelector('#school-grade-calc')?.addEventListener('click', () => {
      const rank = value('sg-rank');
      const total = value('sg-total');
      if (!Number.isInteger(rank) || !Number.isInteger(total) || rank < 1 || total < 1 || rank > total) {
        error('석차와 전체 인원은 1 이상의 정수로, 석차는 전체 인원 이하로 입력해 주세요.');
        return;
      }
      const percentile = rank / total * 100;
      const boundaries = [4, 11, 23, 40, 60, 77, 89, 96, 100];
      const grade = boundaries.findIndex(boundary => percentile <= boundary) + 1;
      show(`<div class="utility-result-grid"><div><span>예상 내신 등급</span><strong>${grade}등급</strong></div><div><span>상위 비율</span><b>${percentile.toFixed(2)}%</b></div><div><span>입력 석차</span><b>${rank} / ${total}명</b></div></div><p>9등급제 누적 구간 4%·11%·23%·40%·60%·77%·89%·96%를 적용했습니다.</p>`);
    });
    return;
  }

  if (type === 'target-weight') {
    if (!root.hasAttribute('data-static-rendered')) {
      root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/health.html">건강 카테고리 더보기</a><h1>목표 체중 계산기</h1><p class="lead">키, 현재 체중과 목표 BMI로 목표 체중과 현재 체중과의 차이를 참고용으로 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${field('tw-height', '키(cm)', '170', 'min="50" max="250" step="any"')}${field('tw-current', '현재 체중(kg)', '70', 'min="1" max="500" step="any"')}${field('tw-bmi', '목표 BMI', '22', 'min="10" max="60" step="any"')}</div><button class="primary-btn" id="target-weight-calc" type="button">목표 체중 계산하기</button></div><div class="result" id="target-weight-result" aria-live="polite"></div><p class="calculator-note">BMI 역산값은 근육량·체지방률·질환을 반영하지 않는 일반 성인 참고치이며 의료 목표가 아닙니다.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/bmi.html">BMI 계산기</a><a href="/calculators/body-fat.html">체지방률 계산기</a><a href="/calculators/calorie.html">권장 칼로리 계산기</a></div></section>`;
    }
    root.querySelector('#target-weight-calc')?.addEventListener('click', () => {
      const height = value('tw-height');
      const current = value('tw-current');
      const targetBmi = value('tw-bmi');
      if (![height, current, targetBmi].every(Number.isFinite) || height < 50 || height > 250
          || current <= 0 || current > 500 || targetBmi < 10 || targetBmi > 60) {
        error('키는 50~250cm, 현재 체중은 0~500kg, 목표 BMI는 10~60 범위로 입력해 주세요.');
        return;
      }
      const metres = height / 100;
      const target = metres ** 2 * targetBmi;
      const currentBmi = current / metres ** 2;
      const difference = target - current;
      show(`<div class="utility-result-grid"><div><span>목표 BMI 체중</span><strong>${target.toFixed(1)}kg</strong></div><div><span>현재 체중과 차이</span><b>${difference >= 0 ? '+' : ''}${difference.toFixed(1)}kg</b></div><div><span>현재 BMI</span><b>${currentBmi.toFixed(1)}</b></div><div><span>목표 BMI</span><b>${targetBmi.toFixed(1)}</b></div></div>`);
    });
    return;
  }

  if (!root.hasAttribute('data-static-rendered')) {
    root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/business.html">업무 카테고리 더보기</a>
      <h1>육아휴직 급여 계산기</h1>
      <p class="lead">월 통상임금과 일반 육아휴직 개월 수를 입력해 월별 상한을 반영한 예상 급여를 계산하세요.</p>
      <section class="calculator-box utility-box">
        <div class="utility-form"><div class="utility-fields">
          ${field('pl-wage', '월 통상임금(원)', '3000000', 'min="0" step="1"')}
          ${field('pl-months', '육아휴직 기간(개월)', '12', 'min="1" max="18" step="1" inputmode="numeric"')}
        </div><button class="primary-btn" id="parental-leave-calc" type="button">육아휴직 급여 계산하기</button></div>
        <div class="result" id="parental-leave-result" aria-live="polite"></div>
        <p class="calculator-note">일반 육아휴직급여의 월별 비율과 상한만 반영한 예상액입니다. 피보험 단위기간, 휴직 가능 기간, 6+6 부모육아휴직제 적용 여부와 실제 지급 자격은 고용24·관할 고용센터에서 확인하세요.</p>
      </section>
      <section class="content-block"><h2>일반 육아휴직급여 계산 기준</h2><p>1~3개월은 통상임금 100%(월 상한 250만원), 4~6개월은 100%(월 상한 200만원), 7개월 이후는 80%(월 상한 160만원)를 적용합니다. 6+6 부모육아휴직제는 별도 요건과 월별 상한이 있어 이 계산에 포함하지 않습니다.</p></section>
      <section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/salary.html">월급 실수령액 계산기</a><a href="/calculators/annual-salary.html">연봉 계산기</a><a href="/calculators/four-insurance.html">4대보험 계산기</a></div></section>`;
  }

  root.querySelector('#parental-leave-calc')?.addEventListener('click', () => {
    const wage = value('pl-wage');
    const months = value('pl-months');
    if (!Number.isFinite(wage) || wage <= 0 || !Number.isInteger(months) || months < 1 || months > 18) {
      error('월 통상임금은 0보다 크게, 육아휴직 기간은 1~18개월의 정수로 입력해 주세요.');
      return;
    }
    const monthlyAmounts = Array.from({ length: months }, (_, index) => {
      const month = index + 1;
      if (month <= 3) return Math.min(wage, 2500000);
      if (month <= 6) return Math.min(wage, 2000000);
      return Math.min(wage * 0.8, 1600000);
    });
    const firstThree = monthlyAmounts.slice(0, 3).reduce((sum, amount) => sum + amount, 0);
    const middleThree = monthlyAmounts.slice(3, 6).reduce((sum, amount) => sum + amount, 0);
    const remainder = monthlyAmounts.slice(6).reduce((sum, amount) => sum + amount, 0);
    const total = monthlyAmounts.reduce((sum, amount) => sum + amount, 0);
    show(`<div class="utility-result-grid"><div><span>예상 급여 합계</span><strong>${won(total)}</strong></div><div><span>1~3개월 합계</span><b>${won(firstThree)}</b></div><div><span>4~6개월 합계</span><b>${won(middleThree)}</b></div><div><span>7개월 이후 합계</span><b>${won(remainder)}</b></div><div><span>월평균 예상액</span><b>${won(total / months)}</b></div><div><span>계산 기간</span><b>${months}개월</b></div></div><p>일반 육아휴직급여 구간별 비율과 상한을 적용했습니다. 하한액·일할 계산·특례와 개인별 지급 자격은 반영하지 않았습니다.</p>`);
  });
})();
