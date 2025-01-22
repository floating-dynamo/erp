import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (_req: Request) => {
  try {
    const dataFilePath = path.join(
      process.cwd(),
      "app",
      "api",
      "countries",
      "data.json"
    );
    const data = await fs.readFile(dataFilePath, "utf-8");
    const countries = JSON.parse(data);
    return NextResponse.json(countries);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Error fetching countries",
        error: true,
      },
      { status: 500 }
    );
  }
};
