"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function OdysseyPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    let phaseT = 0;
    let phase: "crash" | "settle" | "done" = "crash";

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    function drawWave(
      yBase: number,
      amplitude: number,
      freq: number,
      offset: number,
      color: string,
      alpha: number
    ) {
      if (!canvas || !ctx) return;

      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      for (let x = 0; x <= canvas.width; x += 2) {
        const y =
          yBase +
          Math.sin(x * freq + offset + t * 3) * amplitude +
          Math.sin(x * freq * 2.3 + offset + 1.2 + t * 2) *
            amplitude *
            0.5;

        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function animate() {
      if (!canvas || !ctx) return;

      // faster motion
      t += 0.04;
      phaseT += 0.04;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const h = canvas.height;

      // text height reference (where wave crosses)
      const textY = h * 0.35;

      const startY = -150; // ABOVE screen (important for "wash down")
      const endY = h * 0.7;

      let yBase1: number, yBase2: number, amp1: number, amp2: number;

      if (phase === "crash") {
        const progress = Math.min(phaseT / 1.8, 1);

        const ease = 1 - Math.pow(1 - progress, 4);

        // waves descend from above → through text → below
        yBase1 = startY + (endY - startY) * ease;
        yBase2 = startY + 40 + (endY + 40 - (startY + 40)) * ease;

        // strong aggressive waves during impact
        amp1 = 60 + (1 - ease) * 30;
        amp2 = 45 + (1 - ease) * 20;

        if (progress >= 1) {
          phase = "settle";
          phaseT = 0;
        }
      } else if (phase === "settle") {
        const progress = Math.min(phaseT / 1.6, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        yBase1 = endY - 20 + ease * 10;
        yBase2 = endY + 20 + ease * 10;

        amp1 = 25 - 10 * ease;
        amp2 = 18 - 8 * ease;

        if (progress >= 1) phase = "done";
      } else {
        yBase1 = endY - 10;
        yBase2 = endY + 10;
        amp1 = 15;
        amp2 = 12;
      }

      // waves (stacked depth)
      drawWave(yBase2, amp2, 0.015, 0.8, "rgb(9, 39, 113)", 0.85);
      drawWave(yBase1, amp1, 0.012, 0, "rgb(10, 46, 117)", 1);
      drawWave(yBase1 - 14, amp1 * 0.55, 0.018, 2.1, "rgb(42, 84, 135)", 0.5);

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (!heroRef.current || !containerRef.current) return;

      const heroTop = heroRef.current.offsetTop;
      const heroHeight = heroRef.current.offsetHeight;
      const scrollTop = containerRef.current.scrollTop;

      const progress = Math.min(
        Math.max((scrollTop - heroTop) / heroHeight, 0),
        1
      );

      setScrollProgress(progress);
    }

    const container = containerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
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
      {/* NAV */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-black/50 z-50">
        <div className="text-white text-2xl font-bold">ODYSSEY</div>
        <nav className="flex gap-4 text-white">
          <Link href="/narask">NARASK</Link>
          <Link href="/narpit">NARPIT</Link>
          <Link href="/nartech">NARTECH</Link>
          <Link
            href="https://manta-scouting-neptune.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            STRAT
          </Link>
        </nav>
      </div>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative flex flex-col justify-center items-center h-screen w-full snap-start overflow-hidden"
      >
        {/* TEXT (above initially, gets submerged visually) */}
        <div
          className="relative z-30 flex flex-col items-center justify-center text-center text-white"
          style={{
            opacity: 1 - scrollProgress * 0.7,
            transform: `translateY(${scrollProgress * 20}px)`,
          }}
        >
          <h1 className="text-8xl tracking-widest">ODYSSEY</h1>
          <div className="flex ml-4 text-4xl tracking-widest text-white/80">
            <p>31</p>
            <p className="ml-2">28</p>
          </div>
        </div>

        {/* WAVES (now animate OVER text during crash) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-40 pointer-events-none"
        />

        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent z-50" />
      </section>

      {/* PROJECT MENU */}
      <section id="project_menu" className="flex w-full h-screen snap-start">
        <Link href="/narask" className="project_item bg-[#08173a]">
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