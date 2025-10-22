import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dir = path.join(process.cwd(), "public", "barketing_pdfs");
    await fs.mkdir(dir, { recursive: true });

    const safeName = file.name.replace(/\s+/g, "_");
    const filePath = path.join(dir, safeName);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, filename: safeName });
  } catch (err: any) {
    console.error("UploadPdf Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload" },
      { status: 500 }
    );
  }
}
