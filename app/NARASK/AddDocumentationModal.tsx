"use client";
import { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";

interface AddDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingFiles: { filename: string; displayName: string }[]; // now includes display name
  useRichText?: boolean;
  onSaved?: () => void;
}

export default function AddDocumentationModal({
  isOpen,
  onClose,
  existingFiles,
  useRichText = false,
  onSaved,
}: AddDocumentationModalProps) {
  const [mode, setMode] = useState<"append" | "new">("append");
  const [selectedFile, setSelectedFile] = useState(existingFiles[0]?.filename || "");
  const [newFileName, setNewFileName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setSelectedFile(existingFiles[0]?.filename || "");
  }, [existingFiles]);

  const handleSave = async () => {
    let filename = mode === "new" ? `barketing-${Date.now()}` : selectedFile;
    let nameToShow = mode === "new" ? displayName : existingFiles.find(f => f.filename === selectedFile)?.displayName;

    if (!nameToShow || !content) return alert("Name and content required!");

    try {
      const res = await fetch("/api/barketing/saveDoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, displayName: nameToShow, content, mode }),
      });
      const result = await res.json();

      if (result.success) {
        alert("Saved!");
        onClose();
        setContent("");
        setNewFileName("");
        setDisplayName("");
        setSelectedFile(existingFiles[0]?.filename || "");
        if (onSaved) onSaved();
      } else {
        alert("Error saving file: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving file");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-[600px] max-w-full">
        <h2 className="text-xl font-bold text-white mb-4">Add Documentation</h2>

        {/* Mode */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "append" | "new")}
            className="p-2 rounded bg-gray-800 text-white w-full"
          >
            <option value="append">Add to Existing File</option>
            <option value="new">Create New File</option>
          </select>
        </div>

        {/* Select or New */}
        {mode === "append" ? (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Select File</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white w-full"
            >
              {existingFiles.map((f) => (
                <option key={f.filename} value={f.filename}>
                  {f.displayName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">New File Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="p-2 rounded bg-gray-800 text-white w-full"
                placeholder="e.g. My New Doc"
              />
            </div>
          </>
        )}

        {/* Editor */}
        {useRichText ? (
          <div className="mb-4">
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        ) : (
          <textarea
            className="w-full p-2 rounded bg-gray-800 text-white h-40 mb-4"
            placeholder="Write your markdown here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded text-white">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
