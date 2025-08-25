import Link from "next/link";

export default function OdysseyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-navy-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Odyssey</h1>
        <div className="space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="NARASK/page.tsx" className="hover:underline">
            NARASK
          </Link>
          <Link href="NARPIT/page.tsx" className="hover:underline">
            NARPIT
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center">
        <h2 className="text-4xl font-bold text-gray-800">Welcome to Odyssey</h2>
      </main>
    </div>
  );
}
