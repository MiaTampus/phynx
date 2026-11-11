/* ==========================================================================
   app.js — start-up only: load data, wire the pieces together, show a screen.
   ========================================================================== */
(async function (P) {
  'use strict';

  try {
    await P.store.init({ adapter: P.storage.current(), seed: P.seed });
  } catch (err) {
    console.error('[app] failed to load data', err);
    document.getElementById('main').innerHTML =
      '<h1>Something went wrong</h1><p class="sub">The inventory data could not be loaded. Check the browser console for details.</p>';
    return;
  }

  /* Whenever data changes (any service calls store.commit) redraw the current screen. */
  P.store.subscribe(() => P.router.refresh());

  const who = document.getElementById('who');
  who.innerHTML = `<b>${P.util.esc(P.config.user.name)}</b>${P.util.esc(P.config.user.role)}`;

  P.router.start();
})(window.Pynx);
