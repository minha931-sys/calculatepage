const calculators={
 percent:{n:'퍼센트 계산기',c:'money',d:'금액의 퍼센트와 퍼센트 비율을 간편하게 계산합니다.',f:[['number','기준값','100'],['number','퍼센트(%)','10']],op:'percent',r:['discount','vat']},discount:{n:'할인율 계산기',c:'money',d:'정가와 할인율을 입력해 할인 금액과 최종 가격을 계산합니다.',f:[['number','정가(원)','100000'],['number','할인율(%)','20']],op:'discount',r:['percent','dutch-pay']},'savings-interest':{n:'예금 이자 계산기',c:'money',d:'예금 원금, 금리, 기간으로 세전·세후 이자를 계산합니다.',f:[['number','예금 원금(원)','10000000'],['number','연 이자율(%)','3.5'],['number','예치 기간(개월)','12']],op:'interest',r:['installment','loan-interest']},installment:{n:'적금 계산기',c:'money',d:'매월 납입액과 금리로 적금 만기 예상액을 계산합니다.',f:[['number','월 납입액(원)','300000'],['number','연 이자율(%)','3.5'],['number','가입 기간(개월)','12']],op:'installment',r:['savings-interest','budget']},'loan-interest':{n:'대출 이자 계산기',c:'money',d:'대출금과 금리를 입력해 월 이자와 총 이자를 확인합니다.',f:[['number','대출 원금(원)','10000000'],['number','연 이자율(%)','4.5'],['number','대출 기간(개월)','36']],op:'loan',r:['savings-interest','salary']},salary:{n:'월급 실수령액 계산기',c:'money',d:'월 급여에서 예상 공제액을 뺀 월 실수령액을 계산합니다.',f:[['number','월 세전 급여(원)','3000000'],['number','공제율(%)','9']],op:'salary',r:['budget','freelance-rate']},budget:{n:'생활비 예산 계산기',c:'money',d:'월 수입과 고정·변동 지출을 바탕으로 남는 생활비를 계산합니다.',f:[['number','월 수입(원)','3000000'],['number','고정 지출(원)','1000000'],['number','변동 지출(원)','800000']],op:'budget',r:['dutch-pay','salary']},
 gpa:{n:'학점 계산기',c:'education',d:'과목별 학점과 성적을 입력해 이번 학기 평균 평점을 계산합니다.',op:'gpa',r:['target-gpa','average-score']},'target-gpa':{n:'목표 학점 계산기',c:'education',d:'누적 평점과 목표 평점을 바탕으로 다음 학기에 필요한 평점을 계산합니다.',f:[['number','현재 이수 학점','60'],['number','현재 평균 평점','3.5'],['number','다음 학기 학점','18'],['number','목표 누적 평점','3.8']],op:'targetgpa',r:['gpa','retake']},retake:{n:'재수강 학점 계산기',c:'education',d:'재수강 전후 성적과 학점으로 평균 평점 변화를 계산합니다.',f:[['number','현재 이수 학점','60'],['number','현재 평균 평점','3.2'],['number','재수강 과목 학점','3'],['number','기존 성적 평점','2.0'],['number','새 성적 평점','4.0']],op:'retake',r:['gpa','target-gpa']},'school-grade':{n:'내신 등급 계산기',c:'education',d:'석차와 전체 인원을 입력해 예상 내신 등급을 확인합니다.',f:[['number','내 석차','20'],['number','전체 학생 수','200']],op:'rank',r:['average-score','exam-dday']},'average-score':{n:'평균 점수 계산기',c:'education',d:'여러 과목의 점수를 입력해 평균 점수를 계산합니다.',f:[['text','점수 (쉼표로 구분)','80, 90, 85']],op:'average',r:['gpa','school-grade']},'exam-dday':{n:'시험 D-day 계산기',c:'education',d:'시험 날짜까지 남은 일수를 계산해 학습 계획에 활용하세요.',f:[['date','시험 날짜','']],op:'dday',r:['d-day','average-score']},
 bmi:{n:'BMI 계산기',c:'health',d:'키와 몸무게를 입력해 체질량지수(BMI)를 계산합니다.',f:[['number','키(cm)','170'],['number','몸무게(kg)','65']],op:'bmi',r:['bmr','target-weight']},bmr:{n:'기초대사량 계산기',c:'health',d:'성별, 나이, 키, 몸무게를 기준으로 기초대사량을 계산합니다.',f:[['select','성별','남성|여성'],['number','나이','30'],['number','키(cm)','170'],['number','몸무게(kg)','65']],op:'bmr',r:['calorie','bmi']},calorie:{n:'권장 칼로리 계산기',c:'health',d:'기초대사량과 활동량을 기준으로 하루 권장 칼로리를 계산합니다.',f:[['number','기초대사량(kcal)','1500'],['select','활동량','낮음|보통|높음']],op:'calorie',r:['bmr','exercise-calorie']},water:{n:'물 섭취량 계산기',c:'health',d:'몸무게를 바탕으로 하루 권장 물 섭취량을 계산합니다.',f:[['number','몸무게(kg)','65']],op:'water',r:['calorie','bmi']},'exercise-calorie':{n:'운동 칼로리 계산기',c:'health',d:'운동 강도와 시간을 입력해 예상 소모 칼로리를 계산합니다.',f:[['number','몸무게(kg)','65'],['select','운동 강도','가벼움|보통|격렬함'],['number','운동 시간(분)','30']],op:'exercise',r:['calorie','running-pace']},'target-weight':{n:'목표 체중 계산기',c:'health',d:'키와 목표 BMI를 기준으로 목표 체중을 계산합니다.',f:[['number','키(cm)','170'],['number','목표 BMI','22']],op:'targetweight',r:['bmi','water']},'running-pace':{n:'러닝 페이스 계산기',c:'health',d:'달린 거리와 시간을 입력해 1km당 러닝 페이스를 계산합니다.',f:[['number','거리(km)','5'],['number','시간(분)','30']],op:'pace',r:['exercise-calorie','bmi']},
 date:{n:'날짜 계산기',c:'life',d:'기준 날짜에서 원하는 일수만큼 전후 날짜를 계산합니다.',f:[['date','기준 날짜',''],['number','더할 일수','100']],op:'date',r:['d-day','age']},'d-day':{n:'디데이 계산기',c:'life',d:'중요한 날짜까지 남은 날 또는 지난 날을 계산합니다.',f:[['date','목표 날짜','']],op:'dday',r:['date','exam-dday']},age:{n:'나이 계산기',c:'life',d:'출생일을 기준으로 현재 한국식 나이를 계산합니다.',f:[['date','생년월일','']],op:'age',r:['international-age','d-day']},'international-age':{n:'만나이 계산기',c:'life',d:'출생일을 기준으로 현재 만 나이를 계산합니다.',f:[['date','생년월일','']],op:'internationalage',r:['age','date']},time:{n:'시간 계산기',c:'life',d:'시작·종료 시간을 입력해 경과 시간을 계산합니다.',f:[['time','시작 시간','09:00'],['time','종료 시간','18:00']],op:'time',r:['work-hours','date']},'dutch-pay':{n:'더치페이 계산기',c:'life',d:'여러 정산 항목을 추가하고 전체 인원수로 1인당 더치페이 금액을 계산합니다.',f:[['number','총 금액(원)','50000'],['number','인원 수','4']],op:'dutch',r:['discount','budget']},unit:{n:'단위 변환 계산기',c:'life',d:'길이와 무게 단위를 빠르게 변환합니다.',f:[['number','값','1'],['select','변환','km → m|m → cm|kg → g']],op:'unit',r:['percent','time']},
 vat:{n:'부가세 계산기',c:'business',d:'공급가액 또는 합계 금액을 기준으로 부가세를 계산합니다.',f:[['number','공급가액(원)','100000']],op:'vat',r:['margin','estimate']},margin:{n:'마진율 계산기',c:'business',d:'판매가와 원가를 입력해 이익과 마진율을 계산합니다.',f:[['number','판매가(원)','50000'],['number','원가(원)','30000']],op:'margin',r:['vat','freelance-rate']},wage:{n:'시급 계산기',c:'business',d:'월급과 월 근무시간으로 예상 시급을 계산합니다.',f:[['number','월 급여(원)','2500000'],['number','월 근무시간','209']],op:'wage',r:['work-hours','salary']},'work-hours':{n:'근무시간 계산기',c:'business',d:'출퇴근 시간과 휴게 시간을 바탕으로 실제 근무시간을 계산합니다.',f:[['time','출근 시간','09:00'],['time','퇴근 시간','18:00'],['number','휴게 시간(분)','60']],op:'work',r:['wage','time']},estimate:{n:'견적 계산기',c:'business',d:'수량과 단가를 입력해 견적 금액과 부가세를 계산합니다.',f:[['number','수량','10'],['number','단가(원)','10000']],op:'estimate',r:['vat','margin']},'freelance-rate':{n:'프리랜서 단가 계산기',c:'business',d:'목표 월수입과 작업 시간을 기준으로 필요한 시간당 단가를 계산합니다.',f:[['number','목표 월수입(원)','4000000'],['number','월 작업시간','120']],op:'freelance',r:['estimate','wage']},severance:{n:'퇴직금 계산기',c:'business',d:'평균 임금과 근속일수를 기준으로 예상 퇴직금을 계산합니다.',f:[['number','최근 3개월 임금 합계(원)','9000000'],['number','근속 일수','730']],op:'severance',r:['wage','salary']}}
const cats={money:['돈 계산기','💳','돈과 금융에 필요한 계산기','percent discount savings-interest installment loan-interest salary budget'],education:['교육 계산기','📚','학점과 시험을 위한 계산기','gpa target-gpa retake school-grade average-score exam-dday'],health:['건강 계산기','🌿','건강 관리와 운동 계산기','bmi bmr calorie water exercise-calorie target-weight running-pace'],life:['생활 계산기','🗓️','매일 필요한 생활 계산기','date d-day age international-age time dutch-pay unit'],business:['업무 계산기','💼','일과 사업에 필요한 계산기','vat margin wage work-hours estimate freelance-rate severance']};
const popularCalculatorIds=['percent','discount','salary','gpa','d-day','dutch-pay'];
const searchBoostIds=['percent','discount','salary','gpa','d-day','dutch-pay','savings-interest','loan-interest','vat','area-conversion','date','work-hours'];
const searchAliases={percent:'퍼센트 백분율 비율 몇프로',discount:'할인 세일 할인율 최종가격',salary:'월급 급여 실수령액 세후 연봉',gpa:'학점 평점 대학 성적', 'd-day':'디데이 dday 날짜 기념일 시험', 'dutch-pay':'더치페이 n분의1 엔빵 정산 모임', 'savings-interest':'예금 이자 저축 금리 세후', 'loan-interest':'대출 이자 월이자 대출금', vat:'부가세 공급가액 세금', 'area-conversion':'평수 평 제곱미터 m2 면적 아파트', date:'날짜 일수 며칠 후', 'work-hours':'근무시간 출퇴근 휴게시간'};
const href=k=>`/calculators/${k}.html`; const card=k=>`<a class="calc-card" href="${href(k)}"><b>${calculators[k].n}</b><span>${calculators[k].d}</span></a>`;
function val(i){return i?.value||0} function won(n){return Math.round(n).toLocaleString('ko-KR')+'원'}
function compute(op,x){let a=+val(x[0]),b=+val(x[1]),c=+val(x[2]),d=+val(x[3]),e=+val(x[4]), today=new Date();switch(op){case'percent':return[`${(a*b/100).toLocaleString()} (기준값의 ${b}%)`,`${a.toLocaleString()}의 ${b}%입니다.`];case'discount':return[won(a*(1-b/100)),`할인 금액 ${won(a*b/100)} · 최종 가격입니다.`];case'interest':let it=a*b/100*c/12;return[won(a+it*.846),`세전 이자 ${won(it)} · 이자소득세 15.4% 반영`];case'installment':let total=a*c,ii=a*b/100*((c+1)/24);return[won(total+ii*.846),`원금 ${won(total)} · 예상 세전 이자 ${won(ii)}`];case'loan':return[won(a*b/100/12),`매월 단순 이자 · ${c}개월 총 이자 ${won(a*b/100*c/12)}`];case'salary':return[won(a*(1-b/100)),`예상 공제액 ${won(a*b/100)}입니다.`];case'budget':return[won(a-b-c),`수입에서 고정·변동 지출을 뺀 월 잔액입니다.`];case'targetgpa':return[`${((d*(a+c)-a*b)/c).toFixed(2)} / 4.5`,`목표 누적 평점을 위한 다음 학기 필요 평점입니다.`];case'remaining':return[`${Math.max(a-b,0).toLocaleString()}학점`,`졸업까지 남은 학점입니다.`];case'retake':return[`${((a*b-c*d+c*e)/a).toFixed(2)} / 4.5`,`재수강 후 예상 평균 평점입니다.`];case'rank':let p=a/b*100,grade=p<=4?1:p<=11?2:p<=23?3:p<=40?4:p<=60?5:p<=77?6:p<=89?7:p<=96?8:9;return[`${grade}등급`,`상위 ${p.toFixed(1)}% 기준의 예상 등급입니다.`];case'average':let z=x[0].value.split(',').map(Number).filter(Number.isFinite);return[`${(z.reduce((s,n)=>s+n,0)/z.length).toFixed(1)}점`,`총 ${z.length}개 점수의 산술 평균입니다.`];case'dday':let dt=new Date(x[0].value),days=Math.ceil((dt-today)/864e5);return[days>=0?`D-${days}`:`D+${Math.abs(days)}`,`${dt.toLocaleDateString('ko-KR')} 기준입니다.`];case'bmi':let bmi=b/(a/100)**2;return[`${bmi.toFixed(1)} BMI`,bmi<18.5?'저체중 범위입니다.':bmi<23?'정상 범위입니다.':bmi<25?'과체중 범위입니다.':'비만 범위입니다.'];case'bmr':return[`${Math.round(x[0].value==='남성'?88.362+13.397*d+4.799*c-5.677*b:447.593+9.247*d+3.098*c-4.33*b)} kcal`,`하루 기초대사량 추정치입니다.`];case'calorie':return[`${Math.round(a*({낮음:1.2,보통:1.55,높음:1.725}[x[1].value]))} kcal`,`활동량을 반영한 하루 권장 열량입니다.`];case'water':return[`${Math.round(a*30).toLocaleString()} ml`,`하루 권장 물 섭취량의 일반적인 추정치입니다.`];case'exercise':return[`${Math.round(a*({가벼움:3.5,보통:6,격렬함:9}[x[1].value])*c/60)} kcal`,`운동으로 소모한 예상 칼로리입니다.`];case'targetweight':return[`${(a/100)**2*b.toFixed?((a/100)**2*b).toFixed(1):0} kg`,`키와 목표 BMI 기준의 목표 체중입니다.`];case'pace':let s=Math.floor(b/a),sec=Math.round((b/a-s)*60);return[`${s}' ${String(sec).padStart(2,'0')}" /km`,`1km당 러닝 페이스입니다.`];case'date':let dd=new Date(x[0].value);dd.setDate(dd.getDate()+a);return[dd.toLocaleDateString('ko-KR'),`${a}일 후 날짜입니다.`];case'age':return[`${today.getFullYear()-new Date(x[0].value).getFullYear()+1}세`,`현재 연도 기준 한국식 나이입니다.`];case'internationalage':let born=new Date(x[0].value),age=today.getFullYear()-born.getFullYear()-(today<new Date(today.getFullYear(),born.getMonth(),born.getDate()));return[`만 ${age}세`,`생일 경과 여부를 반영했습니다.`];case'time':let m=t=>{let q=t.value.split(':');return +q[0]*60+(+q[1])};let mins=m(x[1])-m(x[0]);if(mins<0)mins+=1440;return[`${Math.floor(mins/60)}시간 ${mins%60}분`,`시작부터 종료까지의 시간입니다.`];case'dutch':return[won(a/b),`${b}명이 균등하게 나눈 금액입니다.`];case'unit':let map={'km → m':[1000,'m'],'m → cm':[100,'cm'],'kg → g':[1000,'g']}[x[1].value];return[`${(a*map[0]).toLocaleString()} ${map[1]}`,`${x[1].value} 변환 결과입니다.`];case'vat':return[won(a*1.1),`공급가액 ${won(a)} · 부가세 ${won(a*.1)}`];case'margin':return[`${((a-b)/a*100).toFixed(1)}%`,`이익 ${won(a-b)} · 판매가 기준 마진율입니다.`];case'wage':return[won(a/b),`월 급여를 월 근무시간으로 나눈 시급입니다.`];case'work':let st=x[0].value.split(':').reduce((h,v)=>h*60+(+v),0),en=x[1].value.split(':').reduce((h,v)=>h*60+(+v),0),mm=en-st-c;if(mm<0)mm+=1440;return[`${Math.floor(mm/60)}시간 ${mm%60}분`,`휴게 시간을 제외한 실제 근무시간입니다.`];case'estimate':let sum=a*b;return[won(sum*1.1),`공급가액 ${won(sum)} · 부가세 ${won(sum*.1)}`];case'freelance':return[won(a/b),`목표 수입 달성을 위한 시간당 단가입니다.`];case'severance':return[won(a/90*30*(b/365)),`평균임금 기준의 간단한 예상 퇴직금입니다.`]}}
function page(){let key=document.body.dataset.calculator;if(!key)return;let q=calculators[key];document.title=`${q.n} | 계산페이지`;document.querySelector('meta[name="description"]')?.setAttribute('content',q.d);let fields=q.op==='gpa'?`<div class="field full"><label>과목별 입력 (학점:평점, 쉼표로 구분)</label><input id="gpa-data" value="3:4.5, 3:4.0, 2:3.5" placeholder="예: 3:4.5, 3:4.0"></div>`:q.f.map(z=>`<label class="field"><span>${z[1]}</span>${z[0]==='select'?`<select>${z[2].split('|').map(v=>`<option>${v}</option>`).join('')}</select>`:`<input type="${z[0]}" value="${z[2]}" ${z[0]==='date'?'required':''}>`}</label>`).join('');document.querySelector('#calculator').innerHTML=`<h1>${q.n}</h1><p class="lead">${q.d}</p><section class="calculator-box"><div class="fields">${fields}</div><button class="primary-btn" id="calculate">계산하기</button><div class="result" id="result"></div></section><section class="content-block"><h2>${q.n} 사용 방법</h2><ol><li>필요한 값을 입력하거나 선택하세요.</li><li>계산하기 버튼을 누르세요.</li><li>계산 결과를 확인하고 계획에 활용하세요.</li></ol></section><section class="content-block"><h2>계산 전 알아두세요</h2><p>${q.d} 입력값과 계산 방식에 따라 결과는 달라질 수 있으며, 결과는 참고용으로 제공됩니다.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related">${q.r.map(k=>`<a href="${href(k)}">${calculators[k].n}</a>`).join('')}</div></section>`;document.querySelector('#calculate').onclick=()=>{let ans;if(q.op==='gpa'){let rows=document.querySelector('#gpa-data').value.split(',').map(v=>v.trim().split(':').map(Number)).filter(v=>v.length===2&&v.every(Number.isFinite));let credits=rows.reduce((s,v)=>s+v[0],0),score=rows.reduce((s,v)=>s+v[0]*v[1],0);ans=[`${(score/credits).toFixed(2)} / 4.5`,`총 이수 학점 ${credits}학점 · 입력한 과목 기준`]}else ans=compute(q.op,[...document.querySelectorAll('.fields input,.fields select')]);let r=document.querySelector('#result');r.innerHTML=`<strong>${ans[0]}</strong><p>${ans[1]}</p>`;r.classList.add('show')}}
function home(){if(!document.querySelector('.popular-list'))return;document.querySelector('.popular-list').innerHTML=popularCalculatorIds.filter(id=>calculators[id]).map(card).join('');document.querySelector('#category-grid').innerHTML=Object.entries(cats).map(([k,v])=>`<a href="/categories/${k}.html"><span>${v[1]}</span>${v[0]}</a>`).join('');let inp=document.querySelector('#calculator-search'),box=document.querySelector('#search-results');inp.oninput=()=>{let s=inp.value.trim();box.innerHTML=s?Object.entries(calculators).filter(([,v])=>v.n.includes(s)).slice(0,7).map(([k,v])=>`<a class="search-result" href="${href(k)}">${v.n}<small>${cats[v.c][0]}</small></a>`).join(''):''}}
function category(){let key=document.body.dataset.category;if(!key||!cats[key])return;let c=cats[key];document.title=`${c[0]} | 계산페이지`;document.querySelector('#category').innerHTML=`<p class="eyebrow">${c[2]}</p><h1>${c[0]}</h1><p class="lead">${c[0]}에 필요한 무료 계산기를 모았습니다. 원하는 항목을 선택해 바로 계산하세요.</p><div class="card-grid">${c[3].split(' ').map(card).join('')}</div>`}home();category();page();
const baseCompute=compute;
compute=(op,x)=>op==='targetweight'?[`${((+x[0].value/100)**2*(+x[1].value)).toFixed(1)} kg`,'키와 목표 BMI 기준의 목표 체중입니다.']:baseCompute(op,x);
page();

function enhanceGpaCalculator(){
  if(document.body.dataset.calculator!=='gpa')return;
  const root=document.querySelector('#calculator');
  const gradeOptions=['선택','A+','A0','B+','B0','C+','C0','D+','D0','F','P'].map(v=>`<option value="${v}">${v}</option>`).join('');
  const creditOptions=['선택','1','2','3','4','5','6'].map(v=>`<option value="${v}">${v}</option>`).join('');
  const row=()=>`<tr><td><input class="course-name" aria-label="과목명" placeholder="과목명"></td><td><select class="course-grade" aria-label="성적">${gradeOptions}</select></td><td><select class="course-credit" aria-label="학점">${creditOptions}</select></td><td><label class="major-check"><input type="checkbox" aria-label="전공 과목"> <span>전공</span></label></td><td><button class="row-delete" type="button" aria-label="과목 삭제">×</button></td></tr>`;
  root.innerHTML=`<h1>학점 계산기</h1><p class="lead">과목별 성적과 학점을 입력하면 이번 학기 평균 평점을 바로 계산할 수 있습니다.</p><section class="calculator-box gpa-box"><div class="gpa-toolbar"><div><label for="grade-scale">평점 기준</label><select id="grade-scale"><option value="4.5">4.5 만점</option><option value="4.3">4.3 만점</option></select></div><label class="include-p"><input id="include-p" type="checkbox"> P/F 과목 포함</label><button type="button" class="add-course" id="add-course">+ 과목 추가</button></div><div class="gpa-table-wrap"><table class="gpa-table"><thead><tr><th>과목명</th><th>성적</th><th>학점</th><th>전공</th><th></th></tr></thead><tbody id="course-rows"></tbody></table></div><div class="gpa-actions"><button class="secondary-btn" id="reset-gpa" type="button">↻ 초기화</button><button class="primary-btn" id="calculate-gpa" type="button">평점 계산하기</button></div><div class="result" id="gpa-result" aria-live="polite"></div><p class="calculator-note">P/F 과목은 일반적으로 평점 평균에 포함되지 않습니다. 학교별 성적 환산 기준이 다를 수 있으니 최종 결과는 학칙을 확인해 주세요.</p></section><section class="content-block"><h2>학점 계산기 사용 방법</h2><ol><li>과목명, 받은 성적, 이수 학점을 차례로 입력하세요.</li><li>과목이 더 있으면 <strong>과목 추가</strong>를 눌러 행을 늘리세요.</li><li><strong>평점 계산하기</strong>를 눌러 총 이수 학점과 평균 평점을 확인하세요.</li></ol></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/target-gpa.html">목표 학점 계산기</a><a href="/calculators/retake.html">재수강 학점 계산기</a><a href="/calculators/average-score.html">평균 점수 계산기</a></div></section>`;
  const tbody=root.querySelector('#course-rows');
  const add=(n=1)=>{for(let i=0;i<n;i++)tbody.insertAdjacentHTML('beforeend',row())};
  add(6);
  root.querySelector('#add-course').onclick=()=>add();
  tbody.onclick=e=>{if(e.target.closest('.row-delete')&&tbody.children.length>1)e.target.closest('tr').remove()};
  root.querySelector('#reset-gpa').onclick=()=>{tbody.innerHTML='';add(6);root.querySelector('#gpa-result').classList.remove('show')};
  root.querySelector('#calculate-gpa').onclick=()=>{
    const scale=+root.querySelector('#grade-scale').value;
    const points=scale===4.5?{'A+':4.5,A0:4,'B+':3.5,B0:3,'C+':2.5,C0:2,'D+':1.5,D0:1,F:0}:{'A+':4.3,A0:4,'B+':3.3,B0:3,'C+':2.3,C0:2,'D+':1.3,D0:1,F:0};
    const includeP=root.querySelector('#include-p').checked;let credits=0,total=0,majorCredits=0,entered=0;
    [...tbody.querySelectorAll('tr')].forEach(tr=>{const grade=tr.querySelector('.course-grade').value,credit=+tr.querySelector('.course-credit').value;if(!credit||grade==='선택'||(grade==='P'&&!includeP))return;entered++;credits+=credit;if(tr.querySelector('input[type=checkbox]').checked)majorCredits+=credit;if(grade!=='P')total+=points[grade]*credit});
    const result=root.querySelector('#gpa-result');
    if(!entered){result.innerHTML='<strong>성적과 학점을 입력해 주세요</strong><p>계산할 과목이 아직 없습니다.</p>';result.classList.add('show');return}
    result.innerHTML=`<div class="gpa-result-grid"><div><span>평균 평점</span><strong>${(total/credits).toFixed(2)} / ${scale.toFixed(1)}</strong></div><div><span>총 이수 학점</span><b>${credits}학점</b></div><div><span>전공 이수 학점</span><b>${majorCredits}학점</b></div></div>`;result.classList.add('show');
  };
}
enhanceGpaCalculator();

// F 학점 반영 여부는 학교별 학점 계산에서 자주 필요한 옵션입니다.
if(document.body.dataset.calculator==='gpa'){
  const root=document.querySelector('#calculator');
  root.querySelector('.include-p').lastChild.textContent=' F학점 포함';
  root.querySelector('#calculate-gpa').onclick=()=>{
    const scale=+root.querySelector('#grade-scale').value;
    const points=scale===4.5?{'A+':4.5,A0:4,'B+':3.5,B0:3,'C+':2.5,C0:2,'D+':1.5,D0:1,F:0}:{'A+':4.3,A0:4,'B+':3.3,B0:3,'C+':2.3,C0:2,'D+':1.3,D0:1,F:0};
    const includeF=root.querySelector('#include-p').checked;let credits=0,total=0,majorCredits=0,entered=0;
    [...root.querySelectorAll('#course-rows tr')].forEach(tr=>{const grade=tr.querySelector('.course-grade').value,credit=+tr.querySelector('.course-credit').value;if(!credit||grade==='선택'||grade==='P'||(grade==='F'&&!includeF))return;entered++;credits+=credit;if(tr.querySelector('input[type=checkbox]').checked)majorCredits+=credit;total+=points[grade]*credit});
    const result=root.querySelector('#gpa-result');
    if(!entered){result.innerHTML='<strong>성적과 학점을 입력해 주세요</strong><p>계산할 과목이 아직 없습니다.</p>';result.classList.add('show');return}
    result.innerHTML=`<div class="gpa-result-grid"><div><span>평균 평점</span><strong>${(total/credits).toFixed(2)} / ${scale.toFixed(1)}</strong></div><div><span>총 이수 학점</span><b>${credits}학점</b></div><div><span>전공 이수 학점</span><b>${majorCredits}학점</b></div></div>`;result.classList.add('show');
  };
}




// 일반 계산기 공통 실행: 각 페이지의 버튼이 항상 같은 방식으로 결과를 표시합니다.
function bindStandardCalculator(){
  const key=document.body.dataset.calculator;
  const button=document.querySelector('#calculate');
  if(!key||!button||key==='gpa')return;
  button.onclick=()=>{
    const result=document.querySelector('#result');
    try{
      const config=calculators[key];
      const inputs=[...document.querySelectorAll('.fields input,.fields select')];
      if(!config||!inputs.length)throw new Error('입력 항목을 찾을 수 없습니다.');
      const answer=compute(config.op,inputs);
      if(!answer||!answer[0])throw new Error('계산 결과를 만들 수 없습니다.');
      result.innerHTML=`<strong>${answer[0]}</strong><p>${answer[1]||''}</p>`;
      result.classList.add('show');
    }catch(error){
      result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>모든 필수 항목을 올바르게 입력한 뒤 다시 계산해 주세요.</p>';
      result.classList.add('show');
      console.error('계산기 실행 오류:',error);
    }
  };
}
bindStandardCalculator();

function enhancePercentCalculator(){
  if(document.body.dataset.calculator!=='percent')return;
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>퍼센트 계산기</h1><p class="lead">전체의 일정 비율, 비율로 전체 금액 구하기, 전체 대비 비율을 빠르게 계산하세요.</p><section class="calculator-box percent-box"><div class="percent-tabs" role="tablist"><button class="percent-tab active" data-mode="of" role="tab">전체의 몇 %</button><button class="percent-tab" data-mode="whole" role="tab">전체 구하기</button><button class="percent-tab" data-mode="ratio" role="tab">몇 %인지 구하기</button></div><div id="percent-form"></div><div class="result" id="percent-result" aria-live="polite"></div></section><section class="content-block"><h2>퍼센트 계산기 사용 방법</h2><ol><li><strong>전체의 몇 %</strong>: 기준값에서 원하는 비율의 값을 구합니다.</li><li><strong>전체 구하기</strong>: 일부 값과 그 비율을 알고 있을 때 원래 전체값을 구합니다.</li><li><strong>몇 %인지 구하기</strong>: 부분값이 전체에서 차지하는 비율을 구합니다.</li></ol></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/discount.html">할인율 계산기</a><a href="/calculators/vat.html">부가세 계산기</a><a href="/calculators/margin.html">마진율 계산기</a></div></section>`;
  const forms={
    of:{title:'전체의 몇 % 구하기',hint:'예: 100,000원의 15%는 얼마인가요?',fields:[['전체 값','100000'],['퍼센트(%)','15']],answer:(a,b)=>[a*b/100,`${a.toLocaleString('ko-KR')}의 ${b}%입니다.`]},
    whole:{title:'부분값과 비율로 전체 구하기',hint:'예: 15,000원이 전체의 15%일 때 전체 금액은 얼마인가요?',fields:[['부분 값','15000'],['퍼센트(%)','15']],answer:(a,b)=>[a/b*100,`${a.toLocaleString('ko-KR')}이 ${b}%일 때의 전체 값입니다.`]},
    ratio:{title:'부분값은 전체의 몇 %인지 구하기',hint:'예: 15,000원은 100,000원의 몇 %인가요?',fields:[['부분 값','15000'],['전체 값','100000']],answer:(a,b)=>[a/b*100,`${a.toLocaleString('ko-KR')}은 ${b.toLocaleString('ko-KR')}의 비율입니다.`]}
  };
  let mode='of';const form=root.querySelector('#percent-form'),result=root.querySelector('#percent-result');
  const render=()=>{const data=forms[mode];form.innerHTML=`<h2>${data.title}</h2><p>${data.hint}</p><div class="percent-fields">${data.fields.map((field,i)=>`<label><span>${field[0]}</span><input id="percent-value-${i}" type="number" min="0" step="any" value="${field[1]}"></label>`).join('')}</div><button class="primary-btn" id="calculate-percent" type="button">계산하기</button>`;form.querySelector('#calculate-percent').onclick=()=>{const a=+form.querySelector('#percent-value-0').value,b=+form.querySelector('#percent-value-1').value;if(!Number.isFinite(a)||!Number.isFinite(b)||b===0){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>0보다 큰 숫자를 입력해 주세요.</p>';result.classList.add('show');return}const [value,text]=data.answer(a,b);result.innerHTML=`<strong>${Number(value.toFixed(6)).toLocaleString('ko-KR')}</strong><p>${text}</p>`;result.classList.add('show')}};
  root.querySelector('.percent-tabs').onclick=e=>{const tab=e.target.closest('.percent-tab');if(!tab)return;mode=tab.dataset.mode;root.querySelectorAll('.percent-tab').forEach(button=>button.classList.toggle('active',button===tab));result.classList.remove('show');render()};
  render();
}
enhancePercentCalculator();

// 실제 값 대신 연한 예시(placeholder)만 보여 주어, 클릭 후 바로 입력할 수 있게 합니다.
function usePlaceholders(scope=document){
  scope.querySelectorAll('input:not([type="checkbox"])').forEach(input=>{
    if(input.dataset.exampleHandled||!input.value)return;
    input.dataset.exampleHandled='true';
    if(['number','text','search'].includes(input.type))input.placeholder=`예: ${input.value}`;
    input.value='';
  });
  scope.querySelectorAll('.fields select').forEach(select=>{
    if(select.dataset.exampleHandled)return;
    select.dataset.exampleHandled='true';
    const option=document.createElement('option');option.value='';option.textContent='선택';option.selected=true;
    select.prepend(option);
  });
}
usePlaceholders();
if(document.body.dataset.calculator==='percent'){
  const percentForm=document.querySelector('#percent-form');
  new MutationObserver(()=>usePlaceholders(percentForm)).observe(percentForm,{childList:true,subtree:true});
}

function enhanceSavingsInterestCalculator(){
  if(document.body.dataset.calculator!=='savings-interest')return;
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>예금 이자 계산기</h1><p class="lead">정기예금과 적립식 예금의 만기 예상액 및 세전·세후 이자를 계산하세요.</p><section class="calculator-box savings-box"><div class="savings-tabs" role="tablist"><button class="savings-tab active" data-mode="fixed" role="tab">정기예금</button><button class="savings-tab" data-mode="installment" role="tab">적립식 예금</button></div><div id="savings-form"></div><div class="result" id="savings-result" aria-live="polite"></div><p class="calculator-note">이자소득세 15.4%를 적용한 단순 계산 결과입니다. 실제 만기 수령액은 금융상품의 우대금리·이자 계산 방식에 따라 달라질 수 있습니다.</p></section><section class="content-block"><h2>정기예금과 적립식 예금의 차이</h2><p>정기예금은 목돈을 한 번에 예치하는 방식이고, 적립식 예금은 매달 일정 금액을 납입하는 방식입니다. 적립식은 납입 시점마다 예치 기간이 달라지므로 같은 금리라도 이자 계산 결과가 다를 수 있습니다.</p></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/loan-interest.html">대출 이자 계산기</a><a href="/calculators/budget.html">생활비 예산 계산기</a><a href="/calculators/percent.html">퍼센트 계산기</a></div></section>`;
  const forms={
    fixed:{title:'정기예금 이자 계산',hint:'목돈을 한 번에 예치하는 경우입니다.',fields:[['예치 금액(원)','10000000'],['연 이자율(%)','3.5'],['예치 기간(개월)','12']],calc:(a,b,c)=>{const interest=a*b/100*c/12;return {principal:a,interest,total:a+interest}}},
    installment:{title:'적립식 예금 이자 계산',hint:'매달 같은 금액을 납입하는 경우입니다.',fields:[['월 납입액(원)','300000'],['연 이자율(%)','3.5'],['가입 기간(개월)','12']],calc:(a,b,c)=>{const principal=a*c,interest=a*b/100*(c+1)/24;return {principal,interest,total:principal+interest}}}
  };
  let mode='fixed';const form=root.querySelector('#savings-form'),result=root.querySelector('#savings-result');
  const money=value=>Math.round(value).toLocaleString('ko-KR')+'원';
  const render=()=>{const data=forms[mode];form.innerHTML=`<div class="savings-form-inner"><h2>${data.title}</h2><p>${data.hint}</p><div class="savings-fields">${data.fields.map((field,i)=>`<label><span>${field[0]}</span><input id="savings-value-${i}" type="number" min="0" step="any" value="${field[1]}"></label>`).join('')}</div><button class="primary-btn" id="calculate-savings" type="button">계산하기</button></div>`;usePlaceholders(form);form.querySelector('#calculate-savings').onclick=()=>{const values=[0,1,2].map(i=>form.querySelector(`#savings-value-${i}`).value);if(values.some(value=>value.trim()==='')){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>모든 항목을 입력한 뒤 다시 계산해 주세요.</p>';result.classList.add('show');return}const [a,b,c]=values.map(Number);if(!Number.isFinite(a)||!Number.isFinite(b)||!Number.isFinite(c)||a<0||b<0||c<=0){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>0보다 큰 기간과 올바른 숫자를 입력해 주세요.</p>';result.classList.add('show');return}const dataResult=data.calc(a,b,c),afterTax=dataResult.interest*.846;result.innerHTML=`<div class="savings-result-grid"><div><span>만기 예상액</span><strong>${money(dataResult.principal+afterTax)}</strong></div><div><span>세전 이자</span><b>${money(dataResult.interest)}</b></div><div><span>세후 이자</span><b>${money(afterTax)}</b></div><div><span>원금</span><b>${money(dataResult.principal)}</b></div></div>`;result.classList.add('show')}};
  root.querySelector('.savings-tabs').onclick=e=>{const tab=e.target.closest('.savings-tab');if(!tab)return;mode=tab.dataset.mode;root.querySelectorAll('.savings-tab').forEach(button=>button.classList.toggle('active',button===tab));result.classList.remove('show');render()};
  render();
}
enhanceSavingsInterestCalculator();

function addSavingsTaxOption(){
  if(document.body.dataset.calculator!=='savings-interest')return;
  const root=document.querySelector('#calculator');
  const form=root.querySelector('#savings-form');
  const button=form?.querySelector('#calculate-savings');
  if(!button||button.dataset.taxBound)return;
  button.dataset.taxBound='true';
  button.insertAdjacentHTML('beforebegin','<label class="tax-option"><input id="include-interest-tax" type="checkbox" checked> 이자소득세 15.4% 반영</label>');
  button.onclick=()=>{
    const values=[0,1,2].map(i=>form.querySelector(`#savings-value-${i}`).value);
    const result=root.querySelector('#savings-result');
    if(values.some(value=>value.trim()==='')){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>모든 항목을 입력한 뒤 다시 계산해 주세요.</p>';result.classList.add('show');return}
    const [amount,rate,months]=values.map(Number);
    if(!Number.isFinite(amount)||!Number.isFinite(rate)||!Number.isFinite(months)||amount<0||rate<0||months<=0){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>0보다 큰 기간과 올바른 숫자를 입력해 주세요.</p>';result.classList.add('show');return}
    const installment=root.querySelector('.savings-tab.active').dataset.mode==='installment';
    const principal=installment?amount*months:amount;
    const interest=installment?amount*rate/100*(months+1)/24:amount*rate/100*months/12;
    const taxApplied=root.querySelector('#include-interest-tax').checked;
    const receivedInterest=taxApplied?interest*.846:interest;
    const money=value=>Math.round(value).toLocaleString('ko-KR')+'원';
    result.innerHTML=`<div class="savings-result-grid"><div><span>만기 예상액</span><strong>${money(principal+receivedInterest)}</strong></div><div><span>${taxApplied?'세전 이자':'예상 이자'}</span><b>${money(interest)}</b></div><div><span>${taxApplied?'세후 이자':'적용 세금'}</span><b>${taxApplied?money(receivedInterest):'0원'}</b></div><div><span>원금</span><b>${money(principal)}</b></div></div>`;
    result.classList.add('show');
  };
}
addSavingsTaxOption();
if(document.body.dataset.calculator==='savings-interest')new MutationObserver(addSavingsTaxOption).observe(document.querySelector('#savings-form'),{childList:true,subtree:true});

function enhanceLoanCalculator(){
  if(document.body.dataset.calculator!=='loan-interest')return;
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>대출 이자 계산기</h1><p class="lead">상환 방법별 월 납입액과 총이자를 비교해 내게 맞는 대출 상환 계획을 세워 보세요.</p><section class="calculator-box loan-box"><div class="loan-tabs" role="tablist"><button class="loan-tab active" data-mode="annuity" role="tab">원리금균등상환</button><button class="loan-tab" data-mode="principal" role="tab">원금균등상환</button><button class="loan-tab" data-mode="bullet" role="tab">만기일시상환</button></div><div id="loan-form"></div><div class="result" id="loan-result" aria-live="polite"></div><p class="calculator-note">중도상환수수료, 인지세, 거치기간 등은 반영하지 않은 단순 예상 결과입니다. 실제 상환 금액은 금융기관의 상품 조건을 확인해 주세요.</p></section><section class="content-block"><h2>상환 방법별 특징</h2><ul><li><strong>원리금균등상환</strong>: 매달 같은 금액을 납부해 월 지출 계획이 쉽습니다.</li><li><strong>원금균등상환</strong>: 초기 납입액은 크지만 시간이 갈수록 줄고, 일반적으로 총이자가 적습니다.</li><li><strong>만기일시상환</strong>: 매달 이자만 내고 원금은 만기에 한 번에 상환합니다.</li></ul></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/savings-interest.html">예금 이자 계산기</a><a href="/calculators/salary.html">월급 실수령액 계산기</a><a href="/calculators/budget.html">생활비 예산 계산기</a></div></section>`;
  const forms={annuity:['원리금균등상환','매달 원금과 이자를 합쳐 같은 금액을 납부합니다.'],principal:['원금균등상환','매달 같은 원금을 갚고, 이자는 남은 원금에 따라 줄어듭니다.'],bullet:['만기일시상환','매달 이자만 납부하고 원금은 만기에 상환합니다.']};
  let mode='annuity';const form=root.querySelector('#loan-form'),result=root.querySelector('#loan-result');
  const money=value=>Math.round(value).toLocaleString('ko-KR')+'원';
  const render=()=>{const [title,hint]=forms[mode];form.innerHTML=`<div class="loan-form-inner"><h2>${title}</h2><p>${hint}</p><div class="loan-fields"><label><span>대출 원금(원)</span><input id="loan-principal" type="number" min="0" value="10000000"></label><label><span>연 이자율(%)</span><input id="loan-rate" type="number" min="0" step="any" value="4.5"></label><label><span>상환 기간(개월)</span><input id="loan-months" type="number" min="1" value="36"></label></div><button class="primary-btn" id="calculate-loan" type="button">계산하기</button></div>`;usePlaceholders(form);form.querySelector('#calculate-loan').onclick=()=>{const raw=['loan-principal','loan-rate','loan-months'].map(id=>form.querySelector(`#${id}`).value);if(raw.some(value=>value.trim()==='')){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>대출 원금, 금리, 기간을 모두 입력해 주세요.</p>';result.classList.add('show');return}const [principal,rate,months]=raw.map(Number);if(!Number.isFinite(principal)||!Number.isFinite(rate)||!Number.isFinite(months)||principal<=0||rate<0||months<=0){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>0보다 큰 원금·기간과 올바른 금리를 입력해 주세요.</p>';result.classList.add('show');return}const monthlyRate=rate/100/12;let monthly,totalInterest,extra='';if(mode==='annuity'){monthly=monthlyRate===0?principal/months:principal*monthlyRate*(1+monthlyRate)**months/((1+monthlyRate)**months-1);totalInterest=monthly*months-principal;extra=`매월 같은 금액 <b>${money(monthly)}</b>을 납부합니다.`}else if(mode==='principal'){const monthlyPrincipal=principal/months;totalInterest=principal*monthlyRate*(months+1)/2;const first=monthlyPrincipal+principal*monthlyRate,last=monthlyPrincipal+monthlyPrincipal*monthlyRate;monthly=first;extra=`첫 달 ${money(first)} → 마지막 달 ${money(last)}으로 줄어듭니다.`}else{monthly=principal*monthlyRate;totalInterest=monthly*months;extra=`매월 이자 ${money(monthly)} 납부 후, 만기에 원금 ${money(principal)}을 상환합니다.`}result.innerHTML=`<div class="loan-result-grid"><div><span>${mode==='principal'?'첫 달 납입액':'월 납입액'}</span><strong>${money(monthly)}</strong></div><div><span>총 이자</span><b>${money(totalInterest)}</b></div><div><span>총 상환액</span><b>${money(principal+totalInterest)}</b></div></div><p class="loan-result-note">${extra}</p>`;result.classList.add('show')}};
  root.querySelector('.loan-tabs').onclick=e=>{const tab=e.target.closest('.loan-tab');if(!tab)return;mode=tab.dataset.mode;root.querySelectorAll('.loan-tab').forEach(button=>button.classList.toggle('active',button===tab));result.classList.remove('show');render()};
  render();
}
enhanceLoanCalculator();

function addLoanBalanceChart(){
  if(document.body.dataset.calculator!=='loan-interest')return;
  const root=document.querySelector('#calculator');
  root.addEventListener('click',event=>{
    if(!event.target.closest('#calculate-loan'))return;
    const form=root.querySelector('#loan-form');
    const [principal,rate,months]=['loan-principal','loan-rate','loan-months'].map(id=>Number(form.querySelector(`#${id}`).value));
    if(!Number.isFinite(principal)||!Number.isFinite(rate)||!Number.isFinite(months)||principal<=0||rate<0||months<=0)return;
    const count=Math.round(months),monthlyRate=rate/1200,mode=root.querySelector('.loan-tab.active').dataset.mode;
    let payment=0;if(mode==='annuity')payment=monthlyRate===0?principal/count:principal*monthlyRate*(1+monthlyRate)**count/((1+monthlyRate)**count-1);
    const samples=[...new Set(Array.from({length:7},(_,i)=>Math.round(count*i/6)))];
    const balanceAt=month=>{if(month>=count)return 0;if(mode==='bullet')return principal;if(mode==='principal')return Math.max(0,principal-principal/count*month);if(monthlyRate===0)return Math.max(0,principal-principal/count*month);let balance=principal;for(let i=0;i<month;i++)balance-=payment-balance*monthlyRate;return Math.max(0,balance)};
    const values=samples.map(balanceAt),width=680,height=220,pad={l:52,r:18,t:22,b:38},max=principal;
    const pos=(value,index)=>({x:pad.l+(width-pad.l-pad.r)*index/(samples.length-1),y:pad.t+(height-pad.t-pad.b)*(1-value/max)});
    const points=values.map(pos),path=points.map((point,index)=>`${index?'L':'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
    const grid=[0,.5,1].map(r=>{const y=pad.t+(height-pad.t-pad.b)*r;const label=Math.round(max*(1-r)/10000).toLocaleString('ko-KR')+'만원';return `<line x1="${pad.l}" x2="${width-pad.r}" y1="${y}" y2="${y}"/><text x="${pad.l-8}" y="${y+4}" text-anchor="end">${label}</text>`}).join('');
    const circles=points.map(point=>`<circle cx="${point.x}" cy="${point.y}" r="4"/>`).join('');
    const labels=points.map((point,index)=>`<text x="${point.x}" y="${height-13}" text-anchor="middle">${samples[index]===0?'시작':samples[index]+'개월'}</text>`).join('');
    const result=root.querySelector('#loan-result');
    result.querySelector('.loan-chart')?.remove();
    result.insertAdjacentHTML('beforeend',`<section class="loan-chart"><h3>남은 대출 원금 추이</h3><p>상환 기간에 따른 예상 잔액입니다.</p><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="남은 대출 원금 변화 그래프"><g class="chart-grid">${grid}</g><path class="chart-line" d="${path}"/>${circles}<g class="chart-labels">${labels}</g></svg></section>`);
  });
}
addLoanBalanceChart();

function addLoanChartTooltip(){
  if(document.body.dataset.calculator!=='loan-interest')return;
  const root=document.querySelector('#calculator');
  let tooltip;
  const hide=()=>tooltip?.remove();
  const show=event=>{
    const point=event.target.closest('.loan-chart circle');
    if(!point)return;
    hide();
    const form=root.querySelector('#loan-form');
    const principal=Number(form.querySelector('#loan-principal').value),rate=Number(form.querySelector('#loan-rate').value),months=Math.round(Number(form.querySelector('#loan-months').value));
    if(!principal||!Number.isFinite(rate)||!months)return;
    const index=[...point.parentNode.querySelectorAll('circle')].indexOf(point),month=Math.round(months*index/6),monthlyRate=rate/1200,mode=root.querySelector('.loan-tab.active').dataset.mode;
    let balance;if(month>=months)balance=0;else if(mode==='bullet')balance=principal;else if(mode==='principal')balance=Math.max(0,principal-principal/months*month);else{const payment=monthlyRate===0?principal/months:principal*monthlyRate*(1+monthlyRate)**months/((1+monthlyRate)**months-1);balance=principal;for(let i=0;i<month;i++)balance-=payment-balance*monthlyRate;balance=Math.max(0,balance)}
    tooltip=document.createElement('div');tooltip.className='loan-tooltip';tooltip.innerHTML=`<b>${month===0?'대출 시작':month+'개월 후'}</b><span>남은 원금 ${Math.round(balance).toLocaleString('ko-KR')}원</span>`;document.body.appendChild(tooltip);
    const move=e=>{if(!tooltip)return;tooltip.style.left=`${e.clientX+14}px`;tooltip.style.top=`${e.clientY-12}px`};move(event);point.onmousemove=move;point.onmouseleave=hide;point.ontouchend=hide;
  };
  root.addEventListener('mouseover',show);
  root.addEventListener('touchstart',show,{passive:true});
}
addLoanChartTooltip();

function enhanceBudgetCalculator(){
  if(document.body.dataset.calculator!=='budget')return;
  const root=document.querySelector('#calculator');
  const field=(id,label,example)=>`<label><span>${label}</span><input id="${id}" type="number" min="0" placeholder="예: ${example}"></label>`;
  root.innerHTML=`<h1>생활비 예산 계산기</h1><p class="lead">월 수입과 지출을 항목별로 정리하고, 저축 목표까지 고려한 한 달 예산을 확인하세요.</p><section class="calculator-box budget-box"><div class="budget-section income-section"><h2>월 수입</h2><div class="budget-fields">${field('budget-income','월 실수령 수입(원)','3000000')}${field('budget-extra','부수입(원)','200000')}</div></div><div class="budget-section"><h2>고정 지출 <small>매달 거의 같은 금액</small></h2><div class="budget-fields budget-fields-four">${field('budget-rent','주거비·관리비','700000')}${field('budget-utility','공과금','150000')}${field('budget-phone','통신비·구독','100000')}${field('budget-insurance','보험·대출·기타','200000')}</div></div><div class="budget-section"><h2>변동 지출 <small>생활에 따라 달라지는 금액</small></h2><div class="budget-fields budget-fields-four">${field('budget-food','식비·카페','500000')}${field('budget-transport','교통비','100000')}${field('budget-leisure','여가·쇼핑','200000')}${field('budget-other','기타 지출','100000')}</div></div><div class="budget-section savings-goal"><h2>저축 목표</h2><div class="budget-fields">${field('budget-saving','월 저축 목표(원)','500000')}</div></div><button class="primary-btn" id="calculate-budget" type="button">예산 계산하기</button><div class="result" id="budget-result" aria-live="polite"></div><p class="calculator-note">입력한 금액은 브라우저에 저장되지 않습니다. 실제 지출은 카드 내역과 함께 정기적으로 확인해 보세요.</p></section><section class="content-block"><h2>생활비 예산을 관리하는 방법</h2><ol><li>최근 2~3개월의 실제 지출을 참고해 항목별 평균을 입력하세요.</li><li>고정 지출부터 확인해 줄일 수 있는 항목을 찾으세요.</li><li>남는 금액과 저축 목표를 비교하고, 변동 지출 한도를 정해 보세요.</li></ol></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/salary.html">월급 실수령액 계산기</a><a href="/calculators/dutch-pay.html">더치페이 계산기</a><a href="/calculators/savings-interest.html">예금 이자 계산기</a></div></section>`;
  root.querySelector('#calculate-budget').onclick=()=>{
    const get=id=>{const value=root.querySelector(`#${id}`).value;return value.trim()===''?0:Number(value)};
    const income=get('budget-income')+get('budget-extra');
    const fixed=['budget-rent','budget-utility','budget-phone','budget-insurance'].reduce((sum,id)=>sum+get(id),0);
    const variable=['budget-food','budget-transport','budget-leisure','budget-other'].reduce((sum,id)=>sum+get(id),0);
    const goal=get('budget-saving'),expenses=fixed+variable,remaining=income-expenses,afterGoal=remaining-goal;
    const result=root.querySelector('#budget-result'),money=value=>Math.abs(Math.round(value)).toLocaleString('ko-KR')+'원';
    if(!Number.isFinite(income)||income<=0||[fixed,variable,goal].some(value=>!Number.isFinite(value))){result.innerHTML='<strong>월 수입을 입력해 주세요</strong><p>수입과 지출 항목에는 0 이상의 숫자를 입력할 수 있습니다.</p>';result.classList.add('show');return}
    const status=afterGoal>=0?`저축 목표를 달성하고도 ${money(afterGoal)}이 남습니다.`:`저축 목표까지 ${money(afterGoal)}이 부족합니다.`;
    result.innerHTML=`<div class="budget-result-grid"><div class="budget-highlight"><span>예상 월 잔액</span><strong>${remaining<0?'-':''}${money(remaining)}</strong></div><div><span>고정 지출</span><b>${money(fixed)}</b><small>수입의 ${(fixed/income*100).toFixed(1)}%</small></div><div><span>변동 지출</span><b>${money(variable)}</b><small>수입의 ${(variable/income*100).toFixed(1)}%</small></div><div><span>총 지출</span><b>${money(expenses)}</b><small>수입의 ${(expenses/income*100).toFixed(1)}%</small></div></div><p class="budget-status ${afterGoal>=0?'positive':'warning'}">${status}</p>`;
    result.classList.add('show');
  };
}
enhanceBudgetCalculator();

function enhanceDiscountCalculator(){
  if(document.body.dataset.calculator!=='discount')return;
  const root=document.querySelector('#calculator');let mode='price';
  root.innerHTML=`<h1>할인율 계산기</h1><p class="lead">할인 후 가격을 구하거나, 정가와 판매가로 실제 할인율을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-tabs"><button class="utility-tab active" data-mode="price">할인 가격 구하기</button><button class="utility-tab" data-mode="rate">할인율 구하기</button></div><div id="discount-form"></div><div class="result" id="discount-result"></div></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/percent.html">퍼센트 계산기</a><a href="/calculators/dutch-pay.html">더치페이 계산기</a></div></section>`;
  const form=root.querySelector('#discount-form'),result=root.querySelector('#discount-result'),money=v=>Math.round(v).toLocaleString('ko-KR')+'원';
  const render=()=>{const reverse=mode==='rate';form.innerHTML=`<div class="utility-form"><h2>${reverse?'판매가 기준 할인율':'할인 후 가격'} 계산</h2><div class="utility-fields">${reverse?'<label><span>정가(원)</span><input id="d-a" type="number" placeholder="예: 100000"></label><label><span>판매가(원)</span><input id="d-b" type="number" placeholder="예: 85000"></label>':'<label><span>정가(원)</span><input id="d-a" type="number" placeholder="예: 100000"></label><label><span>할인율(%)</span><input id="d-b" type="number" placeholder="예: 15"></label>'}</div><button class="primary-btn" id="calc-discount">계산하기</button></div>`;form.querySelector('#calc-discount').onclick=()=>{const a=Number(form.querySelector('#d-a').value),b=Number(form.querySelector('#d-b').value);if(!a||!Number.isFinite(b)||b<0||(reverse&&b>a)){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>정가와 할인 정보를 올바르게 입력해 주세요.</p>';result.classList.add('show');return}const discount=reverse?a-b:a*b/100,final=reverse?b:a-discount,rate=discount/a*100;result.innerHTML=`<div class="utility-result-grid"><div><span>할인 후 가격</span><strong>${money(final)}</strong></div><div><span>할인 금액</span><b>${money(discount)}</b></div><div><span>할인율</span><b>${rate.toFixed(1)}%</b></div></div>`;result.classList.add('show')}};
  root.querySelector('.utility-tabs').onclick=e=>{const tab=e.target.closest('.utility-tab');if(!tab)return;mode=tab.dataset.mode;root.querySelectorAll('.utility-tab').forEach(v=>v.classList.toggle('active',v===tab));result.classList.remove('show');render()};render();
}

function enhanceVatCalculator(){
  if(document.body.dataset.calculator!=='vat')return;
  const root=document.querySelector('#calculator');let mode='supply';
  root.innerHTML=`<h1>부가세 계산기</h1><p class="lead">공급가액 또는 부가세 포함 금액을 기준으로 부가세와 최종 금액을 계산합니다.</p><section class="calculator-box utility-box"><div class="utility-tabs"><button class="utility-tab active" data-mode="supply">공급가액 기준</button><button class="utility-tab" data-mode="total">부가세 포함 금액 기준</button></div><div id="vat-form"></div><div class="result" id="vat-result"></div></section><section class="content-block"><h2>부가세 계산 안내</h2><p>일반 과세 기준 10%를 적용합니다. 면세·간이과세 등 거래 조건에 따라 실제 세금은 다를 수 있습니다.</p></section>`;
  const form=root.querySelector('#vat-form'),result=root.querySelector('#vat-result'),money=v=>Math.round(v).toLocaleString('ko-KR')+'원';
  const render=()=>{const supply=mode==='supply';form.innerHTML=`<div class="utility-form"><h2>${supply?'공급가액':'부가세 포함 금액'} 입력</h2><div class="utility-fields one"><label><span>${supply?'공급가액(원)':'합계 금액(원)'}</span><input id="vat-value" type="number" placeholder="예: 100000"></label></div><button class="primary-btn" id="calc-vat">계산하기</button></div>`;form.querySelector('#calc-vat').onclick=()=>{const input=Number(form.querySelector('#vat-value').value);if(!input||input<0){result.innerHTML='<strong>금액을 입력해 주세요</strong>';result.classList.add('show');return}const base=supply?input:input/1.1,vat=base*.1,total=base+vat;result.innerHTML=`<div class="utility-result-grid"><div><span>합계 금액</span><strong>${money(total)}</strong></div><div><span>공급가액</span><b>${money(base)}</b></div><div><span>부가세</span><b>${money(vat)}</b></div></div>`;result.classList.add('show')}};
  root.querySelector('.utility-tabs').onclick=e=>{const tab=e.target.closest('.utility-tab');if(!tab)return;mode=tab.dataset.mode;root.querySelectorAll('.utility-tab').forEach(v=>v.classList.toggle('active',v===tab));result.classList.remove('show');render()};render();
}

function enhanceDutchPayCalculator(){
  if(document.body.dataset.calculator!=='dutch-pay')return;
  const root=document.querySelector('#calculator');
  const itemRow=()=>`<div class="dutch-item"><label><span>항목명</span><input class="dp-name" type="text" placeholder="예: 저녁 식사"></label><label><span>금액(원)</span><input class="dp-amount" type="number" min="0" placeholder="예: 50000"></label><button class="row-delete" type="button" aria-label="항목 삭제">×</button></div>`;
  root.innerHTML=`<h1>더치페이 계산기</h1><p class="lead">식사, 카페, 택시비처럼 여러 항목을 추가한 뒤 마지막에 전체 인원수로 1인당 부담액을 계산하세요.</p><section class="calculator-box utility-box dutch-box"><div class="utility-form"><div class="estimate-toolbar dutch-toolbar"><div><h2>정산 항목</h2><p>같이 나눌 비용을 항목별로 입력하세요.</p></div></div><div class="dutch-items" id="dutch-items"></div><button class="add-course dutch-add" type="button" id="add-dutch-item">+ 항목 추가</button><div class="dutch-summary-fields"><label><span>전체 인원수</span><input id="dp-people" type="number" min="1" placeholder="예: 4"></label><label class="round-option">반올림 단위 <select id="dp-round"><option value="1">1원</option><option value="10">10원</option><option value="100">100원</option><option value="1000">1,000원</option></select></label></div><button class="primary-btn" id="calc-dutch" type="button">더치페이 계산하기</button></div><div class="result" id="dutch-result"></div><p class="calculator-note">개인별로 다른 금액을 제외한 공통 비용을 N분의 1로 나눌 때 쓰기 좋은 계산입니다.</p></section>`;
  const items=root.querySelector('#dutch-items'),result=root.querySelector('#dutch-result'),money=v=>Math.round(v).toLocaleString('ko-KR')+'원',add=(count=1)=>{for(let i=0;i<count;i++)items.insertAdjacentHTML('beforeend',itemRow())};
  add();
  root.querySelector('#add-dutch-item').onclick=()=>add();
  items.onclick=e=>{const button=e.target.closest('.row-delete');if(!button)return;if(items.querySelectorAll('.dutch-item').length>1)button.closest('.dutch-item').remove()};
  root.querySelector('#calc-dutch').onclick=()=>{const amounts=[...items.querySelectorAll('.dp-amount')].map(input=>Number(input.value)).filter(value=>Number.isFinite(value)&&value>0),people=Number(root.querySelector('#dp-people').value),unit=Number(root.querySelector('#dp-round').value);if(!amounts.length||!people||people<1){result.innerHTML='<strong>항목 금액과 전체 인원수를 입력해 주세요</strong>';result.classList.add('show');return}const sum=amounts.reduce((total,value)=>total+value,0),exact=sum/people,each=Math.ceil(exact/unit)*unit,diff=each*people-sum;result.innerHTML=`<div class="utility-result-grid"><div><span>1인당 부담액</span><strong>${money(each)}</strong></div><div><span>총 정산 금액</span><b>${money(sum)}</b></div><div><span>정산 항목 수</span><b>${amounts.length.toLocaleString('ko-KR')}개</b></div><div><span>정산 차액</span><b>${money(diff)}</b></div></div><p class="utility-note">${people}명이 ${unit.toLocaleString('ko-KR')}원 단위로 올림 정산한 결과입니다.</p>`;result.classList.add('show')};
}
enhanceDiscountCalculator();enhanceVatCalculator();enhanceDutchPayCalculator();

function addVatGuide(){
  if(document.body.dataset.calculator!=='vat')return;
  const root=document.querySelector('#calculator');
  root.insertAdjacentHTML('beforeend',`<section class="vat-guide"><h2>부가세 계산, 어떤 금액을 입력해야 하나요?</h2><div class="vat-guide-grid"><article><h3>공급가액을 알고 있을 때</h3><p>상품·서비스의 순수 판매금액을 입력하세요. 공급가액이 100,000원이면 부가세는 10,000원, 고객에게 받는 합계 금액은 110,000원입니다.</p><div class="vat-example"><span>100,000원</span><i>+ 10%</i><strong>110,000원</strong></div></article><article><h3>부가세 포함 금액을 알고 있을 때</h3><p>영수증이나 견적서의 최종 합계 금액을 입력하세요. 합계가 110,000원이면 공급가액은 100,000원, 부가세는 10,000원입니다.</p><div class="vat-example"><span>110,000원</span><i>÷ 1.1</i><strong>100,000원</strong></div></article></div><section class="vat-faq"><h2>자주 확인하는 내용</h2><details><summary>부가세는 왜 10%를 더하거나 1.1로 나누나요?</summary><p>공급가액의 10%가 부가세이므로 공급가액 기준 합계는 금액 × 1.1입니다. 반대로 부가세가 포함된 합계 금액에서 공급가액을 찾을 때는 금액 ÷ 1.1을 적용합니다.</p></details><details><summary>모든 거래에 부가세 10%가 적용되나요?</summary><p>아닙니다. 면세 거래, 영세율 거래, 간이과세 등에는 다른 기준이 적용될 수 있습니다. 이 계산기는 일반 과세의 기본 세율 10%를 기준으로 한 참고용 도구입니다.</p></details><details><summary>견적서에는 어떤 금액을 적어야 하나요?</summary><p>거래 상대방에게 보여주는 견적서에는 보통 공급가액, 부가세, 합계 금액을 분리해 적으면 금액의 기준이 명확해집니다.</p></details></section></section>`);
}
addVatGuide();

function enhanceEstimateCalculator(){
  if(document.body.dataset.calculator!=='estimate')return;
  const root=document.querySelector('#calculator');
  const row=()=>`<tr><td><input class="estimate-name" type="text" placeholder="예: 디자인 작업"></td><td><input class="estimate-qty" type="number" min="0" step="any" placeholder="예: 2"></td><td><input class="estimate-price" type="number" min="0" placeholder="예: 50000"></td><td class="estimate-line">0원</td><td><button type="button" class="row-delete" aria-label="항목 삭제">×</button></td></tr>`;
  root.innerHTML=`<h1>견적 계산기</h1><p class="lead">품목별 수량과 단가를 입력해 공급가액, 부가세, 최종 견적 금액을 빠르게 정리하세요.</p><section class="calculator-box estimate-box"><div class="estimate-toolbar"><div><h2>견적 항목</h2><p>항목을 추가해 종류별로 수량과 단가를 입력하세요.</p></div><button class="add-course" type="button" id="add-estimate">+ 항목 추가</button></div><div class="estimate-table-wrap"><table class="estimate-table"><thead><tr><th>항목명</th><th>수량</th><th>단가(원)</th><th>금액</th><th></th></tr></thead><tbody id="estimate-rows"></tbody></table></div><div class="estimate-actions"><label class="tax-option"><input id="estimate-tax" type="checkbox" checked> 부가세 10% 포함</label><button class="primary-btn" id="calculate-estimate" type="button">견적 계산하기</button></div><div class="result" id="estimate-result" aria-live="polite"></div><p class="calculator-note">이 계산 결과는 참고용입니다. 실제 견적서 작성 시 할인, 운송비, 원천징수, 계약 조건 등을 별도로 반영해 주세요.</p></section><section class="content-block"><h2>견적 계산기 사용 방법</h2><ol><li>견적 항목마다 이름, 수량, 단가를 입력하세요.</li><li>필요하면 항목 추가 버튼으로 행을 늘리세요.</li><li>부가세 포함 여부를 선택한 뒤 견적 계산하기를 누르세요.</li></ol></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/vat.html">부가세 계산기</a><a href="/calculators/margin.html">마진율 계산기</a><a href="/calculators/freelance-rate.html">프리랜서 단가 계산기</a></div></section>`;
  const tbody=root.querySelector('#estimate-rows'),add=(amount=1)=>{for(let i=0;i<amount;i++)tbody.insertAdjacentHTML('beforeend',row())};add(3);
  root.querySelector('#add-estimate').onclick=()=>add();
  const refreshLines=()=>{[...tbody.querySelectorAll('tr')].forEach(tr=>{const qty=Number(tr.querySelector('.estimate-qty').value)||0,price=Number(tr.querySelector('.estimate-price').value)||0;tr.querySelector('.estimate-line').textContent=Math.round(qty*price).toLocaleString('ko-KR')+'원'})};
  tbody.addEventListener('input',refreshLines);tbody.onclick=e=>{if(e.target.closest('.row-delete')&&tbody.children.length>1)e.target.closest('tr').remove()};
  root.querySelector('#calculate-estimate').onclick=()=>{refreshLines();let count=0,supply=0;[...tbody.querySelectorAll('tr')].forEach(tr=>{const qty=Number(tr.querySelector('.estimate-qty').value)||0,price=Number(tr.querySelector('.estimate-price').value)||0;if(qty>0&&price>=0){count++;supply+=qty*price}});const result=root.querySelector('#estimate-result');if(!count){result.innerHTML='<strong>수량과 단가를 입력해 주세요</strong><p>계산할 견적 항목이 없습니다.</p>';result.classList.add('show');return}const tax=root.querySelector('#estimate-tax').checked?supply*.1:0,money=v=>Math.round(v).toLocaleString('ko-KR')+'원';result.innerHTML=`<div class="estimate-result-grid"><div><span>최종 견적 금액</span><strong>${money(supply+tax)}</strong></div><div><span>공급가액</span><b>${money(supply)}</b></div><div><span>부가세</span><b>${money(tax)}</b></div><div><span>견적 항목</span><b>${count}개</b></div></div>`;result.classList.add('show')};
}
enhanceEstimateCalculator();

function enhanceFreelanceRateCalculator(){
  if(document.body.dataset.calculator!=='freelance-rate')return;
  const root=document.querySelector('#calculator');
  const field=(id,label,example,unit='')=>`<label><span>${label}</span><div class="freelance-input"><input id="${id}" type="number" min="0" step="any" placeholder="예: ${example}"><em>${unit}</em></div></label>`;
  root.innerHTML=`<h1>프리랜서 단가 계산기</h1><p class="lead">목표 순수입, 세금·운영비, 실제 유상 작업 시간을 반영해 현실적인 시간·일·월 단가를 계산하세요.</p><section class="calculator-box freelance-box"><div class="freelance-section"><h2>월 목표와 비용</h2><div class="freelance-fields">${field('fr-income','원하는 월 순수입','4000000','원')}${field('fr-cost','월 운영비·구독·장비비','300000','원')}${field('fr-tax','세금·4대보험 적립 비율','15','%')}</div></div><div class="freelance-section"><h2>실제 작업 가능 시간</h2><p>영업, 미팅, 수정, 행정 업무를 제외하고 돈을 받는 작업 시간만 계산하세요.</p><div class="freelance-fields">${field('fr-days','월 작업일','20','일')}${field('fr-hours','하루 작업시간','8','시간')}${field('fr-util','유상 작업 비율','65','%')}</div></div><button class="primary-btn" id="calculate-freelance" type="button">필요 단가 계산하기</button><div class="result" id="freelance-result" aria-live="polite"></div><p class="calculator-note">계산 결과는 세전 매출 기준의 목표 단가입니다. 프로젝트 범위, 수정 횟수, 부가세, 플랫폼 수수료 등은 견적에 별도로 반영하세요.</p></section><section class="content-block"><h2>프리랜서 단가를 정할 때 확인할 점</h2><ul><li>유상 작업 비율은 일반적으로 전체 근무시간보다 낮습니다. 제안서, 미팅, 홍보 시간도 필요하기 때문입니다.</li><li>일 단가를 제시할 때는 작업 범위와 수정 횟수, 납기 조건을 함께 명시하세요.</li><li>부가세는 수입이 아니라 고객에게 청구하는 세금이므로 일반적으로 견적에서 별도 표기합니다.</li></ul></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/estimate.html">견적 계산기</a><a href="/calculators/vat.html">부가세 계산기</a><a href="/calculators/margin.html">마진율 계산기</a></div></section>`;
  root.querySelector('#calculate-freelance').onclick=()=>{const get=id=>root.querySelector(`#${id}`).value;const raw=['fr-income','fr-cost','fr-tax','fr-days','fr-hours','fr-util'].map(get);const result=root.querySelector('#freelance-result');if(raw.some(value=>value.trim()==='')){result.innerHTML='<strong>모든 항목을 입력해 주세요</strong><p>예시값을 참고해 목표와 작업 시간을 입력하세요.</p>';result.classList.add('show');return}const [income,cost,tax,days,hours,util]=raw.map(Number);if(!Number.isFinite(income+cost+tax+days+hours+util)||income<=0||days<=0||hours<=0||util<=0||util>100||tax<0||tax>=100){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>비율은 0~100 사이로, 작업일과 시간은 0보다 크게 입력해 주세요.</p>';result.classList.add('show');return}const revenue=(income+cost)/(1-tax/100),billableHours=days*hours*util/100,hourly=revenue/billableHours,daily=hourly*hours,weekly=hourly*hours*5,money=value=>Math.round(value).toLocaleString('ko-KR')+'원';result.innerHTML=`<div class="freelance-result-grid"><div><span>권장 시간당 단가</span><strong>${money(hourly)}</strong></div><div><span>권장 일 단가</span><b>${money(daily)}</b><small>${hours}시간 기준</small></div><div><span>주 5일 기준</span><b>${money(weekly)}</b><small>예상 주 단가</small></div><div><span>필요 월 매출</span><b>${money(revenue)}</b><small>유상 작업 ${billableHours.toFixed(1)}시간</small></div></div>`;result.classList.add('show')};
}
enhanceFreelanceRateCalculator();

function enhanceAgeCalculator(){
  if(document.body.dataset.calculator!=='age')return;
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>나이 계산기</h1><p class="lead">생년월일을 기준으로 한국식 나이와 만 나이, 생일 경과 여부를 한 번에 확인하세요.</p><section class="calculator-box age-box"><div class="age-fields"><label><span>생년월일</span><input id="birth-date" type="date" required></label><label><span>기준일 <small>비워두면 오늘</small></span><input id="reference-date" type="date"></label></div><button class="primary-btn" id="calculate-age" type="button">나이 계산하기</button><div class="result" id="age-result" aria-live="polite"></div><p class="calculator-note">한국식 나이는 태어난 해를 1살로 보고 매년 1월 1일에 한 살 더하는 전통적 계산 방식입니다. 행정·법률상 나이는 일반적으로 만 나이를 사용합니다.</p></section><section class="content-block"><h2>나이 계산 기준</h2><ul><li><strong>한국식 나이</strong>: 기준연도 − 출생연도 + 1</li><li><strong>만 나이</strong>: 생일이 지났는지에 따라 기준연도 − 출생연도 또는 그보다 1살 적게 계산</li><li><strong>연 나이</strong>: 기준연도 − 출생연도이며, 일부 법령·제도에서 활용됩니다.</li></ul></section><section class="content-block"><h2>관련 계산기</h2><div class="related"><a href="/calculators/international-age.html">만나이 계산기</a><a href="/calculators/d-day.html">디데이 계산기</a><a href="/calculators/date.html">날짜 계산기</a></div></section>`;
  root.querySelector('#calculate-age').onclick=()=>{const birthValue=root.querySelector('#birth-date').value,referenceValue=root.querySelector('#reference-date').value;if(!birthValue){const result=root.querySelector('#age-result');result.innerHTML='<strong>생년월일을 선택해 주세요</strong><p>달력에서 생년월일을 입력하면 나이를 계산합니다.</p>';result.classList.add('show');return}const birth=new Date(`${birthValue}T00:00:00`),reference=referenceValue?new Date(`${referenceValue}T00:00:00`):new Date();reference.setHours(0,0,0,0);const result=root.querySelector('#age-result');if(birth>reference){result.innerHTML='<strong>기준일을 확인해 주세요</strong><p>기준일은 생년월일 이후여야 합니다.</p>';result.classList.add('show');return}const yearAge=reference.getFullYear()-birth.getFullYear(),birthdayThisYear=new Date(reference.getFullYear(),birth.getMonth(),birth.getDate()),international=yearAge-(reference<birthdayThisYear?1:0),korean=yearAge+1,days=Math.floor((reference-birth)/86400000),nextBirthday=new Date(reference.getFullYear()+(reference>=birthdayThisYear?1:0),birth.getMonth(),birth.getDate()),untilBirthday=Math.ceil((nextBirthday-reference)/86400000);result.innerHTML=`<div class="age-result-grid"><div><span>한국식 나이</span><strong>${korean}세</strong></div><div><span>만 나이</span><b>만 ${international}세</b></div><div><span>연 나이</span><b>${yearAge}세</b></div><div><span>살아온 날</span><b>${days.toLocaleString('ko-KR')}일</b></div></div><p class="age-status">${reference>=birthdayThisYear?'올해 생일이 지났습니다.':'올해 생일까지 '+untilBirthday+'일 남았습니다.'}</p>`;result.classList.add('show')};
}
enhanceAgeCalculator();

if(document.body.dataset.calculator==='age'){
  document.title='나이 계산기 · 만나이 계산기 | 계산페이지';
  document.querySelector('meta[name="description"]')?.setAttribute('content','생년월일로 한국식 나이와 만나이를 함께 계산하세요. 기준일을 지정해 나이와 생일 경과 여부도 확인할 수 있습니다.');
  document.querySelector('#calculator').insertAdjacentHTML('beforeend',`<section class="content-block age-seo"><h2>나이 계산기와 만나이 계산기, 무엇이 다른가요?</h2><p><strong>나이 계산기</strong>는 일반적으로 한국식 나이 또는 연 나이를 확인할 때 사용합니다. 한국식 나이는 태어난 해를 1살로 보고 새해마다 한 살씩 더하는 방식입니다. <strong>만나이 계산기</strong>는 생일이 지났는지까지 반영하는 국제적인 나이 기준으로, 기준일에 따라 결과가 달라질 수 있습니다.</p><p>이 페이지에서는 생년월일 한 번 입력으로 한국식 나이와 만 나이를 함께 보여주므로, 학교·병원·여행·각종 서류에서 필요한 나이 기준을 비교해 확인할 수 있습니다.</p></section>`);
}

calculators['averaging-down']={n:'물타기 계산기',c:'money',d:'추가 매수 후 평균 매입 단가를 계산합니다.'};
calculators['unemployment-benefit']={n:'실업급여 계산기',c:'money',d:'입력한 일급과 지급일수로 예상 수령액을 계산합니다.'};
cats.money[0]='금융 계산기';cats.money[2]='금융 생활에 필요한 계산기';cats.money[3]+=' averaging-down unemployment-benefit';
document.querySelectorAll('nav a[href="/categories/money.html"]').forEach(link=>link.textContent='금융');
if(document.querySelector('.popular-list'))home();if(document.body.dataset.category==='money')category();

function customFinancialCalculators(){
  const type=document.body.dataset.customCalculator;if(!type)return;const root=document.querySelector('#calculator');
  if(type==='averaging-down'){root.innerHTML=`<h1>물타기 계산기</h1><p class="lead">현재 보유 수량과 평균 매입가, 추가 매수 조건을 입력해 새 평균 단가를 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label><span>현재 보유 수량</span><input id="ad-qty" type="number" placeholder="예: 10"></label><label><span>현재 평균 매입가(원)</span><input id="ad-price" type="number" placeholder="예: 50000"></label><label><span>추가 매수 수량</span><input id="ad-newqty" type="number" placeholder="예: 5"></label><label><span>추가 매수 단가(원)</span><input id="ad-newprice" type="number" placeholder="예: 40000"></label></div><button class="primary-btn" id="calc-ad">계산하기</button></div><div class="result" id="ad-result"></div></section>`;root.querySelector('#calc-ad').onclick=()=>{const v=['ad-qty','ad-price','ad-newqty','ad-newprice'].map(id=>Number(root.querySelector('#'+id).value));if(v.some(n=>!n||n<0))return;const[q,p,nq,np]=v,total=q+nq,avg=(q*p+nq*np)/total,fmt=n=>Math.round(n).toLocaleString('ko-KR')+'원',r=root.querySelector('#ad-result');r.innerHTML=`<strong>${fmt(avg)}</strong><p>총 ${total}개 · 총 매입금액 ${fmt(q*p+nq*np)}</p>`;r.classList.add('show')}}
  else {root.innerHTML=`<h1>실업급여 계산기</h1><p class="lead">1일 예상 구직급여액과 소정급여일수로 예상 총 수령액을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label><span>1일 예상 구직급여액(원)</span><input id="ub-daily" type="number" placeholder="예: 60000"></label><label><span>소정급여일수</span><input id="ub-days" type="number" placeholder="예: 150"></label><label><span>이미 지급받은 일수</span><input id="ub-used" type="number" placeholder="예: 0"></label></div><button class="primary-btn" id="calc-ub">예상 금액 계산하기</button></div><div class="result" id="ub-result"></div><p class="calculator-note">수급 자격, 지급일수, 상한·하한액은 개인의 연령·고용보험 가입기간·퇴직 사유와 해당 연도 기준에 따라 달라집니다. 이 결과는 입력값 기반의 참고용 계산입니다.</p></section>`;root.querySelector('#calc-ub').onclick=()=>{const [daily,days,used]=['ub-daily','ub-days','ub-used'].map(id=>Number(root.querySelector('#'+id).value)||0),remain=Math.max(days-used,0),fmt=n=>Math.round(n).toLocaleString('ko-KR')+'원';let r=root.querySelector('#ub-result');r.innerHTML=`<div class="utility-result-grid"><div><span>예상 남은 수령액</span><strong>${fmt(daily*remain)}</strong></div><div><span>남은 지급일수</span><b>${remain}일</b></div><div><span>전체 예상액</span><b>${fmt(daily*days)}</b></div></div>`;r.classList.add('show')}}
}
customFinancialCalculators();

function enhanceUnemploymentBenefitCalculator(){
  if(document.body.dataset.customCalculator!=='unemployment-benefit')return;
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>실업급여 계산기</h1><p class="lead">재직 기간과 최근 평균 월급을 기준으로 구직급여 예상액을 간편하게 확인하세요.</p><section class="calculator-box unemployment-box"><div class="unemployment-section"><h2>재직 정보</h2><div class="unemployment-fields"><label><span>입사일</span><input id="ub-start" type="date"></label><label><span>퇴사일</span><input id="ub-end" type="date"></label><label><span>최근 평균 월급(세전)</span><input id="ub-salary" type="number" placeholder="예: 3000000"></label></div></div><div class="unemployment-section"><h2>예상 지급일수</h2><p>소정급여일수는 연령, 고용보험 가입기간, 퇴직 사유 등에 따라 달라집니다. 본인에게 안내된 일수를 선택해 주세요.</p><select id="ub-benefit-days"><option value="">선택</option><option value="120">120일</option><option value="150">150일</option><option value="180">180일</option><option value="210">210일</option><option value="240">240일</option><option value="270">270일</option></select></div><button class="primary-btn" id="calculate-ub" type="button">예상 금액 계산하기</button><div class="result" id="ub-result" aria-live="polite"></div><p class="calculator-note">이 계산기는 평균 월급의 60%를 30일로 나눈 단순 추정입니다. 실제 실업급여는 고용보험 가입 이력, 퇴직 사유, 해당 연도 상·하한액, 인정일 등에 따라 달라지므로 고용24 또는 관할 고용센터에서 반드시 확인해 주세요.</p></section><section class="content-block"><h2>실업급여 계산 전 확인할 내용</h2><ul><li>퇴직 전 18개월 동안 고용보험 피보험 단위기간 등 수급 요건을 충족해야 합니다.</li><li>재직 기간이 길어도 개인 상황에 따라 지급일수는 달라질 수 있습니다.</li><li>이직확인서 처리 여부와 실제 수급 가능 여부는 공식 안내를 확인해야 합니다.</li></ul></section>`;
  root.querySelector('#calculate-ub').onclick=()=>{const start=root.querySelector('#ub-start').value,end=root.querySelector('#ub-end').value,salary=Number(root.querySelector('#ub-salary').value),days=Number(root.querySelector('#ub-benefit-days').value),result=root.querySelector('#ub-result');if(!start||!end||!salary||!days){result.innerHTML='<strong>재직 정보와 지급일수를 입력해 주세요</strong><p>입사일, 퇴사일, 평균 월급, 예상 지급일수가 필요합니다.</p>';result.classList.add('show');return}const startDate=new Date(start),endDate=new Date(end);if(endDate<=startDate){result.innerHTML='<strong>재직 기간을 확인해 주세요</strong><p>퇴사일은 입사일보다 뒤여야 합니다.</p>';result.classList.add('show');return}const employmentDays=Math.floor((endDate-startDate)/86400000)+1,daily=salary/30*.6,total=daily*days,money=v=>Math.round(v).toLocaleString('ko-KR')+'원';result.innerHTML=`<div class="unemployment-result-grid"><div><span>재직 기간</span><strong>${Math.floor(employmentDays/30)}개월</strong><small>${employmentDays.toLocaleString()}일</small></div><div><span>1일 예상액</span><b>${money(daily)}</b></div><div><span>예상 총 수령액</span><b>${money(total)}</b><small>${days}일 기준</small></div></div>`;result.classList.add('show')};
}
enhanceUnemploymentBenefitCalculator();

calculators.cbm={n:'CBM 계산기',c:'business',d:'상품·박스의 부피와 총 CBM을 계산합니다.'};
cats.business[3]+=' cbm';
if(document.body.dataset.category==='business')category();

function enhanceCbmCalculator(){
  if(document.body.dataset.customCalculator!=='cbm')return;
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>CBM 계산기</h1><p class="lead">박스 또는 상품의 가로·세로·높이와 수량을 입력해 CBM(입방미터)을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><h2>상품 규격 입력 <small>cm 기준</small></h2><div class="utility-fields three"><label><span>가로(cm)</span><input id="cbm-l" type="number" placeholder="예: 50"></label><label><span>세로(cm)</span><input id="cbm-w" type="number" placeholder="예: 40"></label><label><span>높이(cm)</span><input id="cbm-h" type="number" placeholder="예: 30"></label><label><span>수량</span><input id="cbm-q" type="number" placeholder="예: 10"></label></div><button class="primary-btn" id="calc-cbm">CBM 계산하기</button></div><div class="result" id="cbm-result"></div></section><section class="content-block"><h2>CBM 계산 방법</h2><p>CBM은 가로(m) × 세로(m) × 높이(m)로 계산합니다. cm 단위로 입력한 경우 가로 × 세로 × 높이를 1,000,000으로 나누면 개당 CBM이 됩니다.</p></section>`;
  root.querySelector('#calc-cbm').onclick=()=>{const v=['cbm-l','cbm-w','cbm-h','cbm-q'].map(id=>Number(root.querySelector('#'+id).value));const r=root.querySelector('#cbm-result');if(v.some(n=>!n||n<=0)){r.innerHTML='<strong>규격과 수량을 입력해 주세요</strong>';r.classList.add('show');return}const [l,w,h,q]=v,one=l*w*h/1000000,total=one*q;r.innerHTML=`<div class="utility-result-grid"><div><span>총 CBM</span><strong>${total.toFixed(4)} CBM</strong></div><div><span>개당 CBM</span><b>${one.toFixed(4)} CBM</b></div><div><span>총 부피</span><b>${Math.round(total*1000).toLocaleString()} L</b></div></div>`;r.classList.add('show')};
}
enhanceCbmCalculator();

function improveCalculatorSearch(){
  const input=document.querySelector('#calculator-search'),box=document.querySelector('#search-results');
  if(!input||!box)return;
  const normalize=value=>String(value).toLowerCase().replace(/[\s·/]/g,'');
  const boostRank=new Map(searchBoostIds.map((id,index)=>[id,index]));
  const renderLinks=ids=>ids.filter(id=>calculators[id]).map(id=>`<a class="search-result search-suggested" href="${href(id)}"><b>${calculators[id].n}</b><small>${cats[calculators[id].c]?.[0]||'계산기'}</small><span>${calculators[id].d||''}</span></a>`).join('');
  const renderEmpty=()=>{box.innerHTML=`<div class="search-suggestions"><b>자주 찾는 계산기</b><div class="search-suggestion-grid">${renderLinks(popularCalculatorIds)}</div><div class="search-keywords"><span>추천 검색어</span><button type="button">월급</button><button type="button">엔빵</button><button type="button">평수</button><button type="button">디데이</button><button type="button">할인</button></div></div>`};
  const score=([key,item],query)=>{
    const name=normalize(item.n),description=normalize(item.d||''),category=normalize(cats[item.c]?.[0]||''),alias=normalize(searchAliases[key]||''),id=normalize(key);
    let value=0;
    if(name===query)value+=100;
    if(name.startsWith(query))value+=70;
    if(name.includes(query))value+=55;
    if(alias.includes(query))value+=45;
    if(description.includes(query))value+=25;
    if(category.includes(query))value+=15;
    if(id.includes(query))value+=10;
    if(boostRank.has(key))value+=Math.max(0,30-boostRank.get(key));
    return value;
  };
  const render=()=>{
    const query=normalize(input.value);
    if(!query){renderEmpty();return}
    const matches=Object.entries(calculators).map(entry=>{
      const [key,item]=entry;
      const category=cats[item.c]?.[0]||'';
      const text=normalize(`${item.n} ${item.d||''} ${category} ${key} ${searchAliases[key]||''}`);
      return text.includes(query)?[entry,score(entry,query)]:null;
    }).filter(Boolean).sort((a,b)=>b[1]-a[1]||a[0][1].n.localeCompare(b[0][1].n,'ko-KR')).slice(0,8).map(([entry])=>entry);
    box.innerHTML=matches.length?matches.map(([key,item])=>`<a class="search-result" href="${href(key)}"><b>${item.n}</b><small>${cats[item.c]?.[0]||'계산기'}</small><span>${item.d||''}</span></a>`).join(''):'<div class="search-empty">검색 결과가 없습니다. 다른 단어로 검색해 보세요.</div>';
  };
  box.addEventListener('click',event=>{const keyword=event.target.closest('.search-keywords button');if(!keyword)return;input.value=keyword.textContent;render();input.focus()});
  input.oninput=render;input.onfocus=render;
}
improveCalculatorSearch();

calculators['average-price']={n:'평단가 계산기',c:'money',d:'여러 차수의 매수 수량과 단가로 평균 매입가를 계산합니다.'};
calculators['day-count']={n:'일수 계산기',c:'life',d:'두 날짜 사이의 일수와 주 수를 계산합니다.'};
cats.money[3]+=' average-price';cats.life[3]+=' day-count';
if(document.body.dataset.category==='money'||document.body.dataset.category==='life')category();

function addAverageAndDayCalculators(){
  const type=document.body.dataset.customCalculator;if(!type)return;const root=document.querySelector('#calculator');
  if(type==='average-price'){const row=()=>`<tr><td><input class="ap-qty" type="number" placeholder="예: 10"></td><td><input class="ap-price" type="number" placeholder="예: 50000"></td><td class="ap-total">0원</td></tr>`;root.innerHTML=`<h1>평단가 계산기</h1><p class="lead">여러 번 매수한 수량과 가격을 입력해 평균 매입 단가를 계산하세요.</p><section class="calculator-box estimate-box"><div class="estimate-toolbar"><h2>매수 내역</h2><button class="add-course" id="ap-add" type="button">+ 매수 추가</button></div><div class="estimate-table-wrap"><table class="estimate-table"><thead><tr><th>매수 수량</th><th>매수 단가(원)</th><th>매수 금액</th></tr></thead><tbody id="ap-rows"></tbody></table></div><div class="estimate-actions"><button class="primary-btn" id="ap-calc">평단가 계산하기</button></div><div class="result" id="ap-result"></div></section>`;const body=root.querySelector('#ap-rows'),add=n=>{for(let i=0;i<n;i++)body.insertAdjacentHTML('beforeend',row())};add(3);root.querySelector('#ap-add').onclick=()=>add(1);root.querySelector('#ap-calc').onclick=()=>{let q=0,total=0;body.querySelectorAll('tr').forEach(tr=>{const a=Number(tr.querySelector('.ap-qty').value)||0,b=Number(tr.querySelector('.ap-price').value)||0;q+=a;total+=a*b;tr.querySelector('.ap-total').textContent=Math.round(a*b).toLocaleString()+'원'});let r=root.querySelector('#ap-result');if(!q)return;r.innerHTML=`<div class="utility-result-grid"><div><span>평균 매입 단가</span><strong>${Math.round(total/q).toLocaleString()}원</strong></div><div><span>총 수량</span><b>${q.toLocaleString()}개</b></div><div><span>총 매수 금액</span><b>${Math.round(total).toLocaleString()}원</b></div></div>`;r.classList.add('show')}}
  if(type==='day-count'){root.innerHTML=`<h1>일수 계산기</h1><p class="lead">시작일과 종료일 사이의 기간을 일수와 주 단위로 계산하세요.</p><section class="calculator-box age-box"><div class="age-fields"><label><span>시작일</span><input id="dc-start" type="date"></label><label><span>종료일</span><input id="dc-end" type="date"></label></div><label class="tax-option"><input id="dc-inclusive" type="checkbox"> 시작일과 종료일 포함</label><button class="primary-btn" id="dc-calc">일수 계산하기</button><div class="result" id="dc-result"></div></section>`;root.querySelector('#dc-calc').onclick=()=>{const s=root.querySelector('#dc-start').value,e=root.querySelector('#dc-end').value,r=root.querySelector('#dc-result');if(!s||!e)return;let days=Math.round((new Date(e)-new Date(s))/86400000);if(days<0)return;if(root.querySelector('#dc-inclusive').checked)days++;r.innerHTML=`<div class="utility-result-grid"><div><span>총 기간</span><strong>${days.toLocaleString()}일</strong></div><div><span>주 단위</span><b>${Math.floor(days/7)}주 ${days%7}일</b></div><div><span>개월 환산</span><b>${(days/30.44).toFixed(1)}개월</b></div></div>`;r.classList.add('show')}}
}
addAverageAndDayCalculators();

if(document.body.dataset.customCalculator==='day-count'){
  const root=document.querySelector('#calculator');
  root.querySelector('.age-fields').innerHTML='<div class="field-with-option"><label><span>시작일</span><input id="dc-start" type="date"></label><label class="field-option"><input id="dc-start-inclusive" type="checkbox"> 시작일 포함</label></div><div class="field-with-option"><label><span>종료일</span><input id="dc-end" type="date"></label><label class="field-option"><input id="dc-end-inclusive" type="checkbox"> 종료일 포함</label></div>';
  root.querySelector('.tax-option')?.remove();
  root.querySelector('#dc-calc').onclick=()=>{
    const start=root.querySelector('#dc-start').value,end=root.querySelector('#dc-end').value,result=root.querySelector('#dc-result');
    if(!start||!end){result.innerHTML='<strong>시작일과 종료일을 선택해 주세요</strong>';result.classList.add('show');return}
    const difference=Math.round((new Date(end)-new Date(start))/86400000);
    if(difference<0){result.innerHTML='<strong>날짜 순서를 확인해 주세요</strong><p>종료일은 시작일보다 뒤여야 합니다.</p>';result.classList.add('show');return}
    const includeStart=root.querySelector('#dc-start-inclusive').checked,includeEnd=root.querySelector('#dc-end-inclusive').checked;
    let days=Math.max(difference-1,0)+(includeStart?1:0)+(includeEnd?1:0);
    if(difference===0&&(includeStart||includeEnd))days=1;
    result.innerHTML=`<div class="utility-result-grid"><div><span>총 기간</span><strong>${days.toLocaleString()}일</strong></div><div><span>주 단위</span><b>${Math.floor(days/7)}주 ${days%7}일</b></div><div><span>개월 환산</span><b>${(days/30.44).toFixed(1)}개월</b></div></div>`;result.classList.add('show');
  };
}

calculators['annual-leave']={n:'연차 계산기',c:'business',d:'입사일과 기준일로 예상 연차 발생 기준을 확인합니다.'};
calculators['weekly-holiday-pay']={n:'주휴수당 계산기',c:'business',d:'시급과 주 근무시간으로 주휴수당을 계산합니다.'};
calculators['rent-conversion']={n:'전월세 전환 계산기',c:'money',d:'보증금과 월세의 전환 금액을 계산합니다.'};
cats.business[3]+=' annual-leave weekly-holiday-pay';cats.money[3]+=' rent-conversion';
if(document.body.dataset.category==='business'||document.body.dataset.category==='money')category();

function addWorkAndRentCalculators(){
  const type=document.body.dataset.customCalculator;if(!type)return;const root=document.querySelector('#calculator');
  const form=(title,fields)=>`<h1>${title}</h1><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${fields}</div><button class="primary-btn" id="custom-calc">계산하기</button></div><div class="result" id="custom-result"></div></section>`;
  if(type==='annual-leave'){root.innerHTML=form('연차 계산기','<label><span>입사일</span><input id="a-start" type="date"></label><label><span>기준일</span><input id="a-base" type="date"></label>')+'<section class="content-block"><p>근로기준법상 연차 발생은 근로 형태와 출근율 등에 따라 달라질 수 있는 참고용 계산입니다.</p></section>';root.querySelector('#custom-calc').onclick=()=>{const s=new Date(root.querySelector('#a-start').value),b=new Date(root.querySelector('#a-base').value),r=root.querySelector('#custom-result');if(isNaN(s)||isNaN(b)||b<s)return;const months=(b-s)/864e5/30.44,days=months<12?Math.min(11,Math.floor(months)):months<36?15:Math.min(25,15+Math.floor((months-36)/24)+1);r.innerHTML=`<strong>예상 연차 ${days}일</strong><p>근속 약 ${Math.floor(months)}개월 기준입니다.</p>`;r.classList.add('show')}}
  if(type==='weekly-holiday-pay'){root.innerHTML=form('주휴수당 계산기','<label><span>시급(원)</span><input id="w-rate" type="number" placeholder="예: 10030"></label><label><span>주 근무시간</span><input id="w-hours" type="number" placeholder="예: 40"></label><label><span>주 소정근로일수</span><input id="w-days" type="number" placeholder="예: 5"></label>')+'<section class="content-block"><p>일반적인 주 15시간 이상, 소정근로일 개근 기준의 참고용 계산입니다.</p></section>';root.querySelector('#custom-calc').onclick=()=>{const rate=Number(root.querySelector('#w-rate').value),hours=Number(root.querySelector('#w-hours').value),days=Number(root.querySelector('#w-days').value),r=root.querySelector('#custom-result');if(!rate||!hours||!days)return;const holiday=hours>=15?rate*(hours/40)*8:0;r.innerHTML=`<div class="utility-result-grid"><div><span>주휴수당</span><strong>${Math.round(holiday).toLocaleString()}원</strong></div><div><span>예상 주급</span><b>${Math.round(rate*hours+holiday).toLocaleString()}원</b></div><div><span>주휴 시간</span><b>${(holiday/rate).toFixed(1)}시간</b></div></div>`;r.classList.add('show')}}
  if(type==='rent-conversion'){root.innerHTML=form('전월세 전환 계산기','<label><span>전환할 보증금(원)</span><input id="r-deposit" type="number" placeholder="예: 10000000"></label><label><span>연 전환율(%)</span><input id="r-rate" type="number" placeholder="예: 5"></label><label><span>현재 월세(원)</span><input id="r-rent" type="number" placeholder="예: 500000"></label>')+'<section class="content-block"><p>계약상 전환율과 법정 기준은 다를 수 있습니다. 실제 계약 전 최신 기준을 확인하세요.</p></section>';root.querySelector('#custom-calc').onclick=()=>{const d=Number(root.querySelector('#r-deposit').value),rate=Number(root.querySelector('#r-rate').value),rent=Number(root.querySelector('#r-rent').value),r=root.querySelector('#custom-result');if(!d||!rate)return;const change=d*rate/100/12;r.innerHTML=`<div class="utility-result-grid"><div><span>보증금 ${d.toLocaleString()}원 전환 월세</span><strong>${Math.round(change).toLocaleString()}원</strong></div><div><span>기존 월세 포함</span><b>${Math.round(rent+change).toLocaleString()}원</b></div><div><span>연 환산</span><b>${Math.round(change*12).toLocaleString()}원</b></div></div>`;r.classList.add('show')}}
}
addWorkAndRentCalculators();

if(document.body.dataset.calculator==='severance'){
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>퇴직금 계산기</h1><p class="lead">입사일, 퇴사일, 최근 3개월 임금으로 예상 퇴직금을 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label><span>입사일</span><input id="sv-start" type="date"></label><label><span>퇴사일</span><input id="sv-end" type="date"></label><label><span>최근 3개월 임금 합계(원)</span><input id="sv-wage" type="number" placeholder="예: 9000000"></label></div><button class="primary-btn" id="sv-calc">퇴직금 계산하기</button></div><div class="result" id="sv-result"></div></section><section class="content-block"><p>계속근로기간 1년 이상을 전제로 한 단순 추정입니다. 상여금, 미사용 연차수당, 평균임금 산정 기간 등 실제 퇴직금에는 추가 조건이 반영될 수 있습니다.</p></section>`;
  root.querySelector('#sv-calc').onclick=()=>{const s=new Date(root.querySelector('#sv-start').value),e=new Date(root.querySelector('#sv-end').value),w=Number(root.querySelector('#sv-wage').value),r=root.querySelector('#sv-result');if(isNaN(s)||isNaN(e)||!w||e<=s)return;const days=Math.floor((e-s)/864e5),amount=w/90*30*(days/365);r.innerHTML=`<div class="utility-result-grid"><div><span>예상 퇴직금</span><strong>${Math.round(amount).toLocaleString()}원</strong></div><div><span>계속근로기간</span><b>${Math.floor(days/365)}년 ${Math.floor(days%365/30)}개월</b></div><div><span>1일 평균임금</span><b>${Math.round(w/90).toLocaleString()}원</b></div></div>`;r.classList.add('show')};
}

/* const newTools={
 'four-insurance':['4대보험 계산기',[['월 급여','3000000'],['근로자 부담률 합계(%)','9.4']],(a,b)=>['예상 공제액',a*b/100,'월 급여에서 공제되는 4대보험의 간단 추정치입니다. 실제 요율·상한액은 공식 기준을 확인하세요.']],
 'annual-salary':['연봉 계산기',[['연봉(원)','50000000'],['연간 상여금(원)','0']],(a,b)=>['월 평균 급여',(a+b)/12,'연봉과 상여금을 합산한 세전 월 평균입니다.']],
 'jeonse-loan':['전세대출 이자 계산기',[['대출 원금(원)','100000000'],['연 이자율(%)','3.5']],(a,b)=>['월 이자',a*b/1200,'원금 상환을 제외한 월 이자 기준입니다.']],
 'parental-leave':['육아휴직 급여 계산기',[['월 통상임금(원)','3000000'],['적용 비율(%)','80']],(a,b)=>['월 예상 급여',a*b/100,'상한·하한 및 기간별 제도 기준은 별도 확인이 필요합니다.']],
 'car-installment':['자동차 할부 계산기',[['차량 가격(원)','30000000'],['선수금(원)','5000000'],['연 이자율(%)','5'],['할부 기간(개월)','60']],(a,b,c,d)=>{let p=a-b,r=c/1200,m=r?p*r*(1+r)**d/((1+r)**d-1):p/d;return ['월 납입액',m,`총 이자 ${Math.round(m*d-p).toLocaleString()}원`]} };
function addNewTools(){const type=document.body.dataset.customCalculator,c=newTools[type];if(!c)return;const root=document.querySelector('#calculator');root.innerHTML=`<h1>${c[0]}</h1><p class="lead">필요한 값을 입력해 예상 금액을 빠르게 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${c[1].map((x,i)=>`<label><span>${x[0]}</span><input id="nt${i}" type="number" placeholder="예: ${x[1]}"></label>`).join('')}</div><button class="primary-btn" id="ntcalc">계산하기</button></div><div class="result" id="ntresult"></div></section>`;root.querySelector('#ntcalc').onclick=()=>{let v=c[1].map((_,i)=>Number(root.querySelector('#nt'+i).value));if(v.some(x=>!Number.isFinite(x)))return;let [title,note,text]=c[2](...v),r=root.querySelector('#ntresult');r.innerHTML=`<strong>${Math.round(note).toLocaleString()}원</strong><p>${title} · ${text}</p>`;r.classList.add('show')}}addNewTools();
Object.entries(newTools).forEach(([key,value])=>calculators[key]={n:value[0],c:['four-insurance','annual-salary','parental-leave'].includes(key)?'business':'money',d:'예상 금액을 계산합니다.'});
cats.money[3]+=' jeonse-loan car-installment';cats.business[3]+=' four-insurance annual-salary parental-leave';
if(document.body.dataset.category==='money'||document.body.dataset.category==='business')category();

/* const extraTools={
 'volumetric-weight':['부피무게 계산기','business',['가로(cm)','세로(cm)','높이(cm)'],v=>v[0]*v[1]*v[2]/6000,'kg'],
 'compound-interest':['복리 계산기','money',['초기 투자금(원)','연 수익률(%)','기간(년)'],v=>v[0]*(1+v[1]/100)**v[2],'원'],
 'body-fat':['체지방률 계산기','health',['키(cm)','허리둘레(cm)','몸무게(kg)'],v=>Math.max(0,(v[1]/v[0]*100-40)+(v[2]/v[0]-0.4)*10),'%'],
 'fuel-cost':['연료비 계산기','life',['주행 거리(km)','연비(km/L)','유가(원/L)'],v=>v[0]/v[1]*v[2],'원']};
function addExtraTools(){const t=document.body.dataset.customCalculator,c=extraTools[t];if(!c)return;const root=document.querySelector('#calculator');root.innerHTML=`<h1>${c[0]}</h1><p class="lead">필요한 값을 입력해 빠르게 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${c[2].map((n,i)=>`<label><span>${n}</span><input id="ex${i}" type="number" placeholder="예: ${i?10:100}"></label>`).join('')}</div><button class="primary-btn" id="excalc">계산하기</button></div><div class="result" id="exresult"></div></section>`;root.querySelector('#excalc').onclick=()=>{let v=c[2].map((_,i)=>Number(root.querySelector('#ex'+i).value));if(v.some(x=>!x))return;let r=root.querySelector('#exresult'),x=c[3](v);r.innerHTML=`<strong>${x.toFixed(c[4]==='%'?1:0).toLocaleString()} ${c[4]}</strong>`;r.classList.add('show')}}addExtraTools();
if(document.body.dataset.customCalculator==='pregnancy-week'){const root=document.querySelector('#calculator');root.innerHTML=`<h1>임신 주수 계산기</h1><p class="lead">마지막 생리 시작일을 기준으로 임신 주수와 예정일을 확인합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><label>마지막 생리 시작일 <input id="pw" type="date"></label><button class="primary-btn" id="pwc">계산하기</button></div><div class="result" id="pwr"></div><p class="calculator-note">의료 진단이 아닌 날짜 기준 참고용입니다.</p></section>`;root.querySelector('#pwc').onclick=()=>{let d=new Date(root.querySelector('#pw').value),now=new Date(),days=Math.floor((now-d)/864e5),due=new Date(d);due.setDate(due.getDate()+280);let r=root.querySelector('#pwr');r.innerHTML=`<strong>임신 ${Math.floor(days/7)}주 ${days%7}일</strong><p>예정일 ${due.toLocaleDateString('ko-KR')}</p>`;r.classList.add('show')}}
Object.entries(extraTools).forEach(([k,v])=>calculators[k]={n:v[0],c:v[1],d:'생활에 필요한 계산기입니다.'});calculators['pregnancy-week']={n:'임신 주수 계산기',c:'health',d:'임신 주수와 예정일을 계산합니다.'};cats.business[3]+=' volumetric-weight';cats.money[3]+=' compound-interest';cats.health[3]+=' body-fat pregnancy-week';cats.life[3]+=' fuel-cost';if(document.body.dataset.category)category();
// 모든 계산기 등록이 끝난 뒤 메인 탐색 영역도 최신 목록으로 다시 그립니다.
if(document.querySelector('.popular-list')){home();improveCalculatorSearch();}
*/

if(document.body.dataset.customCalculator==='scale'){
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>스케일 계산기</h1><p class="lead">축척 비율을 기준으로 실제 길이와 모형·도면 길이를 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-tabs"><button class="utility-tab active" data-mode="model">실제 → 모형</button><button class="utility-tab" data-mode="real">모형 → 실제</button></div><div class="utility-form" id="scale-form"></div><div class="result" id="scale-result"></div></section><section class="content-block"><p>모든 길이는 같은 단위로 입력하세요. 예를 들어 실제 길이를 cm로 입력했다면 결과도 cm로 표시됩니다.</p></section>`;
  let mode='model';const form=root.querySelector('#scale-form'),result=root.querySelector('#scale-result');
  const render=()=>{form.innerHTML=`<div class="utility-fields"><label><span>${mode==='model'?'실제 길이':'모형 길이'}</span><input id="scale-length" type="number" placeholder="예: 1000"></label><label><span>축척 분모 (1 : ?)</span><input id="scale-ratio" type="number" placeholder="예: 100"></label></div><button class="primary-btn" id="scale-calc">계산하기</button>`;form.querySelector('#scale-calc').onclick=()=>{const length=Number(root.querySelector('#scale-length').value),ratio=Number(root.querySelector('#scale-ratio').value);if(!length||!ratio)return;const value=mode==='model'?length/ratio:length*ratio;result.innerHTML=`<strong>${value.toLocaleString('ko-KR')}</strong><p>${mode==='model'?'모형·도면 길이':'실제 길이'}입니다.</p>`;result.classList.add('show')}};
  root.querySelector('.utility-tabs').onclick=e=>{const tab=e.target.closest('.utility-tab');if(!tab)return;mode=tab.dataset.mode;root.querySelectorAll('.utility-tab').forEach(x=>x.classList.toggle('active',x===tab));result.classList.remove('show');render()};render();
}
calculators.scale={n:'스케일 계산기',c:'life',d:'축척 비율로 실제 길이와 모형 길이를 계산합니다.'};
cats.life[3]+=' scale';
if(document.body.dataset.category==='life')category();

// 최근 추가 계산기: 메인과 분리된 공통 실행 구조로 다시 연결합니다.
const restoredTools={
 'four-insurance':['4대보험 계산기','business',['월 급여(원)','근로자 부담률 합계(%)']],
 'annual-salary':['연봉 계산기','business',['연봉(원)','연간 상여금(원)']],
 'jeonse-loan':['전세대출 이자 계산기','money',['대출 원금(원)','연 이자율(%)']],
 'parental-leave':['육아휴직 급여 계산기','business',['월 통상임금(원)','적용 비율(%)']],
 'car-installment':['자동차 할부 계산기','money',['차량 가격(원)','선수금(원)','연 이자율(%)','할부 기간(개월)']],
 'volumetric-weight':['부피무게 계산기','business',['가로(cm)','세로(cm)','높이(cm)']],
 'compound-interest':['복리 계산기','money',['초기 투자금(원)','연 수익률(%)','기간(년)']],
 'body-fat':['체지방률 계산기','health',['키(cm)','허리둘레(cm)','몸무게(kg)']],
 'fuel-cost':['연료비 계산기','life',['주행 거리(km)','연비(km/L)','유가(원/L)']]
};
function restoredResult(type,v){
  if(type==='four-insurance')return [v[0]*v[1]/100,'예상 월 공제액'];
  if(type==='annual-salary')return [(v[0]+v[1])/12,'상여금 포함 세전 월 평균'];
  if(type==='jeonse-loan')return [v[0]*v[1]/1200,'원금 상환 제외 월 이자'];
  if(type==='parental-leave')return [v[0]*v[1]/100,'월 예상 급여 (제도 상·하한 별도)'];
  if(type==='car-installment'){const p=v[0]-v[1],r=v[2]/1200,n=v[3],m=r?p*r*(1+r)**n/((1+r)**n-1):p/n;return [m,`월 납입액 · 총 이자 ${Math.round(m*n-p).toLocaleString()}원`];}
  if(type==='volumetric-weight')return [v[0]*v[1]*v[2]/6000,'항공·택배 기준 부피무게(kg)'];
  if(type==='compound-interest')return [v[0]*(1+v[1]/100)**v[2],'복리 적용 예상 금액'];
  if(type==='body-fat')return [Math.max(0,(v[1]/v[0]*100-40)+(v[2]/v[0]-.4)*10),'간편 추정 체지방률(%)'];
  if(type==='fuel-cost')return [v[0]/v[1]*v[2],'예상 연료비'];
}
function renderRestoredTool(){
  const type=document.body.dataset.customCalculator,tool=restoredTools[type];
  if(!tool)return;
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>${tool[0]}</h1><p class="lead">필요한 값을 입력해 예상 결과를 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${tool[2].map((label,index)=>`<label><span>${label}</span><input id="restored-${index}" type="number" placeholder="예: ${index?10:1000000}"></label>`).join('')}</div><button class="primary-btn" id="restored-calc">계산하기</button></div><div class="result" id="restored-result"></div><p class="calculator-note">제도·계약 조건과 실제 상품 기준에 따라 결과는 달라질 수 있습니다.</p></section>`;
  root.querySelector('#restored-calc').onclick=()=>{const values=tool[2].map((_,index)=>Number(root.querySelector(`#restored-${index}`).value));const result=root.querySelector('#restored-result');if(values.some(value=>!Number.isFinite(value)||value<=0)){result.innerHTML='<strong>입력값을 확인해 주세요</strong>';result.classList.add('show');return}const [amount,label]=restoredResult(type,values);result.innerHTML=`<strong>${Math.round(amount).toLocaleString('ko-KR')}${type==='body-fat'?'%':'원'}</strong><p>${label}</p>`;result.classList.add('show')};
}
Object.entries(restoredTools).forEach(([key,value])=>calculators[key]={n:value[0],c:value[1],d:'예상 금액을 계산합니다.'});
cats.money[3]+=' jeonse-loan car-installment compound-interest';cats.business[3]+=' four-insurance annual-salary parental-leave volumetric-weight';cats.health[3]+=' body-fat';cats.life[3]+=' fuel-cost';
renderRestoredTool();
if(document.querySelector('.popular-list')){home();improveCalculatorSearch();}
if(document.body.dataset.category)category();

const batchSearchTools={
 'percent-change':['퍼센트 증가율·감소율 계산기','money'], 'break-even':['손익분기점 계산기','business'], roi:['ROI 계산기','money'], exchange:['환율 계산기','money'], 'shipping-split':['배송비 분할 계산기','business'], electricity:['전기요금 계산기','life'], 'travel-budget':['여행 경비 계산기','life'], 'calorie-deficit':['칼로리 적자 계산기','health'], 'exam-target':['시험 성적 목표 계산기','education'], 'income-tax':['근로소득 세금 간편 계산기','business']};
Object.entries(batchSearchTools).forEach(([key,value])=>calculators[key]={n:value[0],c:value[1],d:'생활에 필요한 계산기입니다.'});
cats.money[3]+=' percent-change roi exchange';cats.business[3]+=' break-even shipping-split income-tax';cats.life[3]+=' electricity travel-budget';cats.health[3]+=' calorie-deficit';cats.education[3]+=' exam-target';
if(document.querySelector('.popular-list')){home();improveCalculatorSearch();}if(document.body.dataset.category)category();

function makeHomeCategoriesExpandable(){
  const grid=document.querySelector('#category-grid');
  if(!grid)return;
  const wrap=grid.parentElement;
  let panel=wrap.querySelector('.category-calculator-panel');
  if(!panel){panel=document.createElement('div');panel.className='category-calculator-panel';grid.insertAdjacentElement('afterend',panel)}
  const render=(key)=>{const data=cats[key],ids=[...new Set(data[3].trim().split(/\s+/))].filter(id=>calculators[id]).sort((a,b)=>calculators[a].n.localeCompare(calculators[b].n,'ko-KR'));panel.innerHTML=`<div class="category-panel-heading"><div><p>${data[2]}</p><h3>${data[0]}</h3></div><a href="/categories/${key}.html">전체 보기 →</a></div><div class="category-calculator-list">${ids.map(id=>`<a href="${href(id)}"><b>${calculators[id].n}</b><span>${calculators[id].d||'계산기'}</span></a>`).join('')}</div>`;panel.classList.add('show')};
  grid.innerHTML=Object.entries(cats).map(([key,data])=>`<button type="button" class="home-category" data-category="${key}"><span>${data[1]}</span>${data[0]}</button>`).join('');
  grid.onclick=event=>{const button=event.target.closest('.home-category');if(!button)return;grid.querySelectorAll('.home-category').forEach(item=>item.classList.toggle('active',item===button));render(button.dataset.category)};
  const first=grid.querySelector('.home-category');if(first){first.classList.add('active');render(first.dataset.category)}
}
makeHomeCategoriesExpandable();

// 모호한 강도 선택 대신 운동 종류별 MET 값을 사용합니다.
if(document.body.dataset.calculator==='exercise-calorie'){
  const root=document.querySelector('#calculator');
  root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>운동 칼로리 계산기</h1><p class="lead">운동 종류와 시간을 기준으로 예상 소모 칼로리를 계산하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label><span>몸무게(kg)</span><input id="ec-weight" type="number" placeholder="예: 65"></label><label><span>운동 종류</span><select id="ec-type"><option value="3.5">걷기 (보통 속도)</option><option value="7">조깅</option><option value="10">러닝 (약 10km/h)</option><option value="8">자전거 (보통 속도)</option><option value="8">수영 (자유형 보통)</option><option value="5">근력 운동 (일반)</option></select></label><label><span>운동 시간(분)</span><input id="ec-minutes" type="number" placeholder="예: 30"></label></div><button class="primary-btn" id="ec-calc">칼로리 계산하기</button></div><div class="result" id="ec-result"></div><p class="calculator-note">MET(운동대사당량) 기반 추정치입니다. 실제 소모량은 운동 강도, 체성분, 심박수에 따라 달라집니다.</p></section>`;
  root.querySelector('#ec-calc').onclick=()=>{const weight=+root.querySelector('#ec-weight').value,met=+root.querySelector('#ec-type').value,minutes=+root.querySelector('#ec-minutes').value,result=root.querySelector('#ec-result');if(!weight||!minutes)return;const calories=met*3.5*weight/200*minutes;result.innerHTML=`<strong>${Math.round(calories).toLocaleString()} kcal</strong><p>${root.querySelector('#ec-type').selectedOptions[0].text} · ${minutes}분 기준 예상 소모량입니다.</p>`;result.classList.add('show')};
}

// 모든 공통형 계산기에 빈 입력·미선택 검증을 적용합니다.
function validateStandardCalculator(){
  const button=document.querySelector('#calculate');
  const key=document.body.dataset.calculator;
  if(!button||!key||['gpa','percent','discount','savings-interest','loan-interest','budget','vat','dutch-pay','estimate','freelance-rate','age','exercise-calorie','severance'].includes(key))return;
  button.onclick=()=>{
    const inputs=[...document.querySelectorAll('.fields input,.fields select')];
    const result=document.querySelector('#result');
    const invalid=inputs.some(input=>!String(input.value).trim()||input.value==='선택');
    if(invalid){result.innerHTML='<strong>필수 항목을 입력해 주세요</strong><p>모든 값과 선택 항목을 확인한 뒤 다시 계산해 주세요.</p>';result.classList.add('show');return;}
    try{const answer=compute(calculators[key].op,inputs);if(!answer?.[0])throw new Error();result.innerHTML=`<strong>${answer[0]}</strong><p>${answer[1]||''}</p>`;result.classList.add('show')}catch{result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>값의 단위와 범위를 확인한 뒤 다시 계산해 주세요.</p>';result.classList.add('show')}
  };
}
validateStandardCalculator();

if(document.body.dataset.calculator==='calorie'){
  const root=document.querySelector('#calculator');
  root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>권장 칼로리 계산기</h1><p class="lead">기초대사량과 실제 활동 패턴을 기준으로 하루 유지 칼로리를 추정합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label><span>기초대사량(kcal)</span><input id="cal-bmr" type="number" placeholder="예: 1500"></label><label><span>활동 수준</span><select id="cal-level"><option value="1.2">좌식 생활 · 운동 거의 없음</option><option value="1.375">가벼운 활동 · 주 1~3회 운동</option><option value="1.55">보통 활동 · 주 3~5회 운동</option><option value="1.725">높은 활동 · 주 6~7회 운동</option><option value="1.9">매우 높은 활동 · 육체노동/강도 높은 훈련</option></select></label></div><button class="primary-btn" id="cal-calc">칼로리 계산하기</button></div><div class="result" id="cal-result"></div><p class="calculator-note">체중 유지 기준의 추정치입니다. 감량·증량 목표와 건강 상태에 따라 전문가 상담이 필요할 수 있습니다.</p></section>`;
  root.querySelector('#cal-calc').onclick=()=>{const bmr=+root.querySelector('#cal-bmr').value,factor=+root.querySelector('#cal-level').value,r=root.querySelector('#cal-result');if(!bmr)return;const total=bmr*factor;r.innerHTML=`<strong>${Math.round(total).toLocaleString()} kcal</strong><p>${root.querySelector('#cal-level').selectedOptions[0].text} 기준 하루 유지 칼로리입니다.</p>`;r.classList.add('show')};
}

if(document.body.dataset.calculator==='water'){
  const root=document.querySelector('#calculator');
  root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>물 섭취량 계산기</h1><p class="lead">체중과 운동 시간을 반영해 하루 물 섭취 권장 범위를 확인하세요.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label><span>몸무게(kg)</span><input id="water-weight" type="number" placeholder="예: 65"></label><label><span>추가 운동 시간(분)</span><input id="water-exercise" type="number" placeholder="예: 30"></label></div><button class="primary-btn" id="water-calc">섭취량 계산하기</button></div><div class="result" id="water-result"></div><p class="calculator-note">음식에 포함된 수분과 개인의 질환·임신·수유·기후 조건은 별도로 고려해야 합니다.</p></section>`;
  root.querySelector('#water-calc').onclick=()=>{const weight=+root.querySelector('#water-weight').value,exercise=+root.querySelector('#water-exercise').value||0,r=root.querySelector('#water-result');if(!weight)return;const base=weight*30,extra=Math.ceil(exercise/30)*250;r.innerHTML=`<strong>${Math.round(base+extra).toLocaleString()} ml</strong><p>기본 ${Math.round(base).toLocaleString()}ml + 운동 추가 ${extra.toLocaleString()}ml 기준입니다.</p>`;r.classList.add('show')};
}

// 모든 계산기 등록과 메인 렌더링이 끝난 뒤 카테고리 탐색을 펼침형으로 고정합니다.
if(document.querySelector('#category-grid'))makeHomeCategoriesExpandable();

// 카테고리 페이지를 단순 목록이 아닌 목적별 계산기 안내 페이지로 확장합니다.
(function enhanceCategoryPages(){
  const key=document.body.dataset.category;
  const root=document.querySelector('#category');
  if(!key||!root||!cats[key])return;

  const unique=ids=>[...new Set(String(ids||'').trim().split(/\s+/).filter(Boolean))];
  const safeCard=id=>calculators[id]?card(id):'';
  const safeLink=id=>calculators[id]?`<a href="${href(id)}"><b>${calculators[id].n}</b><span>${calculators[id].d||'필요한 값을 입력해 바로 계산하세요.'}</span></a>`:'';
  const groupBlock=g=>{
    const links=g.ids.map(safeLink).filter(Boolean).join('');
    if(!links)return '';
    return `<article class="category-purpose-card"><h3>${g.title}</h3><p>${g.desc}</p><div class="category-purpose-links">${links}</div></article>`;
  };
  const faqBlock=items=>items.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');

  const data={
    money:{
      eyebrow:'대출·저축·세금·투자',
      title:'금융 계산기',
      lead:'대출 이자, 예금 이자, 월급 실수령액, 세금, 투자 계산까지 생활에 필요한 금융 계산기를 한곳에 모았습니다.',
      recommend:['loan-interest','savings-interest','salary','unemployment-benefit','stock-leverage'],
      groups:[
        {title:'대출 / 이자',desc:'월 이자, 총 상환액, 대출 부담률을 먼저 확인할 때 사용하세요.',ids:['loan-interest','loan-schedule','jeonse-loan','prepayment-fee','dsr']},
        {title:'예금 / 적금',desc:'저축 만기 금액과 세후 이자를 비교할 때 유용합니다.',ids:['savings-interest','installment','compound-interest','youth-leap-account']},
        {title:'월급 / 생활비',desc:'월 실수령액과 생활 예산, 퇴직·실업 상황의 현금흐름을 점검하세요.',ids:['salary','budget','unemployment-benefit','daily-proration','rent-conversion']},
        {title:'세금 / 공제',desc:'세금과 공제 예상액을 빠르게 보고 신고 전 체크리스트로 활용하세요.',ids:['capital-gains-tax','gift-tax','monthly-rent-deduction','property-tax','car-acquisition-tax','lotto-tax']},
        {title:'투자 / 주식',desc:'매수 단가, 수익률, 레버리지 위험을 계산해 투자 판단을 보조합니다.',ids:['average-price','averaging-down','stock-return','stock-leverage','roi','percent-change']}
      ],
      guide:'금융 계산기는 실제 계약이나 신청 전에 대략적인 부담과 수익을 빠르게 파악하는 데 도움이 됩니다. 다만 금리, 세율, 수수료, 지원 조건은 금융기관·정부 제도·적용 시점에 따라 달라질 수 있으므로 최종 결정 전 공식 안내를 함께 확인하는 것이 좋습니다.',
      faq:[
        ['계산 결과가 실제 금액과 같나요?','입력값을 기준으로 한 예상 결과입니다. 실제 금액은 상품 조건, 세율, 우대금리, 수수료에 따라 달라질 수 있습니다.'],
        ['금융 계산기는 어떤 순서로 보면 좋나요?','대출은 월 상환액과 총 이자를 먼저 보고, 예금·적금은 세후 이자와 만기 금액을 함께 확인하는 것이 좋습니다.'],
        ['입력한 금융 정보가 저장되나요?','이 사이트의 계산기는 브라우저에서 즉시 계산하는 용도이며, 별도 저장 기능이 없는 입력값은 서버에 저장되지 않습니다.']
      ]
    },
    education:{
      eyebrow:'학점·성적·시험 일정',
      title:'교육 계산기',
      lead:'학점, 목표 평점, 내신 등급, 평균 점수, 시험 D-day 계산에 필요한 도구를 모았습니다.',
      recommend:['gpa','target-gpa','school-grade','average-score','exam-dday'],
      groups:[
        {title:'대학교 학점',desc:'이번 학기 평점, 목표 평점, 재수강 후 변화를 확인하세요.',ids:['gpa','target-gpa','retake']},
        {title:'시험 / 성적',desc:'평균 점수, 목표 점수, 내신 등급을 계산해 학습 계획에 활용하세요.',ids:['average-score','exam-target','school-grade']},
        {title:'일정 관리',desc:'시험까지 남은 날짜를 확인하고 준비 기간을 나눠 보세요.',ids:['exam-dday','d-day','date']},
        {title:'확률 / 판단',desc:'기댓값처럼 선택지를 비교해야 할 때 참고할 수 있습니다.',ids:['expected-value']}
      ],
      guide:'교육 계산기는 성적을 예측하거나 학습 계획을 세우는 데 유용합니다. 학교별 학점 환산 기준, 내신 산출 방식, 시험 반영 비율은 다를 수 있으므로 최종 성적 판단에는 학교 기준을 함께 확인하세요.',
      faq:[
        ['학점 계산 결과가 학교 성적표와 다를 수 있나요?','학교마다 A+, P/F, 재수강 처리 방식이 다를 수 있어 실제 성적표와 차이가 날 수 있습니다.'],
        ['목표 학점 계산기는 언제 쓰면 좋나요?','다음 학기에 몇 점을 받아야 누적 평점을 맞출 수 있는지 확인할 때 유용합니다.'],
        ['내신 등급은 정확한가요?','일반적인 석차 누적 비율 기준의 예상값입니다. 과목별 반영 방식은 학교 기준을 확인해야 합니다.']
      ]
    },
    health:{
      eyebrow:'체중·칼로리·운동',
      title:'건강 계산기',
      lead:'BMI, 기초대사량, 권장 칼로리, 운동 칼로리, 생리 주기 등 건강 관리를 위한 계산기를 모았습니다.',
      recommend:['bmi','bmr','calorie','exercise-calorie','body-fat'],
      groups:[
        {title:'체중 / 체형',desc:'현재 상태와 목표 체중을 숫자로 확인해 관리 방향을 잡아보세요.',ids:['bmi','target-weight','body-fat']},
        {title:'칼로리 / 식단',desc:'하루 필요 열량, 칼로리 적자, 물 섭취량을 계산합니다.',ids:['bmr','calorie','calorie-deficit','water']},
        {title:'운동',desc:'운동별 예상 소모 칼로리와 러닝 페이스를 확인하세요.',ids:['exercise-calorie','running-pace']},
        {title:'여성 건강 / 날짜',desc:'생리 주기, 배란일, 임신 주수를 날짜 기준으로 계산합니다.',ids:['ovulation','menstrual-cycle','pregnancy-week']}
      ],
      guide:'건강 계산기는 생활 관리에 참고할 수 있는 일반 계산 도구입니다. 신체 상태를 진단하거나 치료 방향을 결정하는 의료 도구가 아니므로, 통증·질환·임신·영양 문제처럼 중요한 상황에서는 의료 전문가와 상담하세요.',
      faq:[
        ['BMI만으로 건강 상태를 판단해도 되나요?','BMI는 키와 몸무게만 반영하므로 근육량, 체지방률, 질환 여부를 함께 고려해야 합니다.'],
        ['권장 칼로리는 매일 같게 먹으면 되나요?','활동량, 운동량, 목표 체중, 건강 상태에 따라 달라질 수 있어 참고값으로 보는 것이 좋습니다.'],
        ['생리 주기 계산은 정확한가요?','최근 주기를 바탕으로 한 예상 날짜입니다. 주기가 불규칙하거나 건강 이슈가 있으면 전문 상담이 필요합니다.']
      ]
    },
    life:{
      eyebrow:'날짜·시간·단위·생활비',
      title:'생활 계산기',
      lead:'날짜, 시간, 나이, 더치페이, 단위 변환, 배송·부피 계산 등 일상에서 자주 쓰는 계산기를 모았습니다.',
      recommend:['d-day','date','age','dutch-pay','unit'],
      groups:[
        {title:'날짜 / 시간',desc:'기준일, 디데이, 일수, 경과 시간을 빠르게 확인합니다.',ids:['date','d-day','day-count','time']},
        {title:'나이 / 생일',desc:'한국식 나이와 만나이를 함께 비교해 서류나 일정 확인에 활용하세요.',ids:['age','international-age']},
        {title:'비용 나누기 / 이동',desc:'더치페이, 여행 예산, 연료비처럼 일상 비용을 나눠 봅니다.',ids:['dutch-pay','travel-budget','fuel-cost']},
        {title:'변환 / 물류',desc:'단위, 스케일, CBM, 부피무게처럼 규격 계산이 필요할 때 사용합니다.',ids:['unit','scale','cbm','volumetric-weight']},
        {title:'생활 공과금',desc:'전기요금처럼 월별 생활비를 추정할 때 참고하세요.',ids:['electricity','car-tax']}
      ],
      guide:'생활 계산기는 반복적으로 찾아보는 작은 계산을 줄이는 데 초점을 둡니다. 날짜와 시간은 포함 기준에 따라 결과가 달라질 수 있고, 배송·요금 계산은 업체별 기준이 다를 수 있으므로 실제 청구 기준을 함께 확인하세요.',
      faq:[
        ['일수 계산은 시작일과 종료일 포함 여부가 중요한가요?','네. 계약 기간, 근무일, 여행 일정 계산에서는 포함 기준에 따라 결과가 1일 이상 달라질 수 있습니다.'],
        ['나이 계산과 만나이 계산은 다른가요?','한국식 나이는 연도 기준, 만나이는 생일 경과 여부 기준이므로 같은 생년월일도 결과가 다를 수 있습니다.'],
        ['CBM이나 부피무게는 실제 배송비와 같나요?','운송사별 분모와 반올림 기준이 달라 실제 청구 중량과 차이가 날 수 있습니다.']
      ]
    },
    business:{
      eyebrow:'사업·업무·급여',
      title:'업무 계산기',
      lead:'부가세, 마진율, 견적, 프리랜서 단가, 근무시간, 퇴직금 등 실무에 필요한 계산기를 모았습니다.',
      recommend:['vat','margin','estimate','freelance-rate','severance'],
      groups:[
        {title:'사업 / 판매',desc:'판매가, 원가, 세금, 손익분기점을 함께 확인해 의사결정에 활용하세요.',ids:['vat','margin','break-even','estimate']},
        {title:'프리랜서 / 인건비',desc:'시간당 단가, 시급, 근무시간, 연차 등 인건비 관련 계산을 모았습니다.',ids:['freelance-rate','wage','work-hours','annual-leave','weekly-holiday-pay']},
        {title:'급여 / 퇴직',desc:'퇴직금, 4대보험, 육아휴직 급여처럼 근로 관련 금액을 추정합니다.',ids:['severance','four-insurance','annual-salary','parental-leave','income-tax','withholding-33']},
        {title:'배송 / 정산',desc:'배송비 분담과 물류 규격 계산으로 견적·정산을 보조합니다.',ids:['shipping-split','cbm','volumetric-weight']}
      ],
      guide:'업무 계산기는 견적, 정산, 급여, 판매 전략을 빠르게 검토하는 데 유용합니다. 실제 세금 신고, 근로계약, 거래 조건은 업종과 계약서에 따라 달라질 수 있으므로 중요한 업무에는 세무·노무·계약 기준을 확인하세요.',
      faq:[
        ['부가세와 마진율은 같이 봐야 하나요?','네. 부가세 포함 판매가인지, 공급가액 기준인지에 따라 실제 이익률 판단이 달라질 수 있습니다.'],
        ['프리랜서 단가는 어떻게 정하는 게 좋나요?','목표 순수입뿐 아니라 영업·미팅·수정 시간, 세금, 장비비, 플랫폼 수수료까지 반영하는 것이 좋습니다.'],
        ['퇴직금이나 4대보험 계산은 확정 금액인가요?','근속기간, 평균임금, 보수월액, 요율, 상한액에 따라 실제 금액이 달라질 수 있는 예상값입니다.']
      ]
    }
  }[key];

  const allIds=unique(cats[key][3]);
  const recommended=data.recommend.map(safeCard).filter(Boolean).join('');
  const allList=allIds.map(safeCard).filter(Boolean).join('');

  document.title=`${data.title} | 계산페이지`;
  document.querySelector('meta[name="description"]')?.setAttribute('content',data.lead);
  root.innerHTML=`
    <p class="eyebrow">${data.eyebrow}</p>
    <h1>${data.title}</h1>
    <p class="lead">${data.lead}</p>
    <section class="category-featured">
      <div class="section-heading"><h2>추천 ${data.title}</h2><p>이 카테고리에서 먼저 확인하면 좋은 계산기입니다.</p></div>
      <div class="card-grid">${recommended}</div>
    </section>
    <section class="category-purpose">
      <div class="section-heading"><h2>어떤 계산기가 필요하세요?</h2><p>목적에 맞는 계산기를 빠르게 고를 수 있게 묶었습니다.</p></div>
      <div class="category-purpose-grid">${data.groups.map(groupBlock).join('')}</div>
    </section>
    <section class="category-all">
      <div class="section-heading"><h2>전체 ${data.title} 목록</h2><p>현재 제공 중인 모든 계산기입니다.</p></div>
      <div class="card-grid">${allList}</div>
    </section>
    <section class="content-block category-guide"><h2>${data.title}를 사용할 때 알아두세요</h2><p>${data.guide}</p></section>
    <section class="content-block category-faq"><h2>자주 묻는 질문</h2>${faqBlock(data.faq)}</section>`;
})();

// 세금·연금·정책형 계산기 10종 검색/카테고리 등록
(function(){
  if(typeof calculators==='undefined'||typeof cats==='undefined')return;
  const added={
    'capital-gains-tax':{n:'양도소득세 계산기',c:'money',d:'양도가액, 취득가액, 필요경비로 양도소득세 예상액을 계산합니다.'},
    'gift-tax':{n:'증여세 계산기',c:'money',d:'증여재산가액과 가족 관계별 공제를 반영해 예상 증여세를 계산합니다.'},
    'car-tax':{n:'자동차세 계산기',c:'life',d:'배기량, 차령 경감, 연납 할인을 반영해 자동차세를 계산합니다.'},
    'national-pension':{n:'국민연금 예상수령액 계산기',c:'money',d:'월 납입보험료와 가입기간으로 국민연금 예상수령액을 추정합니다.'},
    'local-health-insurance':{n:'지역가입자 건강보험료 계산기',c:'money',d:'소득과 재산 기준으로 지역가입자 건강보험료를 간편 추정합니다.'},
    'comprehensive-income-tax':{n:'종합소득세 계산기',c:'business',d:'수입, 필요경비, 공제, 기납부세액으로 종합소득세를 계산합니다.'},
    'withholding-33':{n:'원천징수 3.3% 계산기',c:'business',d:'프리랜서 3.3% 원천징수액과 실수령액을 계산합니다.'},
    'property-tax':{n:'재산세 계산기',c:'money',d:'주택 공시가격과 공정시장가액비율로 재산세를 계산합니다.'},
    'youth-leap-account':{n:'청년도약계좌 만기 계산기',c:'money',d:'월 납입액, 금리, 정부기여금을 반영해 만기 수령액을 계산합니다.'},
    'lotto-tax':{n:'로또 세금 계산기',c:'life',d:'복권 당첨금의 세금과 예상 실수령액을 계산합니다.'}
  };
  Object.assign(calculators,added);
  const add=(cat,ids)=>{const set=new Set((cats[cat][3]+' '+ids).trim().split(/\s+/));cats[cat][3]=[...set].join(' ')};
  add('money','capital-gains-tax gift-tax national-pension local-health-insurance property-tax youth-leap-account');
  add('business','comprehensive-income-tax withholding-33');
  add('life','car-tax lotto-tax');
  if(document.querySelector('.popular-list')){
    home();
    if(typeof improveCalculatorSearch==='function')improveCalculatorSearch();
    if(typeof makeHomeCategoriesExpandable==='function')makeHomeCategoriesExpandable();
  }
  if(document.body.dataset.category)category();
})();

calculators['daily-proration']={n:'일할 계산기',c:'money',d:'월 금액을 일수에 맞춰 일할 계산합니다.'};
calculators['expected-value']={n:'기댓값 계산기',c:'education',d:'확률과 결과값으로 기댓값을 계산합니다.'};
cats.money[3]+=' daily-proration';cats.education[3]+=' expected-value';
if(document.body.dataset.category==='money'||document.body.dataset.category==='education')category();
calculators['stock-leverage']={n:'주식 레버리지 계산기',c:'money',d:'기초자산 수익률과 레버리지 배수로 예상 손익을 계산합니다.'};
cats.money[3]+=' stock-leverage';
if(document.body.dataset.category==='money')category();

function enhanceLifeDateTools(){
  const key=document.body.dataset.calculator;if(!['date','d-day','time'].includes(key))return;const root=document.querySelector('#calculator');
  if(key==='date')root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>날짜 계산기</h1><p class="lead">기준일에서 원하는 일수만큼 앞·뒤 날짜를 계산합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label>기준일<input id="ld-date" type="date"></label><label>계산할 일수<input id="ld-days" type="number" placeholder="예: 100"></label><label>방향<select id="ld-direction"><option value="1">이후</option><option value="-1">이전</option></select></label></div><button class="primary-btn" id="ld-calc">날짜 계산하기</button></div><div class="result" id="ld-result"></div></section>`;
  if(key==='d-day')root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>디데이 계산기</h1><p class="lead">기준일과 목표일 사이의 남은 날짜 또는 지난 날짜를 계산합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label>기준일<input id="ld-date" type="date"></label><div class="field-with-option"><label>목표일<input id="ld-target" type="date"></label><label class="field-option"><input id="ld-include" type="checkbox"> 목표일 포함</label></div></div><button class="primary-btn" id="ld-calc">디데이 계산하기</button></div><div class="result" id="ld-result"></div></section>`;
  if(key==='time')root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>시간 계산기</h1><p class="lead">자정 넘김과 휴게시간을 반영해 실제 경과 시간을 계산합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields"><label>시작 시간<input id="lt-start" type="time"></label><label>종료 시간<input id="lt-end" type="time"></label><label>제외할 시간(분)<input id="lt-break" type="number" placeholder="예: 60"></label></div><button class="primary-btn" id="lt-calc">시간 계산하기</button></div><div class="result" id="lt-result"></div></section>`;
  const button=root.querySelector('.primary-btn');button.onclick=()=>{const r=root.querySelector('.result');if(key==='time'){let a=root.querySelector('#lt-start').value,b=root.querySelector('#lt-end').value,br=+root.querySelector('#lt-break').value||0;if(!a||!b)return;let m=t=>t.split(':').reduce((s,v)=>s*60+(+v),0),d=m(b)-m(a);if(d<0)d+=1440;d=Math.max(0,d-br);r.innerHTML=`<strong>${Math.floor(d/60)}시간 ${d%60}분</strong><p>휴게시간 ${br}분을 제외한 시간입니다.</p>`}else{const a=new Date(root.querySelector('#ld-date').value);if(isNaN(a))return;if(key==='date'){const days=+root.querySelector('#ld-days').value,dir=+root.querySelector('#ld-direction').value;if(!Number.isFinite(days))return;a.setDate(a.getDate()+days*dir);r.innerHTML=`<strong>${a.toLocaleDateString('ko-KR')}</strong>`}else{const b=new Date(root.querySelector('#ld-target').value);if(isNaN(b))return;let d=Math.round((b-a)/864e5);if(root.querySelector('#ld-include').checked)d+=d>=0?1:-1;r.innerHTML=`<strong>${d>=0?'D-'+d:'D+'+Math.abs(d)}</strong><p>기준일과 목표일의 차이입니다.</p>`}}r.classList.add('show')};
}
enhanceLifeDateTools();

function enhanceCoreHealthTools(){
  const key=document.body.dataset.calculator;if(!['bmi','bmr','target-weight','running-pace'].includes(key))return;const root=document.querySelector('#calculator');
  const templates={
    bmi:['BMI 계산기','키(cm)|몸무게(kg)','BMI와 일반적인 성인 범위를 참고로 확인합니다.'],
    bmr:['기초대사량 계산기','성별|나이|키(cm)|몸무게(kg)','Mifflin-St Jeor 식을 사용한 추정치입니다.'],
    'target-weight':['목표 체중 계산기','키(cm)|목표 BMI','키와 목표 BMI로 목표 체중을 계산합니다.'],
    'running-pace':['러닝 페이스 계산기','거리(km)|시간(분)|시간(초)','거리와 시간을 기준으로 km당 페이스를 계산합니다.']};
  const [title,fields,description]=templates[key];const inputs=fields.split('|').map((label,i)=>label==='성별'?`<label>${label}<select id="ch${i}"><option value="male">남성</option><option value="female">여성</option></select></label>`:`<label>${label}<input id="ch${i}" type="number" placeholder="예: ${i?65:170}"></label>`).join('');
  root.innerHTML=`<a class="calculator-home" href="/">← 계산페이지 홈</a><h1>${title}</h1><p class="lead">${description}</p><section class="calculator-box utility-box"><div class="utility-form"><div class="utility-fields">${inputs}</div><button class="primary-btn" id="ch-calc">계산하기</button></div><div class="result" id="ch-result"></div><p class="calculator-note">건강 상태를 진단하는 의료 도구가 아닌 일반적인 참고용 계산입니다.</p></section>`;
  root.querySelector('#ch-calc').onclick=()=>{const r=root.querySelector('#ch-result');let out,text;if(key==='bmi'){const h=+root.querySelector('#ch0').value,w=+root.querySelector('#ch1').value;if(!h||!w)return;const n=w/(h/100)**2;out=`${n.toFixed(1)} BMI`;text=n<18.5?'저체중 범위':n<23?'정상 범위':n<25?'과체중 범위':'비만 범위'}if(key==='bmr'){const sex=root.querySelector('#ch0').value,age=+root.querySelector('#ch1').value,h=+root.querySelector('#ch2').value,w=+root.querySelector('#ch3').value;if(!age||!h||!w)return;const n=sex==='male'?10*w+6.25*h-5*age+5:10*w+6.25*h-5*age-161;out=`${Math.round(n)} kcal`;text='하루 기초대사량 추정치'}if(key==='target-weight'){const h=+root.querySelector('#ch0').value,b=+root.querySelector('#ch1').value;if(!h||!b)return;out=`${((h/100)**2*b).toFixed(1)} kg`;text='목표 BMI 기준 체중'}if(key==='running-pace'){const d=+root.querySelector('#ch0').value,m=+root.querySelector('#ch1').value,s=+root.querySelector('#ch2').value||0;if(!d||!m)return;const sec=(m*60+s)/d;out=`${Math.floor(sec/60)}분 ${String(Math.round(sec%60)).padStart(2,'0')}초 /km`;text='평균 러닝 페이스'}r.innerHTML=`<strong>${out}</strong><p>${text}</p>`;r.classList.add('show')};
}
enhanceCoreHealthTools();
calculators['pregnancy-week']={n:'임신 주수 계산기',c:'health',d:'마지막 생리 시작일 기준 임신 주수와 예정일을 계산합니다.'};
cats.health[3]+=' pregnancy-week';
if(document.body.dataset.category==='health')category();
if(document.body.dataset.customCalculator==='pregnancy-week'){
  const root=document.querySelector('#calculator');
  root.innerHTML='<h1>임신 주수 계산기</h1><p class="lead">마지막 생리 시작일을 기준으로 임신 주수와 예정일을 확인합니다.</p><section class="calculator-box utility-box"><div class="utility-form"><label>마지막 생리 시작일 <input id="pregnancy-date" type="date"></label><button class="primary-btn" id="pregnancy-calc">계산하기</button></div><div class="result" id="pregnancy-result"></div><p class="calculator-note">의료 진단이 아닌 날짜 기준 참고용입니다.</p></section>';
  root.querySelector('#pregnancy-calc').onclick=()=>{const date=new Date(root.querySelector('#pregnancy-date').value),result=root.querySelector('#pregnancy-result');if(isNaN(date))return;const days=Math.floor((Date.now()-date)/86400000),due=new Date(date);due.setDate(due.getDate()+280);result.innerHTML=`<strong>임신 ${Math.floor(days/7)}주 ${days%7}일</strong><p>예정일 ${due.toLocaleDateString('ko-KR')}</p>`;result.classList.add('show')};
}

if(document.body.dataset.customCalculator==='volumetric-weight'){
  const root=document.querySelector('#calculator');
  root.innerHTML=`<h1>부피무게 계산기</h1><p class="lead">포장 규격과 실제 중량을 비교해 배송비 산정에 쓰이는 청구 중량을 계산하세요.</p><section class="calculator-box volume-box"><div class="volume-section"><h2>포장 규격 <small>cm · kg 기준</small></h2><div class="volume-fields"><label>가로(cm)<input id="vw-l" type="number" placeholder="예: 50"></label><label>세로(cm)<input id="vw-w" type="number" placeholder="예: 40"></label><label>높이(cm)<input id="vw-h" type="number" placeholder="예: 30"></label><label>실제 중량(kg)<input id="vw-weight" type="number" placeholder="예: 8"></label><label>수량<input id="vw-qty" type="number" placeholder="예: 2"></label></div></div><div class="volume-section"><h2>운송 기준</h2><label class="round-option">부피무게 분모 <select id="vw-divisor"><option value="6000">6,000 (일반 항공·택배)</option><option value="5000">5,000</option><option value="4000">4,000</option><option value="custom">직접 입력</option></select></label><input id="vw-custom" class="volume-custom" type="number" placeholder="직접 입력할 분모" hidden></div><button class="primary-btn" id="vw-calc">청구 중량 계산하기</button><div class="result" id="vw-result"></div><p class="calculator-note">운송사·노선·상품에 따라 부피무게 분모와 반올림 기준이 다를 수 있습니다. 실제 운임은 해당 운송사의 기준을 확인하세요.</p></section><section class="content-block"><h2>부피무게란?</h2><p>부피는 크지만 가벼운 화물은 실제 중량 대신 부피무게가 배송비 기준이 될 수 있습니다. 일반적으로 실제 중량과 부피무게 중 더 큰 값이 청구 중량으로 적용됩니다.</p></section>`;
  const divisor=root.querySelector('#vw-divisor'),custom=root.querySelector('#vw-custom');divisor.onchange=()=>custom.hidden=divisor.value!=='custom';
  root.querySelector('#vw-calc').onclick=()=>{const get=id=>Number(root.querySelector('#'+id).value),l=get('vw-l'),w=get('vw-w'),h=get('vw-h'),actual=get('vw-weight'),qty=get('vw-qty'),divisor=Number(root.querySelector('#vw-divisor').value==='custom'?custom.value:root.querySelector('#vw-divisor').value),result=root.querySelector('#vw-result');if([l,w,h,actual,qty,divisor].some(v=>!v||v<=0)){result.innerHTML='<strong>모든 항목을 입력해 주세요</strong>';result.classList.add('show');return}const volume=l*w*h/1000000,volWeight=l*w*h/divisor,charge=Math.max(actual,volWeight),fmt=v=>v.toFixed(2);result.innerHTML=`<div class="volume-result-grid"><div><span>개당 청구 중량</span><strong>${fmt(charge)} kg</strong></div><div><span>부피무게</span><b>${fmt(volWeight)} kg</b></div><div><span>실제 중량</span><b>${fmt(actual)} kg</b></div><div><span>총 청구 중량</span><b>${fmt(charge*qty)} kg</b></div><div><span>총 CBM</span><b>${fmt(volume*qty)} CBM</b></div></div><p class="volume-status">${volWeight>actual?'부피무게가 실제 중량보다 커 부피 기준으로 청구될 가능성이 높습니다.':'실제 중량이 부피무게보다 커 실제 중량 기준입니다.'}</p>`;result.classList.add('show')};
}

function addCalculatorHomeLink(){
  if(!document.body.dataset.calculator&&!document.body.dataset.customCalculator)return;
  const root=document.querySelector('#calculator');
  if(!root||root.querySelector('.calculator-home'))return;
  root.insertAdjacentHTML('afterbegin','<a class="calculator-home" href="/">← 계산페이지 홈</a>');
}
addCalculatorHomeLink();

const advancedSearchTools={
  dsr:['DSR 계산기','money'], 'stock-return':['주식 수익률 계산기','money'], 'prepayment-fee':['중도상환수수료 계산기','money'], 'car-acquisition-tax':['자동차 취득세 계산기','money'],
  'card-installment':['카드 할부 수수료 계산기','money'], 'housing-subscription':['청약 가점 계산기','money'], 'monthly-rent-deduction':['월세 세액공제 계산기','money'], 'loan-schedule':['대출 상환 스케줄 계산기','money'],
  ovulation:['배란일·가임기 계산기','health'], 'menstrual-cycle':['생리 주기 계산기','health']
};
Object.entries(advancedSearchTools).forEach(([key,value])=>calculators[key]={n:value[0],c:value[1],d:'생활에 필요한 계산기입니다.'});
cats.money[3]+=' dsr stock-return prepayment-fee car-acquisition-tax card-installment housing-subscription monthly-rent-deduction loan-schedule';
cats.health[3]+=' ovulation menstrual-cycle';
if(document.querySelector('.popular-list')){home();improveCalculatorSearch();}
if(document.body.dataset.category)category();
if(document.querySelector('#category-grid'))makeHomeCategoriesExpandable();

// 단위환산 카테고리와 세부 단위 변환 계산기를 등록합니다.
(function(){
  if(typeof calculators==='undefined'||typeof cats==='undefined')return;
  const unitTools={
    'length-conversion':{n:'길이 단위 변환 계산기',c:'conversion',d:'mm, cm, m, km, inch, ft, yd, mile 등 길이 단위를 빠르게 변환합니다.'},
    'area-unit-conversion':{n:'넓이 단위 변환 계산기',c:'conversion',d:'㎡, 평, ha, acre, ft² 등 면적 단위를 입력값 기준으로 변환합니다.'},
    'weight-conversion':{n:'무게 단위 변환 계산기',c:'conversion',d:'mg, g, kg, ton, lb, oz 등 무게 단위를 빠르게 변환합니다.'},
    'temperature-conversion':{n:'온도 단위 변환 계산기',c:'conversion',d:'섭씨, 화씨, 켈빈 온도를 서로 변환합니다.'},
    'volume-conversion':{n:'부피 단위 변환 계산기',c:'conversion',d:'mL, L, m³, 컵, 갤런 등 부피 단위를 빠르게 변환합니다.'},
    'speed-conversion':{n:'속도 단위 변환 계산기',c:'conversion',d:'m/s, km/h, mph, knot 등 속도 단위를 변환합니다.'}
  };
  Object.assign(calculators,unitTools);
  cats.conversion=['단위환산 계산기','📐','길이·넓이·무게·온도·부피·속도 단위 변환','length-conversion area-unit-conversion weight-conversion temperature-conversion volume-conversion speed-conversion area-conversion scale cbm volumetric-weight'];
  Object.assign(searchAliases,{
    'length-conversion':'길이 단위 변환 mm cm m km 인치 피트 마일',
    'area-unit-conversion':'넓이 면적 단위 변환 제곱미터 평 헥타르 에이커',
    'weight-conversion':'무게 단위 변환 kg g lb 파운드 온스 톤',
    'temperature-conversion':'온도 단위 변환 섭씨 화씨 켈빈 c f k',
    'volume-conversion':'부피 단위 변환 리터 밀리리터 갤런 컵 m3',
    'speed-conversion':'속도 단위 변환 kmh mph mps 노트'
  });
  ['length-conversion','area-unit-conversion','weight-conversion','temperature-conversion','volume-conversion','speed-conversion'].forEach(id=>{
    if(!searchBoostIds.includes(id))searchBoostIds.push(id);
  });
  if(document.querySelector('.popular-list')){home();if(typeof improveCalculatorSearch==='function')improveCalculatorSearch();if(typeof makeHomeCategoriesExpandable==='function')makeHomeCategoriesExpandable();}
  if(document.body.dataset.category)category();
})();
