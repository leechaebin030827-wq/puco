"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "/generate", label: "행동 생성" },
  { href: "/examples", label: "예시 사례" },
  { href: "/about", label: "구조 소개" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200/60"
      style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-zinc-900 tracking-tight">
            PUCO <span className="text-brand-500 font-normal">Behavior</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-zinc-100 text-zinc-950"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="ml-3 btn-primary text-sm py-2 px-4">
            Studio 로그인
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-zinc-500 hover:text-zinc-900"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-200/60 bg-white/95 px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}
            className="block mt-3 btn-primary text-sm py-2.5 text-center">
            Studio 로그인
          </Link>
        </div>
      )}
    </header>
  );
}
