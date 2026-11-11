/* ==========================================================================
   core/store.js — holds the app state in memory, persists it through the
   active storage adapter, and tells subscribers when something changed.
   It knows nothing about products, stock or screens.
   ========================================================================== */
(function (P) {
  'use strict';

  let state = null;
  let adapter = null;
  let seedFn = null;
  const subscribers = new Set();

  const isValid = s => s && ['products', 'stockIns', 'stockOuts', 'requisitions'].every(k => Array.isArray(s[k]));

  function persist() {
    try {
      return Promise.resolve(adapter.save(state)).catch(err => console.warn('[store] save failed', err));
    } catch (err) {
      console.warn('[store] save failed', err);
      return Promise.resolve();
    }
  }

  /* Call once at start-up: loads saved data or falls back to the seed. */
  async function init({ adapter: a, seed }) {
    adapter = a;
    seedFn = seed;
    let saved = null;
    try { saved = await adapter.load(); } catch (err) { console.warn('[store] load failed', err); }
    if (isValid(saved)) {
      state = saved;
    } else {
      state = seedFn();
      await persist();
    }
    return state;
  }

  /* Raw state object — services mutate it, then call commit(). */
  const data = () => state;

  /* Save + notify. Services call this after every successful change. */
  function commit() {
    persist();
    subscribers.forEach(fn => fn(state));
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  /* Wipe everything back to the sample data (handy while developing:
     run `Pynx.store.reset()` in the browser console). */
  async function reset() {
    if (adapter.clear) await adapter.clear();
    state = seedFn();
    commit();
  }

  P.store = { init, data, commit, subscribe, reset };
})(window.Pynx);
