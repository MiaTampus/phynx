/* ==========================================================================
   core/router.js — sidebar navigation + switching between screens.

   A screen registers itself:
       Pynx.router.register('products', { render(root) { ... } });
   `root` is a fresh <div> every time, so screens never have to clean up.
   ========================================================================== */
(function (P) {
  'use strict';
  const { config, util } = P;
  const { esc, $ } = util;

  const views = {};
  let current = null;

  const register = (id, view) => { views[id] = view; };

  const placeholder = {
    render(root) {
      const item = config.nav.find(n => n.id === current);
      root.innerHTML = `<h1>${esc(item ? item.label : '')}</h1><p class="sub">This module isn't part of the inventory screens yet.</p>`;
    }
  };

  function renderNav() {
    $('#nav').innerHTML = config.nav.map(n => `
      <a href="#${esc(n.id)}" class="${n.id === current ? 'on' : ''}" ${n.id === current ? 'aria-current="page"' : ''}>
        <span class="nav-icon" aria-hidden="true">${n.icon}</span>${esc(n.label)}
      </a>`).join('');
  }

  function render() {
    const outlet = $('#main');
    const root = document.createElement('div');
    root.className = 'view';
    outlet.replaceChildren(root);
    (views[current] || placeholder).render(root);
  }

  function show(id) {
    current = id;
    renderNav();
    render();
  }

  const idFromHash = () => {
    const h = location.hash.slice(1);
    return config.nav.some(n => n.id === h) ? h : null;
  };

  /* Navigate from code, e.g. a "View all products" button. */
  function go(id) {
    if (location.hash.slice(1) === id) { show(id); scrollTo(0, 0); }
    else location.hash = id;
  }

  /* Re-draw the current screen (called automatically when data changes). */
  const refresh = () => render();

  function start() {
    addEventListener('hashchange', () => {
      const id = idFromHash();
      if (id && id !== current) { P.ui.closeModal(); show(id); scrollTo(0, 0); }
    });
    show(idFromHash() || config.defaultView);
  }

  P.router = { register, go, refresh, start };
})(window.Pynx);
