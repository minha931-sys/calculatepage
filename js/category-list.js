(function(){
  const section=document.querySelector('#category .category-all');
  const heading=section?.querySelector('.section-heading');
  const grid=section?.querySelector('.card-grid');
  const cards=grid?[...grid.querySelectorAll('.calc-card')]:[];
  if(!section||!heading||!grid||!cards.length)return;

  const details=document.createElement('details');
  details.className='category-list-disclosure';

  const summary=document.createElement('summary');
  const summaryText=document.createElement('strong');
  const summaryHint=document.createElement('span');
  summaryText.textContent=`전체 ${cards.length}개 계산기`;
  summaryHint.textContent='목록 펼쳐보기';
  summary.append(summaryText,summaryHint);

  const panel=document.createElement('div');
  panel.className='category-list-panel';
  const filter=document.createElement('label');
  filter.className='category-list-filter';
  const filterLabel=document.createElement('span');
  filterLabel.textContent='계산기 찾기';
  const input=document.createElement('input');
  input.type='search';
  input.placeholder='예: 대출, 세금, 시급';
  input.autocomplete='off';
  input.setAttribute('aria-controls','category-all-grid');
  grid.id='category-all-grid';
  filter.append(filterLabel,input);

  const status=document.createElement('p');
  status.className='category-list-status';
  status.setAttribute('aria-live','polite');
  status.textContent=`총 ${cards.length}개 계산기`;

  const normalize=value=>value.toLocaleLowerCase('ko-KR').replace(/\s+/g,'');
  const update=()=>{
    const query=normalize(input.value.trim());
    let visible=0;
    cards.forEach(card=>{
      const matched=!query||normalize(card.textContent||'').includes(query);
      card.hidden=!matched;
      if(matched)visible+=1;
    });
    status.textContent=query?`${visible}개 계산기를 찾았습니다.`:`총 ${cards.length}개 계산기`;
  };

  input.addEventListener('input',update);
  input.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&input.value){
      input.value='';
      update();
    }
  });
  details.addEventListener('toggle',()=>{
    summaryHint.textContent=details.open?'목록 접기':'목록 펼쳐보기';
  });

  heading.after(details);
  panel.append(filter,status,grid);
  details.append(summary,panel);
  section.classList.add('category-all-enhanced');
})();
