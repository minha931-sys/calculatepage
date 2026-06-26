(function(){
  var tools = {
    "real-estate-brokerage": ["부동산 중개수수료 계산기", "money", "매매·전세·월세 거래금액과 상한요율을 기준으로 예상 복비를 계산합니다."],
    "real-estate-acquisition-tax": ["부동산 취득세 계산기", "money", "취득가액과 세율을 입력해 부동산 취득세를 간편 계산합니다."],
    "comprehensive-real-estate-tax": ["종합부동산세 계산기", "money", "공시가격 합계와 공제금액, 세율을 입력해 종부세를 추정합니다."],
    "rental-yield": ["임대수익률 계산기", "money", "매입가, 보증금, 월세, 대출이자, 비용을 반영해 임대수익률을 계산합니다."],
    "area-conversion": ["평수 계산기", "life", "㎡와 평을 변환하고 전용면적·공급면적 기준을 함께 확인합니다."],
    "interior-estimate": ["인테리어 견적 계산기", "business", "평수, 공사 등급, 평당 단가, 추가 비용으로 인테리어 예상 견적을 계산합니다."],
    "annual-leave-pay": ["연차수당 계산기", "business", "통상임금과 미사용 연차일수로 예상 연차수당을 계산합니다."],
    "ordinary-wage": ["통상임금 계산기", "business", "월 고정급, 고정수당, 월 소정근로시간으로 시간급 통상임금을 계산합니다."],
    "overtime-pay": ["연장·야간·휴일근로수당 계산기", "business", "시급과 연장·야간·휴일근로 시간을 입력해 가산수당을 추정합니다."],
    "average-wage": ["평균임금 계산기", "business", "최근 3개월 임금과 일수로 1일 평균임금을 계산합니다."]
  };

  if(typeof calculators !== "undefined" && typeof cats !== "undefined"){
    Object.keys(tools).forEach(function(id){
      calculators[id] = { n: tools[id][0], c: tools[id][1], d: tools[id][2], r: [] };
    });
    function add(cat, ids){
      var set = new Set((cats[cat][3] + " " + ids).trim().split(/\s+/).filter(Boolean));
      cats[cat][3] = Array.from(set).join(" ");
    }
    add("money", "real-estate-brokerage real-estate-acquisition-tax comprehensive-real-estate-tax rental-yield");
    add("life", "area-conversion");
    add("business", "interior-estimate annual-leave-pay ordinary-wage overtime-pay average-wage");
    if(document.querySelector(".popular-list")){
      if(typeof home === "function") home();
      if(typeof improveCalculatorSearch === "function") improveCalculatorSearch();
      if(typeof makeHomeCategoriesExpandable === "function") makeHomeCategoriesExpandable();
    }
  }

  var slug = document.body.dataset.propertyLaborCalculator;
  var root = document.querySelector("#calculator");
  if(!slug || !root || !tools[slug]) return;

  function won(n){ return Math.round(Number(n) || 0).toLocaleString("ko-KR") + "원"; }
  function pct(n){ return (Number(n) || 0).toFixed(2).replace(/\.00$/, "") + "%"; }
  function num(id){ var el = root.querySelector("#" + id); return Number(el && el.value || 0); }
  function val(id){ var el = root.querySelector("#" + id); return el ? el.value : ""; }
  function card(label, value){ return '<div><span>' + label + '</span><b>' + value + '</b></div>'; }
  function field(id, label, ex){
    return '<label><span>' + label + '</span><input id="' + id + '" type="number" min="0" step="any" placeholder="예: ' + ex + '" inputmode="decimal"></label>';
  }
  function select(id, label, opts){
    return '<label><span>' + label + '</span><select id="' + id + '">' + opts.map(function(o){ return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join("") + '</select></label>';
  }
  function grid(html){ return '<div class="utility-fields">' + html + '</div>'; }
  function shell(title, lead, body, note, guide){
    root.innerHTML = '<h1>' + title + '</h1><p class="lead">' + lead + '</p><section class="calculator-box utility-box"><div class="utility-form">' + body + '<button class="primary-btn" id="pl-calc" type="button">계산하기</button></div><div class="result" id="pl-result" aria-live="polite"></div><p class="calculator-note">' + note + '</p></section><section class="content-block">' + guide + '</section>';
  }
  function show(html){
    var result = root.querySelector("#pl-result");
    result.innerHTML = html;
    result.classList.add("show");
  }

  if(slug === "real-estate-brokerage"){
    shell("부동산 중개수수료 계산기", "매매·전세·월세 거래금액과 상한요율을 기준으로 예상 중개보수, 복비를 계산합니다.",
      grid(select("rb-type", "거래 종류", [["sale","매매·교환"],["lease","전세"],["rent","월세"]]) + field("rb-price","매매가·보증금(원)","500000000") + field("rb-monthly","월세(원, 월세일 때)","1000000") + field("rb-rate","적용 상한요율(%)","0.4") + field("rb-limit","한도액(원, 없으면 0)","0")),
      "중개보수는 지역 조례, 거래 종류, 주택/오피스텔/상가 여부, 거래금액 구간에 따라 달라집니다. 이 계산기는 입력한 요율 기준의 참고용입니다.",
      "<h2>복비 계산 전 확인하세요</h2><p>월세는 보증금에 월세 환산액을 더한 거래금액을 사용합니다. 실제 적용 요율과 한도액은 계약 지역의 중개보수 요율표를 확인하세요.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var type = val("rb-type"), deposit = num("rb-price"), monthly = num("rb-monthly"), rate = num("rb-rate") / 100, limit = num("rb-limit");
      if(!deposit || !rate) return show("<strong>거래금액과 요율을 입력해 주세요</strong>");
      var amount = deposit;
      if(type === "rent") amount = deposit + monthly * 100;
      if(type === "rent" && amount < 50000000) amount = deposit + monthly * 70;
      var fee = amount * rate, finalFee = limit ? Math.min(fee, limit) : fee;
      show('<div class="utility-result-grid">' + card("예상 중개보수", won(finalFee)) + card("계산 거래금액", won(amount)) + card("적용 요율", pct(rate * 100)) + '</div>');
    };
  }

  if(slug === "real-estate-acquisition-tax"){
    shell("부동산 취득세 계산기", "취득가액과 간편 세율을 입력해 부동산 취득세, 지방교육세, 농어촌특별세를 추정합니다.",
      grid(field("ra-price","취득가액(원)","600000000") + select("ra-preset","간편 세율 선택",[["1","1%"],["2","2%"],["3","3%"],["8","8% 중과 예시"],["12","12% 중과 예시"],["custom","직접 입력"]]) + field("ra-rate","취득세율 직접 입력(%)","3") + field("ra-edu","지방교육세율: 취득세 대비(%)","10") + field("ra-farm","농어촌특별세율(%)","0")),
      "취득세는 주택 수, 조정대상지역, 취득가액, 면적, 감면 조건에 따라 달라집니다. 최종 신고 전 위택스·지자체 기준을 확인하세요.",
      "<h2>법적 오해를 줄이기 위한 계산 방식</h2><p>조건별 세율이 달라질 수 있어 세율을 직접 수정할 수 있게 했습니다. 감면, 중과 배제, 부대비용은 별도로 확인해야 합니다.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var price = num("ra-price"); if(!price) return show("<strong>취득가액을 입력해 주세요</strong>");
      var preset = val("ra-preset"), rate = (preset === "custom" ? num("ra-rate") : Number(preset)) / 100;
      var tax = price * rate, edu = tax * num("ra-edu") / 100, farm = price * num("ra-farm") / 100;
      show('<div class="utility-result-grid">' + card("예상 총 납부액", won(tax + edu + farm)) + card("취득세", won(tax)) + card("지방교육세·농특세", won(edu + farm)) + '</div>');
    };
  }

  if(slug === "comprehensive-real-estate-tax"){
    shell("종합부동산세 계산기", "공시가격 합계, 공제금액, 공정시장가액비율, 세율을 직접 입력해 종부세를 간편 추정합니다.",
      grid(field("ct-price","공시가격 합계(원)","1800000000") + field("ct-deduction","공제금액(원)","1200000000") + field("ct-fair","공정시장가액비율(%)","60") + field("ct-rate","적용 세율(%)","1") + field("ct-credit","세액공제·상한공제(원)","0")),
      "종합부동산세는 주택 수, 과세 유형, 연령·보유기간 공제, 세부담상한 등 변수가 많습니다. 이 계산기는 단순 구조 확인용입니다.",
      "<h2>종부세는 단순 계산이 어렵습니다</h2><p>정확한 종부세는 국세청 계산 및 고지 기준을 확인해야 합니다. 이 페이지는 과세표준과 세율 구조를 이해하기 위한 간편 계산기입니다.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var base = Math.max(0, (num("ct-price") - num("ct-deduction")) * num("ct-fair") / 100);
      var tax = Math.max(0, base * num("ct-rate") / 100 - num("ct-credit"));
      show('<div class="utility-result-grid">' + card("예상 종부세", won(tax)) + card("과세표준", won(base)) + card("공제 후 금액", won(Math.max(0, num("ct-price") - num("ct-deduction")))) + '</div>');
    };
  }

  if(slug === "rental-yield"){
    shell("임대수익률 계산기", "매입가, 보증금, 월세, 대출금, 이자, 비용을 반영해 월 순수익과 연 임대수익률을 계산합니다.",
      grid(field("ry-price","매입가(원)","500000000") + field("ry-deposit","임대보증금(원)","50000000") + field("ry-rent","월세(원)","1800000") + field("ry-loan","대출금(원)","250000000") + field("ry-rate","대출 연이율(%)","4") + field("ry-cost","월 관리·수선·공실 비용(원)","200000") + field("ry-buycost","취득세·중개비 등 초기비용(원)","20000000")),
      "세금, 공실, 수선비, 대출 조건은 실제 투자 결과에 큰 영향을 줍니다. 투자 권유가 아닌 참고용 계산입니다.",
      "<h2>임대수익률 계산 기준</h2><p>투입 자기자본은 매입가와 초기비용에서 보증금과 대출금을 뺀 금액으로 계산합니다. 월 순수익은 월세에서 월 이자와 월 비용을 뺍니다.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var equity = num("ry-price") + num("ry-buycost") - num("ry-deposit") - num("ry-loan");
      var interest = num("ry-loan") * num("ry-rate") / 100 / 12;
      var net = num("ry-rent") - interest - num("ry-cost");
      var annual = net * 12, yieldRate = equity > 0 ? annual / equity * 100 : 0;
      show('<div class="utility-result-grid">' + card("연 순수익률", pct(yieldRate)) + card("월 순수익", won(net)) + card("투입 자기자본", won(equity)) + '</div>');
    };
  }

  if(slug === "area-conversion"){
    root.innerHTML = '<h1>평수 계산기</h1><p class="lead">㎡를 평으로, 평을 ㎡로 변환하고 전용면적과 공급면적 차이를 함께 확인합니다.</p><section class="calculator-box utility-box area-conversion-box"><div class="utility-tabs"><button class="utility-tab active" data-mode="m2-to-p" type="button">㎡ → 평</button><button class="utility-tab" data-mode="p-to-m2" type="button">평 → ㎡</button></div><div class="utility-form" id="area-form"></div><div class="result" id="pl-result" aria-live="polite"></div><p class="calculator-note">평과 ㎡ 변환은 일반적으로 1평 = 3.305785㎡ 기준을 사용합니다. 분양 표기와 실제 사용 면적은 다를 수 있습니다.</p></section><section class="content-block"><h2>전용면적과 공급면적</h2><p>전용면적은 실제 거주 공간에 가까운 면적이고, 공급면적은 공용면적 일부가 포함된 면적입니다.</p></section>';
    var mode = "m2-to-p", form = root.querySelector("#area-form"), result = root.querySelector("#pl-result");
    function renderArea(){
      form.innerHTML = '<div class="utility-fields area-conversion-fields"><label><span>' + (mode === "m2-to-p" ? "제곱미터(㎡)" : "평") + '</span><input id="ac-value" type="number" min="0" step="any" placeholder="' + (mode === "m2-to-p" ? "예: 84" : "예: 25") + '" inputmode="decimal"></label><div class="area-exclusive-control"><label><span>전용률(%)</span><input id="ac-exclusive" type="number" min="0" step="any" placeholder="예: 75" inputmode="decimal" disabled></label><label class="field-option area-exclusive-check"><input id="ac-use-exclusive" type="checkbox"> 전용률 반영</label></div></div><button class="primary-btn" id="pl-calc" type="button">계산하기</button>';
      form.querySelector("#ac-use-exclusive").onchange = function(e){
        var exclusiveInput = form.querySelector("#ac-exclusive");
        exclusiveInput.disabled = !e.target.checked;
        if(!e.target.checked) exclusiveInput.value = "";
      };
      form.querySelector("#pl-calc").onclick = function(){
        var v = num("ac-value");
        if(!v) return show("<strong>면적을 입력해 주세요</strong>");
        var m2 = mode === "p-to-m2" ? v * 3.305785 : v;
        var pyeong = mode === "m2-to-p" ? v / 3.305785 : v;
        var useExclusive = root.querySelector("#ac-use-exclusive").checked;
        var exclusive = m2 * num("ac-exclusive") / 100;
        var resultCards = card("평", pyeong.toFixed(2) + "평") + card("제곱미터", m2.toFixed(2) + "㎡");
        if(useExclusive) resultCards += card("전용률 반영", num("ac-exclusive") ? exclusive.toFixed(2) + "㎡" : "-");
        show('<div class="utility-result-grid">' + resultCards + '</div>');
      };
    }
    root.querySelector(".utility-tabs").onclick = function(e){
      var tab = e.target.closest(".utility-tab");
      if(!tab) return;
      mode = tab.dataset.mode;
      root.querySelectorAll(".utility-tab").forEach(function(x){ x.classList.toggle("active", x === tab); });
      result.classList.remove("show");
      renderArea();
    };
    renderArea();
  }

  if(slug === "interior-estimate"){
    shell("인테리어 견적 계산기", "평수, 공사 범위, 평당 단가, 추가 비용을 입력해 인테리어 예상 견적을 계산합니다.",
      grid(field("ie-area","공사 면적(평)","24") + select("ie-grade","공사 등급",[["800000","부분/기본형"],["1200000","일반형"],["1800000","고급형"],["2500000","프리미엄"]]) + field("ie-custom","평당 단가 직접 입력(원, 선택)","0") + field("ie-kitchen","주방·욕실 추가비(원)","5000000") + field("ie-built","붙박이·가구·조명(원)","3000000") + field("ie-extra","예비비율(%)","10")),
      "실제 견적은 현장 상태, 자재, 철거, 전기·설비, 지역, 업체 조건에 따라 달라집니다. 계약 전 반드시 세부 견적서를 확인하세요.",
      "<h2>견적을 볼 때 주의할 점</h2><p>평당 단가는 대략적인 비교용입니다. 철거, 확장, 누수, 전기 증설, 샷시 교체처럼 큰 공정은 별도 견적이 필요할 수 있습니다.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var area = num("ie-area"), unit = num("ie-custom") || Number(val("ie-grade"));
      var base = area * unit, add = num("ie-kitchen") + num("ie-built"), reserve = (base + add) * num("ie-extra") / 100;
      show('<div class="utility-result-grid">' + card("예상 총 견적", won(base + add + reserve)) + card("기본 공사비", won(base)) + card("추가·예비비", won(add + reserve)) + '</div>');
    };
  }

  if(slug === "annual-leave-pay"){
    shell("연차수당 계산기", "시간급 통상임금, 1일 소정근로시간, 미사용 연차일수로 예상 연차수당을 계산합니다.",
      grid(field("alp-hourly","시간급 통상임금(원)","12000") + field("alp-hours","1일 소정근로시간","8") + field("alp-days","미사용 연차일수","5")),
      "연차 발생일수, 미사용 사유, 퇴직 정산, 통상임금 범위는 근로계약과 법령 해석에 따라 달라질 수 있습니다.",
      "<h2>연차수당 계산식</h2><p>일 통상임금 = 시간급 통상임금 × 1일 소정근로시간, 연차수당 = 일 통상임금 × 미사용 연차일수로 계산합니다.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var daily = num("alp-hourly") * num("alp-hours"), total = daily * num("alp-days");
      show('<div class="utility-result-grid">' + card("예상 연차수당", won(total)) + card("1일 통상임금", won(daily)) + card("미사용 연차", num("alp-days") + "일") + '</div>');
    };
  }

  if(slug === "ordinary-wage"){
    shell("통상임금 계산기", "월 고정급과 정기 고정수당을 더해 월 소정근로시간 기준 시간급 통상임금을 계산합니다.",
      grid(field("ow-base","월 기본급(원)","2500000") + field("ow-allowance","월 고정수당(원)","300000") + field("ow-hours","월 소정근로시간","209")),
      "통상임금 해당 여부는 정기성·일률성·고정성 등 법적 판단이 필요할 수 있습니다. 이 계산기는 금액 구조 확인용입니다.",
      "<h2>통상임금 계산 기준</h2><p>일반적으로 월 통상임금을 월 소정근로시간으로 나누어 시간급 통상임금을 구합니다. 어떤 수당이 포함되는지는 근로조건에 따라 달라질 수 있습니다.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var monthly = num("ow-base") + num("ow-allowance"), hourly = monthly / (num("ow-hours") || 209);
      show('<div class="utility-result-grid">' + card("시간급 통상임금", won(hourly)) + card("월 통상임금", won(monthly)) + card("월 소정근로시간", (num("ow-hours") || 209) + "시간") + '</div>');
    };
  }

  if(slug === "overtime-pay"){
    shell("연장·야간·휴일근로수당 계산기", "시급과 연장·야간·휴일근로 시간을 입력해 예상 가산수당과 총 지급액을 계산합니다.",
      grid(field("op-hourly","시급 또는 시간급 통상임금(원)","12000") + field("op-overtime","연장근로 시간","5") + field("op-night","야간근로 시간","3") + field("op-holiday","휴일근로 시간","4") + field("op-over-rate","연장 가산율(%)","50") + field("op-night-rate","야간 가산율(%)","50") + field("op-holiday-rate","휴일 가산율(%)","50")),
      "가산수당은 사업장 규모, 근로시간, 휴일근로 시간, 대체휴무, 포괄임금 약정 등에 따라 달라질 수 있습니다.",
      "<h2>가산수당 계산 방식</h2><p>연장근로 50% 가산은 해당 시간에 대해 시급의 1.5배를 지급하는 구조입니다. 야간가산은 다른 수당과 중복될 수 있습니다.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var h = num("op-hourly"), op = h * num("op-overtime") * (1 + num("op-over-rate") / 100), np = h * num("op-night") * num("op-night-rate") / 100, hp = h * num("op-holiday") * (1 + num("op-holiday-rate") / 100);
      show('<div class="utility-result-grid">' + card("예상 총 수당", won(op + np + hp)) + card("연장근로분", won(op)) + card("야간·휴일분", won(np + hp)) + '</div>');
    };
  }

  if(slug === "average-wage"){
    shell("평균임금 계산기", "최근 3개월 임금 총액과 산정 일수를 입력해 1일 평균임금과 30일 환산액을 계산합니다.",
      grid(field("aw-wage","최근 3개월 임금 총액(원)","9000000") + field("aw-bonus","반영 상여금·수당(원)","0") + field("aw-days","산정 기간 총 일수","92") + field("aw-exclude","제외 일수","0")),
      "평균임금 산정은 제외 기간, 상여금·수당 반영 방식, 퇴직일 전 3개월 기준에 따라 달라질 수 있습니다.",
      "<h2>평균임금 계산식</h2><p>1일 평균임금은 산정기간 임금 총액을 산정 일수로 나누어 계산합니다. 퇴직금 계산 등에서 통상임금과 비교가 필요한 경우가 있습니다.</p>");
    root.querySelector("#pl-calc").onclick = function(){
      var days = Math.max(1, num("aw-days") - num("aw-exclude")), total = num("aw-wage") + num("aw-bonus"), daily = total / days;
      show('<div class="utility-result-grid">' + card("1일 평균임금", won(daily)) + card("30일 환산액", won(daily * 30)) + card("산정 일수", days + "일") + '</div>');
    };
  }
})();
