/* ==========================================================================
   config.js — the ONE place for app-wide settings.
   Creates the global `Pynx` namespace that every other file plugs into.
   ========================================================================== */
window.Pynx = {
  components: {},

  config: {
    /* Data source: 'local' = browser localStorage (no database needed).
       Later add an adapter in js/data/storage.js and switch this value. */
    dataSource: 'local',
    storageKey: 'pynx_inv_v2',

    /* Formatting */
    locale: 'en-US',
    currencySymbol: '₱',

    /* IDs & defaults */
    idYear: null,            // null = use the current year in receipt numbers
    skuPrefix: 'INV-',
    defaultUnit: 'pcs',

    /* UI */
    toastMs: 2200,
    defaultView: 'dashboard',
    user: { name: 'Inventory Staff', role: 'Inventory' },

    /* Sidebar menu (order = display order). `id` must match a registered view;
       ids without a view show a simple placeholder page. */
    nav: [
      { id: 'dashboard',   icon: '▦', label: 'Dashboard' },
      { id: 'requisition', icon: '☰', label: 'Requisition' },
      { id: 'products',    icon: '▤', label: 'Products' },
      { id: 'stockin',     icon: '⇩', label: 'Stock In' },
      { id: 'stockout',    icon: '⇧', label: 'Stock Out' },
      { id: 'releases',    icon: '✓', label: 'Requisition Releases' },
      { id: 'reports',     icon: '▥', label: 'Inventory Reports' },
      { id: 'purchasing',  icon: '◇', label: 'Purchasing' },
      { id: 'delivery',    icon: '▷', label: 'Delivery' }
    ],

    stockOutReasons: ['Damaged', 'Defective', 'Sample / Marketing Use', 'Adjustment', 'Lost', 'Other'],

    requisitionStatus: {
      pending:  'Pending Release',
      partial:  'Partially Released',
      released: 'Released'
    },

    dashboard: { topCategories: 4, alertRows: 5, productRows: 8 },
    reports:   { chartDays: 7 }
  }
};
