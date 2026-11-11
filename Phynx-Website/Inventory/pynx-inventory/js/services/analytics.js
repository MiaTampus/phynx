/* ==========================================================================
   services/analytics.js — read-only numbers for the dashboard and reports.
   ========================================================================== */
(function (P) {
  'use strict';
  const { store, config, products, requisitions, util } = P;
  const ST = config.requisitionStatus;

  const sumQty = a => a.reduce((s, p) => s + p.qty, 0);
  const count = (a, status) => a.filter(p => products.statusOf(p) === status).length;

  function dashboard() {
    const a = products.active();
    const byCategory = {};
    a.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + p.qty; });
    const lastIn = store.data().stockIns[0] || null;

    return {
      totalUnits: sumQty(a),
      totalProducts: a.length,
      lowCount: count(a, 'Low'),
      outCount: count(a, 'Out'),
      topCategories: Object.entries(byCategory).sort((x, y) => y[1] - x[1]).slice(0, config.dashboard.topCategories),
      alerts: a.filter(p => products.statusOf(p) !== 'In').sort((x, y) => x.qty - y.qty),
      pendingReleases: requisitions.all().filter(r => r.status !== ST.released).length,
      lastStockIn: lastIn && { record: lastIn, product: products.get(lastIn.sku) || null }
    };
  }

  function inventorySummary() {
    const a = products.active();
    return {
      totalProducts: a.length,
      totalUnits: sumQty(a),
      value: a.reduce((s, p) => s + p.qty * p.unitCost, 0),
      lowCount: count(a, 'Low'),
      outCount: count(a, 'Out')
    };
  }

  /* Stock-in / stock-out totals per day for the last `days` days (oldest first). */
  function dailyMovement(days = config.reports.chartDays) {
    const { stockIns, stockOuts } = store.data();
    const total = (list, d) => list.filter(x => x.date === d).reduce((s, x) => s + x.qty, 0);
    const rows = [...Array(days)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1) + i);
      const date = util.iso(d);
      return { date, in: total(stockIns, date), out: total(stockOuts, date) };
    });
    return { rows, max: Math.max(1, ...rows.map(r => Math.max(r.in, r.out))) };
  }

  /* [{ category, units, value }] */
  function valuationByCategory() {
    const c = {};
    products.active().forEach(p => {
      c[p.category] = c[p.category] || { category: p.category, units: 0, value: 0 };
      c[p.category].units += p.qty;
      c[p.category].value += p.qty * p.unitCost;
    });
    return Object.values(c);
  }

  P.analytics = { dashboard, inventorySummary, dailyMovement, valuationByCategory };
})(window.Pynx);
