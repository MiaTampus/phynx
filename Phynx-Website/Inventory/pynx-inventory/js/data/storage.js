/* ==========================================================================
   data/storage.js — persistence adapters. THIS is the file to touch when a
   real database / API is added; nothing else in the app knows where data lives.

   An adapter is any object with:
       load()        -> Promise<state | null>   (null = nothing saved yet)
       save(state)   -> Promise<void>
       clear()       -> Promise<void>           (optional)

   Active adapter is chosen by `config.dataSource`.
   ========================================================================== */
(function (P) {
  'use strict';

  /* Works offline in the browser — used for now, no database needed. */
  const local = {
    async load() {
      try {
        const raw = localStorage.getItem(P.config.storageKey);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.warn('[storage] could not read saved data', err);
        return null;
      }
    },
    async save(state) {
      try {
        localStorage.setItem(P.config.storageKey, JSON.stringify(state));
      } catch (err) {
        console.warn('[storage] could not save data', err);
      }
    },
    async clear() {
      try { localStorage.removeItem(P.config.storageKey); } catch (err) { /* ignore */ }
    }
  };

  /* Example for later:
     const api = {
       async load()      { return (await fetch('/api/inventory')).json(); },
       async save(state) { await fetch('/api/inventory', { method: 'PUT',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify(state) }); }
     };
     ...then add `api` to `adapters` below and set config.dataSource = 'api'. */

  const adapters = { local };

  P.storage = {
    adapters,
    current() {
      return adapters[P.config.dataSource] || local;
    }
  };
})(window.Pynx);
