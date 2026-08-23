(function () {
  'use strict';

  function bindPrintButtons() {
    document.querySelectorAll('[data-print-guide]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.print();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPrintButtons, { once: true });
  } else {
    bindPrintButtons();
  }
})();
