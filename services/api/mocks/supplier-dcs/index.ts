import { SupplierDc } from '@/features/supplier-dc/schemas';

export const SUPPLIER_DCS_MOCK_DATA: SupplierDc[] = [
  {
    id: '918193aiaw-1291ndiwd',
    date: '2025-04-14',
    dcNo: '0001',
    from: 'Shreevara Innovations Pvt Limited',
    to: 'Sridhar Maskeri',
    gstIn: 'GSTIN121212',
    nonreturnable: false,
    returnable: true,
    poRef: 'PO19219jcas',
    workOrders: [
      {
        woNumber: 'WO123',
        woDescription: 'Pen Cap',
        purpose: 'To outsorurce pen cap',
        qty: 10,
        remarks: 'NA',
      },
    ],
  },
];
