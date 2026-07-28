(function(){
  const root=document.querySelector('#calculator');
  const form=document.querySelector('#refinance-form');
  const result=document.querySelector('#refinance-result');
  if(!root||!form||!result)return;

  const number=id=>Number(document.querySelector('#'+id)?.value);
  const value=id=>document.querySelector('#'+id)?.value||'';
  const won=n=>Math.round(Number(n)||0).toLocaleString('ko-KR')+'원';
  const methodName={annuity:'원리금균등',principal:'원금균등',bullet:'만기일시'};
  const metric=(label,text,primary=false)=>`<div class="practical-metric${primary?' primary':''}"><span>${label}</span>${primary?`<strong>${text}</strong>`:`<b>${text}</b>`}</div>`;

  function loanSchedule(principal,annualRate,months,method){
    const monthlyRate=annualRate/1200;
    const rows=[];
    let balance=principal;
    let fixedPayment=0;
    if(method==='annuity'){
      fixedPayment=monthlyRate===0?principal/months:principal*monthlyRate*Math.pow(1+monthlyRate,months)/(Math.pow(1+monthlyRate,months)-1);
    }
    for(let month=1;month<=months;month+=1){
      const interest=balance*monthlyRate;
      let principalPaid;
      if(method==='annuity')principalPaid=month===months?balance:Math.min(balance,fixedPayment-interest);
      else if(method==='principal')principalPaid=month===months?balance:principal/months;
      else principalPaid=month===months?balance:0;
      const payment=interest+principalPaid;
      balance=Math.max(0,balance-principalPaid);
      rows.push({month,payment,principal:principalPaid,interest,balance});
    }
    return{
      rows,
      totalInterest:rows.reduce((sum,row)=>sum+row.interest,0),
      totalPayment:rows.reduce((sum,row)=>sum+row.payment,0),
      firstPayment:rows[0].payment,
      lastPayment:rows[rows.length-1].payment
    };
  }

  function copyText(text,button){
    const done=()=>{const original=button.textContent;button.textContent='복사됨';setTimeout(()=>{button.textContent=original},1400)};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done).catch(()=>{});return}
    const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();try{document.execCommand('copy');done()}finally{area.remove()}
  }

  function showError(message,focusId){
    result.innerHTML=`<strong>입력값을 확인해 주세요</strong><p>${message}</p>`;
    result.classList.add('show');
    document.querySelector('#'+focusId)?.focus();
  }

  form.addEventListener('submit',event=>{
    event.preventDefault();
    const balance=number('rf-balance');
    const oldRateText=document.querySelector('#rf-old-rate')?.value.trim()||'';
    const oldRate=Number(oldRateText);
    const oldMonths=number('rf-old-months');
    const oldMethod=value('rf-old-method');
    const newRateText=document.querySelector('#rf-new-rate')?.value.trim()||'';
    const newRate=Number(newRateText);
    const newMonths=number('rf-new-months');
    const newMethod=value('rf-new-method');
    const prepayment=number('rf-prepayment');
    const extraCost=number('rf-extra-cost');
    if(!Number.isFinite(balance)||balance<=0||balance>1e12)return showError('남은 대출 원금을 0보다 크고 1조 원 이하로 입력하세요.','rf-balance');
    if(oldRateText===''||!Number.isFinite(oldRate)||oldRate<0||oldRate>100)return showError('현재 대출 금리는 0% 이상 100% 이하로 입력하세요.','rf-old-rate');
    if(!Number.isInteger(oldMonths)||oldMonths<1||oldMonths>1200)return showError('현재 남은 기간은 1~1,200개월의 정수로 입력하세요.','rf-old-months');
    if(newRateText===''||!Number.isFinite(newRate)||newRate<0||newRate>100)return showError('새 대출 금리는 0% 이상 100% 이하로 입력하세요.','rf-new-rate');
    if(!Number.isInteger(newMonths)||newMonths<1||newMonths>1200)return showError('새 대출 기간은 1~1,200개월의 정수로 입력하세요.','rf-new-months');
    if(!Number.isFinite(prepayment)||prepayment<0||!Number.isFinite(extraCost)||extraCost<0)return showError('중도상환수수료와 기타 비용은 0원 이상으로 입력하세요.','rf-prepayment');

    const current=loanSchedule(balance,oldRate,oldMonths,oldMethod);
    const replacement=loanSchedule(balance,newRate,newMonths,newMethod);
    const switchingCost=prepayment+extraCost;
    const interestDifference=current.totalInterest-replacement.totalInterest;
    const netSavings=interestDifference-switchingCost;
    const paymentChange=current.firstPayment-replacement.firstPayment;
    const changeText=amount=>`${amount>=0?'감소 ':'증가 '}${won(Math.abs(amount))}`;
    const maxMonths=Math.max(oldMonths,newMonths);
    let cumulativeInterestDifference=0;
    const cumulative=[];
    for(let index=0;index<maxMonths;index+=1){
      cumulativeInterestDifference+=(current.rows[index]?.interest||0)-(replacement.rows[index]?.interest||0);
      cumulative.push(cumulativeInterestDifference);
    }
    let breakEven=-1;
    if(netSavings>0){
      if(switchingCost===0)breakEven=0;
      else{
        for(let index=0;index<cumulative.length;index+=1){
          if(cumulative[index]>=switchingCost&&cumulative.slice(index).every(amount=>amount>=switchingCost)){breakEven=index+1;break}
        }
      }
    }
    const interval=maxMonths<=120?12:maxMonths<=240?24:60;
    const milestones=[];
    for(let month=interval;month<=maxMonths&&milestones.length<12;month+=interval)milestones.push(month);
    if(!milestones.includes(maxMonths))milestones.push(maxMonths);
    const balanceAt=(schedule,month)=>schedule.rows[month-1]?.balance??0;
    const timeline=milestones.map(month=>`<tr><td>${month}개월</td><td>${won(balanceAt(current,month))}</td><td>${won(balanceAt(replacement,month))}</td><td>${won(balanceAt(current,month)-balanceAt(replacement,month))}</td></tr>`).join('');
    const verdictClass=netSavings>0?'positive':netSavings<0?'negative':'';
    const verdictTitle=netSavings>0?`갈아타면 총 ${won(netSavings)} 절감 예상`:netSavings<0?`갈아타면 총 ${won(Math.abs(netSavings))} 추가 부담 예상`:'두 조건의 예상 총비용이 같습니다';
    const termWarning=oldMonths===newMonths?'상환 기간이 같아 총비용을 비교하기 쉽습니다.':`새 대출 기간이 현재보다 ${Math.abs(newMonths-oldMonths)}개월 ${newMonths>oldMonths?'길어 월 부담은 줄어도 총이자가 늘 수 있습니다.':'짧아 월 부담이 커질 수 있습니다.'}`;
    const breakEvenText=breakEven===0?'즉시':breakEven>0?`${breakEven}개월 후`:'회수 어려움';
    const shareText=`대출 갈아타기 비교 결과\n- 실질 예상 절감액: ${won(netSavings)}\n- 현재 남은 이자: ${won(current.totalInterest)}\n- 새 대출 예상 이자: ${won(replacement.totalInterest)}\n- 갈아타기 비용: ${won(switchingCost)}\n- 비용 회수 시점: ${breakEvenText}`;

result.innerHTML=`<div class="practical-summary-grid">${metric('실질 예상 절감액',won(netSavings),true)}${metric('비용 회수 시점',breakEvenText)}${metric('첫 달 납입액 변화',`${paymentChange>=0?'감소 ':'증가 '}${won(Math.abs(paymentChange))}`)}${metric('현재 대출 남은 이자',won(current.totalInterest))}${metric('새 대출 예상 이자',won(replacement.totalInterest))}${metric('갈아타기 비용',won(switchingCost))}</div><div class="practical-verdict ${verdictClass}"><b>${verdictTitle}</b><p>${termWarning} 금리뿐 아니라 중도상환수수료와 부대비용을 포함한 결과를 확인하세요.</p></div><div class="practical-table-wrap"><table class="practical-table"><thead><tr><th>비교 항목</th><th>현재 대출</th><th>새 대출</th><th>현재 대비 변화</th></tr></thead><tbody><tr><td>상환 방식</td><td>${methodName[oldMethod]}</td><td>${methodName[newMethod]}</td><td>-</td></tr><tr><td>기간</td><td>${oldMonths}개월</td><td>${newMonths}개월</td><td>${newMonths-oldMonths>0?'+':''}${newMonths-oldMonths}개월</td></tr><tr><td>첫 달 납입액</td><td>${won(current.firstPayment)}</td><td>${won(replacement.firstPayment)}</td><td>${changeText(current.firstPayment-replacement.firstPayment)}</td></tr><tr><td>마지막 달 납입액</td><td>${won(current.lastPayment)}</td><td>${won(replacement.lastPayment)}</td><td>${changeText(current.lastPayment-replacement.lastPayment)}</td></tr><tr><td>남은 총이자</td><td>${won(current.totalInterest)}</td><td>${won(replacement.totalInterest)}</td><td>${changeText(current.totalInterest-replacement.totalInterest)}</td></tr></tbody></table></div><h3>기간별 예상 잔액</h3><div class="practical-table-wrap"><table class="practical-table"><thead><tr><th>경과 기간</th><th>현재 대출 잔액</th><th>새 대출 잔액</th><th>현재-새 대출</th></tr></thead><tbody>${timeline}</tbody></table></div><div class="result-copy-actions"><button class="result-copy-button" type="button" data-copy-result>결과 복사</button></div>`;
    result.classList.add('show');
    result.querySelector('[data-copy-result]')?.addEventListener('click',event=>copyText(shareText,event.currentTarget));
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  });

  document.querySelector('#refinance-reset')?.addEventListener('click',()=>{
    form.reset();
    result.innerHTML='';
    result.classList.remove('show');
    document.querySelector('#rf-balance')?.focus();
  });
})();
