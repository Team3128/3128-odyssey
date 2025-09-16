"use client";

import { useEffect, useState, useRef } from "react";
import { Menu, ChevronDown, ChevronRight, Copy, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const mdFiles: MdFile[] = [
  { name: "Common", slug: "common", path: "/md_files/common.md" },
  { name: "Practicals", slug: "practicals", path: "/md_files/practicals.md" },
  { name: "Github", slug: "github", path: "/md_files/github.md" },
  { name: "Other", slug: "other", path: "/md_files/other.md" },
];
const howToFile = { name: "How To Add Docs", slug: "howto", path: "/md_files/howto.md" };

export default function NaraskPage() {
  const [search, setSearch] = useState("");
  const [sections, setSections] = useState<SectionsMap>({});
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

  // Load markdown files
  useEffect(() => {
    async function loadFiles() {
      const sectionMap: SectionsMap = {};
      for (const file of mdFiles) {
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
      }
      setSections(sectionMap);
    }
    loadFiles();
  }, []);

  // Load howto.md dynamically
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

  // Close sidebar when clicking outside
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
    h1: (props: any) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
    p: (props: any) => <p className="mb-3 text-gray-200 leading-relaxed" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
    li: (props: any) => <li className="ml-4" {...props} />,
    code: ({ className, children, ...props }: any) => {
      const isBlock = className?.includes("language-") || String(children).includes("\n");
      if (isBlock) {
        return (
          <div className="relative my-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(String(children).trim());
              }}
              className="absolute top-2 right-2 px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
            >
              <Copy size={14} />
            </button>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
              <code {...props} className={className}>
                {children}
              </code>
            </pre>
          </div>
        );
      }
      return (
        <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    },
  };

  // Build display cards
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
    if (mode === "new" && !newDocTitle.trim()) {
      alert("Enter a filename for the new document.");
      return;
    }
    if (mode === "append" && !selectedFile) {
      alert("Select a file to append.");
      return;
    }
    if (!newDocContent.trim()) {
      alert("Documentation content cannot be empty.");
      return;
    }

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
      } else {
        alert(result.error || "Failed to save documentation");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving documentation");
    }
  };


  
  return (
    <div className="min-h-screen relative bg-black p-8 text-white">
      {/* Header */}
      <header className="flex flex-col items-center gap-6 mb-8 relative">
        <button onClick={() => setMenuOpen(!menuOpen)} className="absolute left-0 top-0 p-2">
          <Menu className="w-7 h-7" />
        </button>
        <h1 className="text-4xl font-bold text-center">NARASK</h1>

        {/* Add Documentation Button */}
        <button
          onClick={() => setAddDocOpen(true)}
          className="absolute right-0 top-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg transition"
        >
          <Plus size={18} /> Add Documentation
        </button>

        {/* Search */}
        <div className="w-full max-w-3xl relative group">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 8px 2px rgba(59,130,246,0.35)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="relative border rounded-full border-gray-700 px-4 py-2 w-full text-white bg-black 
             focus:outline-none focus:ring-0 
             group-hover:shadow-[0_0_16px_5px_rgba(59,130,246,0.6)]
             transition-all duration-300"
          />
        </div>
      </header>

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
                  className={`px-4 py-2 rounded-lg font-medium ${
                    !showHowTo ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                  }`}
                >
                  Write Documentation
                </button>
                <button
                  onClick={() => setShowHowTo(true)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    showHowTo ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                  }`}
                >
                  How to Write Documentation
                </button>
              </div>

              {showHowTo ? (
                <div className="max-h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {howToInstructions || "Loading instructions..."}
                  </ReactMarkdown>
                </div>
              ) : (
                <form className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="new"
                        checked={mode === "new"}
                        onChange={() => setMode("new")}
                      />
                      Create new file
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="append"
                        checked={mode === "append"}
                        onChange={() => setMode("append")}
                      />
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
                        <option key={f.slug} value={f.slug}>
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
                  <button
                    type="button"
                    onClick={handleSaveDoc}
                    className="self-end px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
                  >
                    Save
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 bg-black p-6 transform transition-transform duration-500 ease-in-out z-50 overflow-y-auto ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Sections</h3>
        {mdFiles.map((file) => (
          <div key={file.slug} className="mb-4">
            <button
              className="flex items-center justify-between w-full text-left font-semibold py-2 hover:text-blue-400"
              onClick={() => setOpenDropdown(openDropdown === file.slug ? null : file.slug)}
            >
              {file.name}
              {openDropdown === file.slug ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {openDropdown === file.slug && sections[file.slug] && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pl-4 mt-2 space-y-2 text-gray-300"
                >
                  {sections[file.slug].map((sec, idx) => (
                    <li
                      key={idx}
                      className="cursor-pointer hover:text-blue-400"
                      onClick={() => {
                        setExpandedFiles((prev) => {
                          const newSet = new Set(prev);
                          newSet.add(file.slug);
                          return newSet;
                        });

                        const sectionId = `${file.slug}-section-${idx}`;
                        setExpandedSections((prev) => {
                          const newSet = new Set(prev);
                          newSet.add(sectionId);
                          return newSet;
                        });

                        setTimeout(() => {
                          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 300);
                      }}
                    >
                      {sec.heading}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
      </aside>

      {/* Filters and Results */}
      <div className="w-full max-w-full mx-auto mt-6">
        <div className="flex border-gray-700">
          {mdFiles.map((file) => (
            <button
              key={file.slug}
              onClick={() => setActiveFilter(activeFilter === file.slug ? null : file.slug)}
              className={`px-6 py-2 rounded-t-lg font-medium transition-colors
                ${
                  activeFilter === file.slug
                    ? "bg-gray-900 text-blue-400 border-x border-t border-gray-700 -mb-px"
                    : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {file.name}
            </button>
          ))}
          <button
            onClick={() => setActiveFilter(null)}
            className={`ml-auto px-6 py-2 rounded-t-lg font-medium transition-colors
              ${
                activeFilter === null
                  ? "bg-gray-900 text-blue-400 border-x border-t border-gray-700 -mb-px"
                  : "text-gray-400 hover:text-gray-200"
              }`}
          >
            All
          </button>
        </div>

        {/* Results Box */}
        <div className="border border-gray-700 rounded-b-lg rounded-tr-lg bg-gray-900 p-6">
          {displayCards.length > 0 ? (
            <div className="flex flex-col gap-6">
              {displayCards.map((item) => {
                if (item.type === "file") {
                  const fileId = item.file.slug;
                  const fileOpen = expandedFiles.has(fileId);

                  return (
                    <motion.div
                      key={fileId}
                      id={fileId}
                      className="border rounded-lg shadow bg-gray-800 cursor-pointer hover:shadow-[0_0_30px_10px_rgba(59,130,246,0.4)] transition-all duration-300"
                      onClick={() => {
                        const newSet = new Set(expandedFiles);
                        if (fileOpen) newSet.delete(fileId);
                        else newSet.add(fileId);
                        setExpandedFiles(newSet);
                      }}
                    >
                      <div className="p-6 relative">
                        <h2 className="text-2xl font-semibold mb-2">{item.file.name}</h2>
                        <motion.div
                          className="absolute top-4 right-4 text-gray-400"
                          animate={{ rotate: fileOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>

                        {fileOpen ? (
                          <div className="flex flex-col gap-4">
                            {sections[item.file.slug]?.map((section, idx) => {
                              const sectionId = `${item.file.slug}-section-${idx}`;
                              const sectionOpen = expandedSections.has(sectionId);

                              return (
                                <motion.div
                                  key={sectionId}
                                  id={sectionId}
                                  className="border border-gray-700 p-4 rounded-lg bg-gray-700 cursor-pointer hover:shadow-[0_0_10px_2px_rgba(59,130,246,0.4)] transition-all duration-300 relative"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newSet = new Set(expandedSections);
                                    if (sectionOpen) newSet.delete(sectionId);
                                    else newSet.add(sectionId);
                                    setExpandedSections(newSet);
                                  }}
                                >
                                  <h3 className="text-xl font-semibold mb-2">{section.heading}</h3>
                                  <motion.div
                                    className="absolute top-4 right-4 text-gray-400"
                                    animate={{ rotate: sectionOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown className="w-5 h-5" />
                                  </motion.div>
                                  <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-200 prose-li:text-gray-200">
                                    {sectionOpen ? (
                                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                        {section.fullText}
                                      </ReactMarkdown>
                                    ) : (
                                      <p className="text-gray-300">{section.preview}...</p>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-400">
                            Click to view {sections[item.file.slug]?.length || 0} sections
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                } else {
                  const sectionId = `${item.file.slug}-${item.idx}`;
                  const sectionOpen = expandedSections.has(sectionId);
                  return (
                    <motion.div
                      key={sectionId}
                      id={sectionId}
                      className="border rounded-lg shadow bg-gray-800 cursor-pointer hover:shadow-[0_0_7px_3px_rgba(59,130,246,0.4)] transition-all duration-300"
                      onClick={() => {
                        const newSet = new Set(expandedSections);
                        if (sectionOpen) newSet.delete(sectionId);
                        else newSet.add(sectionId);
                        setExpandedSections(newSet);
                      }}
                    >
                      <div className="p-6 relative">
                        <h2 className="text-2xl font-semibold mb-2">{item.section?.heading}</h2>
                        <motion.div
                          className="absolute top-4 right-4 text-gray-400"
                          animate={{ rotate: sectionOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                        <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-200 prose-li:text-gray-200">
                          {sectionOpen ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                              {item.section?.fullText || ""}
                            </ReactMarkdown>
                          ) : (
                            <p>{item.section?.preview}...</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </div>
          ) : (
            <p className="text-gray-500">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
