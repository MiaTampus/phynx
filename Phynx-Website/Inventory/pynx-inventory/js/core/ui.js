/* ==========================================================================
   core/ui.js — generic UI building blocks. Knows nothing about inventory.
   ========================================================================== */
(function (P) {
  'use strict';
  const { esc, $ } = P.util;

  /* ---- Markup helpers (return HTML strings) ---- */
  const head = (title, sub = '') => `<h1>${esc(title)}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}`;

  /* Headers starting with '#' are right-aligned numeric columns. */
  function table(headers, rowsHtml, { empty = 'Nothing to show yet.', narrow = false } = {}) {
    const th = headers.map(h => `<th class="${h[0] === '#' ? 'r' : ''}">${esc(h.replace('#', ''))}</th>`).join('');
    const body = rowsHtml || `<tr><td colspan="${headers.length}" class="mut">${esc(empty)}</td></tr>`;
    return `<div class="tw"><table class="${narrow ? 'narrow' : ''}"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  /* pairs: [[value, label], ...] */
  const options = (pairs, selected) =>
    pairs.map(([v, l]) => `<option value="${esc(v)}" ${v === selected ? 'selected' : ''}>${esc(l)}</option>`).join('');

  const pill = (tone, label) => `<span class="pill pill--${tone}">${esc(label)}</span>`;

  /* ---- Events ---- */
  /* Delegated listener: on(root, 'input', '.search', (el, event) => ...) */
  function on(root, type, selector, fn) {
    root.addEventListener(type, ev => {
      const el = ev.target.closest(selector);
      if (el && root.contains(el)) fn(el, ev);
    });
  }

  /* Click handlers keyed by data-act:  <button data-act="save" data-id="1">
     actions(root, { save: (dataset, el) => ... }) */
  function actions(root, map) {
    on(root, 'click', '[data-act]', el => {
      const fn = map[el.dataset.act];
      if (fn) fn(el.dataset, el);
    });
  }

  const formData = form => Object.fromEntries(new FormData(form));

  /* ---- Toast ---- */
  function toast(message) {
    document.querySelectorAll('.toast').forEach(el => el.remove());
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), P.config.toastMs);
  }

  /* ---- Modal ---- */
  function closeModal() {
    const m = $('#modal');
    if (m) m.remove();
    document.body.classList.remove('modal-open', 'print-receipt');
  }

  /* Opens a modal; any element with [data-close] inside closes it. Returns the modal element. */
  function modal(html) {
    closeModal();
    const m = document.createElement('div');
    m.className = 'modal';
    m.id = 'modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="card">${html}</div>`;
    m.addEventListener('click', ev => {
      if (ev.target === m || ev.target.closest('[data-close]')) closeModal();
    });
    document.body.appendChild(m);
    document.body.classList.add('modal-open');
    return m;
  }
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closeModal(); });

  /* Prints only the open modal (used for receipts) */
  function printModal() {
    document.body.classList.add('print-receipt');
    window.addEventListener('afterprint', () => document.body.classList.remove('print-receipt'), { once: true });
    window.print();
  }

  /* ---- CSV download ---- */
  function downloadCsv(filename, rows) {
    const text = rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  P.ui = { head, table, options, pill, on, actions, formData, toast, modal, closeModal, printModal, downloadCsv };
})(window.Pynx);
