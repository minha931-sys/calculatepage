/* Arithmetic helpers shared by the practical tools. No DOM or network access. */
(() => {
  'use strict';
  const finite=(value,label)=>{if(!Number.isFinite(value))throw new Error(label+'에 올바른 숫자를 입력하세요.');return value;};
  const positive=(value,label)=>{finite(value,label);if(value<=0)throw new Error(label+'은 0보다 커야 합니다.');return value;};
  const nonnegative=(value,label)=>{finite(value,label);if(value<0)throw new Error(label+'은 0 이상이어야 합니다.');return value;};
  const rate=(value,label)=>{nonnegative(value,label);if(value>100)throw new Error(label+'은 100% 이하여야 합니다.');return value;};
  const validResult=value=>{if(!Number.isFinite(value))throw new Error('계산 가능한 숫자 범위를 초과했습니다. 입력값을 줄여 주세요.');return value;};
  function discount(price,first,second,coupon,shipping){
    positive(price,'정가');rate(first,'첫 할인율');rate(second,'추가 할인율');nonnegative(coupon,'쿠폰');nonnegative(shipping,'배송비');
    const firstSaving=price*first/100,afterFirst=price-firstSaving,secondSaving=afterFirst*second/100;
    const usedCoupon=Math.min(coupon,afterFirst-secondSaving),product=afterFirst-secondSaving-usedCoupon,total=validResult(product+shipping);
    return {firstSaving,afterFirst,secondSaving,usedCoupon,product,total,effective:(1-product/price)*100};
  }
  function points(before,after){rate(before,'이전 비율');rate(after,'이후 비율');return {points:after-before,relative:before===0?null:validResult((after-before)/before*100)};}
  function date(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('날짜는 YYYY-MM-DD 형식으로 입력하세요.');
    const time=Date.parse(value+'T00:00:00Z');
    if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==value)throw new Error('존재하는 날짜를 입력하세요.');
    return time/86400000;
  }
  function weekdays(start,end,includeStart,includeEnd,holidays){
    const originalStart=date(start),originalEnd=date(end);if(originalEnd<originalStart)throw new Error('종료일은 시작일과 같거나 이후여야 합니다.');
    const left=originalStart+(includeStart?0:1),right=originalEnd-(includeEnd?0:1);
    const calendar=Math.max(0,right-left+1);
    let weekends=Math.floor(calendar/7)*2;
    for(let i=Math.floor(calendar/7)*7;i<calendar;i++){const weekday=new Date((left+i)*86400000).getUTCDay();if(weekday===0||weekday===6)weekends++;}
    const unique=[...new Set(holidays.map(date))];
    const holidayCount=unique.filter(day=>{const weekday=new Date(day*86400000).getUTCDay();return day>=left&&day<=right&&weekday!==0&&weekday!==6;}).length;
    return {calendar,weekends,holidayCount,workdays:calendar-weekends-holidayCount};
  }
  function pace(minutes,seconds){
    nonnegative(minutes,'분');nonnegative(seconds,'초');if(!Number.isInteger(minutes)||!Number.isInteger(seconds)||seconds>=60)throw new Error('분·초는 정수로, 초는 0~59로 입력하세요.');
    const perKm=positive(minutes*60+seconds,'1km 시간');
    return [1,5,10,21.0975,42.195].map(distance=>({distance,seconds:validResult(perKm*distance)}));
  }
  function score(values){
    if(values.length<2||values.length>500)throw new Error('점수를 2~500개 입력하세요.');
    values.forEach(value=>{nonnegative(value,'점수');if(value>100)throw new Error('100점 만점 기준으로 0~100 사이의 점수를 입력하세요.');});
    const sorted=[...values].sort((a,b)=>a-b),count=values.length,mean=values.reduce((a,b)=>a+b,0)/count;
    const median=count%2?sorted[(count-1)/2]:(sorted[count/2-1]+sorted[count/2])/2;
    const deviation=Math.sqrt(values.reduce((sum,value)=>sum+(value-mean)**2,0)/count);
    return {count,mean,median,min:sorted[0],max:sorted[count-1],deviation,bands:[0,60,70,80,90].map((lower,i)=>({label:['60점 미만','60~69점','70~79점','80~89점','90~100점'][i],count:values.filter(value=>value>=lower&&(i===4?value<=100:value<[60,70,80,90][i])).length}))};
  }
  function saleProfit(fixed,units,price,variable,discountRate){
    nonnegative(fixed,'고정비');positive(units,'판매량');positive(price,'판매가');nonnegative(variable,'변동비');rate(discountRate,'할인율');
    if(!Number.isInteger(units))throw new Error('판매량은 정수 개수로 입력하세요.');
    const salePrice=price*(1-discountRate/100),contribution=salePrice-variable;
    const before=validResult(units*(price-variable)-fixed),after=validResult(units*contribution-fixed);
    return {salePrice,before,after,difference:validResult(after-before),breakEven:contribution>0?validResult(Math.ceil(fixed/contribution)):null,sameProfit:contribution>0&&price>variable?validResult(Math.ceil(units*(price-variable)/contribution)):null};
  }
  function fuel(budget,efficiency,price){positive(budget,'예산');positive(efficiency,'연비');positive(price,'유가');return {litres:validResult(budget/price),distance:validResult(budget/price*efficiency),perKm:validResult(price/efficiency)};}
  function priceTarget(cost,fee,margin){nonnegative(cost,'건당 총비용');rate(fee,'수수료율');rate(margin,'목표 마진율');if(fee+margin>=100)throw new Error('수수료율과 목표 마진율의 합계는 100%보다 작아야 합니다.');const price=Math.ceil(cost/(1-(fee+margin)/100));return {price,fee:validResult(price*fee/100),profit:validResult(price*(1-fee/100)-cost)};}
  globalThis.CP_WORKBENCH_MATH=Object.freeze({discount,points,weekdays,pace,score,saleProfit,fuel,priceTarget});
})();
