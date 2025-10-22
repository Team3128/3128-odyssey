import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "barketing_pdfs");
    await fs.mkdir(dir, { recursive: true });

    const files = await fs.readdir(dir);

    // Only return actual PDFs
    const pdfs = files
      .filter((file) => file.toLowerCase().endsWith(".pdf"))
      .map((file) => ({
        name: file,
        url: `/barketing_pdfs/${file}`,
      }));

    return NextResponse.json({ success: true, files: pdfs });
  } catch (err: any) {
    console.error("ListPdfs Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to list PDFs" },
      { status: 500 }
    );
  }
}
