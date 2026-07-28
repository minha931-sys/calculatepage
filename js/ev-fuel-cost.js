(function(){
  const form=document.querySelector('#ev-cost-form');
  const result=document.querySelector('#ev-cost-result');
  if(!form||!result)return;

  const input=id=>document.querySelector('#'+id);
  const number=id=>Number(input(id)?.value);
  const optional=id=>input(id)?.value.trim()===''?0:Number(input(id).value);
  const won=n=>Math.round(Number(n)||0).toLocaleString('ko-KR')+'원';
  const fmt=(n,digits=1)=>(Number(n)||0).toLocaleString('ko-KR',{maximumFractionDigits:digits});
  const metric=(label,text,primary=false)=>`<div class="practical-metric${primary?' primary':''}"><span>${label}</span>${primary?`<strong>${text}</strong>`:`<b>${text}</b>`}</div>`;

  function copyText(text,button){
    const done=()=>{const original=button.textContent;button.textContent='복사됨';setTimeout(()=>{button.textContent=original},1400)};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done).catch(()=>{});return}
    const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();try{document.execCommand('copy');done()}finally{area.remove()}
  }

  function showError(message,id){
    result.innerHTML=`<strong>입력값을 확인해 주세요</strong><p>${message}</p>`;
    result.classList.add('show');
    input(id)?.focus();
  }

  form.addEventListener('submit',event=>{
    event.preventDefault();
    const distance=number('ev-distance');
    const fuelEfficiency=number('ev-fuel-efficiency');
    const fuelPrice=number('ev-fuel-price');
    const evEfficiency=number('ev-efficiency');
    const slowPrice=optional('ev-slow-price');
    const fastPrice=optional('ev-fast-price');
    const fastShareText=input('ev-fast-share')?.value.trim()||'';
    const fastShare=Number(fastShareText);
    const loss=optional('ev-loss');
    const premium=optional('ev-premium');
    const otherSavings=optional('ev-other-savings');
    if(!Number.isFinite(distance)||distance<=0||distance>1e7)return showError('연간 주행거리를 0km보다 크게 입력하세요.','ev-distance');
    if(!Number.isFinite(fuelEfficiency)||fuelEfficiency<=0||fuelEfficiency>1000)return showError('내연기관차 실연비를 0보다 크게 입력하세요.','ev-fuel-efficiency');
    if(!Number.isFinite(fuelPrice)||fuelPrice<=0)return showError('유류 단가를 0원보다 크게 입력하세요.','ev-fuel-price');
    if(!Number.isFinite(evEfficiency)||evEfficiency<=0||evEfficiency>100)return showError('전기차 실전비를 0보다 크게 입력하세요.','ev-efficiency');
    if(fastShareText===''||!Number.isFinite(fastShare)||fastShare<0||fastShare>100)return showError('급속 충전 비중은 0~100%로 입력하세요.','ev-fast-share');
    if((fastShare<100&&(!Number.isFinite(slowPrice)||slowPrice<=0))||(fastShare>0&&(!Number.isFinite(fastPrice)||fastPrice<=0)))return showError('사용 비중이 있는 충전 방식의 kWh당 단가를 입력하세요.',fastShare===100?'ev-fast-price':'ev-slow-price');
    if(!Number.isFinite(loss)||loss<0||loss>=50)return showError('충전 손실률은 0% 이상 50% 미만으로 입력하세요.','ev-loss');
    if(!Number.isFinite(premium)||premium<0||!Number.isFinite(otherSavings)||otherSavings<0)return showError('구매 추가금과 연간 기타 절감액은 0원 이상으로 입력하세요.','ev-premium');

    const fastRatio=fastShare/100;
    const blendedChargePrice=slowPrice*(1-fastRatio)+fastPrice*fastRatio;
    const fuelLiters=distance/fuelEfficiency;
    const fuelAnnual=fuelLiters*fuelPrice;
    const drivingKwh=distance/evEfficiency;
    const chargedKwh=drivingKwh/(1-loss/100);
    const evAnnual=chargedKwh*blendedChargePrice;
    const energySavings=fuelAnnual-evAnnual;
    const annualBenefit=energySavings+otherSavings;
    const payback=premium>0&&annualBenefit>0?premium/annualBenefit:null;
    const fiveYearNet=annualBenefit*5-premium;
    const scenarios=[1,3,5,10].map(year=>`<tr><td>${year}년</td><td>${won(fuelAnnual*year)}</td><td>${won(evAnnual*year)}</td><td>${won(otherSavings*year)}</td><td><strong>${won(annualBenefit*year-premium)}</strong></td></tr>`).join('');
    const verdictClass=annualBenefit>0?'positive':annualBenefit<0?'negative':'';
    const verdictTitle=annualBenefit>0?`전기차가 연 ${won(annualBenefit)} 절감 예상`:annualBenefit<0?`전기차가 연 ${won(Math.abs(annualBenefit))} 더 들 것으로 예상`:'두 차량의 연간 비용이 같습니다';
    const paybackText=premium<=0?'추가금 없음':payback===null?'회수 어려움':payback>100?'100년 초과':`${fmt(payback,1)}년`;
    const shareText=`전기차·내연기관 유지비 비교 결과\n- 내연기관 연 에너지비: ${won(fuelAnnual)}\n- 전기차 연 충전비: ${won(evAnnual)}\n- 연간 총 절감액: ${won(annualBenefit)}\n- 구매 추가금 회수: ${paybackText}\n- 5년 누적 차이: ${won(fiveYearNet)}`;
    result.innerHTML=`<div class="practical-summary-grid">${metric('연간 총 절감액',won(annualBenefit),true)}${metric('내연기관 연 유류비',won(fuelAnnual))}${metric('전기차 연 충전비',won(evAnnual))}${metric('구매 추가금 회수',paybackText)}${metric('5년 누적 차이',won(fiveYearNet))}${metric('혼합 충전 단가',`${fmt(blendedChargePrice,1)}원/kWh`)}</div><div class="practical-verdict ${verdictClass}"><b>${verdictTitle}</b><p>연 ${fmt(distance,0)}km 주행, 완속 ${100-fastShare}%·급속 ${fastShare}% 충전 기준입니다. 구매가 차이, 기타 절감액과 충전 손실 입력 여부에 따라 회수 기간이 크게 달라집니다.</p></div><div class="practical-table-wrap"><table class="practical-table"><thead><tr><th>비교 항목</th><th>내연기관차</th><th>전기차</th><th>전기차 절감액</th></tr></thead><tbody><tr><td>월 에너지 비용</td><td>${won(fuelAnnual/12)}</td><td>${won(evAnnual/12)}</td><td>${won(fuelAnnual/12-evAnnual/12)}</td></tr><tr><td>연 에너지 비용</td><td>${won(fuelAnnual)}</td><td>${won(evAnnual)}</td><td>${won(fuelAnnual-evAnnual)}</td></tr><tr><td>연간 사용 에너지</td><td>${fmt(fuelLiters)}L</td><td>${fmt(chargedKwh)}kWh</td><td>-</td></tr><tr><td>적용 효율</td><td>${fmt(fuelEfficiency)}km/L</td><td>${fmt(evEfficiency)}km/kWh</td><td>-</td></tr></tbody></table></div><h3>기간별 누적 비용 차이</h3><div class="practical-table-wrap"><table class="practical-table"><thead><tr><th>기간</th><th>내연기관 에너지비</th><th>전기차 충전비</th><th>기타 절감 누계</th><th>구매 추가금 반영 순절감</th></tr></thead><tbody>${scenarios}</tbody></table></div><div class="result-copy-actions"><button class="result-copy-button" type="button" data-copy-result>결과 복사</button></div>`;
    result.classList.add('show');
    result.querySelector('[data-copy-result]')?.addEventListener('click',event=>copyText(shareText,event.currentTarget));
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  });

  document.querySelector('#ev-cost-reset')?.addEventListener('click',()=>{
    form.reset();
    result.innerHTML='';
    result.classList.remove('show');
    input('ev-distance')?.focus();
  });
})();
