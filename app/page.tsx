"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function OdysseyPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleScroll() {
      if (!heroRef.current || !containerRef.current) return;

      const heroTop = heroRef.current.offsetTop;
      const heroHeight = heroRef.current.offsetHeight;
      const scrollTop = containerRef.current.scrollTop;

      // progress = 0 at hero start, 1 when fully scrolled past
      const progress = Math.min(
        Math.max((scrollTop - heroTop) / heroHeight, 0),
        1
      );

      setScrollProgress(progress);
    }

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // run once
    }

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory"
    >
      {/* Fixed nav */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-black bg-opacity-50 z-50">
        <div className="text-white text-2xl font-bold">ODYSSEY</div>
        <nav className="flex gap-4 text-white">
          <Link href="/NARASK">NARASK</Link>
          <Link href="/NARPIT">NARPIT</Link>
          <Link href="/nartech">NARTECH</Link>
          <a
            href="https://manta-scouting-neptune.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            STRAT
          </a>
        </nav>
      </div>

{/* Hero */}
<section
  ref={heroRef}
  className="relative flex flex-col justify-center items-center h-screen w-full snap-start overflow-hidden"
>
  {/* Wave background */}
  <div
    className="absolute bottom-0 left-0 w-full h-[175%] z-20" // higher than text
    style={{
      transform: `translateY(${450 - scrollProgress * 400}px)`, // rises higher
      willChange: "transform",
    }}
  >
    <Image
      src="/wave.jpg"
      alt="Wave background"
      fill
      priority
      className="object-cover"
    />
  </div>

  {/* Foreground tex */}
  <div
    className="relative z-10 flex flex-col items-center justify-center text-center text-white transition-opacity"
    style={{
      opacity: 1 - scrollProgress * 0.6, // fades slower
    }}
  >
    <h1 className="text-8xl tracking-widest">ODYSSEY</h1>
    <div className="flex ml-4 text-4xl tracking-widest text-white/80">
      <p>31</p>
      <p className="ml-2">28</p>
    </div>
  </div>

  <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent"></div>
</section>

      {/* Project menu */}
      <section id="project_menu" className="flex w-full h-screen snap-start">
        <Link href="/NARASK" className="project_item bg-[#08173a]">
          <p className="num">3</p>
          <h4>NARASK</h4>
        </Link>
        <Link href="/NARPIT" className="project_item bg-[#081e51]">
          <p className="num">1</p>
          <h4>NARPIT</h4>
        </Link>
        <Link href="/nartech" className="project_item bg-[#1e305b]">
          <p className="num">2</p>
          <h4>NARTECH</h4>
        </Link>
        <a
          href="https://manta-scouting-neptune.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="project_item bg-[#18316b]"
        >
          <p className="num">8</p>
          <h4>Strat</h4>
        </a>
      </section>
    </div>
  );
}
