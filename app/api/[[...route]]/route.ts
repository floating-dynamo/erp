import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import customers from '@/features/customers/server/route';
import enquiries from '@/features/enquiries/server/route';
import quotations from '@/features/quotations/server/route';
import countries from '@/features/countries/server/route';
import companies from '@/features/companies/server/route';
import supplierDc from '@/features/supplier-dc/server/route';
import purchaseOrders from '@/features/purchase-orders/server/route';
import auth from '@/features/users/server/route';

export const runtime = 'nodejs';

const app = new Hono()
  .basePath('/api')
  .route('/auth', auth)
  .route('/customers', customers)
  .route('/enquiries', enquiries)
  .route('/quotations', quotations)
  .route('/countries', countries)
  .route('/companies', companies)
  .route('/purchase-orders', purchaseOrders)
  .route('/supplier-dcs', supplierDc);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof app;
