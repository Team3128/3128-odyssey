"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // only render editor on client
  }, []);

  const editor = useEditor(
    {
      extensions: [StarterKit, Image],
      content: value || "<p>Start writing...</p>",
      onUpdate: ({ editor }) => onChange(editor.getHTML()),
      immediatelyRender: false, // prevents SSR hydration errors
    },
    [isClient] // only initialize when client
  );

  if (!isClient) return null; // don’t render on server

  return <EditorContent editor={editor} className="bg-gray-800 text-white p-2 rounded" />;
}
