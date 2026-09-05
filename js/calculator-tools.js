(() => {
  'use strict';
  if (typeof getComputedStyle !== 'function') return;
  const root = document.querySelector('#calculator');
  if (!root) return;
  const slug = location.pathname.split('/').pop().replace(/\.html$/, '');
  const title = root.querySelector('h1')?.textContent.trim() || '계산 결과';
  // Pass only the public page identifier; never put user inputs in a URL.
  const reportUrl = '/pages/contact.html?calculator=' + encodeURIComponent(slug);
  document.querySelectorAll('footer a[href="/pages/contact.html"]').forEach(link => {
    link.href = reportUrl; link.textContent = '문의·오류 제보';
  });
  const bound = new WeakSet();
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  function inputSnapshot(container) {
    return [...container.querySelectorAll('input,select,textarea')].filter(input => {
      if(input.closest('.result,.result-tools') || input.disabled || input.type === 'hidden' ||
        getComputedStyle(input).display === 'none' || !input.getClientRects().length) return false;
      const row=input.closest('tbody tr');
      return !row || [...row.querySelectorAll('input,select,textarea')].some(field=>
        field.type==='checkbox'||field.type==='radio'?field.checked:Boolean(field.value.trim()));
    }).map((input,index) => {
      const labelCopy=input.labels?.[0]?.cloneNode(true);
      labelCopy?.querySelectorAll('input,select,textarea,button').forEach(element=>element.remove());
      const label = input.getAttribute('aria-label') || labelCopy?.textContent || input.name || '';
      const cell = input.closest('td');
      const header = cell?.closest('table')?.querySelectorAll('thead th')[cell.cellIndex]?.textContent;
      const row = cell ? (cell.parentElement.sectionRowIndex + 1) + '행 ' : '';
      const value = input.type === 'checkbox' || input.type === 'radio' ? (input.checked ? '선택' : '선택 안 함') :
        input.tagName === 'SELECT' ? input.selectedOptions[0]?.textContent || input.value : input.value;
      return {label:row + clean(label || header || '입력 '+(index+1)),value:clean(value) || '입력 안 함'};
    });
  }
  function remember() {
    try {
      const stored=JSON.parse(localStorage.getItem('cp-recent-tools')||'[]');
      const list=Array.isArray(stored)?stored.filter(item=>typeof item==='string' && /^[a-z0-9-]+$/.test(item)):[];
      localStorage.setItem('cp-recent-tools',JSON.stringify([slug,...list.filter(item=>item!==slug)].slice(0,6)));
    } catch { /* Recent links are optional. Calculation does not depend on storage. */ }
  }
  function attach(result) {
    if(bound.has(result)) return;
    const container=result.closest('.calculator-box,.workbench');
    if(!container) return;
    bound.add(result);
    let latest=null, records=[], serial=0;
    const tools=document.createElement('div'); tools.className='result-tools';tools.hidden=true;
    tools.innerHTML='<div class="result-tools-bar"><button type="button" data-copy>입력값·결과 복사</button><button type="button" data-save>비교용 기록 남기기</button></div><p class="result-tools-status" role="status"></p><textarea aria-label="복사할 계산 내용" readonly hidden></textarea><details class="result-history" hidden><summary>이 화면의 계산 기록</summary><div class="history-grid"></div><p class="result-tools-note">최대 3개까지 비교할 수 있습니다. 입력값과 결과 기록은 이 페이지를 떠나거나 새로고침하면 사라집니다.</p></details>';
    const stale=document.createElement('p');stale.className='input-updated';stale.hidden=true;
    stale.textContent='입력 조건이 바뀌었습니다. 아래는 이전 결과이므로 다시 계산해 주세요.';
    const copy=tools.querySelector('[data-copy]'),save=tools.querySelector('[data-save]'),status=tools.querySelector('[role="status"]');
    const report=document.createElement('a'); report.href=reportUrl; report.textContent='이 계산기 오류 제보';
    tools.querySelector('.result-tools-bar').append(report);
    const history=tools.querySelector('.result-history'),grid=tools.querySelector('.history-grid'),fallback=tools.querySelector('textarea');
    function sync() {copy.disabled=!latest;save.disabled=!latest || records.length>=3;}
    function renderHistory() {
      history.hidden=records.length===0;grid.replaceChildren();
      records.forEach(record=>{
        const card=document.createElement('article');card.className='history-card';
        const heading=document.createElement('h3');heading.textContent='조건 '+record.id+' · '+record.time;
        const inputList=document.createElement('ul');
        record.inputs.forEach(item=>{const li=document.createElement('li');li.textContent=item.label+': '+item.value;inputList.append(li);});
        const summary=document.createElement('pre');summary.textContent=record.text;
        const remove=document.createElement('button');remove.type='button';remove.textContent='기록 삭제';remove.setAttribute('aria-label','조건 '+record.id+' 기록 삭제');
        remove.addEventListener('click',()=>{records=records.filter(item=>item.id!==record.id);renderHistory();sync();status.textContent='기록을 삭제했습니다.';});
        card.append(heading,inputList,summary,remove);grid.append(card);
      });
    }
    save.addEventListener('click',()=>{
      if(!latest || records.length>=3)return;
      if(records.some(record=>record.signature===latest.signature && record.text===latest.text)){status.textContent='같은 조건과 결과가 이미 기록되어 있습니다.';return;}
      records.push({...latest,id:++serial});renderHistory();history.open=true;sync();status.textContent='현재 입력 조건과 결과를 기록했습니다. 값을 바꾸고 다시 계산해 비교하세요.';
    });
    copy.addEventListener('click',async()=>{
      if(!latest)return;
      const text=title+'\n'+latest.time+' 계산\n\n'+latest.inputs.map(item=>item.label+': '+item.value).join('\n')+'\n\n'+latest.text+'\n\n'+location.origin+location.pathname;
      try{await navigator.clipboard.writeText(text);status.textContent='입력값과 결과를 함께 복사했습니다.';fallback.hidden=true;}
      catch{fallback.value=text;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='아래 내용을 선택한 뒤 복사하세요.';}
    });
    function update() {
      const visible=result.classList.contains('show') || getComputedStyle(result).display!=='none';
      const clone=result.cloneNode(true);clone.querySelectorAll('button,script,style').forEach(node=>node.remove());
      const text=(result.innerText || clone.textContent || '').trim();
      const headline=clean(result.querySelector('strong')?.textContent || text.slice(0,80));
      const invalid=!visible || !/\d/.test(text) || /입력.*주세요|값.*확인|계산할 수 없|NaN|Infinity/.test(headline);
      if(invalid){latest=null;stale.hidden=true;tools.hidden=!records.length;sync();return;}
      const inputs=inputSnapshot(container);
      latest={inputs,text,signature:JSON.stringify(inputs),time:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})};
      if(!tools.parentNode){result.insertAdjacentElement('afterend',tools);result.insertAdjacentElement('beforebegin',stale);}
      tools.hidden=false;stale.hidden=true;status.textContent='';fallback.hidden=true;sync();remember();
    }
    let queued=false;
    new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;update();});}).observe(result,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
    function changed(event) {
      if(event.target.closest('.result-tools,.result'))return;
      if(latest && JSON.stringify(inputSnapshot(container))!==latest.signature){latest=null;stale.hidden=false;sync();status.textContent='새 조건을 계산한 뒤 복사하거나 기록할 수 있습니다.';}
    }
    container.addEventListener('input',changed);container.addEventListener('change',changed);
    container.addEventListener('keydown',event=>{
      if(event.key!=='Enter' || event.isComposing || !event.target.matches('input:not([type="checkbox"]):not([type="radio"])'))return;
      const button=container.querySelector('button.primary-btn');if(button){event.preventDefault();button.click();}
    });
    update();
  }
  function scan(){root.querySelectorAll('.calculator-box .result,.workbench .result').forEach(attach);}
  scan();
  new MutationObserver(scan).observe(root,{childList:true,subtree:true});
})();
