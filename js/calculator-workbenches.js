(() => {
  'use strict';
  if(typeof getComputedStyle!=='function')return;
  const math=globalThis.CP_WORKBENCH_MATH;
  if(!math)return;
  const format=(value,digits=2)=>value.toLocaleString('ko-KR',{maximumFractionDigits:digits});
  const money=value=>format(Math.round(value),0)+'원';
  const signed=value=>(value>0?'+':'')+format(value);
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const metrics=items=>'<div class="workbench-metrics">'+items.map(([label,value])=>'<div><span>'+escape(label)+'</span><strong>'+escape(value)+'</strong></div>').join('')+'</div>';
  const table=(caption,headings,rows)=>'<div class="workbench-table-wrap"><table><caption>'+escape(caption)+'</caption><thead><tr>'+headings.map(text=>'<th scope="col">'+escape(text)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((text,index)=>index===0?'<th scope="row">'+escape(text)+'</th>':'<td>'+escape(text)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  const duration=value=>{const seconds=Math.round(value),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60);return (hours?hours+'시간 ':'')+minutes+'분 '+seconds%60+'초';};
  document.querySelectorAll('[data-workbench]').forEach(panel=>{
    const form=panel.querySelector('form'),result=panel.querySelector('.result');
    const value=name=>form.elements.namedItem(name).value.trim();
    const number=name=>{const text=value(name);if(text==='')throw new Error('빈 입력란을 확인하세요. 해당 항목이 없으면 0을 입력하세요.');return Number(text);};
    form.addEventListener('submit',event=>{
      event.preventDefault();if(!form.reportValidity())return;
      try{
        let output='';
        switch(panel.dataset.workbench){
          case 'discount': {
            const price=number('price'),shipping=number('shipping');
            const answer=math.discount(price,number('first'),number('second'),number('coupon'),shipping);
            output=metrics([['배송비 포함 결제액',money(answer.total)],['상품가 실질 할인율',format(answer.effective)+'%']])+table('할인 적용 내역',['단계','차감액','남은 금액'],[['정가','—',money(price)],['첫 할인',money(answer.firstSaving),money(answer.afterFirst)],['추가 할인',money(answer.secondSaving),money(answer.afterFirst-answer.secondSaving)],['정액 쿠폰',money(answer.usedCoupon),money(answer.product)],['배송비 추가','+'+money(shipping),money(answer.total)]]);
            break;
          }
          case 'points': {
            const answer=math.points(number('before'),number('after'));
            output=metrics([['비율 숫자의 차이',signed(answer.points)+'%p'],['이전 비율 대비 변화',answer.relative===null?'정의되지 않음':signed(answer.relative)+'%']])+ '<p>예를 들어 20%에서 25%로 바뀌면 5%p 상승과 25% 증가를 각각 구분해 표현합니다.</p>';
            break;
          }
          case 'weekdays': {
            const holidays=value('holidays').split(/[,\s]+/).filter(Boolean);
            const answer=math.weekdays(value('start'),value('end'),value('includeStart')==='yes',value('includeEnd')==='yes',holidays);
            output=metrics([['사용 가능한 평일',format(answer.workdays,0)+'일'],['포함 기준 적용 기간',format(answer.calendar,0)+'일']])+table('기간에서 제외한 일수',['항목','일수'],[['선택한 기간',answer.calendar],['토요일·일요일',answer.weekends],['직접 입력한 평일 휴일',answer.holidayCount],['남은 평일',answer.workdays]])+'<p>자동으로 제외한 공휴일은 없습니다. 입력하지 않은 공휴일·휴가일은 평일 수에 포함될 수 있습니다.</p>';
            break;
          }
          case 'pace': {
            const rows=math.pace(number('minutes'),number('seconds'));
            output=table('같은 페이스를 유지할 때의 통과 시간',['거리','예상 경과시간'],rows.map(row=>[(row.distance===21.0975?'하프 ':row.distance===42.195?'마라톤 ':'')+format(row.distance,4)+'km',duration(row.seconds)]));
            break;
          }
          case 'score': {
            const scores=value('scores').split(/[,\s]+/).filter(Boolean).map(Number),answer=math.score(scores);
            output=metrics([['평균',format(answer.mean)+'점'],['중앙값',format(answer.median)+'점'],['표준편차',format(answer.deviation)]] )+ '<p>'+answer.count+'개 점수 · 최저 '+format(answer.min)+'점 · 최고 '+format(answer.max)+'점</p>'+table('점수대별 분포',['점수대','개수','비중'],answer.bands.map(band=>[band.label,band.count,format(band.count/answer.count*100)+'%']));
            break;
          }
          case 'saleProfit': {
            const answer=math.saleProfit(number('fixed'),number('units'),number('price'),number('variable'),number('discount'));
            output=metrics([['같은 수량 판매 시 이익 차이',money(answer.difference)],['할인 후 예상 이익',money(answer.after)]])+table('할인 판매의 영향',['항목','계산 결과'],[['할인 후 개당 가격',money(answer.salePrice)],['할인 전 예상 이익',money(answer.before)],['할인 후 손익분기 수량',answer.breakEven===null?'도달할 수 없음':format(answer.breakEven,0)+'개'],['할인 전 이익을 유지할 수량',answer.sameProfit===null?'계산할 수 없음':format(answer.sameProfit,0)+'개']])+'<p>할인 후 판매가가 변동비 이하이면 판매량을 늘려도 고정비를 회수할 수 없습니다.</p>';
            break;
          }
          case 'fuel': {
            const answer=math.fuel(number('budget'),number('efficiency'),number('price'));
            output=metrics([['예상 주행거리',format(answer.distance,1)+'km'],['주유 가능 연료량',format(answer.litres,2)+'L']])+table('주행거리별 예상 연료비',['거리','예상 비용'],[10,50,100,300].map(distance=>[distance+'km',money(answer.perKm*distance)]));
            break;
          }
          case 'priceTarget': {
            const answer=math.priceTarget(number('cost'),number('fee'),number('margin'));
            output=metrics([['필요한 최소 판매가',money(answer.price)],['건당 예상 이익',money(answer.profit)]])+table('판매가 구성',['항목','금액'],[['입력한 건당 총비용',money(number('cost'))],['판매가 비례 수수료',money(answer.fee)],['남는 이익',money(answer.profit)]]);
            break;
          }
        }
        result.innerHTML=output;result.classList.add('show');
      }catch(error){result.innerHTML='<strong>입력값을 확인해 주세요</strong><p>'+escape(error.message)+'</p>';result.classList.add('show');}
    });
  });
})();
