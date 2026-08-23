(() => {
  const slug = document.body.dataset.calculator || document.body.dataset.practicalCalculator;
  const panel = document.querySelector(`[data-scenario-panel="${slug}"]`);
  if (!panel) return;

  const state = {
    latest: null,
    items: [],
    current: null,
    offer: null
  };
  const list = panel.querySelector('[data-scenario-list]');
  const empty = panel.querySelector('[data-scenario-empty]');
  const status = panel.querySelector('[data-scenario-status]');
  const addButtons = [...panel.querySelectorAll('[data-scenario-add]')];
  const slotButtons = [...panel.querySelectorAll('[data-scenario-slot]')];
  const clearButton = panel.querySelector('[data-scenario-clear]');
  const money = value => `${Math.round(Number(value) || 0).toLocaleString('ko-KR')}원`;
  const signedMoney = value => {
    const amount = Math.round(Number(value) || 0);
    return `${amount > 0 ? '+' : amount < 0 ? '-' : ''}${Math.abs(amount).toLocaleString('ko-KR')}원`;
  };
  const percent = value => `${Number(value || 0).toFixed(2)}%`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
  const setStatus = message => {
    if (status) status.textContent = message;
  };
  const hasComparison = () => slug === 'salary'
    ? Boolean(state.current || state.offer)
    : state.items.length > 0;

  function syncControls() {
    const full = slug !== 'salary' && state.items.length >= 3;
    addButtons.forEach(button => {
      button.disabled = !state.latest || full;
    });
    slotButtons.forEach(button => {
      button.disabled = !state.latest;
    });
    if (clearButton) clearButton.disabled = !hasComparison();
  }

  function showComparison(html) {
    if (empty) empty.hidden = true;
    if (list) {
      list.innerHTML = html;
      list.hidden = false;
    }
  }

  function showEmpty() {
    if (list) {
      list.innerHTML = '';
      list.hidden = true;
    }
    if (empty) empty.hidden = false;
  }

  function renderLoan() {
    if (!state.items.length) return showEmpty();
    const lowest = Math.min(...state.items.map(item => item.totalInterest));
    const rows = state.items.map((item, index) => {
      const best = item.totalInterest === lowest;
      return `<tr class="${best ? 'scenario-best' : ''}">
        <th scope="row"><span>상환안 ${index + 1}</span>${best ? '<b class="scenario-badge">총이자 최소</b>' : ''}</th>
        <td>${escapeHtml(item.methodLabel)}</td>
        <td>${money(item.principal)}</td>
        <td>${percent(item.rate)} · ${item.months}개월</td>
        <td>${money(item.first)}${item.method === 'principal' ? `<small>마지막 ${money(item.last)}</small>` : ''}</td>
        <td><strong>${money(item.totalInterest)}</strong></td>
        <td>${money(item.totalPay)}</td>
        <td><button class="scenario-remove" type="button" data-scenario-remove="${index}" aria-label="상환안 ${index + 1} 삭제">삭제</button></td>
      </tr>`;
    }).join('');
    showComparison(`<div class="scenario-loan-table-wrap"><table class="scenario-loan-table"><caption>저장한 대출 상환안 비교</caption><thead><tr><th scope="col">구분</th><th scope="col">상환 방식</th><th scope="col">원금</th><th scope="col">금리·기간</th><th scope="col">월 부담</th><th scope="col">총이자</th><th scope="col">총상환액</th><th scope="col"><span class="visually-hidden">관리</span></th></tr></thead><tbody>${rows}</tbody></table></div>`);
  }

  function renderRefinance() {
    if (!state.items.length) return showEmpty();
    const best = Math.max(...state.items.map(item => item.netSavings));
    const cards = state.items.map((item, index) => {
      const isBest = item.netSavings === best;
      const savingClass = item.netSavings > 0 ? 'positive' : item.netSavings < 0 ? 'negative' : '';
      return `<article class="refinance-scenario-card ${isBest ? 'scenario-best' : ''}">
        <div class="refinance-card-top"><span>대환 후보 ${index + 1}</span>${isBest ? '<b class="scenario-badge">절감액 1위</b>' : ''}<button class="scenario-remove" type="button" data-scenario-remove="${index}" aria-label="대환 후보 ${index + 1} 삭제">삭제</button></div>
        <p class="refinance-rate-route">${percent(item.oldRate)} <span aria-hidden="true">→</span> <strong>${percent(item.newRate)}</strong></p>
        <p class="refinance-card-saving ${savingClass}"><span>실질 예상 절감액</span><strong>${signedMoney(item.netSavings)}</strong></p>
        <dl><div><dt>새 조건</dt><dd>${item.newMonths}개월 · ${escapeHtml(item.newMethodLabel)}</dd></div><div><dt>첫 달 부담</dt><dd>${money(item.newFirstPayment)}</dd></div><div><dt>전환 비용</dt><dd>${money(item.switchingCost)}</dd></div><div><dt>비용 회수</dt><dd>${escapeHtml(item.breakEvenText)}</dd></div></dl>
      </article>`;
    }).join('');
    showComparison(`<div class="refinance-scenario-track">${cards}</div>`);
  }

  function renderSavings() {
    if (!state.items.length) return showEmpty();
    const rates = state.items.map(item => item.principal > 0 ? item.receivedInterest / item.principal * 100 : 0);
    const highest = Math.max(...rates);
    const tickets = state.items.map((item, index) => {
      const netRate = rates[index];
      const best = netRate === highest;
      const width = highest > 0 ? Math.max(8, netRate / highest * 100) : 8;
      return `<article class="savings-scenario-ticket ${best ? 'scenario-best' : ''}">
        <div class="savings-ticket-stub"><span>후보 ${index + 1}</span><b>${escapeHtml(item.modeLabel)}</b></div>
        <div class="savings-ticket-body">
          <div class="savings-ticket-heading"><p><span>연 금리</span><strong>${percent(item.rate)}</strong></p>${best ? '<b class="scenario-badge">수령 이자율 1위</b>' : ''}<button class="scenario-remove" type="button" data-scenario-remove="${index}" aria-label="예금 후보 ${index + 1} 삭제">삭제</button></div>
          <dl><div><dt>${item.installment ? '월 납입액' : '예치금'}</dt><dd>${money(item.amount)}</dd></div><div><dt>기간</dt><dd>${item.months}개월</dd></div><div><dt>${item.taxApplied ? '세후 이자' : '예상 이자'}</dt><dd>${money(item.receivedInterest)}</dd></div><div><dt>만기 예상액</dt><dd>${money(item.maturity)}</dd></div></dl>
          <div class="savings-yield"><span>총 원금 대비 예상 수령 이자 ${percent(netRate)}</span><i style="--scenario-width:${width.toFixed(2)}%"></i></div>
        </div>
      </article>`;
    }).join('');
    showComparison(`<div class="savings-scenario-stack">${tickets}</div>`);
  }

  function salaryColumn(item, slot) {
    const title = slot === 'current' ? '현재 조건' : '비교 조건';
    if (!item) return `<article class="salary-scenario-column is-empty"><span class="salary-scenario-label">${title}</span><p>계산 결과를 만든 뒤 위 버튼으로 저장하세요.</p></article>`;
    return `<article class="salary-scenario-column ${slot}">
      <span class="salary-scenario-label">${title}</span>
      <p class="salary-net"><span>월 예상 실수령액</span><strong>${money(item.net)}</strong></p>
      <dl><div><dt>세전 급여</dt><dd>${money(item.gross)}</dd></div><div><dt>비과세액</dt><dd>${money(item.nontax)}</dd></div><div><dt>월 총 공제</dt><dd>${money(item.totalDeduct)}</dd></div><div><dt>연 환산 실수령</dt><dd>${money(item.net * 12)}</dd></div><div><dt>적용 기준</dt><dd>${escapeHtml(item.yearLabel)}</dd></div><div><dt>소득세</dt><dd>${item.hasIncomeTax ? '입력액 반영' : '미반영'}</dd></div></dl>
    </article>`;
  }

  function renderSalary() {
    if (!state.current && !state.offer) return showEmpty();
    const sameBasis = state.current && state.offer
      && state.current.hasIncomeTax === state.offer.hasIncomeTax
      && state.current.yearLabel === state.offer.yearLabel;
    const difference = state.current && state.offer && sameBasis
      ? `<div class="salary-difference ${state.offer.net - state.current.net >= 0 ? 'positive' : 'negative'}"><span>비교 조건의 월 실수령 차이</span><strong>${signedMoney(state.offer.net - state.current.net)}</strong><small>연 환산 ${signedMoney((state.offer.net - state.current.net) * 12)}</small></div>`
      : state.current && state.offer
        ? '<div class="salary-difference waiting"><strong>비교 기준 불일치</strong><span>보험 기간과 소득세 반영 여부를 같게 맞춘 뒤 다시 저장하세요.</span></div>'
        : '<div class="salary-difference waiting"><span>두 조건을 모두 저장하면 월·연 차이를 계산합니다.</span></div>';
    showComparison(`<div class="salary-scenario-duel">${salaryColumn(state.current, 'current')}${difference}${salaryColumn(state.offer, 'offer')}</div>`);
  }

  function renderBudget() {
    if (!state.items.length) return showEmpty();
    const best = Math.max(...state.items.map(item => item.afterGoal));
    const plans = state.items.map((item, index) => {
      const isBest = item.afterGoal === best;
      const free = Math.max(0, item.afterGoal);
      const scale = Math.max(item.income, item.fixed + item.variable + item.goal, 1);
      const fixedWidth = item.fixed / scale * 100;
      const variableWidth = item.variable / scale * 100;
      const goalWidth = item.goal / scale * 100;
      const freeWidth = free / scale * 100;
      const statusClass = item.afterGoal >= 0 ? 'positive' : 'negative';
      return `<article class="budget-scenario-plan ${isBest ? 'scenario-best' : ''}">
        <div class="budget-plan-heading"><h3>예산안 ${index + 1}</h3>${isBest ? '<b class="scenario-badge">여유자금 최대</b>' : ''}<button class="scenario-remove" type="button" data-scenario-remove="${index}" aria-label="예산안 ${index + 1} 삭제">삭제</button></div>
        <div class="budget-plan-summary"><span>월 수입 ${money(item.income)}</span><strong class="${statusClass}">${item.afterGoal >= 0 ? '저축 후 여유 ' : '저축 목표까지 부족 '}${money(Math.abs(item.afterGoal))}</strong></div>
        <div class="budget-scenario-bar" role="img" aria-label="고정 지출 ${money(item.fixed)}, 변동 지출 ${money(item.variable)}, 저축 목표 ${money(item.goal)}, 여유 자금 ${money(free)}">
          <i class="fixed" style="width:${fixedWidth.toFixed(3)}%"></i><i class="variable" style="width:${variableWidth.toFixed(3)}%"></i><i class="goal" style="width:${goalWidth.toFixed(3)}%"></i><i class="free" style="width:${freeWidth.toFixed(3)}%"></i>
        </div>
        <dl class="budget-plan-legend"><div><dt><i class="fixed"></i>고정비</dt><dd>${money(item.fixed)} · ${(item.fixed / item.income * 100).toFixed(1)}%</dd></div><div><dt><i class="variable"></i>변동비</dt><dd>${money(item.variable)} · ${(item.variable / item.income * 100).toFixed(1)}%</dd></div><div><dt><i class="goal"></i>저축 목표</dt><dd>${money(item.goal)} · ${(item.goal / item.income * 100).toFixed(1)}%</dd></div></dl>
      </article>`;
    }).join('');
    showComparison(`<div class="budget-scenario-plans">${plans}</div>`);
  }

  const renderers = {
    'loan-interest': renderLoan,
    'loan-refinance': renderRefinance,
    'savings-interest': renderSavings,
    salary: renderSalary,
    budget: renderBudget
  };

  function render() {
    renderers[slug]?.();
    syncControls();
  }

  function capture(targetSlug, detail) {
    if (targetSlug !== slug || !detail) return;
    state.latest = { ...detail };
    syncControls();
    setStatus('방금 계산한 결과를 비교 목록에 저장할 수 있습니다.');
  }

  window.CalculatorScenarioComparison = { capture };

  const calculatorRoot = document.querySelector('#calculator');
  const invalidateLatest = () => {
    if (!state.latest) return;
    state.latest = null;
    syncControls();
    setStatus('입력 조건이 바뀌었습니다. 다시 계산하면 새 결과를 저장할 수 있습니다.');
  };
  calculatorRoot?.addEventListener('input', event => {
    if (!panel.contains(event.target)) invalidateLatest();
  });
  calculatorRoot?.addEventListener('change', event => {
    if (!panel.contains(event.target)) invalidateLatest();
  });
  calculatorRoot?.addEventListener('click', event => {
    if (event.target.closest('.savings-tab,#refinance-reset')) invalidateLatest();
  });

  panel.addEventListener('click', event => {
    const add = event.target.closest('[data-scenario-add]:not([data-scenario-slot])');
    const slot = event.target.closest('[data-scenario-slot]');
    const remove = event.target.closest('[data-scenario-remove]');
    const clear = event.target.closest('[data-scenario-clear]');

    if (add && state.latest && state.items.length < 3) {
      state.items.push({ ...state.latest });
      setStatus(`비교 목록에 ${state.items.length}번째 결과를 저장했습니다.`);
      render();
      return;
    }
    if (slot && state.latest) {
      const target = slot.dataset.scenarioSlot;
      state[target] = { ...state.latest };
      setStatus(`${target === 'current' ? '현재' : '비교'} 조건에 방금 계산한 결과를 저장했습니다.`);
      render();
      return;
    }
    if (remove) {
      const index = Number(remove.dataset.scenarioRemove);
      if (Number.isInteger(index)) state.items.splice(index, 1);
      setStatus('선택한 비교 결과를 삭제했습니다.');
      render();
      return;
    }
    if (clear) {
      state.items = [];
      state.current = null;
      state.offer = null;
      setStatus('비교 목록을 비웠습니다. 방금 계산한 결과는 다시 저장할 수 있습니다.');
      render();
    }
  });

  syncControls();
})();
