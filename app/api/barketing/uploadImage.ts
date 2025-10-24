import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // we use formidable instead
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const uploadDir = path.join(process.cwd(), "public/uploads/barketing");

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({ multiples: false, uploadDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ success: false, error: "Upload failed" });
    }

    const file = files.file as unknown as formidable.File;
    if (!file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const fileName = path.basename(file.filepath);
    const filePath = path.join(uploadDir, fileName);

    // Move file (formidable may store with random name)
    fs.renameSync(file.filepath, filePath);

    const publicUrl = `/uploads/barketing/${fileName}`;
    return res.status(200).json({ success: true, url: publicUrl });
  });
}
