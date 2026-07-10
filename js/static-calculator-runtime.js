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
