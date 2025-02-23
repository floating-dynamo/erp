import { Hono } from "hono";
import { handle } from "hono/vercel";

import customers from "@/features/customers/server/route";
import enquiries from "@/features/enquiries/server/route";
import quotations from "@/features/quotations/server/route";
import countries from "@/features/countries/server/route";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/customers", customers)
  .route("/enquiries", enquiries)
  .route("/quotations", quotations)
  .route("/countries", countries);

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof routes;
