"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Zap, LayoutDashboard, Camera, Radio, Mic, GitBranch,
  Brain, Target, ScrollText, Shield, Layers, Move3d,
  Projector, Volume2, Music, Puzzle, AlertOctagon,
  Eye, RotateCcw, BookOpen, History, Settings, LogOut,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "개요",
    items: [{ href: "/studio", label: "대시보드", icon: LayoutDashboard }],
  },
  {
    label: "Perception",
    items: [
      { href: "/studio/capabilities", label: "Capabilities", icon: Zap },
      { href: "/studio/perceptions", label: "Perceptions", icon: Camera },
      { href: "/studio/fusions", label: "Sensor Fusion", icon: GitBranch },
    ],
  },
  {
    label: "Understanding",
    items: [
      { href: "/studio/contexts", label: "Context States", icon: Brain },
      { href: "/studio/interpretations", label: "Interpretations", icon: ScrollText },
      { href: "/studio/intents", label: "Intents", icon: Target },
      { href: "/studio/policies", label: "Behavior Policies", icon: Layers },
    ],
  },
  {
    label: "Expression",
    items: [
      { href: "/studio/joints", label: "Joints & Poses", icon: Move3d },
      { href: "/studio/motions", label: "Motion Primitives", icon: Move3d },
      { href: "/studio/projections", label: "Projections", icon: Projector },
      { href: "/studio/sounds", label: "Sounds", icon: Volume2 },
      { href: "/studio/compositions", label: "Compositions", icon: Music },
    ],
  },
  {
    label: "Rules",
    items: [
      { href: "/studio/constraints", label: "Constraints", icon: AlertOctagon },
      { href: "/studio/monitoring", label: "Monitoring", icon: Eye },
      { href: "/studio/recovery", label: "Recovery", icon: RotateCcw },
      { href: "/studio/rules", label: "Behavior Rules", icon: Puzzle },
    ],
  },
  {
    label: "Cases",
    items: [{ href: "/studio/cases", label: "Behavior Cases", icon: BookOpen }],
  },
  {
    label: "시스템",
    items: [
      { href: "/studio/history", label: "수정 이력", icon: History },
      { href: "/studio/settings", label: "설정", icon: Settings },
    ],
  },
];

function NavGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const isActive = group.items.some((item) => pathname.startsWith(item.href) && item.href !== "/studio" || pathname === item.href);
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
      >
        {group.label}
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const active = item.href === "/studio" ? pathname === "/studio" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-brand-600/20 text-brand-300 border border-brand-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudioSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="studio-sidebar w-60 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">PUCO</p>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Studio</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.label} group={group} pathname={pathname} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
