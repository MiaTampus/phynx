/* ==========================================================================
   views/releases.js — check stock for approved requisitions and release it.
   ========================================================================== */
(function (P) {
  'use strict';
  const { ui, products, requisitions, router, components, config, util } = P;
  const { esc, num, fdate, $ } = util;
  const ST = config.requisitionStatus;
  const pill = components.statusPill;

  const TABS = [ST.pending, ST.partial, ST.released, 'All'];
  let tab = ST.pending;
  let query = '';

  function tableHtml() {
    const rows = requisitions.list({ status: tab, q: query });
    return ui.table(
      ['Requisition', 'Department', 'Requested by', 'Approved', '#Items', 'Stock check', 'Status', '#Actions'],
      rows.map(r => `<tr>
        <td><b>${esc(r.id)}</b><small>${esc(r.title)}</small></td>
        <td>${esc(r.department)}</td><td>${esc(r.requestedBy)}</td><td>${fdate(r.approvedDate)}</td>
        <td class="r">${r.items.length}</td>
        <td>${pill.availability(requisitions.availability(r))}</td>
        <td>${pill.requisition(r.status)}</td>
        <td class="r">${r.status === ST.released
          ? `<button class="sm" data-act="review" data-id="${esc(r.id)}">View</button>`
          : `<button class="sm pri" data-act="review" data-id="${esc(r.id)}">Review &amp; Release</button>`}</td></tr>`).join(''),
      { empty: 'No requisitions in this tab.' });
  }

  function openReview(id) {
    const r = requisitions.get(id);
    if (!r) return;

    const rows = r.items.map(i => {
      const p = products.get(i.sku);
      return `<tr><td>${esc(p ? p.name : i.sku)}</td><td class="r">${num(i.qty)}</td><td class="r">${num(i.released)}</td>
        <td class="r">${p ? `${num(p.qty)} ${esc(p.unit)}` : '—'}</td></tr>`;
    }).join('');

    const m = ui.modal(`
      <h2>${esc(r.id)}</h2>
      <p class="mut">${esc(r.title)} · ${esc(r.department)}</p>
      ${ui.table(['Item', '#Requested', '#Released', '#Available'], rows, { narrow: true })}
      <p class="acts">
        <button data-close>Close</button>
        ${r.status !== ST.released ? '<button class="pri" data-act="release">Release available stock</button>' : ''}
      </p>`);

    ui.actions(m, {
      release: () => {
        const res = requisitions.release(id);
        if (!res.ok) return ui.toast(res.error);
        ui.closeModal();
        ui.toast('Stock released');
      }
    });
  }

  function render(root) {
    root.innerHTML = `
      ${ui.head('Requisition Releases', 'Approved requisitions waiting for stock to be checked and released to the requesting department.')}
      <div class="tabs" id="release-tabs">
        ${TABS.map(t => `<button data-act="tab" data-tab="${esc(t)}" class="${t === tab ? 'on' : ''}">${esc(t)}</button>`).join('')}
      </div>
      <div class="tools">
        <input id="release-search" type="search" placeholder="Search requisition, department" value="${esc(query)}" aria-label="Search requisitions">
      </div>
      <div class="card" id="release-table">${tableHtml()}</div>
      <p class="mut">Requisitions are created and approved in the Requisition module. These are sample records for now.</p>`;

    const repaint = () => { $('#release-table', root).innerHTML = tableHtml(); };

    ui.on(root, 'input', '#release-search', el => { query = el.value; repaint(); });

    ui.actions(root, {
      tab: d => {
        tab = d.tab;
        root.querySelectorAll('#release-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
        repaint();
      },
      review: d => openReview(d.id)
    });
  }

  router.register('releases', { render });
})(window.Pynx);
