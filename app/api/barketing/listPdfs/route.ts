// app/api/barketing/listPdfs/route.ts
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "barketing", "uploads");
    let files: string[] = [];
    try {
      files = await fs.readdir(dir);
    } catch {
      files = [];
    }

    const fileList = files.map((f) => ({
      name: f,
      url: `/barketing/uploads/${f}`,
    }));

    return NextResponse.json({ success: true, files: fileList });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
