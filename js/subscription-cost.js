(function(){
  const root=document.querySelector('#calculator');
  const form=document.querySelector('#subscription-form');
  const list=document.querySelector('#subscription-list');
  const result=document.querySelector('#subscription-result');
  if(!root||!form||!list||!result)return;

  let rowNumber=0;
  const won=n=>Math.round(Number(n)||0).toLocaleString('ko-KR')+'원';
  const esc=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const metric=(label,text,primary=false)=>`<div class="practical-metric${primary?' primary':''}"><span>${label}</span>${primary?`<strong>${text}</strong>`:`<b>${text}</b>`}</div>`;
  const cycleData={monthly:{label:'매월',factor:1},annual:{label:'매년',factor:1/12},weekly:{label:'매주',factor:52/12},quarterly:{label:'3개월마다',factor:1/3}};

  function updateRowTitles(){
    [...list.querySelectorAll('.subscription-row')].forEach((row,index)=>{
      row.querySelector('.subscription-row-title').textContent=`구독 ${index+1}`;
      row.setAttribute('aria-label',`구독 ${index+1} 입력`);
    });
  }

  function resetRow(row){
    row.querySelectorAll('input').forEach(input=>{
      input.value='';
      if(input.type==='checkbox')input.checked=false;
    });
    row.querySelectorAll('select').forEach(select=>{select.selectedIndex=0});
  }

  function addRow(){
    if(list.children.length>=20)return;
    rowNumber+=1;
    const row=document.createElement('article');
    row.className='subscription-row';
    row.innerHTML=`<div class="subscription-row-head"><span class="subscription-row-title"></span><div class="subscription-row-actions"><label class="subscription-toggle"><input class="subscription-cancel" type="checkbox"><span>해지 후보</span></label><button class="subscription-remove" type="button" aria-label="이 구독 항목 삭제">삭제</button></div></div><div class="subscription-row-fields"><label class="subscription-field"><span>서비스명</span><input class="subscription-name" type="text" maxlength="40" placeholder="예: 동영상 서비스" autocomplete="off"></label><label class="subscription-field"><span>결제 금액(원)</span><input class="subscription-amount" type="number" min="0" step="1" inputmode="numeric" placeholder="예: 14900"></label><label class="subscription-field"><span>결제 주기</span><select class="subscription-cycle"><option value="monthly">매월</option><option value="annual">매년</option><option value="weekly">매주</option><option value="quarterly">3개월마다</option></select></label><label class="subscription-field"><span>월 사용 횟수</span><input class="subscription-uses" type="number" min="0" step="1" inputmode="numeric" placeholder="예: 8"><small class="practical-field-help">모르면 비워두세요.</small></label></div>`;
    row.querySelector('.subscription-remove').addEventListener('click',()=>{
      if(list.children.length===1){resetRow(row);row.querySelector('.subscription-name')?.focus();return}
      row.remove();updateRowTitles();
    });
    list.appendChild(row);
    updateRowTitles();
  }

  function copyText(text,button){
    const done=()=>{const original=button.textContent;button.textContent='복사됨';setTimeout(()=>{button.textContent=original},1400)};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done).catch(()=>{});return}
    const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();try{document.execCommand('copy');done()}finally{area.remove()}
  }

  function showError(message,element){
    result.innerHTML=`<strong>입력값을 확인해 주세요</strong><p>${message}</p>`;
    result.classList.add('show');
    element?.focus();
  }

  document.querySelector('#subscription-add')?.addEventListener('click',()=>{addRow();list.lastElementChild?.querySelector('.subscription-name')?.focus()});
  for(let index=0;index<2;index+=1)addRow();

  form.addEventListener('submit',event=>{
    event.preventDefault();
    const rows=[];
    for(const [index,row] of [...list.querySelectorAll('.subscription-row')].entries()){
      const name=row.querySelector('.subscription-name').value.trim();
      const amountText=row.querySelector('.subscription-amount').value.trim();
      const usesText=row.querySelector('.subscription-uses').value.trim();
      const cancel=row.querySelector('.subscription-cancel').checked;
      if(!name&&!amountText&&!usesText&&!cancel)continue;
      const amount=Number(amountText);
      const uses=usesText===''?null:Number(usesText);
      const cycle=row.querySelector('.subscription-cycle').value;
      if(!Number.isFinite(amount)||amount<=0)return showError(`${index+1}번째 구독의 결제 금액을 0원보다 크게 입력하세요.`,row.querySelector('.subscription-amount'));
      if(uses!==null&&(!Number.isInteger(uses)||uses<0||uses>10000))return showError(`${index+1}번째 구독의 월 사용 횟수를 0 이상의 정수로 입력하세요.`,row.querySelector('.subscription-uses'));
      const monthly=amount*cycleData[cycle].factor;
      rows.push({name:name||`구독 ${index+1}`,amount,uses,cancel,cycle,monthly,annual:monthly*12});
    }
    if(!rows.length)return showError('한 개 이상의 구독 서비스와 결제 금액을 입력하세요.',list.querySelector('.subscription-amount'));
    const increaseText=document.querySelector('#subscription-increase').value.trim();
    const budgetText=document.querySelector('#subscription-budget').value.trim();
    const increase=increaseText===''?0:Number(increaseText);
    const budget=budgetText===''?null:Number(budgetText);
    if(!Number.isFinite(increase)||increase<0||increase>100)return showError('예상 인상률은 0% 이상 100% 이하로 입력하세요.',document.querySelector('#subscription-increase'));
    if(budget!==null&&(!Number.isFinite(budget)||budget<0))return showError('월 구독 예산은 0원 이상으로 입력하세요.',document.querySelector('#subscription-budget'));

    const totalMonthly=rows.reduce((sum,row)=>sum+row.monthly,0);
    const totalAnnual=totalMonthly*12;
    const cancelMonthly=rows.filter(row=>row.cancel).reduce((sum,row)=>sum+row.monthly,0);
    const keptMonthly=totalMonthly-cancelMonthly;
    const nextAnnual=keptMonthly*12*(1+increase/100);
    const highest=[...rows].sort((a,b)=>b.monthly-a.monthly)[0];
    const lowUse=rows.filter(row=>row.uses!==null&&row.uses<=1);
    const budgetDifference=budget===null?null:budget-keptMonthly;
    const sorted=[...rows].sort((a,b)=>b.monthly-a.monthly);
    const tableRows=sorted.map(row=>{
      const costPerUse=row.uses===null?'-':row.uses===0?'미사용':won(row.monthly/row.uses);
      return `<tr><td><strong>${esc(row.name)}</strong></td><td>${cycleData[row.cycle].label} ${won(row.amount)}</td><td>${won(row.monthly)}</td><td>${won(row.annual)}</td><td>${costPerUse}</td><td class="subscription-status ${row.cancel?'cancel':'keep'}">${row.cancel?'해지 후보':'유지'}</td></tr>`;
    }).join('');
    const budgetMessage=budget===null?'월 구독 예산을 입력하면 예산 초과 여부도 함께 확인할 수 있습니다.':budgetDifference>=0?`해지 후보 반영 후 월 예산에서 ${won(budgetDifference)}이 남습니다.`:`해지 후보를 반영해도 월 예산을 ${won(Math.abs(budgetDifference))} 초과합니다.`;
    const useMessage=lowUse.length?`월 1회 이하로 사용하는 구독은 ${lowUse.map(row=>esc(row.name)).join(', ')}입니다.`:'입력한 사용 횟수 기준으로 월 1회 이하인 구독은 없습니다.';
    const verdictClass=cancelMonthly>0?'positive':'';
    const shareText=`구독료 계산 결과\n- 현재 월 구독료: ${won(totalMonthly)}\n- 현재 연 구독료: ${won(totalAnnual)}\n- 해지 후보 반영 월 구독료: ${won(keptMonthly)}\n- 예상 연간 절감액: ${won(cancelMonthly*12)}\n- 가장 큰 구독: ${highest.name} ${won(highest.monthly)}/월`;
    result.innerHTML=`<div class="practical-summary-grid">${metric('현재 월 구독료',won(totalMonthly),true)}${metric('현재 연 구독료',won(totalAnnual))}${metric('해지 후보 반영 월액',won(keptMonthly))}${metric('예상 연간 절감액',won(cancelMonthly*12))}${metric(`인상률 ${increase}% 반영 다음 해`,won(nextAnnual))}${metric('가장 큰 월 구독료',`${esc(highest.name)} · ${won(highest.monthly)}`)}</div><div class="practical-verdict ${verdictClass}"><b>${cancelMonthly>0?`해지 후보를 정리하면 연 ${won(cancelMonthly*12)} 절감 예상`:'해지 후보를 선택하면 절감액을 바로 비교할 수 있습니다'}</b><p>${budgetMessage} ${useMessage}</p></div><div class="practical-table-wrap"><table class="practical-table"><thead><tr><th>서비스</th><th>결제 조건</th><th>월 환산</th><th>연 환산</th><th>1회 사용당</th><th>상태</th></tr></thead><tbody>${tableRows}</tbody></table></div><div class="result-copy-actions"><button class="result-copy-button" type="button" data-copy-result>결과 복사</button></div>`;
    result.classList.add('show');
    result.querySelector('[data-copy-result]')?.addEventListener('click',event=>copyText(shareText,event.currentTarget));
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  });

  document.querySelector('#subscription-reset')?.addEventListener('click',()=>{
    form.reset();
    list.innerHTML='';
    for(let index=0;index<2;index+=1)addRow();
    result.innerHTML='';
    result.classList.remove('show');
    list.querySelector('.subscription-name')?.focus();
  });
})();
