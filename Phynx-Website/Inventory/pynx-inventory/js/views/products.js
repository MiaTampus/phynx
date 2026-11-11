/* ==========================================================================
   views/products.js — product list, add / edit / view / archive / delete.
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, router, components, config, util } = P;
  const { esc, num, money, $ } = util;
  const pill = components.statusPill;

  const filters = { q: '', category: '', status: '', sort: 'name' };

  /* ---- Table ---- */
  function tableHtml() {
    const rows = products.list(filters);
    return ui.table(
      ['SKU', 'Product', 'Category', 'Location', '#On hand', '#Min.', '#Unit cost', 'Status', '#Actions'],
      rows.map(p => `<tr>
        <td>${esc(p.sku)}</td>
        <td><b>${esc(p.name)}</b><small>${esc(p.supplier)}</small></td>
        <td>${esc(p.category)}</td><td>${esc(p.location)}</td>
        <td class="r">${num(p.qty)} ${esc(p.unit)}</td><td class="r">${num(p.minLevel)}</td>
        <td class="r">${money(p.unitCost)}</td><td>${pill.product(p)}</td>
        <td><div class="acts">
          <button class="sm" data-act="view" data-sku="${esc(p.sku)}">View</button>
          <button class="sm" data-act="edit" data-sku="${esc(p.sku)}">Edit</button>
          <button class="sm" data-act="archive" data-sku="${esc(p.sku)}">Archive</button>
          ${p.qty === 0 ? `<button class="sm dng" data-act="delete" data-sku="${esc(p.sku)}">Delete</button>` : ''}
        </div></td></tr>`).join(''),
      { empty: 'No products match your filters.' });
  }

  /* ---- Dialogs ---- */
  function openView(sku) {
    const p = products.get(sku);
    if (!p) return;
    const rows = [
      ['SKU', p.sku], ['Supplier', p.supplier], ['Category', p.category], ['Location', p.location],
      ['On hand', `${num(p.qty)} ${p.unit}`], ['Minimum level', num(p.minLevel)],
      ['Unit cost', money(p.unitCost)], ['Value', money(p.unitCost * p.qty)]
    ];
    ui.modal(`<h2>${esc(p.name)}</h2>
      ${rows.map(([k, v]) => `<div class="row"><span class="mut">${k}</span><b>${esc(v)}</b></div>`).join('')}
      <div class="row"><span class="mut">Status</span>${pill.product(p)}</div>
      <p><button data-close>Close</button></p>`);
  }

  function openForm(sku) {
    const editing = Boolean(sku);
    const p = editing ? products.get(sku) : {
      sku: products.nextSku(), name: '', supplier: '', category: '', location: '',
      unit: config.defaultUnit, qty: 0, minLevel: 0, unitCost: 0
    };
    if (!p) return;

    const m = ui.modal(`<h2>${editing ? 'Edit' : 'Add'} Product</h2>
      <form>
        <div class="two">
          <div><label>SKU</label><input name="sku" required value="${esc(p.sku)}" ${editing ? 'readonly' : ''}></div>
          <div><label>Product name</label><input name="name" required value="${esc(p.name)}"></div>
          <div><label>Supplier</label><input name="supplier" value="${esc(p.supplier)}"></div>
          <div><label>Category</label><input name="category" required list="category-list" value="${esc(p.category)}">
            <datalist id="category-list">${products.categories().map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist></div>
          <div><label>Location</label><input name="location" value="${esc(p.location)}"></div>
          <div><label>Unit</label><input name="unit" required value="${esc(p.unit)}"></div>
          <div><label>On hand</label><input name="qty" type="number" min="0" step="any" value="${p.qty}" ${editing ? 'readonly' : ''}></div>
          <div><label>Minimum level</label><input name="minLevel" type="number" min="0" step="any" value="${p.minLevel}"></div>
          <div><label>Unit cost (${esc(config.currencySymbol)})</label><input name="unitCost" type="number" min="0" step="0.01" value="${p.unitCost}"></div>
        </div>
        ${editing ? '<div class="mut note">On-hand quantity changes through Stock In / Stock Out.</div>' : ''}
        <p class="acts"><button type="button" data-close>Cancel</button><button class="pri">Save Product</button></p>
      </form>`);

    ui.on(m, 'submit', 'form', (form, ev) => {
      ev.preventDefault();
      const data = ui.formData(form);
      const res = editing ? products.update(sku, data) : products.create(data);
      if (!res.ok) return ui.toast(res.error);
      ui.closeModal();
      ui.toast('Product saved');
    });
  }

  /* ---- Screen ---- */
  function render(root) {
    const catOptions = ui.options(products.categories().map(c => [c, c]), filters.category);
    const statusOptions = ui.options(Object.entries(products.STATUS), filters.status);
    const sortOptions = ui.options([
      ['name', 'Sort: Name (A–Z)'], ['sku', 'Sort: SKU'], ['qty', 'Sort: Lowest stock'], ['cost', 'Sort: Highest cost']
    ], filters.sort);

    root.innerHTML = `
      ${ui.head('Products', 'Register items, edit details and keep an eye on stock levels.')}
      <div class="tools">
        <input class="grow" type="search" data-filter="q" placeholder="Search name, SKU, supplier" value="${esc(filters.q)}" aria-label="Search products">
        <select data-filter="category" aria-label="Category"><option value="">All categories</option>${catOptions}</select>
        <select data-filter="status" aria-label="Status"><option value="">All statuses</option>${statusOptions}</select>
        <select data-filter="sort" aria-label="Sort">${sortOptions}</select>
        <button data-act="export">Export CSV</button>
        <button class="pri" data-act="add">+ Add Product</button>
      </div>
      <div class="card" id="product-table">${tableHtml()}</div>`;

    const repaint = () => { $('#product-table', root).innerHTML = tableHtml(); };
    const onFilter = el => { filters[el.dataset.filter] = el.value; repaint(); };
    ui.on(root, 'input', 'input[data-filter]', onFilter);
    ui.on(root, 'change', 'select[data-filter]', onFilter);

    ui.actions(root, {
      add: () => openForm(),
      view: d => openView(d.sku),
      edit: d => openForm(d.sku),
      export: () => ui.downloadCsv('products.csv', [
        ['SKU', 'Product', 'Supplier', 'Category', 'Location', 'Unit', 'On hand', 'Min', 'Unit cost'],
        ...products.list(filters).map(p => [p.sku, p.name, p.supplier, p.category, p.location, p.unit, p.qty, p.minLevel, p.unitCost])
      ]),
      archive: d => {
        if (!confirm('Archive this product? It will be hidden from the lists.')) return;
        const res = products.archive(d.sku);
        ui.toast(res.ok ? 'Product archived' : res.error);
      },
      delete: d => {
        if (!confirm('Delete this product permanently?')) return;
        const res = products.remove(d.sku);
        ui.toast(res.ok ? 'Product deleted' : res.error);
      }
    });
  }

  router.register('products', { render });
})(window.Pynx);
