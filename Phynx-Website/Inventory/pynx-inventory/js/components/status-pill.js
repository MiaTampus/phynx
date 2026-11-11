/* ==========================================================================
   components/status-pill.js — every coloured status badge, in one place.
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, config } = P;
  const ST = config.requisitionStatus;

  const PRODUCT_TONE = { In: 'ok', Low: 'warn', Out: 'bad' };
  const REQ_TONE = { [ST.pending]: 'warn', [ST.partial]: 'warn', [ST.released]: 'ok' };
  const AVAIL_TONE = { All: 'ok', Part: 'warn', Out: 'bad' };

  P.components.statusPill = {
    product(p) {
      const s = products.statusOf(p);
      return ui.pill(PRODUCT_TONE[s], products.STATUS[s]);
    },
    requisition(status) {
      return ui.pill(REQ_TONE[status] || 'warn', status);
    },
    availability(a) {
      return ui.pill(AVAIL_TONE[a.key], a.label);
    }
  };
})(window.Pynx);
