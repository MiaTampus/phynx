/* ==========================================================================
   core/util.js — small pure helpers (formatting, escaping, results).
   No dependency on any other Pynx module except config.
   ========================================================================== */
(function (P) {
  'use strict';
  const cfg = P.config;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const num = x => Number(x).toLocaleString(cfg.locale, { maximumFractionDigits: 3 });

  const money = x => cfg.currencySymbol + Number(x).toLocaleString(cfg.locale, {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  /* Avoids 0.1 + 0.2 = 0.30000000000000004 style artefacts in stock counts */
  const round = x => Math.round((Number(x) + Number.EPSILON) * 1e4) / 1e4;

  /* Local-time YYYY-MM-DD (not UTC) */
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const today = () => iso(new Date());

  const fdate = s => {
    if (!s) return '—';
    const d = new Date(s + 'T00:00');
    return isNaN(d) ? String(s) : d.toLocaleDateString(cfg.locale, { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const weekday = s => new Date(s + 'T00:00').toLocaleDateString(cfg.locale, { weekday: 'short' });

  const $ = (sel, root = document) => root.querySelector(sel);

  /* Service-layer return values: { ok:true, ...extra } or { ok:false, error } */
  const ok = (extra = {}) => ({ ok: true, ...extra });
  const fail = error => ({ ok: false, error });

  P.util = { esc, num, money, round, iso, today, fdate, weekday, $, ok, fail };
})(window.Pynx);
