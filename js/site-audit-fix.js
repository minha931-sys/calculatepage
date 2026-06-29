(function(){
  const root = document.querySelector('#calculator');
  if(!root) return;

  const getSlug = () =>
    document.body.dataset.calculator ||
    document.body.dataset.customCalculator ||
    document.body.dataset.advancedCalculator ||
    document.body.dataset.batch ||
    document.body.dataset.misc ||
    '';

  const SITE_ORIGIN = 'https://calculatepage.com';
  const officialUrl = () => SITE_ORIGIN + location.pathname;
  const money = n => Math.round(n).toLocaleString('ko-KR') + '원';

  function ensureHeader(){
    if(!document.querySelector('.site-header')){
      document.body.insertAdjacentHTML('afterbegin',
        '<header class="site-header"><a class="logo" href="/">계산<span>페이지</span></a></header>'
      );
    }
  }

  function ensureHomeButton(){
    if(root.querySelector('.calculator-home')) return;
    root.insertAdjacentHTML('afterbegin','<a class="calculator-home" href="/">← 계산페이지 홈</a>');
  }

  function normalizeInputs(){
    root.querySelectorAll('button:not([type])').forEach(button => button.type = 'button');
    root.querySelectorAll('input[type="number"]').forEach(input => {
      input.inputMode = 'decimal';
      if(!input.step) input.step = 'any';
      if(input.value && !input.dataset.keepDefault && !input.dataset.exampleNormalized){
        if(!input.placeholder) input.placeholder = `예: ${input.value}`;
        input.value = '';
        input.dataset.exampleNormalized = 'true';
      }
    });
    root.querySelectorAll('input[placeholder^="ex)"]').forEach(input => {
      input.placeholder = input.placeholder.replace(/^ex\)\s*/,'예: ');
    });
    root.querySelectorAll('input[placeholder^="예"]').forEach(input => {
      input.placeholder = input.placeholder.replace(/^예[):]?\s*/,'예: ');
    });
  }

  function nearestResult(button){
    const scope = button.closest('.calculator-box') || root;
    return scope.querySelector('.result, #result, #advanced-result, #misc-result, #br, #quick-result, #cycle-result, #percent-result, #savings-result, #loan-result') ||
      root.querySelector('.result, #result, #advanced-result, #misc-result, #br, #quick-result, #cycle-result, #percent-result, #savings-result, #loan-result');
  }

  function hasEmptyRequiredLikeField(scope){
    const fields = [...scope.querySelectorAll('input, select, textarea')]
      .filter(el => !el.disabled && el.type !== 'checkbox' && el.type !== 'radio' && !el.classList.contains('course-name') && !el.classList.contains('ev-name'));
    return fields.some(el => String(el.value || '').trim() === '');
  }

  function showInputHelp(result, scope){
    if(!result || result.classList.contains('show') || result.textContent.trim()) return;
    const empty = hasEmptyRequiredLikeField(scope);
    result.innerHTML = empty
      ? '<strong>입력값을 확인해 주세요</strong><p>비어 있는 필수 항목을 입력한 뒤 다시 계산해 주세요.</p>'
      : '<strong>계산 조건을 확인해 주세요</strong><p>입력 조합상 계산할 수 없는 값이 있습니다. 0 또는 음수가 들어가면 안 되는 항목을 확인해 주세요.</p>';
    result.classList.add('show');
  }

  function bindSilentFailGuard(){
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if(!button) return;
      const isCalcButton =
        button.classList.contains('primary-btn') ||
        /계산|구하기|확인|변환|분석/.test(button.textContent || '') ||
        /calc|calculate|bc|quick|misc|advanced/.test(button.id || '');
      if(!isCalcButton) return;
      const scope = button.closest('.calculator-box') || root;
      const result = nearestResult(button);
      if(result){
        result.dataset.auditBefore = result.textContent.trim();
        result.classList.remove('audit-pending');
      }
      setTimeout(() => {
        if(!result) return;
        const before = result.dataset.auditBefore || '';
        const after = result.textContent.trim();
        if(!after || after === before && !result.classList.contains('show')){
          showInputHelp(result, scope);
        }
      }, 80);
    }, true);
  }

  function improveStockLeverage(){
    if(getSlug() !== 'stock-leverage') return;
    const fee = root.querySelector('#sl-fee');
    const toggle = root.querySelector('.fee-toggle');
    if(fee){
      const label = fee.closest('label');
      const span = label?.querySelector('span');
      if(span) span.textContent = '수수료율(%)';
      if(toggle) fee.insertAdjacentElement('afterend', toggle);
    }
  }

  function addUtilityNotes(){
    const slug = getSlug();
    if(!slug || root.querySelector('.audit-usage-note')) return;
    const leanPages = new Set([
      'break-even','calorie-deficit','electricity','exam-target','exchange','income-tax',
      'percent-change','roi','cagr','shipping-split','travel-budget','daily-proration','expected-value'
    ]);
    if(!leanPages.has(slug)) return;
    root.insertAdjacentHTML('beforeend',
      '<section class="content-block audit-usage-note"><h2>계산 결과를 볼 때 참고할 점</h2><p>이 계산기는 입력한 조건을 기준으로 빠르게 추정값을 보여주는 도구입니다. 실제 금액, 세금, 수수료, 정책 기준은 계약 조건이나 적용 시점에 따라 달라질 수 있으니 중요한 결정 전에는 공식 안내나 실제 명세를 함께 확인해 주세요.</p></section>'
    );
  }

  function addCalculatorStructuredData(){
    const slug = getSlug();
    if(!slug || document.querySelector('script[data-calculator-schema]')) return;
    const name = root.querySelector('h1')?.textContent?.trim() || document.title.replace(/\s*\|\s*계산페이지\s*$/,'');
    const description = document.querySelector('meta[name="description"]')?.content || `${name}를 무료로 사용할 수 있는 계산기입니다.`;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.calculatorSchema = 'true';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name,
      description,
      url: officialUrl(),
      applicationCategory: 'CalculatorApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW'
      }
    });
    document.head.appendChild(script);
  }

  function improveRelatedLinks(){
    const slug = getSlug();
    const relatedBox = root.querySelector('.related');
    if(!slug || !relatedBox || relatedBox.dataset.improvedRelated) return;
    const labels = {
      percent:'퍼센트 계산기',discount:'할인율 계산기',salary:'월급 실수령액 계산기',gpa:'학점 계산기','d-day':'디데이 계산기','dutch-pay':'더치페이 계산기',
      'savings-interest':'예금 이자 계산기',installment:'적금 계산기','compound-interest':'복리 계산기','loan-interest':'대출 이자 계산기',dsr:'DSR 계산기','prepayment-fee':'중도상환수수료 계산기',budget:'생활비 예산 계산기',vat:'부가세 계산기',margin:'마진율 계산기',estimate:'견적 계산기',
      'freelance-rate':'프리랜서 단가 계산기','work-hours':'근무시간 계산기',wage:'시급 계산기',date:'날짜 계산기','day-count':'일수 계산기',age:'나이 계산기','international-age':'만나이 계산기',
      'average-score':'평균 점수 계산기','target-gpa':'목표 학점 계산기',retake:'재수강 학점 계산기','school-grade':'내신 등급 계산기','exam-dday':'시험 D-day 계산기','exam-target':'시험 성적 목표 계산기',
      'area-conversion':'평수 계산기',unit:'단위 변환 계산기',scale:'스케일 계산기',cbm:'CBM 계산기','volumetric-weight':'부피무게 계산기','interior-estimate':'인테리어 견적 계산기','real-estate-brokerage':'부동산 중개보수 계산기',
      'travel-budget':'여행 경비 계산기','shipping-split':'배송비 분할 계산기','fuel-cost':'유류비 계산기',exchange:'환율 계산기','average-price':'평단가 계산기','stock-return':'주식 수익률 계산기',roi:'ROI 계산기','averaging-down':'물타기 계산기','percent-change':'퍼센트 증가율 계산기',
      'loan-schedule':'대출 상환 스케줄 계산기','annual-salary':'연봉 계산기','four-insurance':'4대보험 계산기',severance:'퇴직금 계산기','weekly-holiday-pay':'주휴수당 계산기','overtime-pay':'연장근로수당 계산기','ordinary-wage':'통상임금 계산기','pregnancy-week':'임신 주수 계산기'
    };
    labels.cagr = 'CAGR 계산기';
    labels['employee-health-insurance'] = '직장인 건강보험료 계산기';
    const map = {
      percent:['discount','vat','margin','percent-change'],
      discount:['percent','vat','dutch-pay','budget'],
      salary:['annual-salary','employee-health-insurance','four-insurance','budget'],
      'employee-health-insurance':['salary','four-insurance','local-health-insurance','annual-salary'],
      gpa:['target-gpa','retake','average-score','school-grade'],
      'd-day':['date','day-count','exam-dday','age'],
      'dutch-pay':['budget','travel-budget','shipping-split','discount'],
      'savings-interest':['installment','compound-interest','loan-interest','budget'],
      'loan-interest':['loan-schedule','dsr','prepayment-fee','savings-interest'],
      budget:['salary','dutch-pay','savings-interest','travel-budget'],
      vat:['estimate','margin','freelance-rate','percent'],
      margin:['vat','estimate','discount','freelance-rate'],
      estimate:['vat','margin','freelance-rate','shipping-split'],
      'freelance-rate':['estimate','vat','margin','work-hours'],
      'work-hours':['wage','salary','weekly-holiday-pay','overtime-pay'],
      wage:['work-hours','salary','weekly-holiday-pay','ordinary-wage'],
      date:['d-day','day-count','age','exam-dday'],
      'day-count':['date','d-day','work-hours','exam-dday'],
      age:['international-age','d-day','date','pregnancy-week'],
      'international-age':['age','date','d-day','day-count'],
      'average-score':['gpa','target-gpa','school-grade','exam-target'],
      'target-gpa':['gpa','retake','average-score','school-grade'],
      retake:['gpa','target-gpa','average-score','school-grade'],
      'school-grade':['average-score','exam-target','gpa','exam-dday'],
      'exam-dday':['d-day','date','day-count','average-score'],
      'area-conversion':['scale','unit','interior-estimate','real-estate-brokerage'],
      unit:['area-conversion','scale','cbm','volumetric-weight'],
      scale:['area-conversion','unit','cbm','volumetric-weight'],
      cbm:['volumetric-weight','shipping-split','unit','scale'],
      'volumetric-weight':['cbm','shipping-split','unit','scale'],
      'travel-budget':['dutch-pay','fuel-cost','budget','exchange'],
      'shipping-split':['dutch-pay','estimate','cbm','volumetric-weight'],
      'average-price':['stock-return','averaging-down','cagr','roi'],
      cagr:['compound-interest','roi','stock-return','percent-change'],
      'loan-schedule':['loan-interest','dsr','prepayment-fee','savings-interest']
    };
    const ids = (map[slug] || []).filter(id => id !== slug);
    if(!ids.length) return;
    relatedBox.innerHTML = ids.map(id => `<a href="/calculators/${id}.html">${labels[id] || id}</a>`).join('');
    relatedBox.dataset.improvedRelated = 'true';
  }

  function bindResultShareButtons(){
    const shareable = new Set([
      'estimate','dutch-pay','travel-budget','shipping-split','budget','loan-schedule',
      'average-price','gpa','average-score','work-hours','day-count','d-day','date',
      'loan-interest','savings-interest','salary','freelance-rate','area-conversion','pet-age',
      'electricity','fuel-cost'
    ]);
    const slug = getSlug();
    if(!shareable.has(slug) || root.dataset.shareButtonsBound) return;
    root.dataset.shareButtonsBound = 'true';

    const money = value => Math.round(value).toLocaleString('ko-KR') + '원';

    const clean = value => (value || '').replace(/\s+/g,' ').trim();
    const inputValue = input => {
      if(!input) return '';
      if(input.type === 'checkbox') return input.checked ? '예' : '아니오';
      if(input.tagName === 'SELECT') return clean(input.selectedOptions?.[0]?.textContent || input.value);
      return clean(input.value);
    };
    const labelText = label => {
      const span = label.querySelector('span');
      if(span) return clean(span.textContent);
      const clone = label.cloneNode(true);
      clone.querySelectorAll('input,select,textarea,button').forEach(el => el.remove());
      return clean(clone.textContent);
    };

    const getGridResultText = result => {
      const rows = [...result.querySelectorAll('[class*="result-grid"] > div')].map(item => {
        const label = item.querySelector('span')?.textContent?.replace(/\s+/g,' ').trim();
        const value = item.querySelector('strong,b')?.textContent?.replace(/\s+/g,' ').trim();
        return label && value ? `${label}: ${value}` : '';
      }).filter(Boolean);
      return rows.length ? rows.join('\n') : '';
    };

    const getGenericInputText = () => {
      const rows = [];
      const seen = new Set();
      root.querySelectorAll('.calculator-box label').forEach(label => {
        const input = label.querySelector('input,select,textarea');
        if(!input || input.type === 'hidden' || input.disabled || seen.has(input)) return;
        const labelName = labelText(label);
        const value = inputValue(input);
        if(!labelName || !value) return;
        seen.add(input);
        rows.push(`${labelName}: ${value}`);
      });
      return rows.join('\n');
    };

    const getEstimateInputText = () => {
      const rows = [...root.querySelectorAll('#estimate-rows tr')].map((tr,index) => {
        const name = clean(tr.querySelector('.estimate-name')?.value) || `항목 ${index + 1}`;
        const qty = Number(tr.querySelector('.estimate-qty')?.value);
        const price = Number(tr.querySelector('.estimate-price')?.value);
        const line = clean(tr.querySelector('.estimate-line')?.textContent);
        return Number.isFinite(qty) && qty > 0 && Number.isFinite(price) && price > 0 ? `- ${name}: 수량 ${qty.toLocaleString('ko-KR')} · 단가 ${money(price)} · 금액 ${line || money(qty * price)}` : '';
      }).filter(Boolean);
      const tax = root.querySelector('#estimate-tax')?.checked ? '예' : '아니오';
      return rows.length ? ['견적 항목', rows.join('\n'), `부가세 10% 포함: ${tax}`].join('\n') : '';
    };

    const getDutchShareText = result => {
      const items = [...root.querySelectorAll('.dutch-item')].map((item,index) => {
        const name = item.querySelector('.dp-name')?.value?.trim() || `항목 ${index + 1}`;
        const amount = Number(item.querySelector('.dp-amount')?.value);
        return Number.isFinite(amount) && amount > 0 ? `- ${name}: ${money(amount)}` : '';
      }).filter(Boolean);
      const people = Number(root.querySelector('#dp-people')?.value);
      const round = root.querySelector('#dp-round')?.selectedOptions?.[0]?.textContent?.trim();
      const resultText = getGridResultText(result);
      const inputLines = [];
      const lines = [];
      if(items.length) inputLines.push('정산 항목', items.join('\n'));
      if(Number.isFinite(people) && people > 0) inputLines.push(`전체 인원수: ${people.toLocaleString('ko-KR')}명`);
      if(round) inputLines.push(`반올림 단위: ${round}`);
      if(inputLines.length) lines.push('계산 입력', inputLines.join('\n'));
      if(resultText) lines.push('계산 결과', resultText);
      return lines.join('\n');
    };

    const getGpaInputText = () => {
      const rows = [...root.querySelectorAll('#course-rows tr')].map((tr,index) => {
        const name = clean(tr.querySelector('.course-name')?.value) || `과목 ${index + 1}`;
        const grade = inputValue(tr.querySelector('.course-grade'));
        const credit = inputValue(tr.querySelector('.course-credit'));
        const major = tr.querySelector('input[type="checkbox"]')?.checked ? ' · 전공' : '';
        return grade && grade !== '선택' && credit && credit !== '선택' ? `- ${name}: ${grade} · ${credit}학점${major}` : '';
      }).filter(Boolean);
      const scale = inputValue(root.querySelector('#grade-scale'));
      const includeP = root.querySelector('#include-p')?.checked ? '예' : '아니오';
      return rows.length ? [`평점 기준: ${scale}`, `P/F 과목 포함: ${includeP}`, '과목', rows.join('\n')].join('\n') : '';
    };

    const getAverageScoreInputText = () => {
      const useWeight = root.querySelector('#avg-use-weight')?.checked;
      const rows = [...root.querySelectorAll('#avg-rows tr')].map((tr,index) => {
        const name = clean(tr.querySelector('.avg-name')?.value) || `과목 ${index + 1}`;
        const score = Number(tr.querySelector('.avg-score')?.value);
        const weight = Number(tr.querySelector('.avg-weight')?.value) || 1;
        return Number.isFinite(score) ? `- ${name}: ${score.toLocaleString('ko-KR')}점${useWeight ? ` · 가중치 ${weight.toLocaleString('ko-KR')}` : ''}` : '';
      }).filter(Boolean);
      return rows.length ? [`가중치 사용: ${useWeight ? '예' : '아니오'}`, '점수 입력', rows.join('\n')].join('\n') : '';
    };

    const getAveragePriceInputText = () => {
      const rows = [...root.querySelectorAll('#ap-rows tr')].map((tr,index) => {
        const qty = Number(tr.querySelector('.ap-qty')?.value);
        const price = Number(tr.querySelector('.ap-price')?.value);
        const total = clean(tr.querySelector('.ap-total')?.textContent);
        return Number.isFinite(qty) && qty > 0 && Number.isFinite(price) && price > 0 ? `- 매수 ${index + 1}: 수량 ${qty.toLocaleString('ko-KR')}개 · 단가 ${money(price)} · 금액 ${total || money(qty * price)}` : '';
      }).filter(Boolean);
      return rows.length ? ['매수 내역', rows.join('\n')].join('\n') : '';
    };

    const getInputText = () => {
      if(slug === 'dutch-pay') return '';
      if(slug === 'estimate') return getEstimateInputText();
      if(slug === 'gpa') return getGpaInputText();
      if(slug === 'average-score') return getAverageScoreInputText();
      if(slug === 'average-price') return getAveragePriceInputText();
      return getGenericInputText();
    };

    const getResultText = result => {
      if(slug === 'dutch-pay') return getDutchShareText(result);
      const gridText = getGridResultText(result);
      if(gridText) return gridText;
      const clone = result.cloneNode(true);
      clone.querySelectorAll('.result-share-actions').forEach(el => el.remove());
      return clone.textContent.replace(/\s+/g, ' ').trim();
    };

    const getShareBody = result => {
      if(slug === 'dutch-pay') return getResultText(result);
      const inputText = getInputText();
      const resultText = getResultText(result);
      const lines = [];
      if(inputText) lines.push('계산 입력', inputText);
      if(resultText) lines.push('계산 결과', resultText);
      return lines.join('\n');
    };

    const addButtons = () => {
      root.querySelectorAll('.result.show').forEach(result => {
        const text = getShareBody(result);
        if(!text || /입력값|확인해 주세요|선택해 주세요|입력해 주세요/.test(text)) return;
        if(result.querySelector('.result-share-actions')) return;
        result.insertAdjacentHTML('beforeend','<div class="result-share-actions"><button class="result-share-btn" type="button">결과 공유</button></div>');
      });
    };

    root.addEventListener('click', async event => {
      const button = event.target.closest('.result-share-btn');
      if(!button) return;
      const result = button.closest('.result');
      const title = root.querySelector('h1')?.textContent?.trim() || document.title.replace(/\s*\|\s*계산페이지\s*$/,'');
      const text = `${title}\n${getShareBody(result)}\n\n계산페이지: ${officialUrl()}`;
      const done = message => {
        button.textContent = message;
        setTimeout(() => button.textContent = '결과 공유', 1500);
      };
      const copy = async () => {
        if(!navigator.clipboard) return false;
        await navigator.clipboard.writeText(text);
        done('복사 완료');
        return true;
      };
      try{
        if(navigator.share){
          await navigator.share({title, text});
        }else{
          const copied = await copy();
          if(!copied) done('복사 불가');
        }
      }catch(error){
        try{
          const copied = await copy();
          if(!copied) done('공유 취소');
        }catch(copyError){
          done('공유 취소');
        }
      }
    });

    new MutationObserver(addButtons).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    setTimeout(addButtons, 120);
  }

  function run(){
    ensureHeader();
    ensureHomeButton();
    normalizeInputs();
    improveStockLeverage();
    addUtilityNotes();
    addCalculatorStructuredData();
    improveRelatedLinks();
    bindResultShareButtons();
  }

  run();
  bindSilentFailGuard();
  window.addEventListener('load', run);
  setTimeout(run, 120);
})();

// Readability upgrade for high-intent labor and loan calculators.
(function(){
  const root = document.querySelector('#calculator');
  if(!root) return;
  const key = document.body.dataset.calculator || document.body.dataset.customCalculator || '';
  if(!['severance','weekly-holiday-pay','loan-interest'].includes(key)) return;

  const won = value => Math.round(Number(value) || 0).toLocaleString('ko-KR') + '원';
  const num = id => Number(root.querySelector('#' + id)?.value || 0);
  const val = id => root.querySelector('#' + id)?.value || '';
  const card = (label,value,sub='') => `<div><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const field = (id,label,placeholder,type='number',extra='') => `<label><span>${label}</span><input id="${id}" type="${type}" placeholder="예: ${placeholder}" ${type === 'number' ? 'min="0" step="any" inputmode="decimal"' : ''} ${extra}></label>`;
  const select = (id,label,options) => `<label><span>${label}</span><select id="${id}">${options.map(option => `<option value="${option[0]}">${option[1]}</option>`).join('')}</select></label>`;
  const top = `<a class="calculator-home category-more-link" href="${key === 'loan-interest' ? '/categories/money.html' : '/categories/business.html'}">${key === 'loan-interest' ? '금융' : '업무'} 카테고리 더보기</a>`;
  const show = (id,html) => { const result = root.querySelector('#' + id); result.innerHTML = html; result.classList.add('show'); };

  if(key === 'severance'){
    root.innerHTML = `${top}<h1>퇴직금 계산기</h1><p class="lead">입사일, 퇴사일, 최근 3개월 임금을 넣어 계속근로기간 기준 예상 퇴직금을 계산합니다.</p>
      <section class="calculator-box utility-box readable-calc-box">
        <div class="readable-intro">
          <h2>퇴직금은 이렇게 계산해요</h2>
          <p>퇴직금은 보통 <strong>1일 평균임금 × 30일 × 계속근로일수 ÷ 365</strong> 방식으로 계산합니다. 평균임금에는 퇴직 전 3개월 임금과 일부 상여금·연차수당 가산액이 함께 반영될 수 있습니다.</p>
          <div class="readable-guide-grid">
            <article><b>1년 이상 근무</b><p>계속근로기간이 1년 미만이면 일반적인 퇴직금 대상에서 제외될 수 있습니다.</p></article>
            <article><b>주 15시간 이상</b><p>초단시간 근로 등 예외가 있을 수 있어 근로계약 조건 확인이 필요합니다.</p></article>
            <article><b>세전 임금 기준</b><p>최근 3개월 임금 합계는 공제 전 금액을 기준으로 입력하세요.</p></article>
          </div>
        </div>
        <div class="utility-form">
          <h2>1. 근무 기간과 임금을 입력하세요</h2>
          <div class="utility-fields">
            ${field('sv-start','입사일','2023-01-01','date')}
            ${field('sv-end','퇴사일','2026-01-01','date')}
            ${field('sv-wage','퇴직 전 3개월 임금 합계(원)','9000000')}
            ${field('sv-days','퇴직 전 3개월 총 일수','92')}
            ${field('sv-bonus','연간 상여금 합계(원)','4000000')}
            ${field('sv-leave','연차수당 합계(원)','300000')}
          </div>
          <button class="primary-btn" id="sv-calc" type="button">예상 퇴직금 계산하기</button>
        </div>
        <div class="result" id="sv-result" aria-live="polite"></div>
        <p class="calculator-note">이 결과는 참고용 추정입니다. 평균임금보다 통상임금이 높은 경우, 제외 기간, 퇴직연금 유형, 세금, 회사 규정에 따라 실제 지급액은 달라질 수 있습니다.</p>
      </section>
      <section class="content-block readable-faq">
        <h2>계산 전 확인할 점</h2>
        <details open><summary>상여금과 연차수당은 어떻게 넣나요?</summary><p>고용노동부 계산 예시처럼 연간 상여금과 연차수당은 3개월분으로 환산해 평균임금에 더하는 방식으로 계산했습니다.</p></details>
        <details><summary>퇴직소득세도 반영되나요?</summary><p>아니요. 이 계산기는 세전 퇴직금 추정입니다. 퇴직소득세는 근속연수와 과세 기준에 따라 달라져 별도 확인이 필요합니다.</p></details>
      </section>`;
    root.querySelector('#sv-calc').onclick = () => {
      const start = new Date(val('sv-start'));
      const end = new Date(val('sv-end'));
      const wage = num('sv-wage');
      const periodDays = num('sv-days') || 92;
      if(!wage || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return show('sv-result','<strong>입력값을 확인해 주세요</strong><p>입사일, 퇴사일, 최근 3개월 임금 합계를 입력해 주세요.</p>');
      const serviceDays = Math.ceil((end - start) / 86400000);
      const bonusPart = num('sv-bonus') * 3 / 12;
      const leavePart = num('sv-leave') * 3 / 12;
      const averageDaily = (wage + bonusPart + leavePart) / Math.max(1,periodDays);
      const severance = averageDaily * 30 * serviceDays / 365;
      const status = serviceDays < 365 ? '계속근로기간이 1년 미만으로 계산되어 일반적인 퇴직금 대상이 아닐 수 있습니다.' : '계속근로기간 1년 이상 기준으로 예상 퇴직금을 계산했습니다.';
      show('sv-result',`<div class="savings-result-grid">${card('예상 퇴직금',won(severance),'세전 추정')}${card('1일 평균임금',won(averageDaily))}${card('계속근로일수',serviceDays.toLocaleString('ko-KR') + '일')}${card('평균임금 산정액',won(wage + bonusPart + leavePart))}</div><p>${status}</p>`);
    };
  }

  if(key === 'weekly-holiday-pay'){
    root.innerHTML = `${top}<h1>주휴수당 계산기</h1><p class="lead">시급, 1주 소정근로시간, 개근 여부를 입력해 주휴수당과 주급 예상액을 계산합니다.</p>
      <section class="calculator-box utility-box readable-calc-box">
        <div class="readable-intro">
          <h2>주휴수당 대상인지 먼저 확인하세요</h2>
          <p>주휴수당은 일반적으로 <strong>1주 소정근로시간 15시간 이상</strong>이고, 그 주의 <strong>소정근로일을 개근</strong>한 경우를 기준으로 봅니다.</p>
          <div class="readable-guide-grid">
            <article><b>소정근로시간</b><p>실제 추가근무가 아니라 근로계약상 약속한 주간 근무시간을 입력하세요.</p></article>
            <article><b>개근 여부</b><p>결근이 있으면 주휴수당이 발생하지 않을 수 있습니다.</p></article>
            <article><b>최대 8시간</b><p>계산 편의상 주휴시간은 1일 8시간 한도로 반영합니다.</p></article>
          </div>
        </div>
        <div class="utility-form">
          <h2>1. 근로 조건을 입력하세요</h2>
          <div class="utility-fields">
            ${field('whp-hourly','시급(원)','10030')}
            ${field('whp-weekly','1주 소정근로시간','20')}
            ${field('whp-days','주 소정근로일수','5')}
            ${select('whp-attend','소정근로일 개근 여부',[['yes','개근했어요'],['no','결근이 있어요']])}
          </div>
          <button class="primary-btn" id="whp-calc" type="button">주휴수당 계산하기</button>
        </div>
        <div class="result" id="whp-result" aria-live="polite"></div>
        <p class="calculator-note">이 결과는 참고용 추정입니다. 근로계약, 사업장 규모, 단시간 근로 조건, 결근 처리, 법령·행정해석 변경에 따라 실제 지급 여부와 금액은 달라질 수 있습니다.</p>
      </section>
      <section class="content-block readable-faq">
        <h2>자주 헷갈리는 부분</h2>
        <details open><summary>주 15시간은 실제 근무시간인가요?</summary><p>일반적으로 근로계약상 약속한 1주 소정근로시간을 기준으로 봅니다. 일시적인 추가근무만으로 판단하기 어렵습니다.</p></details>
        <details><summary>월급제도 주휴수당을 따로 받나요?</summary><p>월급제는 주휴수당이 월급에 포함되어 설계된 경우가 많습니다. 별도 지급 여부는 임금명세서와 근로계약서를 함께 확인해야 합니다.</p></details>
      </section>`;
    root.querySelector('#whp-calc').onclick = () => {
      const hourly = num('whp-hourly');
      const weeklyHours = num('whp-weekly');
      const days = Math.max(1,num('whp-days') || 5);
      if(!hourly || !weeklyHours) return show('whp-result','<strong>입력값을 확인해 주세요</strong><p>시급과 1주 소정근로시간을 입력해 주세요.</p>');
      const eligible = weeklyHours >= 15 && val('whp-attend') === 'yes';
      const dailyHours = Math.min(8, weeklyHours / days);
      const holidayHours = eligible ? dailyHours : 0;
      const holidayPay = hourly * holidayHours;
      const weeklyBasePay = hourly * weeklyHours;
      const message = eligible ? '입력 조건 기준으로 주휴수당 발생 가능성이 있는 경우로 계산했습니다.' : '주 15시간 미만이거나 개근 조건을 충족하지 않는 것으로 계산했습니다.';
      show('whp-result',`<div class="savings-result-grid">${card('예상 주휴수당',won(holidayPay))}${card('인정 주휴시간',holidayHours.toFixed(1) + '시간')}${card('기본 주급',won(weeklyBasePay))}${card('주휴 포함 주급',won(weeklyBasePay + holidayPay))}</div><p>${message}</p>`);
    };
  }

  if(key === 'loan-interest'){
    const forms = {
      annuity:['원리금균등상환','매달 거의 같은 금액을 내는 방식입니다. 월 지출 계획을 세우기 쉽습니다.'],
      principal:['원금균등상환','매달 같은 원금을 갚고 이자는 남은 원금에 따라 줄어듭니다.'],
      bullet:['만기일시상환','매달 이자만 내고 원금은 만기에 한 번에 갚는 방식입니다.']
    };
    let mode = 'annuity';
    root.innerHTML = `${top}<h1>대출 이자 계산기</h1><p class="lead">대출 원금, 금리, 기간을 입력해 상환 방식별 월 납입액과 총 이자를 비교합니다.</p>
      <section class="calculator-box loan-box readable-calc-box">
        <div class="readable-intro">
          <h2>상환 방식부터 고르세요</h2>
          <p>같은 원금과 금리라도 상환 방식에 따라 매달 납입액, 총 이자, 만기 부담이 달라집니다.</p>
          <div class="readable-guide-grid">
            <article><b>원리금균등</b><p>월 납입액이 일정해 예산 관리가 편합니다.</p></article>
            <article><b>원금균등</b><p>초기 부담은 크지만 총 이자가 상대적으로 적을 수 있습니다.</p></article>
            <article><b>만기일시</b><p>월 부담은 낮지만 만기에 원금을 한 번에 갚아야 합니다.</p></article>
          </div>
        </div>
        <div class="loan-tabs" role="tablist">
          <button class="loan-tab active" data-mode="annuity" type="button" role="tab">원리금균등</button>
          <button class="loan-tab" data-mode="principal" type="button" role="tab">원금균등</button>
          <button class="loan-tab" data-mode="bullet" type="button" role="tab">만기일시</button>
        </div>
        <div id="loan-form"></div>
        <div class="result" id="loan-result" aria-live="polite"></div>
        <p class="calculator-note">중도상환수수료, 인지세, 보증료, 거치기간, 변동금리, 우대금리 조건은 반영하지 않은 참고용 추정입니다. 실제 대출 조건은 금융기관 안내를 확인하세요.</p>
      </section>
      <section class="content-block readable-faq">
        <h2>결과를 볼 때 확인할 점</h2>
        <details open><summary>총 이자가 가장 적은 방식은 무엇인가요?</summary><p>같은 조건에서는 원금균등상환이 총 이자가 적은 경우가 많지만, 초기 월 납입액이 커질 수 있습니다.</p></details>
        <details><summary>실제 은행 납입액과 다를 수 있나요?</summary><p>네. 실행일, 이자 계산 일수, 금리 변동, 수수료, 거치기간, 우대금리 충족 여부에 따라 실제 금액은 달라질 수 있습니다.</p></details>
      </section>`;
    const form = root.querySelector('#loan-form');
    const result = root.querySelector('#loan-result');
    const render = () => {
      const [title,hint] = forms[mode];
      form.innerHTML = `<div class="loan-form-inner"><h2>${title}</h2><p>${hint}</p><div class="loan-fields">${field('loan-principal','대출 원금(원)','10000000')}${field('loan-rate','연 이자율(%)','4.5')}${field('loan-months','상환 기간(개월)','36')}</div><div class="search-keywords loan-presets"><span>빠른 예시</span><button type="button" data-principal="10000000" data-rate="4.5" data-months="36">1천만원 · 3년</button><button type="button" data-principal="100000000" data-rate="4.2" data-months="240">1억원 · 20년</button><button type="button" data-principal="300000000" data-rate="4" data-months="360">3억원 · 30년</button></div><button class="primary-btn" id="calculate-loan" type="button">대출 이자 계산하기</button></div>`;
      form.querySelectorAll('.loan-presets button').forEach(button => {
        button.onclick = () => {
          root.querySelector('#loan-principal').value = button.dataset.principal;
          root.querySelector('#loan-rate').value = button.dataset.rate;
          root.querySelector('#loan-months').value = button.dataset.months;
        };
      });
      form.querySelector('#calculate-loan').onclick = () => {
        const principal = num('loan-principal'), rate = num('loan-rate'), months = Math.round(num('loan-months'));
        if(!principal || rate < 0 || !months) return show('loan-result','<strong>입력값을 확인해 주세요</strong><p>대출 원금, 금리, 상환 기간을 모두 입력해 주세요.</p>');
        const monthlyRate = rate / 100 / 12;
        let monthly = 0, totalInterest = 0, sub = '';
        if(mode === 'annuity'){
          monthly = monthlyRate === 0 ? principal / months : principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
          totalInterest = monthly * months - principal;
          sub = `매월 약 ${won(monthly)}을 납입하는 구조입니다.`;
        }else if(mode === 'principal'){
          const monthlyPrincipal = principal / months;
          const first = monthlyPrincipal + principal * monthlyRate;
          const last = monthlyPrincipal + monthlyPrincipal * monthlyRate;
          monthly = first;
          totalInterest = principal * monthlyRate * (months + 1) / 2;
          sub = `첫 달 ${won(first)}에서 마지막 달 ${won(last)} 수준으로 줄어듭니다.`;
        }else{
          monthly = principal * monthlyRate;
          totalInterest = monthly * months;
          sub = `매달 이자만 내고 만기에 원금 ${won(principal)}을 상환합니다.`;
        }
        show('loan-result',`<div class="loan-result-grid"><div><span>${mode === 'principal' ? '첫 달 납입액' : '월 납입액'}</span><strong>${won(monthly)}</strong></div><div><span>총 이자</span><b>${won(totalInterest)}</b></div><div><span>총 상환액</span><b>${won(principal + totalInterest)}</b></div></div><p class="loan-result-note">${sub}</p>`);
      };
    };
    root.querySelector('.loan-tabs').onclick = event => {
      const tab = event.target.closest('.loan-tab');
      if(!tab) return;
      mode = tab.dataset.mode;
      root.querySelectorAll('.loan-tab').forEach(button => button.classList.toggle('active',button === tab));
      result.classList.remove('show');
      render();
    };
    render();
  }
})();

// 개별 계산기 페이지 공통 SEO 보강: 사용 맥락, 체크포인트, FAQ를 자동 추가합니다.
(function enhanceCalculatorSeoTemplate(){
  const root=document.querySelector('#calculator');
  if(!root)return;

  const slug=
    document.body.dataset.calculator||
    document.body.dataset.customCalculator||
    document.body.dataset.advancedCalculator||
    document.body.dataset.batch||
    document.body.dataset.misc||
    document.body.dataset.taxCalculator||
    document.body.dataset.propertyLaborCalculator||
    '';
  if(!slug)return;

  const categoryMap={
    money:['percent','discount','savings-interest','installment','loan-interest','salary','employee-health-insurance','budget','averaging-down','unemployment-benefit','average-price','rent-conversion','jeonse-loan','car-installment','compound-interest','percent-change','cagr','roi','exchange','daily-proration','stock-leverage','dsr','stock-return','prepayment-fee','car-acquisition-tax','card-installment','monthly-rent-deduction','loan-schedule','capital-gains-tax','gift-tax','national-pension','local-health-insurance','property-tax','youth-leap-account','youth-account-switch','housing-subscription','real-estate-brokerage','real-estate-acquisition-tax','comprehensive-real-estate-tax','rental-yield'],
    education:['gpa','target-gpa','retake','school-grade','average-score','exam-dday','exam-target','expected-value'],
    health:['bmi','bmr','calorie','water','exercise-calorie','target-weight','running-pace','calorie-deficit','body-fat','ovulation','menstrual-cycle','pregnancy-week'],
    life:['date','d-day','age','international-age','time','dutch-pay','unit','day-count','cbm','scale','volumetric-weight','electricity','travel-budget','fuel-cost','car-tax','lotto-tax','pet-age','area-conversion'],
    business:['vat','margin','wage','work-hours','estimate','freelance-rate','severance','break-even','shipping-split','income-tax','annual-salary','annual-leave','four-insurance','parental-leave','comprehensive-income-tax','withholding-33','weekly-holiday-pay','interior-estimate','annual-leave-pay','ordinary-wage','overtime-pay','average-wage']
  };
  const category=Object.entries(categoryMap).find(([,ids])=>ids.includes(slug))?.[0]||'life';
  const label={money:'금융',education:'교육',health:'건강',life:'생활',business:'업무'}[category];
  const title=()=>root.querySelector('h1')?.textContent?.trim()||'계산기';

  const notes={
    money:{
      when:'금액, 이자, 세금, 공제, 수수료처럼 조건에 따라 결과가 달라지는 금융 판단을 빠르게 비교할 때 사용하세요.',
      check:'실제 금리, 세율, 수수료, 우대 조건, 신청 자격은 기관·상품·적용 시점에 따라 달라질 수 있습니다.',
      q1:'계산 결과를 실제 계약에 바로 써도 되나요?',
      a1:'아니요. 입력값 기준의 예상 결과이므로 계약·신고·신청 전에는 금융기관, 국세청, 고용보험 등 공식 기준을 확인하는 것이 좋습니다.'
    },
    education:{
      when:'학점, 점수, 등급, 시험 일정처럼 학습 계획을 세우기 전에 대략적인 목표와 현재 위치를 확인할 때 사용하세요.',
      check:'학교별 성적 환산 기준, 반영 비율, 재수강 처리 방식이 다를 수 있어 최종 판단은 학교 기준을 함께 확인해야 합니다.',
      q1:'학교 성적표와 결과가 다를 수 있나요?',
      a1:'네. 학교마다 평점 기준, P/F 처리, 과목별 가중치가 다를 수 있어 참고용으로 보는 것이 안전합니다.'
    },
    health:{
      when:'체중, 칼로리, 운동량, 날짜 주기처럼 건강 관리의 기준값을 잡고 생활 계획을 세울 때 사용하세요.',
      check:'건강 계산 결과는 의료 진단이 아닙니다. 질환, 임신, 통증, 급격한 체중 변화가 있으면 의료 전문가와 상담하세요.',
      q1:'이 결과로 건강 상태를 판단해도 되나요?',
      a1:'아니요. 일반 공식 기반의 참고값입니다. 개인의 질환, 약물, 근육량, 생활 습관은 별도로 고려해야 합니다.'
    },
    life:{
      when:'날짜, 시간, 나이, 단위, 비용 나누기처럼 일상에서 반복적으로 필요한 계산을 빠르게 처리할 때 사용하세요.',
      check:'포함 기준, 반올림 방식, 업체별 규정에 따라 실제 결과가 달라질 수 있으므로 중요한 일정이나 비용은 한 번 더 확인하세요.',
      q1:'결과가 1일 또는 일부 금액 차이 날 수 있나요?',
      a1:'네. 시작일 포함 여부, 종료일 포함 여부, 반올림 기준, 업체별 산정 방식에 따라 차이가 날 수 있습니다.'
    },
    business:{
      when:'판매가, 견적, 근무시간, 단가, 세금, 퇴직 관련 금액을 빠르게 검토하고 실무 판단의 초안을 잡을 때 사용하세요.',
      check:'세무·노무·계약 조건은 사업 형태, 근로계약, 업종, 신고 기준에 따라 달라질 수 있습니다.',
      q1:'계산 결과를 견적서나 신고서에 그대로 써도 되나요?',
      a1:'기초 검토용으로는 유용하지만 최종 견적·신고·계약에는 실제 거래 조건과 세무·노무 기준을 반영해야 합니다.'
    }
  }[category];

  function append(){
    if(root.querySelector('.seo-template-block'))return;
    const h=title();
    root.insertAdjacentHTML('beforeend',`
      <section class="content-block seo-template-block">
        <h2>${h}는 언제 쓰면 좋나요?</h2>
        <p>${notes.when}</p>
      </section>
      <section class="content-block seo-template-block">
        <h2>${h} 계산 전 확인할 점</h2>
        <ul>
          <li>입력값이 비어 있거나 단위가 다르면 결과가 크게 달라질 수 있습니다.</li>
          <li>예시값은 입력 형식을 보여주기 위한 참고값이며, 실제 상황에 맞게 바꿔 입력해야 합니다.</li>
          <li>${notes.check}</li>
        </ul>
      </section>
      <section class="content-block seo-template-block seo-faq">
        <h2>${h} 자주 묻는 질문</h2>
        <details><summary>${notes.q1}</summary><p>${notes.a1}</p></details>
        <details><summary>${h} 결과는 저장되나요?</summary><p>별도 저장 기능이 없는 계산기는 입력값을 서버에 저장하지 않고, 브라우저 화면에서 즉시 계산 결과만 보여줍니다.</p></details>
        <details><summary>다른 ${label} 계산기도 함께 볼 수 있나요?</summary><p>상단의 ${label} 카테고리 더보기 버튼을 누르면 관련 계산기 목록을 한 번에 확인할 수 있습니다.</p></details>
      </section>`);
  }

  window.addEventListener('load',append);
  setTimeout(append,260);
})();

// 상위 유입 후보 계산기별 본문을 보강하고, 전체 계산기에 법적·의료·금융 리스크 고지를 일관되게 추가합니다.
(function enhanceTopCalculatorsAndRiskNotice(){
  const root=document.querySelector('#calculator');
  if(!root)return;
  const slug=
    document.body.dataset.calculator||
    document.body.dataset.customCalculator||
    document.body.dataset.advancedCalculator||
    document.body.dataset.batch||
    document.body.dataset.misc||
    document.body.dataset.taxCalculator||
    document.body.dataset.propertyLaborCalculator||
    '';
  if(!slug)return;

  const sensitive={
    tax:['vat','income-tax','capital-gains-tax','gift-tax','property-tax','comprehensive-income-tax','comprehensive-real-estate-tax','withholding-33','monthly-rent-deduction','lotto-tax','car-tax','car-acquisition-tax','real-estate-acquisition-tax','youth-leap-account'],
    labor:['salary','annual-salary','employee-health-insurance','four-insurance','severance','weekly-holiday-pay','wage','work-hours','overtime-pay','ordinary-wage','average-wage','annual-leave','annual-leave-pay','parental-leave','unemployment-benefit'],
    finance:['loan-interest','loan-schedule','savings-interest','installment','dsr','jeonse-loan','prepayment-fee','stock-leverage','stock-return','average-price','averaging-down','cagr','roi','compound-interest','national-pension','local-health-insurance','employee-health-insurance','housing-subscription','youth-account-switch','rental-yield','rent-conversion'],
    health:['bmi','bmr','calorie','water','exercise-calorie','target-weight','running-pace','calorie-deficit','body-fat','ovulation','menstrual-cycle','pregnancy-week'],
    realEstate:['area-conversion','real-estate-brokerage','real-estate-acquisition-tax','rental-yield','rent-conversion','jeonse-loan','interior-estimate','comprehensive-real-estate-tax','property-tax']
  };

  function typeOfSlug(){
    if(sensitive.tax.includes(slug))return 'tax';
    if(sensitive.labor.includes(slug))return 'labor';
    if(sensitive.finance.includes(slug))return 'finance';
    if(sensitive.health.includes(slug))return 'health';
    if(sensitive.realEstate.includes(slug))return 'realEstate';
    return 'general';
  }

  const riskCopy={
    tax:['세금·공제 결과 이용 안내','세법, 공제 요건, 신고 방식, 지방세 기준은 적용 시점과 개인 조건에 따라 달라질 수 있습니다. 이 계산기는 신고서 작성이나 세무 자문을 대신하지 않으며, 실제 신고·납부 전에는 국세청, 위택스, 지자체 또는 세무 전문가의 안내를 확인하세요.'],
    labor:['급여·노무 결과 이용 안내','근로계약, 사업장 규모, 근속기간, 평균임금 산정 방식, 보험료 상한액에 따라 실제 금액이 달라질 수 있습니다. 이 계산기는 노무·법률 자문이 아닌 참고용 계산이며, 분쟁이나 신고 전에는 공식 기관 또는 전문가의 검토가 필요합니다.'],
    finance:['금융 결과 이용 안내','금리, 수수료, 세금, 상품 약관, 심사 기준은 금융기관과 시점에 따라 달라질 수 있습니다. 이 계산 결과는 투자 권유나 대출 승인 가능성을 의미하지 않으며, 계약 전에는 상품설명서와 공식 약관을 확인하세요.'],
    health:['건강 계산 결과 이용 안내','건강 관련 계산 결과는 일반적인 공식과 입력값을 바탕으로 한 참고값입니다. 진단, 치료, 약물, 임신, 식단 처방을 대신하지 않으며, 통증·질환·급격한 변화가 있으면 의료 전문가와 상담하세요.'],
    realEstate:['부동산 계산 결과 이용 안내','부동산 세금, 중개보수, 면적 표기, 대출 조건은 지역, 주택 유형, 계약 조건, 정책 기준에 따라 달라질 수 있습니다. 계약·신고·대출 신청 전에는 계약서, 고지서, 공식 안내를 함께 확인하세요.'],
    general:['계산 결과 이용 안내','이 계산기는 사용자가 입력한 값을 기준으로 결과를 빠르게 확인하는 참고용 도구입니다. 중요한 일정, 금액, 계약, 신고에 활용할 때는 원자료와 공식 기준을 한 번 더 확인하세요.']
  };

  const topDetails={
    'salary':['월급 실수령액을 볼 때 놓치기 쉬운 항목',['비과세 식대, 차량유지비, 육아수당처럼 과세 제외 항목이 있으면 실수령액이 달라질 수 있습니다.','소득세는 부양가족 수와 간이세액표 적용 방식에 따라 달라집니다.','성과급이나 상여금은 월급과 별도로 계산되는 경우가 많아 급여명세서 기준을 확인해야 합니다.']],
    'annual-salary':['연봉을 비교할 때 확인할 점',['계약 연봉이 상여 포함인지 별도인지 먼저 확인하세요.','12개월, 13개월, 14개월 분할 지급 여부에 따라 월 수령액 체감이 달라집니다.','실수령액 비교는 월 비과세액과 예상 공제율을 함께 넣어 보는 것이 좋습니다.']],
    vat:['부가세 계산에서 자주 헷갈리는 기준',['공급가액 기준이면 부가세를 더하고, 부가세 포함 금액 기준이면 1.1로 나누어 공급가액을 구합니다.','면세, 간이과세, 영세율 거래는 일반 10% 계산과 다를 수 있습니다.','견적서나 세금계산서 작성 전에는 거래 유형과 공급가액 기준을 확인하세요.']],
    'loan-interest':['대출 이자 계산 전 체크리스트',['금리는 연 이자율 기준으로 입력해야 월 납입액이 맞게 계산됩니다.','중도상환수수료, 인지세, 보증료, 거치기간은 별도 비용으로 확인해야 합니다.','원리금균등과 원금균등은 총 이자와 초기 월 납입액이 크게 다릅니다.']],
    'savings-interest':['예금 이자 결과를 해석하는 방법',['표시 금리는 보통 연 이율이므로 예치 기간에 따라 실제 이자는 달라집니다.','세후 금액은 이자소득세 적용 여부에 따라 달라질 수 있습니다.','우대금리 조건을 충족하지 못하면 만기 수령액이 줄어들 수 있습니다.']],
    'area-conversion':['평수 계산에서 확인할 점',['아파트 광고의 평형은 공급면적 기준인 경우가 많고, 실제 생활 공간은 전용면적 기준으로 보는 것이 좋습니다.','1평은 일반적으로 3.305785㎡로 계산합니다.','전용률은 단지와 주택 유형에 따라 달라지므로 분양면적표와 등기 정보를 함께 확인하세요.']],
    bmi:['BMI 결과를 볼 때 주의할 점',['BMI는 키와 몸무게만 반영해 근육량과 체지방 분포를 구분하지 못합니다.','운동선수, 고령자, 임산부, 성장기 청소년은 일반 성인 기준과 다르게 해석해야 합니다.','건강 판단은 허리둘레, 혈압, 혈액검사 등 다른 지표와 함께 보는 것이 좋습니다.']],
    bmr:['기초대사량 계산 후 활용 방법',['BMR은 가만히 있어도 소비되는 에너지 추정치이며, 하루 섭취 목표는 활동량을 함께 반영해야 합니다.','감량 중에도 지나치게 낮은 섭취량은 지속하기 어렵고 건강에 부담이 될 수 있습니다.','운동량이나 체중 변화가 크면 주기적으로 다시 계산하세요.']],
    'd-day':['디데이 계산 기준 정하기',['시험, 계약, 여행 일정은 목표일 포함 여부에 따라 결과가 하루 차이 날 수 있습니다.','시간대가 다른 해외 일정은 현지 날짜 기준을 따로 확인하세요.','반복 일정은 날짜 계산기와 함께 사용하면 준비 기간을 나누기 좋습니다.']],
    percent:['퍼센트 계산 실수 줄이는 법',['증가율은 이전 값을 기준으로 하고, 할인율은 정가를 기준으로 합니다.','퍼센트포인트와 퍼센트 증감은 다른 개념입니다.','금액 계산에서는 반올림 단위가 최종 결제액에 영향을 줄 수 있습니다.']],
    discount:['할인율 결과를 볼 때 확인할 점',['쿠폰, 적립금, 배송비가 있으면 실제 체감 할인율은 달라질 수 있습니다.','정가가 실제 판매 기준인지, 임의로 높게 설정된 표시가인지 확인하세요.','여러 할인은 단순 합산이 아니라 순차 적용되는 경우가 많습니다.']],
    'four-insurance':['4대보험 계산 전 확인할 점',['보험료율과 상한액은 적용 연도에 따라 바뀔 수 있습니다.','비과세 급여와 보수월액 산정 방식에 따라 공제액이 달라집니다.','회사 부담분과 근로자 부담분을 구분해서 봐야 합니다.']],
    severance:['퇴직금 계산 전 필요한 정보',['퇴직금은 계속근로기간 1년 이상 여부가 핵심입니다.','최근 3개월 임금에 상여금, 연차수당이 어떻게 반영되는지 확인해야 합니다.','평균임금 산정 기간과 퇴사일 기준에 따라 결과가 달라질 수 있습니다.']],
    'weekly-holiday-pay':['주휴수당 확인 기준',['소정근로시간, 결근 여부, 근로계약상 근무일이 계산에 영향을 줍니다.','주 15시간 이상 요건과 개근 요건을 함께 봐야 합니다.','사업장·계약 형태별 적용 여부는 공식 노무 기준을 확인하세요.']],
    electricity:['전기요금 계산 결과 활용법',['누진 구간과 계절 구간에 따라 같은 사용량도 요금이 달라질 수 있습니다.','부가세, 전력산업기반기금, 복지할인 여부를 별도로 확인하세요.','실제 청구액은 검침일과 계약종별에 따라 달라질 수 있습니다.']],
    'car-tax':['자동차세 계산 전 확인할 점',['승용차, 영업용, 전기차 등 차종에 따라 과세 방식이 다릅니다.','차령 경감과 연납 공제율은 고지 시점에 따라 달라질 수 있습니다.','실제 고지액은 지자체 고지서를 우선 확인하세요.']],
    'capital-gains-tax':['양도소득세 계산 전 확인할 점',['1세대 1주택 비과세, 장기보유특별공제, 다주택 중과 여부가 결과를 크게 바꿉니다.','필요경비 인정 여부는 증빙과 거래 조건에 따라 달라집니다.','신고 전에는 세무 전문가 또는 국세청 안내를 확인하세요.']],
    'gift-tax':['증여세 계산 전 확인할 점',['10년 이내 동일인 증여 합산 여부가 공제액과 세액에 영향을 줍니다.','부담부증여, 비거주자, 세대생략 증여는 별도 판단이 필요합니다.','재산 평가액과 증빙 기준은 실제 신고에서 매우 중요합니다.']],
    'housing-subscription':['청약 가점 결과를 볼 때 주의할 점',['무주택기간, 부양가족, 청약통장 가입기간은 세부 인정 기준이 있습니다.','모집공고마다 우선공급, 특별공급, 지역 조건이 다를 수 있습니다.','가점은 당첨을 보장하지 않으며 경쟁률과 커트라인을 함께 봐야 합니다.']],
    'jeonse-loan':['전세대출 이자 계산 전 확인할 점',['대출 한도, 보증기관, 금리 유형, 보증료가 월 부담액에 영향을 줍니다.','변동금리는 향후 금리 변동에 따라 이자가 달라질 수 있습니다.','실제 승인 여부와 금리는 금융기관 심사 결과를 따라야 합니다.']]
  };

  function appendTopDetail(){
    if(root.querySelector('.top-calculator-detail'))return;
    const detail=topDetails[slug];
    if(!detail)return;
    root.insertAdjacentHTML('beforeend',`<section class="content-block top-calculator-detail"><h2>${detail[0]}</h2><ul>${detail[1].map(item=>`<li>${item}</li>`).join('')}</ul></section>`);
  }

  function appendRiskNotice(){
    if(root.querySelector('.legal-risk-notice'))return;
    const copy=riskCopy[typeOfSlug()];
    root.insertAdjacentHTML('beforeend',`<section class="content-block legal-risk-notice"><h2>${copy[0]}</h2><p>${copy[1]}</p></section>`);
  }

  window.addEventListener('load',()=>{appendTopDetail();appendRiskNotice();});
  setTimeout(()=>{appendTopDetail();appendRiskNotice();},360);
})();

// 애드센스 승인 전 핵심 계산기 10개 보강: 실제 예시와 해석 기준을 짧고 유용하게 추가합니다.
(function enhanceCoreCalculatorExamples(){
  const root=document.querySelector('#calculator');
  if(!root)return;
  const slug=
    document.body.dataset.calculator||
    document.body.dataset.customCalculator||
    document.body.dataset.advancedCalculator||
    document.body.dataset.batch||
    document.body.dataset.misc||
    document.body.dataset.taxCalculator||
    document.body.dataset.propertyLaborCalculator||
    '';
  if(!slug)return;

  const examples={
    percent:{
      title:'퍼센트 계산 예시와 해석',
      body:'예를 들어 80,000원의 15%는 12,000원입니다. 반대로 12,000원이 80,000원에서 차지하는 비율을 구하면 15%입니다. 할인, 수수료, 증가율처럼 기준값이 무엇인지 먼저 정하면 결과를 잘못 해석할 가능성이 줄어듭니다.',
      points:['부분값 = 기준값 × 퍼센트 ÷ 100','비율 = 부분값 ÷ 기준값 × 100','증가율은 이전 값, 할인율은 정가를 기준으로 보는 것이 일반적입니다.']
    },
    discount:{
      title:'할인율 계산 예시와 해석',
      body:'정가가 120,000원이고 할인율이 25%라면 할인 금액은 30,000원, 결제 기준 가격은 90,000원입니다. 쿠폰, 적립금, 배송비가 따로 있으면 실제 결제 금액과 체감 할인율은 달라질 수 있습니다.',
      points:['할인 금액 = 정가 × 할인율 ÷ 100','할인 후 가격 = 정가 - 할인 금액','여러 할인은 단순 합산보다 순차 적용되는 경우가 많습니다.']
    },
    salary:{
      title:'월급 실수령액 계산 예시와 해석',
      body:'월 세전 급여가 3,000,000원이라도 4대보험, 소득세, 지방소득세, 비과세 항목에 따라 실제 입금액은 달라집니다. 이 계산기는 급여명세서를 받기 전 대략적인 월 현금흐름을 가늠할 때 쓰는 참고용 도구입니다.',
      points:['비과세액이 있으면 과세 대상 급여가 줄어 실수령액이 달라질 수 있습니다.','부양가족 수와 간이세액표 적용 방식에 따라 소득세가 달라질 수 있습니다.','성과급, 상여금, 식대, 차량유지비는 회사 급여 규정을 함께 확인하세요.']
    },
    gpa:{
      title:'학점 계산 예시와 해석',
      body:'3학점 과목에서 A0, 2학점 과목에서 B+를 받았다면 단순 평균이 아니라 학점 수를 곱한 가중 평균으로 평점이 계산됩니다. 과목별 학점이 다를수록 학점 수가 큰 과목의 성적이 평균에 더 크게 반영됩니다.',
      points:['평균 평점 = 과목별 평점 × 학점의 합 ÷ 전체 학점','P/F 과목은 학교 기준에 따라 평점 평균에서 제외될 수 있습니다.','4.5 만점과 4.3 만점은 환산 기준이 다르므로 학교 성적표 기준을 확인하세요.']
    },
    'd-day':{
      title:'디데이 계산 예시와 해석',
      body:'오늘이 6월 1일이고 목표일이 6월 10일이면 목표일 포함 여부에 따라 남은 날짜가 다르게 보일 수 있습니다. 시험, 여행, 계약처럼 날짜 기준이 중요한 일정은 목표일을 포함할지 먼저 정하는 것이 좋습니다.',
      points:['목표일 미포함은 기준일과 목표일 사이의 간격을 봅니다.','목표일 포함은 준비 기간이나 행사일까지 남은 전체 날짜를 세고 싶을 때 유용합니다.','해외 일정은 현지 날짜와 시간대를 따로 확인하세요.']
    },
    'dutch-pay':{
      title:'더치페이 계산 예시와 해석',
      body:'식사 58,000원, 카페 16,000원을 4명이 나누면 총 74,000원을 기준으로 1인당 18,500원입니다. 100원 또는 1,000원 단위로 올림 정산하면 남는 차액이 생길 수 있으므로 결과의 정산 차액도 함께 확인하세요.',
      points:['총 정산 금액 = 입력한 항목 금액의 합계','1인당 부담액 = 총 정산 금액 ÷ 전체 인원수','올림 단위를 적용하면 실제 걷는 총액이 원래 금액보다 조금 커질 수 있습니다.']
    },
    'area-conversion':{
      title:'평수 계산 예시와 해석',
      body:'84㎡를 평으로 바꾸면 약 25.4평입니다. 다만 아파트에서 말하는 평형은 공급면적 기준인 경우가 많고, 실제 생활 공간은 전용면적 기준으로 보는 것이 더 자연스러울 수 있습니다.',
      points:['평 = 제곱미터 ÷ 3.305785','제곱미터 = 평 × 3.305785','전용률은 단지, 주택 유형, 공용면적 구성에 따라 달라집니다.']
    },
    vat:{
      title:'부가세 계산 예시와 해석',
      body:'공급가액이 100,000원이면 일반적인 10% 부가세는 10,000원이고 합계 금액은 110,000원입니다. 반대로 부가세 포함 금액이 110,000원이라면 공급가액은 100,000원으로 볼 수 있습니다.',
      points:['부가세 = 공급가액 × 10%','합계 금액 = 공급가액 × 1.1','면세, 영세율, 간이과세 거래는 일반 10% 계산과 다를 수 있습니다.']
    },
    'loan-interest':{
      title:'대출 이자 계산 예시와 해석',
      body:'대출 원금 10,000,000원에 연 4.8% 금리를 단순 월 이자로 보면 한 달 이자는 약 40,000원입니다. 실제 대출은 상환 방식, 거치기간, 중도상환수수료, 보증료에 따라 월 부담액이 달라질 수 있습니다.',
      points:['단순 월 이자 = 대출 원금 × 연 이자율 ÷ 12','원리금균등은 월 납입액이 비교적 일정합니다.','원금균등은 초기 납입액이 크지만 총 이자가 줄어드는 경우가 많습니다.']
    },
    'savings-interest':{
      title:'예금 이자 계산 예시와 해석',
      body:'1,000만 원을 연 3.5%로 12개월 예치하면 세전 이자는 약 350,000원입니다. 세후 수령액은 이자소득세 적용 여부와 상품별 우대금리 조건에 따라 달라질 수 있습니다.',
      points:['세전 이자 = 원금 × 연 이자율 × 예치개월 ÷ 12','일반 과세 상품은 이자소득세를 반영하면 실제 수령 이자가 줄어듭니다.','중도해지나 우대금리 미충족 시 예상 결과와 다를 수 있습니다.']
    }
  };

  function append(){
    if(root.querySelector('.core-calculator-example'))return;
    const data=examples[slug];
    if(!data)return;
    root.insertAdjacentHTML('beforeend',`<section class="content-block core-calculator-example"><h2>${data.title}</h2><p>${data.body}</p><ul>${data.points.map(item=>`<li>${item}</li>`).join('')}</ul></section>`);
  }

  window.addEventListener('load',append);
  setTimeout(append,420);
})();

// 애드센스 신청 전 핵심 유입 계산기 10개 보강: 페이지별 예시와 FAQ를 추가합니다.
(function enhanceAdSensePriorityCalculators(){
  const root=document.querySelector('#calculator');
  if(!root)return;
  const slug=
    document.body.dataset.calculator||
    document.body.dataset.customCalculator||
    document.body.dataset.advancedCalculator||
    document.body.dataset.batch||
    document.body.dataset.misc||
    document.body.dataset.taxCalculator||
    document.body.dataset.propertyLaborCalculator||
    '';
  if(!slug||root.querySelector('.adsense-priority-faq'))return;

  const data={
    'annual-salary':{
      example:'연봉 4,800만원은 단순히 12로 나누면 월 400만원입니다. 다만 실제 입금액은 비과세 항목, 4대보험, 소득세, 상여금 지급 방식에 따라 달라집니다.',
      tips:['연봉에 상여금과 식대가 포함되어 있는지 먼저 확인하세요.','월급처럼 비교하려면 12개월 기준 금액과 실제 지급 월수를 함께 봐야 합니다.','세후 금액은 회사 급여 규정과 개인 공제 조건에 따라 달라질 수 있습니다.'],
      faq:[['연봉 계산기는 세후 금액까지 정확히 보여주나요?','세전 기준 비교와 대략적인 월 환산을 돕는 도구입니다. 정확한 세후 금액은 월급 실수령액 계산기나 실제 급여명세서 기준으로 확인하는 것이 좋습니다.'],['상여금이 있는 연봉은 어떻게 봐야 하나요?','계약서에 적힌 상여금 포함 여부와 지급 월수를 확인한 뒤 연 총액과 월평균을 함께 비교하세요.']]
    },
    salary:{
      example:'월 세전 급여 300만원이라도 비과세액, 부양가족 수, 4대보험 적용 기준에 따라 실수령액은 달라집니다. 이 계산기는 급여 구조를 빠르게 가늠하는 참고용입니다.',
      tips:['비과세 식대나 차량유지비가 있으면 과세 대상 급여가 줄어듭니다.','소득세는 간이세액표와 개인 조건에 따라 달라질 수 있습니다.','성과급, 야근수당, 상여금은 월급과 별도로 계산되는 경우가 많습니다.'],
      faq:[['급여명세서와 금액이 다를 수 있나요?','네. 회사별 공제 방식, 비과세 처리, 부양가족 수, 추가 수당에 따라 실제 급여명세서와 차이가 날 수 있습니다.'],['월급 실수령액은 언제 확인하면 좋나요?','이직, 연봉 협상, 대출 상환 계획, 생활비 예산을 세울 때 대략적인 현금흐름을 보기 좋습니다.']]
    },
    'four-insurance':{
      example:'4대보험은 국민연금, 건강보험, 장기요양보험, 고용보험을 함께 봐야 합니다. 같은 월급이라도 비과세액과 적용 기준에 따라 근로자 부담액이 달라질 수 있습니다.',
      tips:['보험료율과 상한액은 시점에 따라 바뀔 수 있습니다.','건강보험료와 장기요양보험료는 연결되어 계산됩니다.','정확한 금액은 공단 고지서나 급여명세서를 기준으로 확인하세요.'],
      faq:[['4대보험 계산 결과가 실제 공제액과 다를 수 있나요?','네. 보수월액 신고, 비과세 항목, 사업장 처리 방식에 따라 차이가 날 수 있어 참고용으로 보는 것이 안전합니다.'],['사업주 부담분도 같은 금액인가요?','항목마다 근로자와 사업주 부담 기준이 다릅니다. 실제 사업장 비용은 사업주 부담분을 별도로 확인해야 합니다.']]
    },
    severance:{
      example:'퇴직금은 일반적으로 계속근로기간 1년 이상인 경우 평균임금을 기준으로 계산합니다. 최근 3개월 임금 합계와 재직 기간이 결과에 큰 영향을 줍니다.',
      tips:['상여금, 연차수당, 수당 포함 여부에 따라 평균임금이 달라질 수 있습니다.','입사일과 퇴사일을 정확히 입력해야 근속일수 오차를 줄일 수 있습니다.','분쟁이나 정산 전에는 회사 인사팀 또는 고용노동부 안내를 함께 확인하세요.'],
      faq:[['퇴직금 계산 결과를 그대로 청구해도 되나요?','이 계산기는 예상액 확인용입니다. 실제 청구나 분쟁에는 평균임금 산정 자료와 공식 기준 확인이 필요합니다.'],['1년 미만 근무해도 퇴직금이 나오나요?','일반적으로 계속근로기간 1년 이상이 중요한 기준입니다. 예외나 특수한 계약은 별도 확인이 필요합니다.']]
    },
    'area-conversion':{
      example:'84㎡는 약 25.4평입니다. 다만 아파트 광고의 평형은 공급면적 기준인 경우가 많아 실제 생활 공간인 전용면적과 차이가 날 수 있습니다.',
      tips:['1평은 일반적으로 3.305785㎡ 기준으로 계산합니다.','전용률을 반영하면 공급면적과 전용면적의 차이를 함께 볼 수 있습니다.','분양면적, 계약면적, 전용면적 표기는 서로 다를 수 있습니다.'],
      faq:[['평수와 제곱미터 중 어떤 기준을 봐야 하나요?','실제 거주 공간은 전용면적을 중심으로 보고, 광고나 분양 표기는 공급면적 기준인지 함께 확인하는 것이 좋습니다.'],['전용률은 꼭 입력해야 하나요?','아닙니다. 단순 ㎡와 평 변환만 필요하면 전용률을 제외하고 계산해도 됩니다.']]
    },
    'loan-interest':{
      example:'대출 원금 1,000만원, 연 4.8%라면 단순 월 이자는 약 4만원입니다. 실제 월 납입액은 상환 방식과 기간에 따라 달라집니다.',
      tips:['원리금균등, 원금균등, 만기일시상환은 월 납입액 흐름이 다릅니다.','중도상환수수료, 보증료, 인지세는 별도로 확인해야 합니다.','금리가 변동형이면 향후 월 부담액이 달라질 수 있습니다.'],
      faq:[['대출 가능 여부도 알 수 있나요?','아닙니다. 이 계산기는 이자와 상환 부담을 가늠하는 도구이며, 실제 승인 여부는 금융기관 심사에 따릅니다.'],['총이자가 왜 상환 방식마다 다른가요?','원금을 얼마나 빨리 갚는지에 따라 남은 원금이 달라지고, 그에 따라 발생하는 이자도 달라집니다.']]
    },
    bmi:{
      example:'키 170cm, 몸무게 65kg이면 BMI는 약 22.5입니다. BMI는 키와 몸무게만 반영하므로 근육량, 체지방률, 연령은 따로 고려해야 합니다.',
      tips:['운동선수나 근육량이 많은 사람은 BMI가 높게 나와도 해석이 다를 수 있습니다.','건강 판단은 허리둘레, 혈압, 혈액검사 등 다른 지표와 함께 봐야 합니다.','질환이나 급격한 체중 변화가 있다면 의료 전문가와 상담하세요.'],
      faq:[['BMI만으로 비만 여부를 확정할 수 있나요?','아닙니다. BMI는 선별 지표에 가깝고, 개인의 체성분과 건강 상태를 모두 설명하지는 못합니다.'],['어린이와 청소년도 같은 기준을 쓰나요?','성장기에는 연령과 성별에 따른 기준이 따로 필요할 수 있어 일반 성인 기준과 다르게 봐야 합니다.']]
    },
    'd-day':{
      example:'오늘부터 시험일까지 남은 날을 계산할 때 목표일 포함 여부에 따라 결과가 하루 차이 날 수 있습니다. 시험, 여행, 계약처럼 기준이 중요한 일정은 포함 기준을 먼저 정하세요.',
      tips:['목표일 포함은 실제 준비 가능한 날짜 수를 셀 때 유용합니다.','지난 날짜를 입력하면 D+ 형식으로 경과일을 확인할 수 있습니다.','해외 일정은 현지 날짜와 시차를 함께 확인하는 것이 좋습니다.'],
      faq:[['D-day가 하루 다르게 보이는 이유는 무엇인가요?','시작일이나 목표일을 포함하는지에 따라 하루 차이가 생길 수 있습니다.'],['시험 일정에도 사용할 수 있나요?','네. 시험일, 접수 마감일, 발표일처럼 기준 날짜가 분명한 일정에 활용하기 좋습니다.']]
    },
    percent:{
      example:'80,000원의 15%는 12,000원입니다. 반대로 12,000원이 80,000원의 몇 퍼센트인지 계산하면 15%입니다.',
      tips:['증가율은 이전 값을 기준으로 계산합니다.','할인율은 보통 정가를 기준으로 계산합니다.','퍼센트포인트와 퍼센트 증감은 서로 다른 개념입니다.'],
      faq:[['퍼센트와 퍼센트포인트는 다른가요?','네. 10%에서 12%로 오른 것은 2퍼센트포인트 상승이고, 비율로는 20% 증가입니다.'],['금액 계산에서 반올림은 어떻게 보나요?','실제 결제나 정산에서는 원 단위, 10원 단위, 100원 단위 등 적용 기준에 따라 결과가 달라질 수 있습니다.']]
    },
    vat:{
      example:'공급가액 100,000원에 부가세 10%를 더하면 합계는 110,000원입니다. 부가세 포함 금액 110,000원에서 공급가액을 구할 때는 1.1로 나눕니다.',
      tips:['공급가액 기준이면 10%를 더합니다.','부가세 포함 금액 기준이면 1.1로 나누어 공급가액을 구합니다.','면세, 영세율, 간이과세 거래는 일반 계산과 다를 수 있습니다.'],
      faq:[['모든 거래에 부가세 10%가 붙나요?','아닙니다. 면세, 영세율, 간이과세 등 거래 유형에 따라 기준이 달라질 수 있습니다.'],['견적서에는 어떤 금액을 적어야 하나요?','보통 공급가액, 부가세, 합계 금액을 분리해 적으면 기준이 명확해집니다.']]
    }
  };

  function append(){
    if(root.querySelector('.adsense-priority-faq'))return;
    const page=data[slug];
    if(!page)return;
    const title=root.querySelector('h1')?.textContent?.trim()||'계산기';
    const faqHtml=page.faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
    root.insertAdjacentHTML('beforeend',`
      <section class="content-block adsense-priority-faq">
        <h2>${title} 사용 예시</h2>
        <p>${page.example}</p>
        <ul>${page.tips.map(item=>`<li>${item}</li>`).join('')}</ul>
        <h2>${title} 자주 묻는 질문</h2>
        ${faqHtml}
      </section>`);
  }

  window.addEventListener('load',append);
  setTimeout(append,900);
  setTimeout(append,1600);
})();

// 2차 후보 실사용형 개선: 단순 산식 계산기를 판단 가능한 계산기로 보강합니다.
(function(){
  const slug =
    document.body.dataset.calculator ||
    document.body.dataset.customCalculator ||
    document.body.dataset.advancedCalculator ||
    '';
  const targets = ['salary','margin','jeonse-loan','car-installment','monthly-rent-deduction','housing-subscription'];
  if(!targets.includes(slug)) return;

  const root = document.querySelector('#calculator');
  if(!root) return;

  const category = {
    salary:['money','금융'],
    margin:['business','업무'],
    'jeonse-loan':['money','금융'],
    'car-installment':['money','금융'],
    'monthly-rent-deduction':['money','금융'],
    'housing-subscription':['money','금융']
  }[slug];

  const navItems = [
    ['money','금융'],['education','교육'],['health','건강'],['life','생활'],['business','업무']
  ];
  const more = `<a class="calculator-home category-more-link" href="/categories/${category[0]}.html">${category[1]} 카테고리 더보기</a>`;
  const won = n => Math.round(Number(n)||0).toLocaleString('ko-KR') + '원';
  const pct = n => (Number(n)||0).toFixed(2).replace(/\.00$/,'') + '%';
  const num = id => Number(root.querySelector('#'+id)?.value || 0);
  const val = id => root.querySelector('#'+id)?.value || '';
  const card = (label,value,small='') => `<div><span>${label}</span><b>${value}</b>${small?`<small>${small}</small>`:''}</div>`;
  const field = (id,label,ex,step='any') => `<label><span>${label}</span><input id="${id}" type="number" min="0" step="${step}" placeholder="예: ${ex}" inputmode="decimal"></label>`;
  const select = (id,label,options) => `<label><span>${label}</span><select id="${id}">${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;
  const shell = (title,lead,inputs,note,guide) => {
    root.innerHTML = `${more}<h1>${title}</h1><p class="lead">${lead}</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${inputs}</div><button class="primary-btn" id="calc2" type="button">계산하기</button></div><div class="result" id="result2" aria-live="polite"></div><p class="calculator-note">${note}</p></section><section class="content-block">${guide}</section>`;
  };
  const show = html => {
    const result = root.querySelector('#result2');
    result.innerHTML = html;
    result.classList.add('show');
  };

  if(slug==='salary'){
    const simpleField=(id,label,ex)=>`<label><span>${label}</span><input id="${id}" type="number" min="0" step="any" placeholder="예: ${ex}" inputmode="decimal"></label>`;
    root.innerHTML = `${more}<h1>월급 실수령액 계산기</h1><p class="lead">월 세전 급여만 입력해도 예상 실수령액을 바로 계산합니다. 필요하면 비과세액과 공제율을 직접 조정할 수 있습니다.</p><section class="calculator-box utility-box salary-simple-box"><div class="salary-quick"><h2>간편 계산</h2><p>대부분의 사용자는 월 세전 급여만 입력하고 계산하면 됩니다.</p><div class="utility-fields">${simpleField('sal-gross','월 세전 급여(원)','3000000')}${simpleField('sal-nontax','월 비과세액(원, 선택)','200000')}</div></div><details class="salary-advanced"><summary>고급 설정 열기 <span>4대보험·세금 비율 직접 조정</span></summary><div class="salary-advanced-grid">${simpleField('sal-pension','국민연금(%)','4.5')}${simpleField('sal-health','건강보험(%)','3.545')}${simpleField('sal-care','장기요양: 건강보험료 대비(%)','12.95')}${simpleField('sal-employment','고용보험(%)','0.9')}${simpleField('sal-tax','간이 소득세율(%)','2.5')}</div><p>비율을 비워두면 기본값으로 계산합니다. 실제 급여명세서와 맞추고 싶을 때만 수정하세요.</p></details><div class="salary-actions"><button class="primary-btn" id="calc2" type="button">실수령액 계산하기</button></div><div class="result" id="result2" aria-live="polite"></div><p class="calculator-note">소득세는 간이세액표, 부양가족 수, 비과세 항목에 따라 달라집니다. 이 계산기는 월급 구조를 빠르게 확인하는 참고용입니다.</p></section><section class="content-block"><h2>월급 실수령액 계산 전 알아둘 점</h2><p>국민연금·건강보험·고용보험은 과세 대상 급여를 기준으로 추정하고, 지방소득세는 소득세의 10%로 계산합니다. 정확한 급여명세서는 회사 급여 규정과 최신 세액표를 확인하세요.</p></section>`;
    root.querySelector('#calc2').onclick = () => {
      const gross=num('sal-gross'), nontax=num('sal-nontax');
      const taxable=Math.max(0,gross-nontax);
      if(!gross) return show('<strong>월 세전 급여를 입력해 주세요</strong><p>급여가 있어야 실수령액을 계산할 수 있습니다.</p>');
      const rate=(id,base)=>Number(root.querySelector('#'+id)?.value||base);
      const pension=taxable*rate('sal-pension',4.5)/100;
      const health=taxable*rate('sal-health',3.545)/100;
      const care=health*rate('sal-care',12.95)/100;
      const employment=taxable*rate('sal-employment',0.9)/100;
      const incomeTax=taxable*rate('sal-tax',2.5)/100;
      const localTax=incomeTax*0.1;
      const deduct=pension+health+care+employment+incomeTax+localTax;
      const net=gross-deduct;
      show(`<div class="savings-result-grid salary-result-grid">${card('예상 월 실수령액',won(net))}${card('월 총 공제액',won(deduct))}${card('세전 급여 대비',((net/gross)*100).toFixed(1)+'%')}${card('과세 기준 급여',won(taxable))}</div><details class="salary-deduction-detail" open><summary>공제 항목 자세히 보기</summary><table class="rate-table"><tbody><tr><td>국민연금</td><td>${won(pension)}</td></tr><tr><td>건강보험</td><td>${won(health)}</td></tr><tr><td>장기요양</td><td>${won(care)}</td></tr><tr><td>고용보험</td><td>${won(employment)}</td></tr><tr><td>간이 소득세</td><td>${won(incomeTax)}</td></tr><tr><td>지방소득세</td><td>${won(localTax)}</td></tr></tbody></table></details><p>처음 계산이라면 기본값 그대로 사용해도 됩니다. 실제 급여명세서와 차이가 크면 고급 설정에서 비과세액이나 세율을 조정해 보세요.</p>`);
    };
  }

  if(slug==='margin'){
    shell(
      '마진율 계산기',
      '판매가, 매입원가, 플랫폼 수수료, 결제 수수료, 배송·광고비를 반영해 실제 상품 이익과 손익분기 판매가를 계산합니다.',
      field('mg-price','판매가(원)','50000') +
      field('mg-cost','매입원가(원)','30000') +
      field('mg-platform','플랫폼 수수료율(%)','8') +
      field('mg-payment','결제 수수료율(%)','3') +
      field('mg-shipping','건당 배송·포장비(원)','3000') +
      field('mg-ad','건당 광고비·쿠폰비(원)','2000') +
      select('mg-vat','판매가 부가세 처리',[['included','판매가에 부가세 포함'],['excluded','판매가가 공급가액']]),
      '수수료 부과 기준과 부가세 처리 방식은 쇼핑몰·플랫폼마다 다릅니다. 입점 수수료, 반품비, 정산 보류금은 별도로 확인하세요.',
      '<h2>마진율을 볼 때 중요한 기준</h2><p>판매가 기준 마진율만 보면 실제 이익을 과대평가하기 쉽습니다. 원가 외에도 플랫폼 수수료, 결제 수수료, 배송비, 광고비, 쿠폰비를 함께 넣어야 상품별 손익 판단이 가능합니다.</p>'
    );
    root.querySelector('#calc2').onclick = () => {
      const price=num('mg-price'), cost=num('mg-cost'), feeRate=(num('mg-platform')+num('mg-payment'))/100;
      if(!price) return show('<strong>판매가를 입력해 주세요</strong>');
      const revenue=val('mg-vat')==='included' ? price/1.1 : price;
      const fees=price*feeRate;
      const variable=cost+fees+num('mg-shipping')+num('mg-ad');
      const profit=revenue-variable;
      const margin=revenue ? profit/revenue*100 : 0;
      const markup=cost ? profit/cost*100 : 0;
      const breakEvenSupply=(cost+num('mg-shipping')+num('mg-ad'))/(1-feeRate || 1);
      const breakEven=val('mg-vat')==='included' ? breakEvenSupply*1.1 : breakEvenSupply;
      show(`<div class="savings-result-grid">${card('건당 예상 이익',won(profit))}${card('실질 마진율',pct(margin))}${card('원가 대비 이익률',pct(markup))}${card('손익분기 판매가',won(breakEven))}</div><table class="rate-table"><tbody><tr><td>매출 기준액</td><td>${won(revenue)}</td></tr><tr><td>수수료 합계</td><td>${won(fees)}</td></tr><tr><td>총 변동비</td><td>${won(variable)}</td></tr><tr><td>부가세 처리</td><td>${val('mg-vat')==='included'?'판매가 포함':'공급가액 입력'}</td></tr></tbody></table>`);
    };
  }

  if(slug==='jeonse-loan'){
    shell(
      '전세대출 이자 계산기',
      '전세보증금, 대출금, 금리, 기간, 상환방식을 기준으로 월 부담액과 총 이자를 계산합니다.',
      field('jl-deposit','전세보증금(원)','300000000') +
      field('jl-loan','대출금(원)','200000000') +
      field('jl-rate','연 이자율(%)','3.8') +
      field('jl-months','대출 기간(개월)','24','1') +
      field('jl-income','연소득(원, 선택)','50000000') +
      select('jl-method','상환방식',[['interest','만기일시: 이자만 납부'],['amortized','원리금균등']]),
      '보증료, 인지세, 중도상환수수료, 금리 변동은 반영하지 않습니다. 실제 전세대출 가능액과 금리는 금융기관 심사 결과에 따라 달라집니다.',
      '<h2>전세대출 이자 확인 포인트</h2><p>만기일시 상환은 매달 이자만 내므로 월 부담은 낮지만 원금은 만기에 그대로 남습니다. 원리금균등은 매달 원금과 이자를 함께 갚아 총 이자와 잔액이 줄어드는 구조입니다.</p>'
    );
    root.querySelector('#calc2').onclick = () => {
      const loan=num('jl-loan'), rate=num('jl-rate')/1200, months=num('jl-months')||1;
      if(!loan) return show('<strong>대출금을 입력해 주세요</strong>');
      const monthlyInterest=loan*rate;
      const monthly=val('jl-method')==='amortized' ? (rate ? loan*rate*Math.pow(1+rate,months)/(Math.pow(1+rate,months)-1) : loan/months) : monthlyInterest;
      const totalPay=val('jl-method')==='amortized' ? monthly*months : monthlyInterest*months+loan;
      const totalInterest=val('jl-method')==='amortized' ? totalPay-loan : monthlyInterest*months;
      const ltv=num('jl-deposit') ? loan/num('jl-deposit')*100 : 0;
      const burden=num('jl-income') ? monthly*12/num('jl-income')*100 : 0;
      show(`<div class="savings-result-grid">${card('월 예상 부담액',won(monthly))}${card('총 이자',won(totalInterest),`${months}개월 기준`)}${card('보증금 대비 대출비율',pct(ltv))}${card('연소득 대비 월부담',num('jl-income')?pct(burden):'-')}</div><p>${val('jl-method')==='interest'?'만기일시 상환 기준으로 월 이자만 표시했습니다. 원금은 만기에 별도 상환해야 합니다.':'원리금균등 상환 기준으로 매월 같은 금액을 내는 방식입니다.'}</p>`);
    };
  }

  if(slug==='car-installment'){
    shell(
      '자동차 할부 계산기',
      '차량 가격, 선수금, 취득세·부대비용, 금리, 기간, 유예금을 반영해 월 할부금과 총 구매비용을 계산합니다.',
      field('ci-price','차량 가격(원)','35000000') +
      field('ci-down','선수금(원)','5000000') +
      field('ci-fee','취득세·등록비 등 초기비용(원)','2500000') +
      field('ci-rate','연 할부 금리(%)','5.5') +
      field('ci-months','할부 기간(개월)','60','1') +
      field('ci-balloon','만기 유예금·잔존가치(원)','0'),
      '자동차 할부 상품의 실제 비용은 캐피탈 수수료, 보험료, 탁송료, 옵션, 중도상환 조건에 따라 달라질 수 있습니다.',
      '<h2>자동차 할부를 비교할 때</h2><p>월 납입액만 낮으면 좋아 보이지만 유예금이 있으면 만기 때 큰 금액이 남을 수 있습니다. 총 이자, 초기 현금, 만기 잔액을 함께 확인해야 실제 부담을 알 수 있습니다.</p>'
    );
    root.querySelector('#calc2').onclick = () => {
      const principal=Math.max(0,num('ci-price')-num('ci-down')-num('ci-balloon'));
      const months=num('ci-months')||1, r=num('ci-rate')/1200;
      if(!num('ci-price')) return show('<strong>차량 가격을 입력해 주세요</strong>');
      const monthly=r ? principal*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1) : principal/months;
      const interest=monthly*months-principal;
      const initial=num('ci-down')+num('ci-fee');
      const total=initial+monthly*months+num('ci-balloon');
      show(`<div class="savings-result-grid">${card('월 할부금',won(monthly))}${card('총 이자',won(interest))}${card('초기 필요 현금',won(initial))}${card('총 구매 부담액',won(total))}</div><p>할부 원금은 차량가에서 선수금과 유예금을 제외한 ${won(principal)} 기준입니다. 유예금은 만기 상환 또는 재할부가 필요할 수 있습니다.</p>`);
    };
  }

  if(slug==='monthly-rent-deduction'){
    shell(
      '월세 세액공제 계산기',
      '월세, 거주 개월, 연 총급여, 무주택 여부를 입력해 월세 세액공제 예상액과 인정 월세 한도를 확인합니다.',
      field('mr-rent','월세(원)','600000') +
      field('mr-months','거주 개월 수','12','1') +
      field('mr-salary','연 총급여(원)','50000000') +
      field('mr-cap','연 월세 인정 한도(원)','7500000') +
      select('mr-house','무주택 세대 여부',[['yes','무주택'],['no','무주택 아님']]),
      '월세 세액공제는 총급여, 주택 요건, 계약자·전입신고, 납부 증빙 등 요건에 따라 달라집니다. 신고 전 국세청 기준을 확인하세요.',
      '<h2>월세 세액공제 자동 공제율</h2><p>간편 계산 기준으로 연 총급여 5,500만 원 이하는 17%, 7,000만 원 이하는 15%, 그 초과 또는 무주택이 아니면 0%로 계산합니다.</p>'
    );
    root.querySelector('#calc2').onclick = () => {
      const annualRent=num('mr-rent')*(num('mr-months')||0), salary=num('mr-salary'), cap=num('mr-cap')||7500000;
      if(!annualRent || !salary) return show('<strong>월세와 연 총급여를 입력해 주세요</strong>');
      const rate=val('mr-house')==='yes' ? (salary<=55000000 ? 0.17 : salary<=70000000 ? 0.15 : 0) : 0;
      const eligible=Math.min(annualRent,cap);
      const credit=eligible*rate;
      show(`<div class="savings-result-grid">${card('예상 세액공제',won(credit))}${card('적용 공제율',pct(rate*100))}${card('연간 납부 월세',won(annualRent))}${card('인정 월세액',won(eligible))}</div><p>${rate>0?'입력 조건 기준으로 공제 가능성이 있는 구간입니다.':'총급여 또는 무주택 조건 때문에 공제액을 0원으로 계산했습니다.'}</p>`);
    };
  }

  if(slug==='housing-subscription'){
    shell(
      '청약 가점 계산기',
      '무주택 기간, 부양가족 수, 청약통장 가입기간을 입력해 청약 가점 총점과 항목별 점수를 계산합니다.',
      field('hs-house','무주택 기간(년)','5','1') +
      field('hs-family','부양가족 수','2','1') +
      field('hs-account','청약통장 가입기간(년)','7','1'),
      '청약 가점은 세대 구성, 무주택 인정 기준, 지역·주택 유형, 특별공급 여부에 따라 달라질 수 있습니다. 이 계산기는 일반공급 가점제 이해를 돕는 참고용입니다.',
      '<h2>청약 가점 항목</h2><p>청약 가점은 일반적으로 무주택 기간 최대 32점, 부양가족 수 최대 35점, 청약통장 가입기간 최대 17점, 총 84점 구조로 봅니다.</p>'
    );
    root.querySelector('#calc2').onclick = () => {
      const house=Math.max(0,num('hs-house')), family=Math.max(0,num('hs-family')), account=Math.max(0,num('hs-account'));
      const houseScore=house<1 ? 2 : Math.min(32,2+Math.floor(house)*2);
      const familyScore=Math.min(35,5+Math.floor(family)*5);
      const accountScore=account<0.5 ? 1 : Math.min(17,2+Math.floor(account));
      const total=houseScore+familyScore+accountScore;
      show(`<div class="savings-result-grid">${card('예상 청약 가점',total+'점 / 84점')}${card('무주택 기간 점수',houseScore+'점')}${card('부양가족 점수',familyScore+'점')}${card('통장 가입기간 점수',accountScore+'점')}</div><table class="rate-table"><tbody><tr><td>무주택 기간</td><td>${house}년 입력 · 최대 32점</td></tr><tr><td>부양가족 수</td><td>${family}명 입력 · 최대 35점</td></tr><tr><td>청약통장</td><td>${account}년 입력 · 최대 17점</td></tr></tbody></table>`);
    };
  }
})();

// 기본 계산기 중 결과가 단순했던 항목을 실용형 화면으로 교체합니다.
(function(){
  const key = document.body.dataset.calculator;
  const root = document.querySelector('#calculator');
  if(!key || !root) return;
  const targets = ['unit','wage','work-hours','average-score','school-grade','target-weight'];
  if(!targets.includes(key)) return;
  const won = n => Math.round(Number(n)||0).toLocaleString('ko-KR') + '원';
  const num = id => Number(root.querySelector('#'+id)?.value || 0);
  const val = id => root.querySelector('#'+id)?.value || '';
  const card = (label,value) => `<div><span>${label}</span><b>${value}</b></div>`;
  const field = (id,label,ex,type='number') => `<label><span>${label}</span><input id="${id}" type="${type}" placeholder="예: ${ex}" inputmode="decimal"></label>`;
  const select = (id,label,opts) => `<label><span>${label}</span><select id="${id}">${opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label>`;
  const cat = key==='unit' ? ['life','생활'] : ['wage','work-hours'].includes(key) ? ['business','업무'] : key==='target-weight' ? ['health','건강'] : ['education','교육'];
  const top = `<a class="calculator-home category-more-link" href="/categories/${cat[0]}.html">${cat[1]} 카테고리 더보기</a>`;
  const shell = (title,lead,inputs,note,guide) => {
    root.innerHTML = `${top}<h1>${title}</h1><p class="lead">${lead}</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${inputs}</div><button class="primary-btn" id="better-calc" type="button">계산하기</button></div><div class="result" id="better-result"></div><p class="calculator-note">${note}</p></section><section class="content-block">${guide}</section>`;
  };
  const show = html => { const r=root.querySelector('#better-result'); r.innerHTML=html; r.classList.add('show'); };

  if(key==='unit'){
    const units = {
      length: [['mm','밀리미터'],['cm','센티미터'],['m','미터'],['km','킬로미터'],['in','인치'],['ft','피트'],['yd','야드'],['mile','마일']],
      weight: [['g','그램'],['kg','킬로그램'],['t','톤'],['oz','온스'],['lb','파운드']],
      area: [['m2','㎡'],['pyeong','평'],['ft2','ft²'],['acre','acre']],
      temp: [['c','섭씨 ℃'],['f','화씨 ℉'],['k','켈빈 K']]
    };
    shell('단위 변환 계산기','길이, 무게, 면적, 온도를 한 페이지에서 변환하고 자주 쓰는 환산값도 함께 확인합니다.',
      select('u-type','변환 종류',[['length','길이'],['weight','무게'],['area','면적'],['temp','온도']]) + field('u-value','값','100') + '<label><span>기준 단위</span><select id="u-from"></select></label><label><span>변환 단위</span><select id="u-to"></select></label>',
      '생활 단위 환산용 계산기입니다. 상업·공학 용도의 정밀 환산은 소수점 처리 기준을 별도로 확인하세요.',
      '<h2>자주 쓰는 환산</h2><p>1평 = 3.3058㎡, 1인치 = 2.54cm, 1파운드 = 0.453592kg 기준으로 계산합니다.</p>');
    const typeEl=root.querySelector('#u-type'), from=root.querySelector('#u-from'), to=root.querySelector('#u-to');
    const fill=()=>{const opts=units[typeEl.value].map(u=>`<option value="${u[0]}">${u[1]}</option>`).join('');from.innerHTML=opts;to.innerHTML=opts;to.selectedIndex=1};
    typeEl.onchange=fill; fill();
    const toBase=(v,u,t)=>{if(t==='length')return v*({mm:.001,cm:.01,m:1,km:1000,in:.0254,ft:.3048,yd:.9144,mile:1609.344}[u]);if(t==='weight')return v*({g:.001,kg:1,t:1000,oz:.0283495,lb:.453592}[u]);if(t==='area')return v*({m2:1,pyeong:3.305785,ft2:.092903,acre:4046.856}[u]);if(t==='temp')return u==='c'?v+273.15:u==='f'?(v-32)*5/9+273.15:v};
    const fromBase=(v,u,t)=>{if(t==='length')return v/({mm:.001,cm:.01,m:1,km:1000,in:.0254,ft:.3048,yd:.9144,mile:1609.344}[u]);if(t==='weight')return v/({g:.001,kg:1,t:1000,oz:.0283495,lb:.453592}[u]);if(t==='area')return v/({m2:1,pyeong:3.305785,ft2:.092903,acre:4046.856}[u]);if(t==='temp')return u==='c'?v-273.15:u==='f'?(v-273.15)*9/5+32:v};
    root.querySelector('#better-calc').onclick=()=>{const t=val('u-type'), v=num('u-value'); const out=fromBase(toBase(v,val('u-from'),t),val('u-to'),t); show(`<div class="savings-result-grid">${card('변환 결과',Number(out.toFixed(6)).toLocaleString())}${card('기준 단위',from.selectedOptions[0].text)}${card('변환 단위',to.selectedOptions[0].text)}${card('입력값',v.toLocaleString())}</div>`);};
  }

  if(key==='wage'){
    shell('시급 계산기','월급, 주급, 일급을 시급으로 환산하고 주휴수당 포함 여부까지 함께 확인합니다.',
      field('wg-pay','급여 금액(원)','2500000') + select('wg-type','급여 기준',[['monthly','월급'],['weekly','주급'],['daily','일급']]) + field('wg-hours','근무시간','209') + field('wg-days','주 근무일수','5') + field('wg-min','비교 최저시급(원)','10030'),
      '월급은 월 근무시간, 주급은 주 근무시간, 일급은 하루 근무시간을 입력하세요. 최저시급은 연도별로 달라지므로 직접 수정할 수 있게 했습니다.',
      '<h2>시급 환산 팁</h2><p>월급제는 통상 월 소정근로시간 209시간을 많이 사용하지만, 사업장 근로조건에 따라 다를 수 있습니다.</p>');
    root.querySelector('#better-calc').onclick=()=>{const pay=num('wg-pay'), hours=num('wg-hours'), min=num('wg-min'); if(!pay||!hours)return show('<strong>급여와 근무시간을 입력해 주세요</strong>'); const hourly=pay/hours, diff=hourly-min, type=val('wg-type'), weeklyHours=type==='monthly'?hours/4.345:type==='weekly'?hours:hours*(num('wg-days')||5), holidayHours=weeklyHours>=15?Math.min(8,weeklyHours/40*8):0; show(`<div class="savings-result-grid">${card('환산 시급',won(hourly))}${card('최저시급 대비',`${diff>=0?'+':''}${won(diff)}`)}${card('예상 주휴시간',holidayHours.toFixed(1)+'시간')}${card('주휴 포함 주급',won(hourly*(weeklyHours+holidayHours)))}</div><p>${type==='monthly'?'월급':type==='weekly'?'주급':'일급'} 기준 입력값을 시급으로 환산했습니다. 월급제는 입력한 월 근무시간을 주 단위로 환산했습니다.</p>`);};
  }

  if(key==='work-hours'){
    shell('근무시간 계산기','출퇴근 시간, 휴게시간, 야간근로 시간을 나눠 실제 근무시간과 급여 계산용 시간을 확인합니다.',
      field('wh-start','출근 시간','09:00','time') + field('wh-end','퇴근 시간','18:00','time') + field('wh-break','휴게시간(분)','60') + field('wh-wage','시급(원)','10030') + field('wh-night-start','야간 시작','22:00','time') + field('wh-night-end','야간 종료','06:00','time'),
      '야간근로 가산수당 계산은 근로계약, 사업장 규모, 법정 요건에 따라 달라질 수 있습니다. 여기서는 시간 파악용으로 제공합니다.',
      '<h2>계산 기준</h2><p>퇴근 시간이 출근 시간보다 빠르면 다음 날 퇴근으로 간주합니다. 야간 시간은 22:00~06:00 기본값을 사용합니다.</p>');
    const min=t=>{const [h,m]=String(t||'00:00').split(':').map(Number);return h*60+m};
    const overlap=(a,b,c,d)=>Math.max(0,Math.min(b,d)-Math.max(a,c));
    root.querySelector('#better-calc').onclick=()=>{let st=min(val('wh-start')), en=min(val('wh-end')); if(en<=st)en+=1440; const br=num('wh-break'), total=Math.max(0,en-st-br), wage=num('wh-wage'); let ns=min(val('wh-night-start')), ne=min(val('wh-night-end')); if(ne<=ns)ne+=1440; const night=overlap(st,en,ns,ne)+overlap(st,en,ns+1440,ne+1440), nightAfterBreak=Math.min(total,night), pay=total/60*wage, nightExtra=nightAfterBreak/60*wage*.5; show(`<div class="savings-result-grid">${card('실근무시간',`${Math.floor(total/60)}시간 ${total%60}분`)}${card('야간 포함 시간',`${Math.floor(nightAfterBreak/60)}시간 ${nightAfterBreak%60}분`)}${card('기본 급여 환산',won(pay))}${card('야간가산 참고',won(nightExtra))}</div><p>야간가산은 통상 50%를 참고값으로 표시했습니다. 실제 적용 여부는 근로기준법 요건과 사업장 조건을 확인하세요.</p>`);};
  }

  if(key==='average-score'){
    const row=()=>`<tr><td><input class="avg-name" placeholder="과목명"></td><td><input class="avg-score" type="number" placeholder="예: 85"></td><td class="avg-weight-cell"><input class="avg-weight" type="number" placeholder="예: 1"></td></tr>`;
    root.innerHTML = `${top}<h1>평균 점수 계산기</h1><p class="lead">과목별 점수를 입력해 단순 평균을 계산하고, 필요하면 가중치 또는 학점 반영 평균도 함께 확인합니다.</p><section class="calculator-box estimate-box average-score-box"><div class="estimate-toolbar average-toolbar"><div><h2>점수 입력</h2><p>기본은 단순 평균이며, 가중치 사용을 켜면 반영 비율·학점 기준 평균을 계산합니다.</p></div><button class="add-course" id="avg-add" type="button">+ 과목 추가</button></div><div class="average-options"><label class="tax-check average-weight-toggle"><input id="avg-use-weight" type="checkbox"> 가중치 사용</label><p>시험 반영비율, 과목별 학점, 중요도처럼 점수마다 비중이 다를 때만 켜세요.</p></div><div class="estimate-table-wrap average-table-wrap"><table class="estimate-table average-score-table"><thead><tr><th>과목</th><th>점수</th><th class="avg-weight-cell">가중치/학점</th></tr></thead><tbody id="avg-rows">${row()+row()+row()}</tbody></table></div><div class="estimate-actions"><button class="primary-btn" id="better-calc" type="button">평균 계산하기</button></div><div class="result" id="better-result"></div><p class="calculator-note">가중치 사용을 끄면 입력한 점수의 단순 평균만 계산합니다. 가중치 사용을 켜면 빈 가중치는 1로 계산합니다.</p></section><section class="content-block"><h2>가중 평균이 필요한 경우</h2><p>시험 반영비율이나 과목별 학점이 다르면 단순 평균보다 가중 평균이 실제 최종 점수에 더 가깝습니다. 예를 들어 중간 30%, 기말 40%, 과제 30%처럼 비중이 다르면 가중치 사용을 켜고 각각 30, 40, 30을 입력하면 됩니다.</p></section>`;
    root.querySelector('#avg-add').onclick=()=>root.querySelector('#avg-rows').insertAdjacentHTML('beforeend',row());
    const toggleWeights=()=>root.classList.toggle('average-weight-enabled',root.querySelector('#avg-use-weight').checked);
    root.querySelector('#avg-use-weight').onchange=toggleWeights; toggleWeights();
    root.querySelector('#better-calc').onclick=()=>{const useWeight=root.querySelector('#avg-use-weight').checked;let count=0,sum=0,wSum=0,wTotal=0;root.querySelectorAll('#avg-rows tr').forEach(tr=>{const s=Number(tr.querySelector('.avg-score').value),w=Number(tr.querySelector('.avg-weight').value)||1;if(Number.isFinite(s)&&s>=0){count++;sum+=s;if(useWeight){wSum+=s*w;wTotal+=w;}}});if(!count)return show('<strong>점수를 입력해 주세요</strong><p>평균을 낼 점수를 1개 이상 입력하세요.</p>');const simple=sum/count,weighted=wTotal?wSum/wTotal:simple;show(`<div class="savings-result-grid">${card(useWeight?'가중 평균':'평균 점수',(useWeight?weighted:simple).toFixed(2)+'점')}${card('단순 평균',simple.toFixed(2)+'점')}${card('입력 항목',count+'개')}${card(useWeight?'총 가중치':'계산 방식',useWeight?wTotal.toLocaleString():'단순 평균')}</div><p>${useWeight?'가중치가 큰 항목일수록 평균에 더 크게 반영했습니다.':'가중치 없이 입력한 점수의 산술 평균을 계산했습니다.'}</p>`);};
  }

  if(key==='school-grade'){
    shell('내신 등급 계산기','석차와 전체 인원으로 예상 내신 등급, 상위 누적 비율, 다음 등급까지 필요한 석차를 확인합니다.',
      field('sg-rank','내 석차','20') + field('sg-total','전체 학생 수','200'),
      '일반적인 9등급 누적 비율 기준입니다. 학교별 동점자 처리, 과목별 단위수 반영 방식은 실제 산출과 다를 수 있습니다.',
      '<h2>내신 등급 누적 기준</h2><table class="rate-table"><tbody><tr><td>1등급</td><td>상위 4%</td></tr><tr><td>2등급</td><td>상위 11%</td></tr><tr><td>3등급</td><td>상위 23%</td></tr><tr><td>4등급</td><td>상위 40%</td></tr><tr><td>5등급</td><td>상위 60%</td></tr><tr><td>6등급</td><td>상위 77%</td></tr><tr><td>7등급</td><td>상위 89%</td></tr><tr><td>8등급</td><td>상위 96%</td></tr><tr><td>9등급</td><td>상위 100%</td></tr></tbody></table>');
    root.querySelector('#better-calc').onclick=()=>{const rank=num('sg-rank'), total=num('sg-total'); if(!rank||!total||rank>total)return show('<strong>석차와 전체 인원을 확인해 주세요</strong>'); const pct=rank/total*100, cuts=[4,11,23,40,60,77,89,96,100], grade=cuts.findIndex(c=>pct<=c)+1, prev=grade===1?0:cuts[grade-2], nextRank=Math.floor(total*prev/100); show(`<div class="savings-result-grid">${card('예상 등급',grade+'등급')}${card('상위 누적 비율',pct.toFixed(2)+'%')}${card('현재 석차',`${rank}/${total}`)}${card('윗등급 컷',grade===1?'이미 1등급':`${Math.max(1,nextRank)}등 이내`)}</div>`);};
  }

  if(key==='target-weight'){
    shell('목표 체중 계산기','키와 현재 체중, 목표 BMI를 입력해 목표 체중과 감량·증량 차이를 확인합니다.',
      field('tw-height','키(cm)','170') + field('tw-current','현재 체중(kg)','70') + field('tw-bmi','목표 BMI','22'),
      'BMI 기준의 단순 목표 체중입니다. 근육량, 체지방률, 건강 상태에 따라 적정 체중은 달라질 수 있습니다.',
      '<h2>BMI 참고 범위</h2><p>일반적으로 18.5 미만은 저체중, 18.5~22.9는 정상, 23~24.9는 과체중, 25 이상은 비만 범위로 참고합니다.</p>');
    root.querySelector('#better-calc').onclick=()=>{const h=num('tw-height')/100, cur=num('tw-current'), bmi=num('tw-bmi'); if(!h||!bmi)return show('<strong>키와 목표 BMI를 입력해 주세요</strong>'); const target=h*h*bmi, diff=target-cur; show(`<div class="savings-result-grid">${card('목표 체중',target.toFixed(1)+'kg')}${card('현재와 차이',`${diff>=0?'+':''}${diff.toFixed(1)}kg`)}${card('현재 BMI',cur?(cur/(h*h)).toFixed(1):'-')}${card('목표 BMI',bmi.toFixed(1))}</div>`);};
  }
})();

// 단순 사칙연산 수준이던 일부 계산기를 실사용형으로 보강합니다.
(function(){
  const type = document.body.dataset.customCalculator;
  const root = document.querySelector('#calculator');
  if(!type || !root) return;
  const won = n => Math.round(Number(n)||0).toLocaleString('ko-KR') + '원';
  const n = id => Number(root.querySelector('#'+id)?.value || 0);
  const card = (label,value) => `<div><span>${label}</span><b>${value}</b></div>`;
  const field = (id,label,ex) => `<label><span>${label}</span><input id="${id}" type="number" placeholder="예: ${ex}" inputmode="decimal"></label>`;
  const select = (id,label,opts) => `<label><span>${label}</span><select id="${id}">${opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label>`;
  const categoryLink = {
    'four-insurance':['business','업무'],
    'annual-salary':['business','업무'],
    'fuel-cost':['life','생활'],
    'parental-leave':['business','업무']
  }[type];
  if(!categoryLink) return;
  const topLink = `<a class="calculator-home category-more-link" href="/categories/${categoryLink[0]}.html">${categoryLink[1]} 카테고리 더보기</a>`;
  const shell = (title,lead,inputs,note,guide) => {
    root.innerHTML = `${topLink}<h1>${title}</h1><p class="lead">${lead}</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${inputs}</div><button class="primary-btn" id="practical-calc" type="button">계산하기</button></div><div class="result" id="practical-result"></div><p class="calculator-note">${note}</p></section><section class="content-block">${guide}</section>`;
  };
  const show = html => { const r=root.querySelector('#practical-result'); r.innerHTML=html; r.classList.add('show'); };

  if(type==='four-insurance'){
    shell('4대보험 계산기','월 급여와 비과세액을 입력하면 국민연금, 건강보험, 장기요양, 고용보험 근로자 부담액을 항목별로 계산합니다.',
      field('fi-salary','월 급여(세전, 원)','3000000') + field('fi-nontax','월 비과세액(원)','200000') + field('fi-np','국민연금 근로자 부담률(%)','4.5') + field('fi-hi','건강보험 근로자 부담률(%)','3.545') + field('fi-ltc','장기요양보험료율: 건강보험료 대비(%)','12.95') + field('fi-ei','고용보험 근로자 부담률(%)','0.9'),
      '보험료율·상한액·사업장 조건은 적용 시점에 따라 달라질 수 있습니다. 이 계산기는 사용자가 입력한 요율로 근로자 부담분을 항목별로 보여주는 참고용입니다.',
      '<h2>기본 적용 요율</h2><p>기본값은 국민연금 4.5%, 건강보험 3.545%, 장기요양보험료 건강보험료 대비 12.95%, 고용보험 0.9%로 넣어두었습니다. 회사/직종/연도에 맞게 직접 수정할 수 있습니다.</p>');
    root.querySelector('#practical-calc').onclick=()=>{
      const base=Math.max(0,n('fi-salary')-n('fi-nontax')); if(!base) return show('<strong>급여를 입력해 주세요</strong>');
      const pension=base*n('fi-np')/100, health=base*n('fi-hi')/100, care=health*n('fi-ltc')/100, emp=base*n('fi-ei')/100, total=pension+health+care+emp;
      show(`<div class="savings-result-grid">${card('예상 공제 합계',won(total))}${card('국민연금',won(pension))}${card('건강보험+장기요양',won(health+care))}${card('고용보험',won(emp))}</div><p>보험료 산정 기준액 ${won(base)} 기준입니다.</p>`);
    };
  }

  if(type==='annual-salary'){
    shell('연봉 계산기','연봉, 상여금, 비과세액, 예상 공제율을 입력해 월 세전/세후 평균과 실수령액을 계산합니다.',
      field('as-salary','계약 연봉(원)','50000000') + field('as-bonus','연간 별도 상여금(원)','0') + field('as-nontax','월 비과세액(원)','200000') + field('as-deduct','예상 공제율(%)','9.4') + select('as-months','지급 개월 수',[['12','12개월'],['13','13개월'],['14','14개월']]),
      '실제 실수령액은 소득세, 지방소득세, 4대보험, 부양가족, 비과세 항목에 따라 달라집니다. 빠른 예산 확인용입니다.',
      '<h2>연봉을 볼 때 확인할 점</h2><p>계약 연봉에 상여금이 포함인지 별도인지, 12개월 균등 지급인지 13·14분할인지에 따라 월 수령 체감이 달라집니다.</p>');
    root.querySelector('#practical-calc').onclick=()=>{
      const annual=n('as-salary')+n('as-bonus'), months=n('as-months')||12, monthlyGross=annual/months, taxable=Math.max(0,monthlyGross-n('as-nontax')), deduct=taxable*n('as-deduct')/100, net=monthlyGross-deduct;
      if(!annual) return show('<strong>연봉을 입력해 주세요</strong>');
      show(`<div class="savings-result-grid">${card('월 예상 실수령액',won(net))}${card('월 세전 지급액',won(monthlyGross))}${card('월 예상 공제액',won(deduct))}${card('연 총액',won(annual))}</div><p>${months}개월 지급, 예상 공제율 ${n('as-deduct')||0}% 기준입니다.</p>`);
    };
  }

  if(type==='fuel-cost'){
    shell('연료비 계산기','주행거리, 연비, 유가뿐 아니라 왕복/월 반복 횟수까지 반영해 실제 주행 예산을 계산합니다.',
      field('fc-distance','편도 거리(km)','25') + field('fc-eff','연비(km/L)','12') + field('fc-price','유가(원/L)','1650') + field('fc-times','월 왕복 횟수','20') + field('fc-toll','월 톨비·주차비(원)','0'),
      '연비는 도심/고속도로, 계절, 차량 상태에 따라 달라질 수 있습니다. 통근·여행 전 예산 확인용으로 사용하세요.',
      '<h2>계산 방식</h2><p>월 주행거리 = 편도 거리 × 2 × 월 왕복 횟수입니다. 연료비에 톨비·주차비를 더해 월 교통비를 계산합니다.</p>');
    root.querySelector('#practical-calc').onclick=()=>{
      const km=n('fc-distance')*2*n('fc-times'), liters=km/(n('fc-eff')||1), fuel=liters*n('fc-price'), total=fuel+n('fc-toll');
      if(!km||!n('fc-eff')||!n('fc-price')) return show('<strong>거리, 연비, 유가를 입력해 주세요</strong>');
      show(`<div class="savings-result-grid">${card('월 예상 교통비',won(total))}${card('월 연료비',won(fuel))}${card('월 주행거리',Math.round(km).toLocaleString()+'km')}${card('필요 연료량',liters.toFixed(1)+'L')}</div><p>1회 왕복 비용은 ${won(total/(n('fc-times')||1))}입니다.</p>`);
    };
  }

  if(type==='parental-leave'){
    shell('육아휴직 급여 계산기','월 통상임금, 휴직 개월 수, 적용 비율, 상·하한액을 입력해 육아휴직 급여 예상액을 계산합니다.',
      field('pl-wage','월 통상임금(원)','3000000') + field('pl-months','휴직 개월 수','12') + field('pl-rate','지급 비율(%)','80') + field('pl-max','월 상한액(원)','1500000') + field('pl-min','월 하한액(원)','700000'),
      '육아휴직 급여 제도는 기간, 부모 동시 사용, 특례, 시행연도에 따라 달라질 수 있습니다. 실제 신청 전 고용보험 안내를 확인하세요.',
      '<h2>상·하한액을 직접 수정하세요</h2><p>제도 개편 시 상한액이 달라질 수 있으므로, 최신 기준에 맞춰 상한액과 하한액을 직접 입력할 수 있게 했습니다.</p>');
    root.querySelector('#practical-calc').onclick=()=>{
      const wage=n('pl-wage'), months=n('pl-months')||1, raw=wage*n('pl-rate')/100, monthly=Math.min(Math.max(raw,n('pl-min')),n('pl-max'));
      if(!wage) return show('<strong>월 통상임금을 입력해 주세요</strong>');
      show(`<div class="savings-result-grid">${card('총 예상 급여',won(monthly*months))}${card('월 예상 급여',won(monthly))}${card('비율 적용액',won(raw))}${card('휴직 기간',months+'개월')}</div><p>입력한 상·하한액을 적용한 간편 추정입니다.</p>`);
    };
  }
})();

// 모든 계산기 페이지 상단에 메인과 같은 카테고리 네비게이션을 보강합니다.
(function(){
  const root = document.querySelector('#calculator');
  if(!root) return;

  const navItems = [
    ['money','금융','/categories/money.html'],
    ['education','교육','/categories/education.html'],
    ['health','건강','/categories/health.html'],
    ['life','생활','/categories/life.html'],
    ['business','업무','/categories/business.html']
  ];

  const slug =
    document.body.dataset.calculator ||
    document.body.dataset.customCalculator ||
    document.body.dataset.advancedCalculator ||
    document.body.dataset.batch ||
    document.body.dataset.misc ||
    document.body.dataset.taxCalculator ||
    document.body.dataset.propertyLaborCalculator ||
    '';

  const categoryMap = {
    money: [
      'percent','discount','savings-interest','installment','loan-interest','salary','budget',
      'averaging-down','unemployment-benefit','average-price','rent-conversion','jeonse-loan',
      'car-installment','compound-interest','percent-change','cagr','roi','exchange','daily-proration',
      'stock-leverage','dsr','stock-return','prepayment-fee','car-acquisition-tax','card-installment',
      'monthly-rent-deduction','loan-schedule','employee-health-insurance','capital-gains-tax','gift-tax','national-pension',
      'local-health-insurance','property-tax','youth-leap-account','youth-account-switch','housing-subscription',
      'real-estate-brokerage','real-estate-acquisition-tax','comprehensive-real-estate-tax','rental-yield'
    ],
    education: ['gpa','target-gpa','retake','school-grade','average-score','exam-dday','exam-target'],
    health: [
      'bmi','bmr','calorie','water','exercise-calorie','target-weight','running-pace',
      'calorie-deficit','body-fat','ovulation','menstrual-cycle','pregnancy-week'
    ],
    life: [
      'date','d-day','age','international-age','time','dutch-pay','unit','day-count','cbm',
      'scale','volumetric-weight','electricity','travel-budget','fuel-cost','car-tax','lotto-tax','pet-age',
      'area-conversion'
    ],
    business: [
      'vat','margin','wage','work-hours','estimate','freelance-rate','severance',
      'break-even','shipping-split','income-tax','annual-salary','annual-leave',
      'four-insurance','parental-leave',
      'comprehensive-income-tax','withholding-33','interior-estimate','annual-leave-pay',
      'ordinary-wage','overtime-pay','average-wage'
    ]
  };

  const currentCategory = Object.entries(categoryMap).find(([, ids]) => ids.includes(slug))?.[0] || '';
  const categoryLabels = {
    money: '금융',
    education: '교육',
    health: '건강',
    life: '생활',
    business: '업무'
  };

  function ensureCategoryNav(){
    let header = document.querySelector('.site-header');
    if(!header){
      document.body.insertAdjacentHTML('afterbegin','<header class="site-header"><a class="logo" href="/">계산<span>페이지</span></a></header>');
      header = document.querySelector('.site-header');
    }

    let logo = header.querySelector('.logo');
    if(logo){
      logo.innerHTML = '계산<span>페이지</span>';
    }

    let nav = header.querySelector('nav');
    if(!nav){
      nav = document.createElement('nav');
      nav.setAttribute('aria-label','주요 카테고리');
      header.appendChild(nav);
    }else{
      nav.setAttribute('aria-label','주요 카테고리');
    }

    nav.innerHTML = navItems.map(([key,label,href]) =>
      `<a href="${href}"${key === currentCategory ? ' class="active"' : ''}>${label}</a>`
    ).join('');
  }

  function replaceHomeButtonWithCategoryMore(){
    const button = root.querySelector('.calculator-home');
    if(!button || !currentCategory) return;
    button.href = `/categories/${currentCategory}.html`;
    button.textContent = `${categoryLabels[currentCategory]} 카테고리 더보기`;
    button.classList.add('category-more-link');
  }

  ensureCategoryNav();
  replaceHomeButtonWithCategoryMore();
  window.addEventListener('load', () => {
    ensureCategoryNav();
    replaceHomeButtonWithCategoryMore();
  });
  setTimeout(() => {
    ensureCategoryNav();
    replaceHomeButtonWithCategoryMore();
  }, 120);
})();

(function(){
  const root=document.querySelector('#calculator');
  if(!root)return;
  const slug=
    document.body.dataset.calculator ||
    document.body.dataset.customCalculator ||
    document.body.dataset.advancedCalculator ||
    document.body.dataset.batch ||
    document.body.dataset.misc ||
    document.body.dataset.taxCalculator ||
    document.body.dataset.propertyLaborCalculator ||
    '';
  const conversionIds=[
    'length-conversion','area-unit-conversion','weight-conversion','temperature-conversion',
    'volume-conversion','speed-conversion','unit','area-conversion','scale','cbm','volumetric-weight'
  ];
  const apply=()=>{
    const nav=document.querySelector('.site-header nav');
    if(nav){
      nav.innerHTML=[
        ['money','금융','/categories/money.html'],
        ['education','교육','/categories/education.html'],
        ['health','건강','/categories/health.html'],
        ['life','생활','/categories/life.html'],
        ['business','업무','/categories/business.html'],
        ['conversion','단위환산','/categories/conversion.html']
      ].map(([key,label,href])=>`<a href="${href}"${conversionIds.includes(slug)&&key==='conversion'?' class="active"':''}>${label}</a>`).join('');
    }
    if(conversionIds.includes(slug)){
      const button=root.querySelector('.calculator-home');
      if(button){
        button.href='/categories/conversion.html';
        button.textContent='단위환산 카테고리 더보기';
        button.classList.add('category-more-link');
      }
    }
  };
  apply();
  window.addEventListener('load',apply);
  setTimeout(apply,180);
})();
