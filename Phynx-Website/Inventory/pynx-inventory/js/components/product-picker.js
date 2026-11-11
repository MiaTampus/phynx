/* ==========================================================================
   components/product-picker.js — product dropdown + "current stock" hint,
   shared by the Stock In and Stock Out forms.
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, util } = P;
  const { num, $ } = util;

  const EMPTY_HINT = 'Select a product to see the current stock.';

  function html() {
    const opts = '<option value="">— Select product —</option>' +
      ui.options(products.active().map(p => [p.sku, `${p.name} (${p.sku})`]));
    return `<label for="f-sku">Product *</label>
      <select name="sku" id="f-sku" required>${opts}</select>
      <div class="hint" id="stock-hint">${EMPTY_HINT}</div>`;
  }

  /* onChange(product|undefined) fires whenever the selection changes. */
  function bind(root, onChange) {
    const select = $('#f-sku', root);
    const hint = $('#stock-hint', root);
    select.addEventListener('change', () => {
      const p = products.get(select.value);
      hint.textContent = p ? `Current stock: ${num(p.qty)} ${p.unit} · Min ${num(p.minLevel)}` : EMPTY_HINT;
      if (onChange) onChange(p);
    });
  }

  P.components.productPicker = { html, bind };
})(window.Pynx);
