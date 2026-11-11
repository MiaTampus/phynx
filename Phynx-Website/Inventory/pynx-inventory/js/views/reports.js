/* ==========================================================================
   views/reports.js — KPIs, 7-day movement chart and report tables (CSV/print).
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, stock, analytics, router, util } = P;
  const { esc, num, money, fdate, weekday, $ } = util;

  const TABS = [
    ['levels', 'Stock Levels'],
    ['ledger', 'Movement Ledger'],
    ['low', 'Low & Out of Stock'],
    ['val', 'Valuation by Category']
  ];
  let tab = 'levels';

  /* Returns { h: headers, r: rows } for the selected report tab. '#' headers are numeric. */
  function dataset() {
    const a = products.active();
    const S = products.STATUS;

    if (tab === 'ledger') {
      return {
        h: ['Date', 'Receipt', 'Type', 'Product', '#Qty', 'Note'],
        r: stock.ledger().map(x => [
          fdate(x.date), x.id, x.type === 'in' ? 'Stock-In' : 'Stock-Out',
          (products.get(x.sku) || {}).name || x.sku,
          (x.type === 'in' ? '+' : '−') + num(x.qty), x.note
        ])
      };
    }
    if (tab === 'low') {
      return {
        h: ['SKU', 'Product', 'Category', '#On hand', '#Min', 'Status'],
        r: a.filter(p => products.statusOf(p) !== 'In')
            .map(p => [p.sku, p.name, p.category, `${num(p.qty)} ${p.unit}`, num(p.minLevel), S[products.statusOf(p)]])
      };
    }
    if (tab === 'val') {
      return {
        h: ['Category', '#Units', '#Value'],
        r: analytics.valuationByCategory().map(c => [c.category, num(c.units), money(c.value)])
      };
    }
    return {
      h: ['SKU', 'Product', 'Category', '#On hand', '#Min', '#Unit cost', '#Value', 'Status'],
      r: a.map(p => [p.sku, p.name, p.category, `${num(p.qty)} ${p.unit}`, num(p.minLevel), money(p.unitCost), money(p.qty * p.unitCost), S[products.statusOf(p)]])
    };
  }

  function reportTable() {
    const d = dataset();
    const rows = d.r.map(r => `<tr>${r.map((c, i) => `<td class="${d.h[i][0] === '#' ? 'r' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('');
    return ui.table(d.h, rows, { empty: 'Nothing to report.' });
  }

  function render(root) {
    const s = analytics.inventorySummary();
    const mv = analytics.dailyMovement();
    const kpis = [
      ['Total Products', s.totalProducts, 'Active items'],
      ['Total Units', num(s.totalUnits), 'All units on hand'],
      ['Inventory Value', money(s.value), 'At unit cost'],
      ['Needs Attention', s.lowCount + s.outCount, `${s.lowCount} low · ${s.outCount} out of stock`]
    ];

    root.innerHTML = `
      ${ui.head('Inventory Reports', 'Stock levels, movement history and valuation. Export to CSV or print.')}
      <div class="grid g4">${kpis.map(([label, value, note]) => `
        <div class="card"><span class="mut">${label}</span><div class="big md">${esc(value)}</div><span class="mut">${esc(note)}</span></div>`).join('')}
      </div>

      <div class="card" style="margin-bottom:18px">
        <h2>Stock movement — last ${mv.rows.length} days</h2>
        <div class="chart">${mv.rows.map(d => `<div>
          <i style="background:#111;height:${d.in / mv.max * 100}%" title="Stock-In ${num(d.in)}"></i>
          <i style="background:#b9b4a6;height:${d.out / mv.max * 100}%" title="Stock-Out ${num(d.out)}"></i></div>`).join('')}</div>
        <div class="days">${mv.rows.map(d => `<span>${weekday(d.date)}</span>`).join('')}</div>
        <p class="mut legend"><i style="background:#111"></i>Stock-In &nbsp; <i style="background:#b9b4a6"></i>Stock-Out</p>
      </div>

      <div class="tabs" id="report-tabs">
        ${TABS.map(([k, l]) => `<button data-act="tab" data-tab="${k}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('')}
      </div>
      <div class="tools noprint">
        <button data-act="export">Export CSV</button>
        <button class="pri" data-act="print">Print Report</button>
      </div>
      <div class="card" id="report-table">${reportTable()}</div>`;

    ui.actions(root, {
      tab: d => {
        tab = d.tab;
        root.querySelectorAll('#report-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
        $('#report-table', root).innerHTML = reportTable();
      },
      export: () => {
        const d = dataset();
        ui.downloadCsv('inventory_report.csv', [d.h.map(h => h.replace('#', '')), ...d.r]);
      },
      print: () => window.print()
    });
  }

  router.register('reports', { render });
})(window.Pynx);
