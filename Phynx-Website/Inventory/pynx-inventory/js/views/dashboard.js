/* ==========================================================================
   views/dashboard.js — "Welcome to Inventory!" overview screen.
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, analytics, router, config, components, util } = P;
  const { esc, num, fdate, $ } = util;
  const pill = components.statusPill;

  let query = '';

  function productsTable() {
    const rows = products.list({ q: query, sort: '' }).slice(0, config.dashboard.productRows);
    return ui.table(
      ['SKU', 'Product', 'Category', '#On hand', '#Min. level', 'Status'],
      rows.map(p => `<tr>
        <td>${esc(p.sku)}</td><td><b>${esc(p.name)}</b></td><td>${esc(p.category)}</td>
        <td class="r">${num(p.qty)} ${esc(p.unit)}</td><td class="r">${num(p.minLevel)}</td>
        <td>${pill.product(p)}</td></tr>`).join(''),
      { empty: 'No products match your search.' });
  }

  function render(root) {
    const s = analytics.dashboard();
    const topMax = s.topCategories[0] ? s.topCategories[0][1] || 1 : 1;
    const last = s.lastStockIn;
    const today = new Date().toLocaleDateString(config.locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const kpis = [
      ['Total Products', s.totalProducts, 'Active registered items'],
      ['Low Stock Items', s.lowCount, 'At or below minimum level'],
      ['Out of Stock', s.outCount, 'Currently unavailable'],
      ['Pending Releases', s.pendingReleases, 'Approved requisitions']
    ];

    root.innerHTML = `
      <h1>Welcome to Inventory!</h1><p class="sub">${esc(today)}</p>

      <div class="grid g3">
        <div class="card"><h2>Stock History</h2>
          <div class="big">${num(s.totalUnits)}</div><div class="mut">Total units on hand</div>
          <p class="mut">${last ? `Last restocked: ${fdate(last.record.date)} · ${esc(last.product ? last.product.name : last.record.sku)}` : 'No stock-ins yet'}</p>
        </div>
        <div class="card"><h2>Top Categories</h2>
          ${s.topCategories.map(([c, v]) => `
            <div class="row tight"><span>${esc(c)}</span><b>${num(v)}</b></div>
            <div class="bar"><i style="width:${v / topMax * 100}%"></i></div>`).join('') || '<p class="mut">No products yet.</p>'}
        </div>
        <div class="card"><h2>Low Stock Alerts ${ui.pill('warn', s.alerts.length)}</h2>
          ${s.alerts.slice(0, config.dashboard.alertRows).map(p => `
            <div class="row"><span>${esc(p.name)}</span>
              <span>${num(p.qty)} ${esc(p.unit)} ${pill.product(p)}</span></div>`).join('') || '<p class="mut">All items are well stocked.</p>'}
        </div>
      </div>

      <div class="grid g4">${kpis.map(([label, value, note]) => `
        <div class="card"><span class="mut">${label}</span><div class="big">${value}</div><span class="mut">${note}</span></div>`).join('')}
      </div>

      <div class="tools">
        <h2 class="title">Products</h2>
        <input id="dq" type="search" placeholder="Search product" value="${esc(query)}" aria-label="Search product">
        <button data-act="all">View all products →</button>
      </div>
      <div class="card" id="dash-products">${productsTable()}</div>`;

    ui.on(root, 'input', '#dq', el => {
      query = el.value;
      $('#dash-products', root).innerHTML = productsTable();
    });
    ui.actions(root, { all: () => router.go('products') });
  }

  router.register('dashboard', { render });
})(window.Pynx);
