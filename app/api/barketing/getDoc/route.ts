import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "barketing", "barketing.md");

    let content = "";
    try {
      content = await fs.readFile(filePath, "utf-8");
    } catch {
      // File might not exist yet
      content = "# Welcome to the Barketing Wiki\n\nStart editing...";
    }

    return NextResponse.json({ success: true, content });
  } catch (err: any) {
    console.error("Get Barketing Doc Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
