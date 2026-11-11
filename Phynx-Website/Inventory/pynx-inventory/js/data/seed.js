/* ==========================================================================
   data/seed.js — sample data used the first time the app runs
   (or after Pynx.store.reset()). Edit freely; no other file holds sample data.
   ========================================================================== */
(function (P) {
  'use strict';

  const prod = (sku, name, supplier, category, location, unit, qty, minLevel, unitCost) =>
    ({ sku, name, supplier, category, location, unit, qty, minLevel, unitCost, archived: false });

  P.seed = () => ({
    products: [
      prod('INV-015', 'Clothes Hangers',            'PackRight Inc.',       'Store Supplies',    'Shelf G1',   'pcs',    800, 200, 6),
      prod('INV-001', 'Cotton Fabric (White)',      'ABC Garments',         'Fabrics',           'Rack A1',    'meters', 450, 100, 185),
      prod('INV-002', 'Denim Fabric (Indigo)',      'Metro Textile Supply', 'Fabrics',           'Rack A2',    'meters', 320, 80,  260),
      prod('INV-003', 'Polyester Blend Fabric',     'Fabric House',         'Fabrics',           'Rack A3',    'meters', 60,  100, 150),
      prod('INV-004', 'Shirt Buttons (Assorted)',   'Thread & Co.',         'Sewing Supplies',   'Shelf B1',   'packs',  0,   50,  35),
      prod('INV-005', 'Metal Zipper 7in',           'Thread & Co.',         'Sewing Supplies',   'Shelf B2',   'pcs',    900, 300, 12),
      prod('INV-006', 'Sewing Thread (Black)',      'Thread & Co.',         'Sewing Supplies',   'Shelf B3',   'pcs',    120, 60,  45),
      prod('INV-007', 'Woven Care Labels',          'PrintWorks Co.',       'Labels & Tags',     'Shelf C1',   'pcs',    1500, 500, 1.5),
      prod('INV-008', 'Hang Tags',                  'PrintWorks Co.',       'Labels & Tags',     'Shelf C2',   'pcs',    240, 300, 2.25),
      prod('INV-009', 'Packaging Poly Bags',        'PackRight Inc.',       'Packaging',         'Shelf D1',   'pcs',    2000, 600, 1.8),
      prod('INV-010', 'Shipping Boxes (M)',         'PackRight Inc.',       'Packaging',         'Shelf D2',   'pcs',    300, 100, 14),
      prod('INV-011', 'Screen Printing Ink (Black)','PrintWorks Co.',       'Printing Materials','Cabinet E1', 'liters', 5,   10,  420),
      prod('INV-012', 'Heat Transfer Vinyl',        'PrintWorks Co.',       'Printing Materials','Cabinet E2', 'rolls',  40,  15,  780),
      prod('INV-013', 'Plain White T-Shirt (M)',    'In-house Production',  'Finished Goods',    'Rack F1',    'pcs',    180, 60,  120),
      prod('INV-014', 'Pynx Hoodie (L, Black)',     'In-house Production',  'Finished Goods',    'Rack F2',    'pcs',    75,  30,  650)
    ],

    stockIns: [
      { id: 'SI-2026-0003', date: '2026-11-08', sku: 'INV-001', qty: 200, supplier: 'ABC Garments',        reference: 'DLV-2026-001',       notes: '' },
      { id: 'SI-2026-0002', date: '2026-11-05', sku: 'INV-014', qty: 25,  supplier: 'In-house Production', reference: 'Production Batch 12', notes: '' },
      { id: 'SI-2026-0001', date: '2026-11-04', sku: 'INV-005', qty: 400, supplier: 'Thread & Co.',        reference: 'DLV-2026-002',       notes: '' }
    ],

    stockOuts: [
      { id: 'SO-2026-0003', date: '2026-11-09', sku: 'INV-013', qty: 20, reason: 'Sample / Marketing Use', issuedTo: 'Marketing & Design', reference: '', notes: '' },
      { id: 'SO-2026-0002', date: '2026-11-08', sku: 'INV-003', qty: 90, reason: 'Defective',              issuedTo: 'Production',         reference: '', notes: '' },
      { id: 'SO-2026-0001', date: '2026-11-06', sku: 'INV-011', qty: 7,  reason: 'Damaged',                issuedTo: 'Production',         reference: '', notes: '' }
    ],

    requisitions: [
      { id: 'REQ-2026-0013', title: 'Garment sample sewing',            department: 'Marketing & Design', requestedBy: 'Maria Santos', approvedDate: '2026-11-10', status: 'Pending Release',
        items: [{ sku: 'INV-004', qty: 50, released: 0 }, { sku: 'INV-006', qty: 20, released: 0 }] },
      { id: 'REQ-2026-0014', title: 'Brand promotion print materials',  department: 'Marketing & Design', requestedBy: 'Maria Santos', approvedDate: '2026-11-10', status: 'Pending Release',
        items: [{ sku: 'INV-012', qty: 5, released: 0 }, { sku: 'INV-011', qty: 10, released: 0 }] },
      { id: 'REQ-2026-0012', title: 'Packaging for outgoing orders',    department: 'Logistics',          requestedBy: 'John Reyes',   approvedDate: '2026-11-09', status: 'Pending Release',
        items: [{ sku: 'INV-009', qty: 200, released: 0 }, { sku: 'INV-010', qty: 100, released: 0 }] },
      { id: 'REQ-2026-0011', title: 'New Collection photoshoot samples',department: 'Marketing & Design', requestedBy: 'Ana Cruz',     approvedDate: '2026-11-08', status: 'Pending Release',
        items: [{ sku: 'INV-001', qty: 20, released: 0 }, { sku: 'INV-002', qty: 15, released: 0 }, { sku: 'INV-013', qty: 10, released: 0 }] }
    ]
  });
})(window.Pynx);
