"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Header from "../components/narask/Header";
import Sidebar from "../components/narask/Sidebar";
import MarkdownViewer from "../components/narask/MarkdownViewer";

type MdFile = {
  name: string;
  slug: string;
  path: string;
};

type Section = {
  heading: string;
  preview: string;
  fullText: string;
};

type SectionsMap = Record<string, Section[]>;


// highlight component
const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={idx} className="bg-yellow-400 text-black">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export default function NaraskPage() {

  // --- SOFTWARE STATE ---
  const [mdFiles, setMdFiles] = useState<MdFile[]>([]);
  const [sections, setSections] = useState<SectionsMap>({});
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [howToInstructions, setHowToInstructions] = useState<string>("");

  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [mode, setMode] = useState<"new" | "append">("new");
  const [selectedFile, setSelectedFile] = useState<string>("");
  

  const sidebarRef = useRef<HTMLDivElement>(null);
  const howToFile = { name: "How To Add Docs", slug: "howto", path: "/md_files/howto.md" };

 
  useEffect(() => {
  if (mode !== "append" || !selectedFile) return;

  const loadExistingDoc = async () => {
    try {
      // find the file object
      const file = mdFiles.find((f) => f.slug === selectedFile);
      if (!file) return;

      const res = await fetch(file.path);
      const text = await res.text();

      setNewDocContent(text);
    } catch (err) {
      console.error("Failed to load existing doc:", err);
      setNewDocContent("");
    }
  };

  loadExistingDoc();
}, [mode, selectedFile, mdFiles]);

useEffect(()=>{

}, [])

useEffect(() => {
  if (mode === "new") {
    setNewDocContent("");
    setSelectedFile("");
  }
}, [mode]);


  // --- LOAD MARKDOWN FILES ---
  useEffect(() => {
    const loadMdFiles = async () => {
      try {
        const res = await fetch("/api/listDocs");
        const data = await res.json();
        if (data.success) setMdFiles(data.files);
      } catch (err) {
        console.error("Failed to load md files:", err);
      }
    };
    loadMdFiles();
  }, []);

  useEffect(() => {
    const loadSections = async () => {
      const sectionMap: SectionsMap = {};
      for (const file of mdFiles) {
        try {
          const res = await fetch(file.path);
          const text = await res.text();
          const rawSections = text.split(/^##\s+/m).slice(1);
          sectionMap[file.slug] = rawSections.map((section) => {
            const lines = section.split("\n");
            const heading = lines[0].trim();
            const fullText = lines.slice(1).join("\n").trim();
            const preview = lines.slice(1, 5).join(" ").trim();
            return { heading, preview, fullText };
          });
        } catch (err) {
          console.error(`Failed to load ${file.name}:`, err);
        }
      }
      setSections(sectionMap);
    };
    if (mdFiles.length) loadSections();
  }, [mdFiles]);

  useEffect(() => {
    async function loadHowTo() {
      try {
        const res = await fetch(howToFile.path);
        const text = await res.text();
        setHowToInstructions(text);
      } catch (err) {
        console.error("Failed to load howto.md:", err);
      }
    }
    loadHowTo();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const markdownComponents = {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-6 mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-semibold mt-5 mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
    p: ({ children }: any) => <p className="mb-3 text-gray-200 leading-relaxed">{children}</p>,
    ul: (props: any) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
    li: (props: any) => <li className="ml-4" {...props} />,
    pre: ({ children }: any) => (
  <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
    {children}
  </pre>
),
img: ({ src, alt }: any) => (
  <img
    src={src}
    alt={alt}
    height={400}
    width={300}
    className="rounded-lg my-4 max-w-full h-auto"
  />
),

code: ({ className, children, ...props }: any) => (
  <code className={className} {...props}>
    {children}
  </code>
),
  };



  // --- Build Display Cards ---
  let displayCards: { type: "file" | "section"; file: MdFile; section?: Section; idx?: number }[] = [];
  if (search.trim() === "" && !activeFilter) {
    displayCards = mdFiles.map((file) => ({ type: "file", file }));
  } else {
    mdFiles.forEach((file) => {
      if (sections[file.slug]) {
        sections[file.slug].forEach((section, idx) => {
          const query = search.toLowerCase();
          const matches =
            section.heading.toLowerCase().includes(query) ||
            section.preview.toLowerCase().includes(query) ||
            section.fullText.toLowerCase().includes(query);
          if ((!activeFilter || activeFilter === file.slug) && (search.trim() === "" || matches)) {
            displayCards.push({ type: "section", file, section, idx });
          }
        });
      }
    });
  }

  const handleSaveDoc = async () => {
    if (mode === "new" && !newDocTitle.trim()) return alert("Enter a filename.");
    if (mode === "append" && !selectedFile) return alert("Select a file to append.");
    if (!newDocContent.trim()) return alert("Content cannot be empty.");

    try {
      const filename = mode === "new" ? newDocTitle.trim() : selectedFile;
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, content: newDocContent, mode }),
      });
      const result = await res.json();
      if (result.success) {
        alert("Documentation saved!");
        setAddDocOpen(false);
        setNewDocTitle("");
        setNewDocContent("");
        setSelectedFile("");

        const refresh = await fetch("/api/listDocs");
        const data = await refresh.json();
        if (data.success) setMdFiles(data.files);
      } else alert(result.error || "Failed to save");
    } catch (err) {
      console.error(err);
      alert("Error saving documentation");
    }
  };




  return (
    <div className="min-h-screen relative bg-black p-8 text-white">
   
  
  <Header
  setMenuOpen={setMenuOpen}
  openAddDoc={() => setAddDocOpen(true)}
/>

      {/* SOFTWARE SECTION */}
        
          {/* Add Documentation Modal */}
          <AnimatePresence>
            {addDocOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-gray-900 p-6 rounded-2xl w-full max-w-3xl text-white relative"
                >
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                    onClick={() => setAddDocOpen(false)}
                  >
                    ✕
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Add Documentation</h2>

                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setShowHowTo(false)}
                      className={`px-4 py-2 rounded-lg font-medium ${!showHowTo ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
                    >
                      Write Documentation
                    </button>
                    <button
                      onClick={() => setShowHowTo(true)}
                      className={`px-4 py-2 rounded-lg font-medium ${showHowTo ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
                    >
                      How to Write Documentation
                    </button>
                  </div>

                  {showHowTo ? (
                    <div className="max-h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{howToInstructions || "Loading instructions..."}</ReactMarkdown>
                    </div>
                  ) : (
                    <form className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input type="radio" value="new" checked={mode === "new"} onChange={() => setMode("new")} />
                          Create new file
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" value="append" checked={mode === "append"} onChange={() => setMode("append")} />
                          Add to existing file
                        </label>
                      </div>

                      {mode === "new" ? (
                        <input
                          type="text"
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                          placeholder="Enter new document filename..."
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none"
                        />
                      ) : (
                        <select
                          value={selectedFile}
                          onChange={(e) => setSelectedFile(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none"
                        >
                          <option value="">Select file to append</option>
                          {mdFiles.map((f) => (
                            <option key={f.path} value={f.slug}>
                              {f.name}
                            </option>

                          ))}
                        </select>
                      )}

                      <textarea
                        value={newDocContent}
                        onChange={(e) => setNewDocContent(e.target.value)}
                        placeholder="Write your documentation in markdown..."
                        rows={12}
                        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none font-mono"
                      />
                      <button type="button" onClick={handleSaveDoc} className="self-end px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
                        Save
                      </button>
                    </form>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

   <Sidebar
  mdFiles={mdFiles}
  sections={sections}
  menuOpen={menuOpen}
  setMenuOpen={setMenuOpen}
  openDropdown={openDropdown}
  setOpenDropdown={setOpenDropdown}
  setActiveFilter={setActiveFilter}
  setExpandedFiles={setExpandedFiles}
  setExpandedSections={setExpandedSections}
  sidebarRef={sidebarRef}
/>

{/* Filters & Results */}
<div className="w-full max-w-full mx-auto mt-6">
  <input
  type="text"
  placeholder="Search documentation..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
  {/* Filters */}
  <div className="flex border-gray-700">
    {mdFiles.map((file) => (
      <button
        key={file.slug}
        onClick={() => setActiveFilter(activeFilter === file.slug ? null : file.slug)}
        className={`px-3 py-1 border rounded-lg mr-2 mb-2 text-sm ${
          activeFilter === file.slug ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 border-gray-700"
        }`}
      >
        {file.name}
      </button>
    ))}
  </div>
<MarkdownViewer
  sections={sections}
  expandedFiles={expandedFiles}
  expandedSections={expandedSections}
  search={search}
  markdownComponents={markdownComponents}
  displayCards={displayCards}
  setExpandedSections={setExpandedSections}
  setExpandedFiles={setExpandedFiles}
/>

</div>
  
    </div>
  );
}
