/* ==========================================================================
   views/stockin.js — record received items + recent stock-in history.
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, stock, router, components, util } = P;
  const { esc, num, fdate, today, $ } = util;

  let query = '';

  const productCell = sku => {
    const p = products.get(sku);
    return p ? `<b>${esc(p.name)}</b><small>${esc(p.sku)}</small>` : esc(sku);
  };

  function historyHtml() {
    const rows = stock.searchIns(query);
    return ui.table(
      ['Receipt', 'Date', 'Product', '#Qty', 'Supplier / Ref', ''],
      rows.map(r => `<tr>
        <td>${esc(r.id)}</td><td>${fdate(r.date)}</td><td>${productCell(r.sku)}</td>
        <td class="r">+${num(r.qty)} ${esc((products.get(r.sku) || {}).unit || '')}</td>
        <td>${esc(r.supplier)}<small>${esc(r.reference || r.notes || '—')}</small></td>
        <td><button class="sm" data-act="receipt" data-id="${esc(r.id)}">Receipt</button></td></tr>`).join(''),
      { empty: 'No stock-ins recorded.', narrow: true });
  }

  function render(root) {
    root.innerHTML = `
      ${ui.head('Stock In', 'Record newly received items and increase stock levels.')}
      <div class="grid g2">
        <div class="card">
          <h2>Record Stock-In</h2>
          <form id="stockin-form">
            ${components.productPicker.html()}
            <label for="f-qty">Quantity *</label>
            <input id="f-qty" name="qty" type="number" min="0.01" step="any" required placeholder="0" inputmode="decimal">
            <label for="f-ref">Delivery / PO Reference</label>
            <input id="f-ref" name="reference" placeholder="e.g. DLV-2026-001 or PO-2026-014">
            <label for="f-sup">Supplier</label>
            <input id="f-sup" name="supplier" placeholder="Auto-filled from product">
            <label for="f-date">Date *</label>
            <input id="f-date" name="date" type="date" required value="${today()}">
            <label for="f-notes">Notes</label>
            <textarea id="f-notes" name="notes" rows="2" placeholder="Optional"></textarea>
            <p><button class="pri block">Save Stock-In</button></p>
          </form>
        </div>
        <div>
          <div class="tools">
            <h2 class="title">Recent Stock-Ins</h2>
            <input id="history-search" type="search" placeholder="Search history" value="${esc(query)}" aria-label="Search history">
          </div>
          <div class="card" id="history">${historyHtml()}</div>
        </div>
      </div>`;

    const form = $('#stockin-form', root);

    /* Picking a product pre-fills its usual supplier */
    components.productPicker.bind(root, p => { if (p) $('#f-sup', root).value = p.supplier; });

    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const res = stock.stockIn(ui.formData(form));
      ui.toast(res.ok ? 'Stock-in saved' : res.error);
    });

    ui.on(root, 'input', '#history-search', el => {
      query = el.value;
      $('#history', root).innerHTML = historyHtml();
    });

    ui.actions(root, { receipt: d => components.receipt.show('in', stock.findIn(d.id)) });
  }

  router.register('stockin', { render });
})(window.Pynx);
