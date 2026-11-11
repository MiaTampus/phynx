/* ==========================================================================
   services/stock.js — stock-in / stock-out rules and movement history.
   ========================================================================== */
(function (P) {
  'use strict';
  const { store, config, products, util } = P;
  const { ok, fail, round } = util;

  const ins = () => store.data().stockIns;
  const outs = () => store.data().stockOuts;
  const text = v => String(v ?? '').trim();

  /* e.g. SI-2026-0004 — continues from the highest existing number */
  function nextId(prefix, list) {
    const head = `${prefix}-${config.idYear || new Date().getFullYear()}-`;
    const max = list.reduce((m, r) => (r.id.startsWith(head) ? Math.max(m, parseInt(r.id.slice(head.length), 10) || 0) : m), 0);
    return head + String(max + 1).padStart(4, '0');
  }

  const productName = r => (products.get(r.sku) || {}).name || '';
  const matches = (hay, q) => hay.toLowerCase().includes(q.toLowerCase());

  const searchIns  = (q = '') => ins().filter(r => matches(r.id + r.sku + r.supplier + productName(r), q));
  const searchOuts = (q = '') => outs().filter(r => matches(r.id + r.sku + r.reason + r.issuedTo + productName(r), q));

  function findIn(id)  { return ins().find(r => r.id === id); }
  function findOut(id) { return outs().find(r => r.id === id); }

  function stockIn(d) {
    const p = products.get(d.sku);
    if (!p || p.archived) return fail('Please select a product');
    const qty = Number(d.qty);
    if (!(qty > 0)) return fail('Quantity must be greater than zero');
    if (!d.date) return fail('Date is required');

    p.qty = round(p.qty + qty);
    const record = {
      id: nextId('SI', ins()),
      date: d.date,
      sku: p.sku,
      qty,
      supplier: text(d.supplier) || p.supplier,
      reference: text(d.reference),
      notes: text(d.notes)
    };
    ins().unshift(record);
    store.commit();
    return ok({ record });
  }

  /* Low-level: deducts stock and logs the movement WITHOUT saving.
     Used by stockOut() and by requisition releases (which save once at the end). */
  function applyOut(p, qty, meta) {
    p.qty = round(p.qty - qty);
    const record = {
      id: nextId('SO', outs()),
      date: meta.date,
      sku: p.sku,
      qty,
      reason: meta.reason,
      issuedTo: text(meta.issuedTo),
      reference: text(meta.reference),
      notes: text(meta.notes)
    };
    outs().unshift(record);
    return record;
  }

  function stockOut(d) {
    const p = products.get(d.sku);
    if (!p || p.archived) return fail('Please select a product');
    const qty = Number(d.qty);
    if (!(qty > 0)) return fail('Quantity must be greater than zero');
    if (!text(d.reason)) return fail('Please select a reason');
    if (!d.date) return fail('Date is required');
    if (qty > p.qty) return fail(`Only ${util.num(p.qty)} ${p.unit} on hand`);

    const record = applyOut(p, qty, d);
    store.commit();
    return ok({ record });
  }

  /* Every movement, newest first (used by the ledger report). */
  function ledger() {
    const rows = [
      ...ins().map(r => ({ ...r, type: 'in', note: r.reference || r.notes || '—' })),
      ...outs().map(r => ({ ...r, type: 'out', note: r.reason }))
    ];
    return rows.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }

  P.stock = { ins, outs, searchIns, searchOuts, findIn, findOut, stockIn, stockOut, applyOut, ledger };
})(window.Pynx);
