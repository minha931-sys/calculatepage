(() => {
  const root = document.querySelector('#calculator[data-static-rendered="true"]');
  if (!root) return;

  window.__staticCalculatorRuntime = true;

  const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (descriptor?.get && descriptor?.set) {
    Object.defineProperty(root, 'innerHTML', {
      configurable: true,
      get() {
        return descriptor.get.call(root);
      },
      set() {
        // Calculator layouts are supplied by the source HTML. Legacy renderers
        // may still bind their click handlers, but cannot replace this content.
      }
    });
  }

  root.insertAdjacentHTML = () => {};

  const modeGroupSelector = '.date-mode-tabs,.percent-tabs,.savings-tabs,.utility-tabs';

  function enhanceResults() {
    root.querySelectorAll('.result').forEach(result => {
      result.setAttribute('aria-live', 'polite');
      result.setAttribute('aria-atomic', 'true');
    });
  }

  function enhanceTables() {
    const tables = Array.from(root.querySelectorAll('table'));
    const heading = document.querySelector('.calculator-page h1, main h1, h1')?.textContent.trim() || '계산기';

    tables.forEach((table, index) => {
      table.querySelectorAll('thead th:not([scope])').forEach(cell => {
        cell.setAttribute('scope', 'col');
      });
      table.querySelectorAll('tbody th:not([scope])').forEach(cell => {
        cell.setAttribute('scope', 'row');
      });

      const hasAccessibleName =
        table.getAttribute('aria-label')?.trim() ||
        table.getAttribute('aria-labelledby')?.trim() ||
        table.querySelector('caption')?.textContent.trim();

      if (!hasAccessibleName) {
        const suffix = tables.length > 1 ? `계산표 ${index + 1}` : '계산표';
        table.setAttribute('aria-label', `${heading} ${suffix}`);
      }
    });
  }

  function getModeButtons(group) {
    return Array.from(group.querySelectorAll('button,[role="tab"]'));
  }

  function syncModeGroup(group) {
    const buttons = getModeButtons(group);
    if (!buttons.length) return;

    const usesTabs =
      group.getAttribute('role') === 'tablist' ||
      buttons.some(button => button.getAttribute('role') === 'tab');

    if (usesTabs) {
      group.setAttribute('role', 'tablist');
      const activeButton =
        (group.matches('.date-mode-tabs') && buttons.find(button => button.classList.contains('primary-btn'))) ||
        buttons.find(button => button.classList.contains('active')) ||
        buttons.find(button => button.getAttribute('aria-selected') === 'true') ||
        buttons.find(button => !button.disabled) ||
        buttons[0];

      buttons.forEach(button => {
        const isActive = button === activeButton;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      });
      return;
    }

    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
  }

  function enhanceModeGroups() {
    root.querySelectorAll(modeGroupSelector).forEach(syncModeGroup);
  }

  function enhanceAccessibility() {
    enhanceResults();
    enhanceTables();
    enhanceModeGroups();
  }

  enhanceAccessibility();

  let accessibilityUpdateScheduled = false;
  const accessibilityObserver = new MutationObserver(() => {
    if (accessibilityUpdateScheduled) return;
    accessibilityUpdateScheduled = true;
    queueMicrotask(() => {
      accessibilityUpdateScheduled = false;
      enhanceAccessibility();
    });
  });
  accessibilityObserver.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  root.addEventListener('click', event => {
    const target = event.target instanceof Element
      ? event.target.closest('button,[role="tab"]')
      : null;
    const group = target?.closest(modeGroupSelector);
    if (!group || !root.contains(group)) return;
    queueMicrotask(() => syncModeGroup(group));
  });

  root.addEventListener('keydown', event => {
    const currentTab = event.target instanceof Element
      ? event.target.closest('[role="tab"]')
      : null;
    const group = currentTab?.closest(modeGroupSelector);
    if (!currentTab || !group || !root.contains(group)) return;

    const tabs = getModeButtons(group).filter(button => !button.disabled);
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < 0) return;

    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  });

  document.addEventListener('paste', event => {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    if (!input || input.type !== 'number') return;
    const pasted = event.clipboardData?.getData('text') || '';
    if (!pasted.includes(',')) return;
    const normalized = pasted.replaceAll(',', '').trim();
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return;
    event.preventDefault();
    input.value = normalized;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
})();
