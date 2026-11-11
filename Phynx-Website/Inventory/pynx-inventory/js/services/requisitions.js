/* ==========================================================================
   services/requisitions.js — approved requisitions and releasing stock.
   ========================================================================== */
(function (P) {
  'use strict';
  const { store, config, products, stock, util } = P;
  const { ok, fail, today, round } = util;
  const ST = config.requisitionStatus;

  const all = () => store.data().requisitions;
  const get = id => all().find(r => r.id === id);
  const remaining = i => round(i.qty - i.released);
  const onHand = i => (products.get(i.sku) || { qty: 0 }).qty;

  function list({ status = 'All', q = '' } = {}) {
    const needle = q.toLowerCase();
    return all().filter(r =>
      (status === 'All' || r.status === status) &&
      (r.id + r.title + r.department + r.requestedBy).toLowerCase().includes(needle)
    );
  }

  /* Can the warehouse cover what is still owed? -> { key:'All'|'Part'|'Out', label } */
  function availability(r) {
    const covered = r.items.map(i => Math.min(remaining(i), onHand(i)) >= remaining(i));
    if (covered.every(Boolean)) return { key: 'All', label: 'All available' };
    if (covered.some(Boolean) || r.items.some(i => onHand(i) > 0)) return { key: 'Part', label: 'Partly available' };
    return { key: 'Out', label: 'Unavailable' };
  }

  /* Releases whatever is in stock for each line; logs a stock-out per line. */
  function release(id) {
    const r = get(id);
    if (!r) return fail('Requisition not found');
    let released = false;

    r.items.forEach(i => {
      const p = products.get(i.sku);
      if (!p) return;
      const qty = Math.min(remaining(i), p.qty);
      if (qty > 0) {
        released = true;
        i.released = round(i.released + qty);
        stock.applyOut(p, qty, { date: today(), reason: 'Requisition Release', issuedTo: r.department, reference: r.id });
      }
    });

    if (!released) return fail('No stock available to release');
    r.status = r.items.every(i => i.released >= i.qty) ? ST.released : ST.partial;
    store.commit();
    return ok();
  }

  P.requisitions = { all, get, list, remaining, availability, release };
})(window.Pynx);
