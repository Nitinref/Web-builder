"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ChevronRight, Plus, Paperclip, Settings, ArrowUp, FolderOpen, Zap, Eye, Brain, FileCode, RefreshCw, Menu, X } from "lucide-react"; // Added Menu, X
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/spotlight";
import { WobbleCard } from "@/components/ui/wobble-card";
import { NoiseBackground } from "@/components/ui/noise-background";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";

const GRADIENT_BORDER = {
  background: "linear-gradient(#0a0a0a, #0a0a0a) padding-box, linear-gradient(135deg, rgb(99,220,180), rgb(80,120,255), rgb(200,60,255), rgb(255,80,120)) border-box",
  border: "1.5px solid transparent",
};

function useReveal() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={cn("transition-all duration-700 ease-out", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function HeroInput() {
  const [msg, setMsg] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const router = useRouter();
  const { token } = useAuthStore();

  function handleGo() {
    if (!msg.trim()) return;
    sessionStorage.setItem("forge_initial_prompt", msg.trim());
    router.push("/signup");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGo(); }
  }

  const canGo = !!msg.trim();

  return (
    <div className="w-full max-w-2xl mx-auto px-4"> {/* Added px-4 for mobile */}

      {/* Input box */}
      <div className="relative rounded-sm p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
        <div className="relative bg-[#0a0a0a] rounded-sm overflow-hidden">
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            rows={3}
            className="w-full bg-transparent border-none outline-none px-4 sm:px-5 pt-5 pb-2 text-white font-mono text-[14px] leading-relaxed resize-none placeholder:text-white/30 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 pb-4 pt-1 border-t border-white/10">
            <button className="w-8 h-8 rounded-sm border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors bg-transparent">
              <Plus size={15} />
            </button>
            <button className="w-8 h-8 rounded-sm flex items-center justify-center text-white/50 hover:text-white transition-colors bg-transparent border-none">
              <Paperclip size={14} />
            </button>
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-sm border border-white/20 bg-transparent text-white/70 font-mono text-[10px] sm:text-[11px] cursor-pointer hover:border-white/40 hover:text-white transition-all select-none tracking-wide">
              Models <ChevronRight size={11} className="opacity-70" />
            </div>
            <div className="flex-1" />
            <button className="w-8 h-8 rounded-sm flex items-center justify-center text-white/50 hover:text-white transition-colors bg-transparent border-none">
              <Settings size={14} />
            </button>
            <button
              onClick={handleGo}
              className={cn(
                "w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-150 border",
                canGo
                  ? "bg-white text-black cursor-pointer hover:bg-white/90 hover:scale-105 active:scale-95 border-white"
                  : "bg-transparent text-white/30 border-white/20 cursor-default"
              )}
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Banner - mobile optimized */}
      {showBanner && (
        <div className="mt-4 px-3 sm:px-4 py-3 rounded-sm border border-white/20 bg-[#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="px-2 py-0.5 rounded-sm bg-white text-black font-mono text-[10px] font-bold tracking-widest uppercase shrink-0">NEW</span>
            <span className="font-mono text-[11px] sm:text-[12px] text-white/60 truncate">Advanced AI on Browser, CLI, Phone...</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button onClick={() => setShowBanner(false)} className="font-mono text-[10px] sm:text-[11px] text-white/40 hover:text-white/70 transition-colors bg-transparent border-none cursor-pointer px-2">Close</button>
            <Link href="/signup" className="px-3 py-1.5 rounded-sm bg-white text-black font-mono text-[10px] sm:text-[11px] font-bold tracking-wide hover:bg-white/90 transition-colors no-underline whitespace-nowrap">Explore</Link>
          </div>
        </div>
      )}

      {/* Bottom text */}
      <p className="text-center font-mono text-[10px] sm:text-[11px] text-white/30 mt-4 px-4">
        Get access to the best AI Agent. +30M users choose WEB BUILDER.{" "}
        <Link href="/signup" className="text-white/60 hover:text-white transition-colors no-underline underline underline-offset-2">Upgrade plan</Link>
      </p>

      {/* CTA buttons - stacked on mobile */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
        <Link
          href="/signup"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-white text-black font-bold font-mono text-[12px] tracking-widest uppercase no-underline hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
        >
          Explore Now <ArrowUp size={13} className="rotate-45" />
        </Link>
        <a
          href="https://github.com/Nitinref/seezer.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm font-mono text-[12px] tracking-widest uppercase text-white/70 hover:text-white no-underline hover:-translate-y-0.5 transition-all border border-white/20 bg-transparent hover:border-white/40"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Star on GitHub
        </a>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Eye, title: "Instant Preview", desc: "Live sandbox URL with every build. See changes in real-time without leaving the chat.", tag: "Live", gradientColors: ["rgb(99,220,180)", "rgb(50,150,255)", "rgb(120,80,255)"], span: "col-span-1 sm:col-span-2" },
  { icon: Brain, title: "Multi-Model AI", desc: "Switch between GPT-4o and Gemini 2.0 Flash in one click.", tag: "AI", gradientColors: ["rgb(255,100,180)", "rgb(200,60,255)", "rgb(100,60,200)"], span: "col-span-1" },
  { icon: FileCode, title: "Full Code Access", desc: "Browse, copy, and download every generated file. Your code, your ownership.", tag: "Files", gradientColors: ["rgb(255,160,50)", "rgb(255,80,80)", "rgb(200,50,120)"], span: "col-span-1" },
  { icon: RefreshCw, title: "Iterative Builds", desc: "Chat to refine your app. FORGE never starts from scratch — always builds on context.", tag: "Chat", gradientColors: ["rgb(60,200,255)", "rgb(80,120,255)", "rgb(160,60,255)"], span: "col-span-1 sm:col-span-2" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono overflow-x-hidden"> {/* Added overflow-x-hidden */}

      {/* Corner brackets - hidden on mobile */}
      <span className="hidden sm:block pointer-events-none fixed top-0 left-0 z-[60] w-3 h-3 border-t-2 border-l-2 border-white/20" />
      <span className="hidden sm:block pointer-events-none fixed top-0 right-0 z-[60] w-3 h-3 border-t-2 border-r-2 border-white/20" />
      <span className="hidden sm:block pointer-events-none fixed bottom-0 left-0 z-[60] w-3 h-3 border-b-2 border-l-2 border-white/20" />
      <span className="hidden sm:block pointer-events-none fixed bottom-0 right-0 z-[60] w-3 h-3 border-b-2 border-r-2 border-white/20" />

      {/* MOBILE-OPTIMIZED NAV */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-8 md:px-16 transition-all duration-500", // Responsive padding
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]" : "bg-transparent border-b border-transparent"
      )}>
        <span className="font-bold text-[12px] sm:text-[14px] tracking-[0.25em] uppercase text-white">SEEZER.AI</span>

        {/* Desktop menu - hidden on mobile */}
        <div className="hidden md:flex items-center gap-10">
          {["Pricing", "Product", "Docs"].map(l => (
            <a key={l} href="#" className="relative text-white/50 text-[13px] tracking-wide transition-colors duration-300 hover:text-white group">
              {l}
              <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          {token && (
            <Link href="/dashboard" className="relative flex items-center gap-1.5 text-white/50 text-[13px] tracking-wide transition-colors duration-300 hover:text-white group no-underline">
              <FolderOpen size={14} /> My Projects
              <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          )}
        </div>

        {/* Desktop auth buttons - hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <>
              <div className="px-3 py-1.5 rounded-md border border-white/10 bg-white/[0.05] text-[12px] text-white/50 backdrop-blur-md">
                {user?.email}<span className="text-white/70"> · 0 tokens</span>
              </div>
              <Link href="/dashboard" className="px-5 py-2 rounded-md bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-all no-underline">Dashboard</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 rounded-md border border-white/15 text-white/50 text-[13px] hover:text-white hover:border-white/30 transition-all no-underline">Sign In</Link>
              <Link href="/signup" className="px-5 py-2 rounded-md bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-all no-underline">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-8 h-8 rounded-sm border border-white/20 flex items-center justify-center text-white/70"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-[#0f0f0f] border-b border-white/10 p-4 md:hidden">
          <div className="flex flex-col gap-4">
            {["Pricing", "Product", "Docs"].map(l => (
              <a key={l} href="#" className="text-white/70 text-[13px] tracking-wide py-2 border-b border-white/5">{l}</a>
            ))}
            {token ? (
              <>
                <div className="text-white/50 text-[12px] py-2 border-b border-white/5">{user?.email} · 0 tokens</div>
                <Link href="/dashboard" className="text-white/70 text-[13px] tracking-wide py-2">Dashboard</Link>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" className="px-4 py-3 rounded-sm border border-white/20 text-white/70 text-[13px] text-center">Sign In</Link>
                <Link href="/signup" className="px-4 py-3 rounded-sm bg-white text-black text-[13px] font-semibold text-center">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-16 text-center relative">
        <Spotlight className="-top-20 left-1/2 -translate-x-1/2" fill="white" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a0a]/40 via-transparent to-[#0a0a0a] pointer-events-none" />

        {/* Badge */}
        <div className="relative z-10 flex justify-center mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <button
            onClick={() => router.push(token ? "/dashboard" : "/signup")}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-sm border border-white/10 bg-white/[0.04] font-mono text-[10px] sm:text-[11px] text-white/50 hover:bg-white/[0.07] hover:text-white/75 transition-all cursor-pointer tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block animate-pulse" />
            New — Try AI Agents
            <ChevronRight size={11} className="opacity-50" />
          </button>
        </div>

        {/* Title */}
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <h1 className="font-black text-white leading-none tracking-[-0.04em] uppercase mb-6 px-4" style={{ fontSize: "clamp(32px,10vw,80px)" }}>
            Launch your website
            <br />
            <span className="text-white/40">in hours, not days</span>
          </h1>
          <p className="max-w-xl mx-auto font-mono text-[12px] sm:text-[13px] text-white/35 leading-relaxed mb-10 px-4">
            With AI, you can launch your website in hours, not days. Try our best in class,
            state of the art, cutting edge AI tools to get your website up and running.
          </p>
        </div>

        {/* Input */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 relative z-10 w-full">
          <HeroInput />
        </div>
      </section>

      {/* Rest of the sections - add responsive padding */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] overflow-hidden">
        {/* ... features section (same content, just responsive padding) ... */}
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-12 text-center border-t border-white/[0.06]">
        {/* ... CTA section (same content) ... */}
      </section>

      <section className="relative py-16 sm:py-28 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] overflow-hidden">
        {/* ... wobble cards section (same content) ... */}
      </section>

      <footer className="px-4 sm:px-12 py-12 sm:py-20 border-t border-white/[0.06] flex flex-col items-center justify-center gap-8">
        <div className="w-full max-w-5xl h-20 sm:h-40">
          <TextHoverEffect
            text="SEEZER.AI"
            duration={1}
          />
        </div>
        <span className="font-mono text-[11px] sm:text-[13px] text-white/40 tracking-widest text-center px-4">2026 — Build anything with AI</span>
      </footer>
    </div>
  );
}