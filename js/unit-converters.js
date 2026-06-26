(function(){
  const root = document.querySelector('#calculator');
  const type = document.body.dataset.customCalculator;
  if(!root || !type) return;

  const tools = {
    'length-conversion': {
      title: '길이 단위 변환 계산기',
      lead: 'mm, cm, m, km, inch, ft, yd, mile 등 자주 쓰는 길이 단위를 한 번에 변환하세요.',
      category: '길이',
      units: {
        mm: { label: '밀리미터(mm)', factor: 0.001 },
        cm: { label: '센티미터(cm)', factor: 0.01 },
        m: { label: '미터(m)', factor: 1 },
        km: { label: '킬로미터(km)', factor: 1000 },
        inch: { label: '인치(in)', factor: 0.0254 },
        ft: { label: '피트(ft)', factor: 0.3048 },
        yd: { label: '야드(yd)', factor: 0.9144 },
        mile: { label: '마일(mi)', factor: 1609.344 }
      },
      examples: ['1 m = 100 cm', '1 inch = 2.54 cm', '1 mile = 1.609344 km']
    },
    'area-unit-conversion': {
      title: '넓이 단위 변환 계산기',
      lead: '㎡, 평, ha, acre, ft² 등 면적 단위를 변환하고 부동산·토지 면적을 비교하세요.',
      category: '넓이',
      units: {
        m2: { label: '제곱미터(㎡)', factor: 1 },
        pyeong: { label: '평', factor: 3.305785 },
        km2: { label: '제곱킬로미터(㎢)', factor: 1000000 },
        ha: { label: '헥타르(ha)', factor: 10000 },
        acre: { label: '에이커(acre)', factor: 4046.8564224 },
        ft2: { label: '제곱피트(ft²)', factor: 0.09290304 },
        yd2: { label: '제곱야드(yd²)', factor: 0.83612736 }
      },
      examples: ['1평 = 3.305785㎡', '1ha = 10,000㎡', '1acre = 약 4,046.86㎡']
    },
    'weight-conversion': {
      title: '무게 단위 변환 계산기',
      lead: 'g, kg, ton, lb, oz 등 무게 단위를 바꿔 배송·운동·요리 계산에 활용하세요.',
      category: '무게',
      units: {
        mg: { label: '밀리그램(mg)', factor: 0.000001 },
        g: { label: '그램(g)', factor: 0.001 },
        kg: { label: '킬로그램(kg)', factor: 1 },
        ton: { label: '톤(t)', factor: 1000 },
        oz: { label: '온스(oz)', factor: 0.028349523125 },
        lb: { label: '파운드(lb)', factor: 0.45359237 }
      },
      examples: ['1 kg = 1,000 g', '1 lb = 0.45359237 kg', '1 oz = 약 28.35 g']
    },
    'temperature-conversion': {
      title: '온도 단위 변환 계산기',
      lead: '섭씨, 화씨, 켈빈 온도를 서로 변환해 해외 날씨나 조리 온도 확인에 활용하세요.',
      category: '온도',
      temperature: true,
      units: {
        c: { label: '섭씨(°C)' },
        f: { label: '화씨(°F)' },
        k: { label: '켈빈(K)' }
      },
      examples: ['0°C = 32°F', '100°C = 212°F', '273.15K = 0°C']
    },
    'volume-conversion': {
      title: '부피 단위 변환 계산기',
      lead: 'mL, L, m³, 컵, 갤런 등 부피 단위를 변환해 요리·물류·생활 계산에 활용하세요.',
      category: '부피',
      units: {
        ml: { label: '밀리리터(mL)', factor: 0.001 },
        l: { label: '리터(L)', factor: 1 },
        m3: { label: '세제곱미터(m³)', factor: 1000 },
        tsp: { label: '티스푼(tsp)', factor: 0.00492892159375 },
        tbsp: { label: '테이블스푼(tbsp)', factor: 0.01478676478125 },
        cup: { label: '컵(US cup)', factor: 0.2365882365 },
        gal: { label: '갤런(US gal)', factor: 3.785411784 }
      },
      examples: ['1 L = 1,000 mL', '1 m³ = 1,000 L', '1 US gal = 3.785 L']
    },
    'speed-conversion': {
      title: '속도 단위 변환 계산기',
      lead: 'm/s, km/h, mph, knot 등 속도 단위를 바꿔 이동·운동·항해 속도를 비교하세요.',
      category: '속도',
      units: {
        mps: { label: '미터/초(m/s)', factor: 1 },
        kmh: { label: '킬로미터/시(km/h)', factor: 0.2777777777778 },
        mph: { label: '마일/시(mph)', factor: 0.44704 },
        knot: { label: '노트(knot)', factor: 0.5144444444444 },
        fps: { label: '피트/초(ft/s)', factor: 0.3048 }
      },
      examples: ['100 km/h = 27.78 m/s', '1 mph = 1.609 km/h', '1 knot = 1.852 km/h']
    }
  };

  const tool = tools[type];
  if(!tool) return;

  const format = value => {
    if(!Number.isFinite(value)) return '-';
    const abs = Math.abs(value);
    if(abs !== 0 && (abs >= 1000000 || abs < 0.0001)) return value.toExponential(6).replace(/\.?0+e/,'e');
    return value.toLocaleString('ko-KR', { maximumFractionDigits: 8 });
  };

  const toBaseTemperature = (value, unit) => {
    if(unit === 'c') return value;
    if(unit === 'f') return (value - 32) * 5 / 9;
    return value - 273.15;
  };

  const fromBaseTemperature = (value, unit) => {
    if(unit === 'c') return value;
    if(unit === 'f') return value * 9 / 5 + 32;
    return value + 273.15;
  };

  const optionHtml = Object.entries(tool.units)
    .map(([key, unit]) => `<option value="${key}">${unit.label}</option>`)
    .join('');
  const exampleHtml = tool.examples.map(item => `<li>${item}</li>`).join('');

  root.innerHTML = `<a class="calculator-home category-more-link" href="/categories/conversion.html">단위환산 카테고리 더보기</a>
    <h1>${tool.title}</h1>
    <p class="lead">${tool.lead}</p>
    <section class="calculator-box utility-box">
      <div class="utility-form">
        <div class="utility-fields">
          <label><span>값</span><input id="unit-value" type="number" placeholder="예: 100" inputmode="decimal" step="any"></label>
          <label><span>변환 전 단위</span><select id="unit-from">${optionHtml}</select></label>
          <label><span>변환 후 단위</span><select id="unit-to">${optionHtml}</select></label>
        </div>
        <button class="primary-btn" id="unit-calc" type="button">단위 변환하기</button>
      </div>
      <div class="result" id="unit-result" aria-live="polite"></div>
      <p class="calculator-note">표준 환산 계수를 이용한 참고용 계산입니다. 산업·기관·상품별 반올림 기준이 있으면 해당 기준을 우선 확인하세요.</p>
    </section>
    <section class="content-block">
      <h2>${tool.category} 단위 예시</h2>
      <ul>${exampleHtml}</ul>
    </section>
    <section class="content-block">
      <h2>관련 계산기</h2>
      <div class="related">
        <a href="/calculators/length-conversion.html">길이 단위 변환</a>
        <a href="/calculators/area-unit-conversion.html">넓이 단위 변환</a>
        <a href="/calculators/temperature-conversion.html">온도 단위 변환</a>
        <a href="/calculators/volume-conversion.html">부피 단위 변환</a>
      </div>
    </section>`;

  const from = root.querySelector('#unit-from');
  const to = root.querySelector('#unit-to');
  const result = root.querySelector('#unit-result');
  const keys = Object.keys(tool.units);
  if(keys[1]) to.value = keys[1];

  root.querySelector('#unit-calc').onclick = () => {
    const input = Number(root.querySelector('#unit-value').value);
    if(!Number.isFinite(input)){
      result.innerHTML = '<strong>값을 입력해 주세요</strong><p>변환할 숫자를 입력한 뒤 다시 계산해 주세요.</p>';
      result.classList.add('show');
      return;
    }

    let converted;
    if(tool.temperature){
      converted = fromBaseTemperature(toBaseTemperature(input, from.value), to.value);
    }else{
      converted = input * tool.units[from.value].factor / tool.units[to.value].factor;
    }

    result.innerHTML = `<strong>${format(converted)} ${tool.units[to.value].label}</strong>
      <p>${format(input)} ${tool.units[from.value].label} 변환 결과입니다.</p>`;
    result.classList.add('show');
  };
})();
