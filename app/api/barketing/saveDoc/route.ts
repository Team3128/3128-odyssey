import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Missing content" },
        { status: 400 }
      );
    }

    // Barketing doc lives in its own folder
    const dir = path.join(process.cwd(), "public", "barketing");
    await fs.mkdir(dir, { recursive: true });

    // Always overwrite barketing.md (the single wiki doc)
    const filePath = path.join(dir, "barketing.md");
    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save Barketing Doc Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
