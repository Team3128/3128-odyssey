"use client";

import { Menu, Plus } from "lucide-react";

type HeaderProps = {
  setMenuOpen: (open: boolean) => void;
  openAddDoc: () => void;
};

export default function Header({
  setMenuOpen,
  openAddDoc,
}: HeaderProps) {
  return (
    <header className="relative flex items-center justify-center p-6">
      {/* Menu Button */}
      <button
        onClick={() => setMenuOpen(true)}
        className="absolute left-4 top-4 p-2 text-white"
      >
        <Menu size={24} />
      </button>

      {/* Title */}
      <h1 className="text-4xl font-bold">
        NARASK
      </h1>

      {/* Add Button */}
      <button
        onClick={openAddDoc}
        className="
          absolute right-4 top-4
          flex items-center justify-center
          rounded-full
          bg-blue-600
          p-3
          text-white
          shadow-lg
          transition
          hover:bg-blue-500
        "
      >
        <Plus size={22} />
      </button>
    </header>
  );
}