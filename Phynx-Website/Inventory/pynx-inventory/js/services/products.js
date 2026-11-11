/* ==========================================================================
   services/products.js — product rules (no HTML in here).
   ========================================================================== */
(function (P) {
  'use strict';
  const { store, config, util } = P;
  const { ok, fail } = util;

  const STATUS = { In: 'In Stock', Low: 'Low Stock', Out: 'Out of Stock' };

  const all = () => store.data().products;
  const active = () => all().filter(p => !p.archived);
  const get = sku => all().find(p => p.sku === sku);
  const categories = () => [...new Set(active().map(p => p.category))].sort();

  /* 'In' | 'Low' | 'Out' */
  const statusOf = p => (p.qty <= 0 ? 'Out' : p.qty <= p.minLevel ? 'Low' : 'In');

  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name),
    sku:  (a, b) => a.sku.localeCompare(b.sku),
    qty:  (a, b) => a.qty - b.qty,
    cost: (a, b) => b.unitCost - a.unitCost
  };

  /* Filter + sort active products. sort:'' keeps the original order. */
  function list({ q = '', category = '', status = '', sort = 'name' } = {}) {
    const needle = q.toLowerCase();
    const rows = active().filter(p =>
      (p.name + p.sku + p.supplier).toLowerCase().includes(needle) &&
      (!category || p.category === category) &&
      (!status || statusOf(p) === status)
    );
    return sorters[sort] ? rows.sort(sorters[sort]) : rows;
  }

  /* Next free SKU such as INV-016 */
  function nextSku() {
    let n = all().length + 1;
    const make = i => config.skuPrefix + String(i).padStart(3, '0');
    while (get(make(n))) n++;
    return make(n);
  }

  function clean(d) {
    const v = {
      sku: String(d.sku ?? '').trim(),
      name: String(d.name ?? '').trim(),
      supplier: String(d.supplier ?? '').trim(),
      category: String(d.category ?? '').trim(),
      location: String(d.location ?? '').trim(),
      unit: String(d.unit ?? '').trim(),
      qty: Number(d.qty) || 0,
      minLevel: Number(d.minLevel) || 0,
      unitCost: Number(d.unitCost) || 0
    };
    if (!v.sku) return fail('SKU is required');
    if (!v.name) return fail('Product name is required');
    if (!v.category) return fail('Category is required');
    if (!v.unit) return fail('Unit is required');
    if (v.qty < 0 || v.minLevel < 0 || v.unitCost < 0) return fail('Numbers cannot be negative');
    return ok({ value: v });
  }

  function create(d) {
    const c = clean(d);
    if (!c.ok) return c;
    if (get(c.value.sku)) return fail('SKU already exists');
    all().push({ ...c.value, qty: util.round(c.value.qty), archived: false });
    store.commit();
    return ok();
  }

  /* SKU and on-hand quantity can't be edited here — quantity only moves via Stock In/Out. */
  function update(sku, d) {
    const p = get(sku);
    if (!p) return fail('Product not found');
    const c = clean({ ...p, ...d, sku: p.sku, qty: p.qty });
    if (!c.ok) return c;
    Object.assign(p, c.value);
    store.commit();
    return ok();
  }

  function archive(sku) {
    const p = get(sku);
    if (!p) return fail('Product not found');
    p.archived = true;
    store.commit();
    return ok();
  }

  /* Only products with nothing on hand can be deleted. */
  function remove(sku) {
    const p = get(sku);
    if (!p) return fail('Product not found');
    if (p.qty > 0) return fail('Only products with zero stock can be deleted');
    store.data().products = all().filter(x => x.sku !== sku);
    store.commit();
    return ok();
  }

  P.products = { STATUS, all, active, get, categories, statusOf, list, nextSku, create, update, archive, remove };
})(window.Pynx);
