import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const directory=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../calculators');
// Each group follows a calculation task, including useful links across categories.
const groups=[
  'loan-interest loan-schedule loan-refinance prepayment-fee mortgage-loan dsr',
  'salary annual-salary four-insurance employee-health-insurance income-tax',
  'annual-leave-pay annual-leave ordinary-wage wage',
  'average-wage severance ordinary-wage unemployment-benefit',
  'wage weekly-holiday-pay overtime-pay work-hours salary',
  'parental-leave salary four-insurance annual-leave',
  'national-pension four-insurance salary employee-health-insurance local-health-insurance',
  'savings-interest installment compound-interest youth-leap-account youth-account-switch',
  'average-price averaging-down stock-return stock-leverage roi cagr',
  'cagr roi stock-return compound-interest exchange',
  'jeonse-loan rent-conversion rental-yield mortgage-loan',
  'housing-subscription monthly-average-income monthly-rent-deduction jeonse-loan',
  'real-estate-acquisition-tax real-estate-brokerage mortgage-loan area-conversion',
  'property-tax comprehensive-real-estate-tax capital-gains-tax real-estate-acquisition-tax',
  'gift-tax capital-gains-tax comprehensive-income-tax income-tax',
  'withholding-33 comprehensive-income-tax freelance-rate income-tax',
  'lotto-tax withholding-33 income-tax percent',
  'car-installment car-acquisition-tax car-tax fuel-cost ev-fuel-cost',
  'card-installment discount percent budget',
  'budget daily-proration dutch-pay travel-budget',
  'travel-budget exchange fuel-cost dutch-pay',
  'electricity ev-fuel-cost fuel-cost budget',
  'percent percent-change discount vat',
  'gpa target-gpa retake average-score',
  'school-grade grade-cutoff average-score exam-target',
  'jlpt-score exam-target average-score exam-dday',
  'date d-day day-count exam-dday time',
  'age international-age date pet-age',
  'bmi body-fat target-weight bmr',
  'bmr calorie calorie-deficit exercise-calorie target-weight',
  'running-pace exercise-calorie speed-conversion water',
  'water exercise-calorie calorie bmr',
  'menstrual-cycle ovulation pregnancy-week date',
  'margin break-even vat estimate freelance-rate cpm',
  'cpm margin roi break-even',
  'freelance-rate estimate withholding-33 work-hours',
  'expected-value average-score roi percent',
  'cbm volumetric-weight shipping-split volume-conversion weight-conversion',
  'area-conversion area-unit-conversion interior-estimate real-estate-brokerage',
  'unit length-conversion weight-conversion volume-conversion temperature-conversion speed-conversion',
  'scale length-conversion area-unit-conversion unit'
].map(group=>group.split(' '));
const names=new Map();
for(const file of await readdir(directory)){
  if(!file.endsWith('.html'))continue;
  const html=await readFile(path.join(directory,file),'utf8');
  const name=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g,'').trim();
  if(name)names.set(file.slice(0,-5),name);
}
export function relatedTools(slug){
  const matching=groups.filter(group=>group.includes(slug));
  const candidates=[...matching.filter(group=>group[0]===slug),...matching.filter(group=>group[0]!==slug)].flat();
  return [...new Set(candidates)].filter(candidate=>candidate!==slug&&names.has(candidate)).slice(0,4).map(candidate=>[names.get(candidate),'/calculators/'+candidate+'.html']);
}
