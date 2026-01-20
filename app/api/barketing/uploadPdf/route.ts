import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uploadDir = path.join(process.cwd(), "public", "barketing", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PDF Upload Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
