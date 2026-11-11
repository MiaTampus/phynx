/* ==========================================================================
   views/stockout.js — record items leaving inventory + recent history.
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, stock, router, components, config, util } = P;
  const { esc, num, fdate, today, $ } = util;

  let query = '';

  const productCell = sku => {
    const p = products.get(sku);
    return p ? `<b>${esc(p.name)}</b><small>${esc(p.sku)}</small>` : esc(sku);
  };

  function historyHtml() {
    const rows = stock.searchOuts(query);
    return ui.table(
      ['Receipt', 'Date', 'Product', '#Qty', 'Reason / To', ''],
      rows.map(r => `<tr>
        <td>${esc(r.id)}</td><td>${fdate(r.date)}</td><td>${productCell(r.sku)}</td>
        <td class="r">−${num(r.qty)} ${esc((products.get(r.sku) || {}).unit || '')}</td>
        <td>${esc(r.reason)}<small>${esc(r.issuedTo || '—')}</small></td>
        <td><button class="sm" data-act="receipt" data-id="${esc(r.id)}">Receipt</button></td></tr>`).join(''),
      { empty: 'No stock-outs recorded.', narrow: true });
  }

  function render(root) {
    const reasons = config.stockOutReasons.map(r => `<option>${esc(r)}</option>`).join('');

    root.innerHTML = `
      ${ui.head('Stock Out', 'Record items leaving inventory (damaged, defective, samples, adjustments).')}
      <div class="grid g2">
        <div class="card">
          <h2>Record Stock-Out</h2>
          <form id="stockout-form">
            ${components.productPicker.html()}
            <label for="f-qty">Quantity *</label>
            <input id="f-qty" name="qty" type="number" min="0.01" step="any" required placeholder="0" inputmode="decimal">
            <label for="f-reason">Reason *</label>
            <select id="f-reason" name="reason" required><option value="">— Select reason —</option>${reasons}</select>
            <label for="f-to">Issued to / Department</label>
            <input id="f-to" name="issuedTo" placeholder="e.g. Production, Marketing &amp; Design">
            <label for="f-ref">Reference</label>
            <input id="f-ref" name="reference" placeholder="Optional document / report no.">
            <div class="mut note">Releases for approved requisitions are done under <b>Requisition Releases</b>.</div>
            <label for="f-date">Date *</label>
            <input id="f-date" name="date" type="date" required value="${today()}">
            <label for="f-notes">Notes</label>
            <textarea id="f-notes" name="notes" rows="2" placeholder="Optional"></textarea>
            <p><button class="pri block">Save Stock-Out</button></p>
          </form>
        </div>
        <div>
          <div class="tools">
            <h2 class="title">Recent Stock-Outs</h2>
            <input id="history-search" type="search" placeholder="Search history" value="${esc(query)}" aria-label="Search history">
          </div>
          <div class="card" id="history">${historyHtml()}</div>
        </div>
      </div>`;

    const form = $('#stockout-form', root);
    components.productPicker.bind(root);

    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const res = stock.stockOut(ui.formData(form));
      ui.toast(res.ok ? 'Stock-out saved' : res.error);
    });

    ui.on(root, 'input', '#history-search', el => {
      query = el.value;
      $('#history', root).innerHTML = historyHtml();
    });

    ui.actions(root, { receipt: d => components.receipt.show('out', stock.findOut(d.id)) });
  }

  router.register('stockout', { render });
})(window.Pynx);
