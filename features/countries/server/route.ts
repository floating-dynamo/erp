import { promises as fs } from "fs";
import path from "path";
import { Hono } from "hono";

const app = new Hono().get("/", async (c) => {
  try {
    const dataFilePath = path.join(
      process.cwd(),
      "features",
      "countries",
      "server",
      "data.json"
    );
    const data = await fs.readFile(dataFilePath, "utf-8");
    const countries = JSON.parse(data);
    return c.json(countries);
  } catch (error) {
    console.error(error);
    return c.json(
      { message: "Error fetching countries", error: (error as Error).message },
      500
    );
  }
});

export default app;
