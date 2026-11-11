/* ==========================================================================
   components/receipt.js — receipt dialog with a Print button.
   Shown in-page (no pop-up window), so it also works on phones where
   pop-up blockers would stop a new window.
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, util } = P;
  const { esc, num, fdate } = util;

  /* kind: 'in' | 'out' */
  function show(kind, r) {
    if (!r) return;
    const p = products.get(r.sku);
    const isIn = kind === 'in';
    const detail = isIn
      ? `${r.supplier || '—'} / ${r.reference || r.notes || '—'}`
      : `${r.reason} / ${r.issuedTo || '—'}`;

    const m = ui.modal(`
      <div class="receipt">
        <h2>${isIn ? 'Stock-In' : 'Stock-Out'} Receipt</h2>
        <p><b>${esc(r.id)}</b><br>${fdate(r.date)}</p>
        <p>${esc(p ? p.name : r.sku)} (${esc(r.sku)})<br>Quantity: ${num(r.qty)} ${esc(p ? p.unit : '')}</p>
        <p>${esc(detail)}</p>
      </div>
      <p class="acts noprint">
        <button data-close>Close</button>
        <button class="pri" data-act="print">Print</button>
      </p>`);

    ui.actions(m, { print: () => ui.printModal() });
  }

  P.components.receipt = { show };
})(window.Pynx);
