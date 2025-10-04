import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const pdfDir = path.join(process.cwd(), "public/pdfs/marketing");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith(".pdf"));

    return NextResponse.json({
      success: true,
      files: files.map(f => ({
        name: f,
        url: `/pdfs/marketing/${f}`
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
