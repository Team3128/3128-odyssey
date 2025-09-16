import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const docsDir = path.join(process.cwd(), "public/md_files");

export async function POST(req: Request) {
  try {
    const { filename, content, mode } = await req.json();

    if (!filename || !content) {
      return NextResponse.json({ error: "Filename and content required" }, { status: 400 });
    }

    const filePath = path.join(docsDir, `${filename}.md`);

    if (mode === "append") {
      await fs.appendFile(filePath, `\n\n${content}`);
    } else {
      // **Check if file exists** to prevent overwriting
      try {
        await fs.access(filePath);
        return NextResponse.json({ error: "File already exists" }, { status: 400 });
      } catch {
        // file doesn't exist, safe to create
      }
      await fs.writeFile(filePath, content);
    }

    return NextResponse.json({ success: true, file: `${filename}.md` });
  } catch (err: any) {
    console.error("Error writing file:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
