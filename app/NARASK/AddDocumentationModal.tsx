"use client";
import { useState } from "react";

interface AddDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingFiles: string[];
}

export default function AddDocumentationModal({ isOpen, onClose, existingFiles }: AddDocumentationModalProps) {
  const [mode, setMode] = useState<"append" | "new">("append");
  const [selectedFile, setSelectedFile] = useState(existingFiles[0] || "");
  const [newFileName, setNewFileName] = useState("");
  const [content, setContent] = useState("");

  const handleSave = async () => {
    const fileName = mode === "new" ? newFileName : selectedFile;
    if (!fileName || !content) return alert("File name and content required!");

    const res = await fetch("/api/saveDoc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        content,
        append: mode === "append",
      }),
    });

    if (res.ok) {
      alert("Saved!");
      onClose();
    } else {
      alert("Error saving file.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-[600px]">
        <h2 className="text-xl font-bold text-white mb-4">Add Documentation</h2>

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

        {mode === "append" ? (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Select File</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white w-full"
            >
              {existingFiles.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">New File Name</label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white w-full"
              placeholder="e.g. myDoc"
            />
          </div>
        )}

        <textarea
          className="w-full p-2 rounded bg-gray-800 text-white h-40 mb-4"
          placeholder="Write your markdown here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
