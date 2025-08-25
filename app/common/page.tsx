"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function CommonPage() {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    // fetch markdown file from /public/md_files/common.md
    fetch("/md_files/common.md")
      .then((res) => res.text())
      .then((text) => setMarkdown(text));
  }, []);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Practicals</h1>
      <article className="prose dark:prose-invert">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </main>
  );
}

