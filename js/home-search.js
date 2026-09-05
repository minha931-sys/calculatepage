(() => {
  'use strict';
  const input = document.querySelector('#calculator-search');
  const results = document.querySelector('#search-results');
  const form = document.querySelector('#home-search-form');
  const category = document.querySelector('#search-category');
  if (!input || !results || !form || !category) return;
  const index = window.CP_SEARCH_INDEX || [];
  const categories = {money:'금융',education:'교육',health:'건강',life:'생활',business:'업무',conversion:'단위환산'};
  const aliases = {
    salary:'월급 실수령 실수령액 급여 월급명세서 이직', 'annual-salary':'연봉 세후 연간',
    'loan-interest':'대출 이자 상환 원리금 원금균등', 'loan-refinance':'대환 갈아타기 이자절약',
    'savings-interest':'예금 정기예금 목돈 이자', installment:'적금 매월 저축',
    'area-conversion':'평수 아파트 전용면적 평', percent:'퍼센트 백분율 비율 퍼센트계산 원래값',
    discount:'할인 쿠폰 세일 쇼핑 중복할인', 'd-day':'디데이 dday d-day 날짜 며칠 주말',
    gpa:'학점 성적 대학 평균평점', 'target-gpa':'목표학점 목표평점', bmi:'체질량 체중 비만지수',
    'international-age':'만나이 만 나이', vat:'부가세 부가가치세 공급가액',
    'withholding-33':'3.3% 삼쩜삼 원천징수', 'real-estate-brokerage':'복비 중개수수료',
    severance:'퇴직금 퇴사', 'weekly-holiday-pay':'주휴수당 아르바이트 알바',
    'fuel-cost':'주유비 유류비 기름값', 'ev-fuel-cost':'전기차 충전비',
    'weight-conversion':'무게 kg g lb 파운드', 'length-conversion':'길이 인치 센티미터 피트',
    'temperature-conversion':'온도 섭씨 화씨 켈빈', 'volume-conversion':'부피 리터 갤런 밀리리터',
    'running-pace':'러닝 페이스 달리기 마라톤 완주', 'break-even':'손익분기점 원가 판매량',
    'subscription-cost':'구독료 구독비 넷플릭스', budget:'생활비 가계부 예산 지출 저축'
  };
  const normalize = text => String(text).toLowerCase().replace(/[\s·_%.,-]+/g, '');
  let matches = [], active = -1;
  function close() { results.hidden = true; input.setAttribute('aria-expanded','false'); input.removeAttribute('aria-activedescendant'); active = -1; }
  function select(position) {
    const options = [...results.querySelectorAll('[role="option"]')];
    if (!options.length) return;
    active = (position + options.length) % options.length;
    options.forEach((option,i) => option.setAttribute('aria-selected', String(i === active)));
    input.setAttribute('aria-activedescendant', options[active].id);
    options[active].scrollIntoView({block:'nearest'});
  }
  function render() {
    const query = normalize(input.value);
    if (!query && !category.value) { matches = []; results.replaceChildren(); close(); return; }
    matches = index.filter(item => !category.value || item.category === category.value).map(item => {
      const name = normalize(item.name), alias = normalize(aliases[item.slug] || '');
      const score = !query ? 1 : name === query ? 100 : name.startsWith(query) ? 80 : name.includes(query) ? 60 : alias.includes(query) ? 40 : normalize(item.description).includes(query) ? 10 : 0;
      return {...item,score};
    }).filter(item=>item.score).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name,'ko')).slice(0,8);
    results.replaceChildren(); active = -1;
    if (!matches.length) {
      const empty = document.createElement('p'); empty.className='search-empty';
      empty.textContent='검색 결과가 없습니다. 짧은 단어로 검색하거나 분야를 바꿔 보세요.'; results.append(empty);
    }
    matches.forEach((item,i)=>{
      const link=document.createElement('a'); link.className='search-result'; link.href='/calculators/'+item.slug+'.html';
      link.id='search-option-'+i; link.setAttribute('role','option'); link.setAttribute('aria-selected','false');
      const name=document.createElement('span'); name.textContent=item.name;
      const label=document.createElement('small'); label.textContent=categories[item.category] || '';
      link.append(name,label); results.append(link);
    });
    results.hidden=false; input.setAttribute('aria-expanded','true'); input.removeAttribute('aria-activedescendant');
  }
  input.addEventListener('input',render); input.addEventListener('focus',()=>{if(input.value || category.value)render();});
  category.addEventListener('change',()=>{render();input.focus();});
  input.addEventListener('keydown',event=>{
    if(event.key==='Escape'){close();return;}
    if(event.key==='ArrowDown'||event.key==='ArrowUp') { event.preventDefault(); if(results.hidden)render(); select(active+(event.key==='ArrowDown'?1:-1)); }
  });
  form.addEventListener('submit',event=>{event.preventDefault();if(results.hidden)render();if(matches.length)location.href='/calculators/'+matches[Math.max(0,active)].slug+'.html';});
  document.addEventListener('click',event=>{if(!form.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)&&!event.target.isContentEditable){event.preventDefault();input.focus();}});

  const recent=document.querySelector('#recent-tools');
  try {
    const stored=JSON.parse(localStorage.getItem('cp-recent-tools')||'[]');
    const slugs=Array.isArray(stored)?stored.filter(slug=>typeof slug==='string'):[];
    const known=[...new Set(slugs)].map(slug=>index.find(item=>item.slug===slug)).filter(Boolean).slice(0,6);
    if(known.length){
      const grid=document.createElement('div');grid.className='home-tools';
      known.forEach(item=>{const a=document.createElement('a');a.className='home-tool';a.href='/calculators/'+item.slug+'.html';const icon=document.createElement('span');icon.className='tool-icon';icon.textContent='↗';icon.setAttribute('aria-hidden','true');const text=document.createElement('span');const b=document.createElement('b');b.textContent=item.name;const small=document.createElement('small');small.textContent=categories[item.category];text.append(b,small);a.append(icon,text);grid.append(a);});
      recent.replaceChildren(grid);
    }
  } catch { /* Storage is optional. Search and links keep working. */ }
  const tabs=[...document.querySelectorAll('.home-tabs [role="tab"]')];
  function activate(tab){tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;});}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activate(tabs[next]);tabs[next].focus();});});
})();
