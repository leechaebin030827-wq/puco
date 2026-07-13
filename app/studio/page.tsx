import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Database, FileText, Globe, AlertTriangle, Clock, Plus } from "lucide-react";

const TABLES = [
  "capabilities", "perceptions", "sensor_fusion_rules", "context_states",
  "interpretations", "intents", "behavior_policies", "joints_and_poses",
  "motion_primitives", "projection_primitives", "sound_primitives",
  "multimodal_compositions", "constraints", "monitoring_rules",
  "recovery_rules", "behavior_rules", "behavior_cases",
];

const TABLE_LABELS: Record<string, string> = {
  capabilities: "Capabilities", perceptions: "Perceptions",
  sensor_fusion_rules: "Sensor Fusion", context_states: "Context States",
  interpretations: "Interpretations", intents: "Intents",
  behavior_policies: "Policies", joints_and_poses: "Joints & Poses",
  motion_primitives: "Motions", projection_primitives: "Projections",
  sound_primitives: "Sounds", multimodal_compositions: "Compositions",
  constraints: "Constraints", monitoring_rules: "Monitoring",
  recovery_rules: "Recovery", behavior_rules: "Behavior Rules",
  behavior_cases: "Cases",
};

const ROUTE_MAP: Record<string, string> = {
  capabilities: "/studio/capabilities", perceptions: "/studio/perceptions",
  sensor_fusion_rules: "/studio/fusions", context_states: "/studio/contexts",
  interpretations: "/studio/interpretations", intents: "/studio/intents",
  behavior_policies: "/studio/policies", joints_and_poses: "/studio/joints",
  motion_primitives: "/studio/motions", projection_primitives: "/studio/projections",
  sound_primitives: "/studio/sounds", multimodal_compositions: "/studio/compositions",
  constraints: "/studio/constraints", monitoring_rules: "/studio/monitoring",
  recovery_rules: "/studio/recovery", behavior_rules: "/studio/rules",
  behavior_cases: "/studio/cases",
};

async function getStats() {
  try {
    const supabase = await createClient();
    const stats: Record<string, { total: number; draft: number; published: number; deprecated: number }> = {};

    await Promise.all(
      TABLES.map(async (table) => {
        const { data } = await supabase
          .from(table)
          .select("status")
          .is("deleted_at", null);

        if (data) {
          stats[table] = {
            total: data.length,
            draft: data.filter((r) => r.status === "draft").length,
            published: data.filter((r) => r.status === "published").length,
            deprecated: data.filter((r) => r.status === "deprecated").length,
          };
        } else {
          stats[table] = { total: 0, draft: 0, published: 0, deprecated: 0 };
        }
      })
    );

    const totals = Object.values(stats).reduce(
      (acc, s) => ({
        total: acc.total + s.total,
        draft: acc.draft + s.draft,
        published: acc.published + s.published,
        deprecated: acc.deprecated + s.deprecated,
      }),
      { total: 0, draft: 0, published: 0, deprecated: 0 }
    );

    return { stats, totals };
  } catch {
    return {
      stats: {} as Record<string, { total: number; draft: number; published: number; deprecated: number }>,
      totals: { total: 0, draft: 0, published: 0, deprecated: 0 },
    };
  }
}

export default async function StudioPage() {
  await requireAdmin();
  const { stats, totals } = await getStats();

  const STAT_CARDS = [
    { label: "전체 항목", value: totals.total, icon: Database, color: "from-brand-600/30 to-brand-800/30", border: "border-brand-500/20" },
    { label: "초안 (Draft)", value: totals.draft, icon: FileText, color: "from-indigo-600/30 to-indigo-800/30", border: "border-indigo-500/20" },
    { label: "발행됨 (Published)", value: totals.published, icon: Globe, color: "from-emerald-600/30 to-emerald-800/30", border: "border-emerald-500/20" },
    { label: "지원 종료 (Deprecated)", value: totals.deprecated, icon: AlertTriangle, color: "from-slate-600/30 to-slate-800/30", border: "border-slate-500/20" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">대시보드</h1>
        <p className="text-slate-500 text-sm mt-1">PUCO Behavior Grammar 데이터베이스 현황</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className={`glass rounded-xl p-5 border ${card.border}`}>
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} border ${card.border} flex items-center justify-center mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* DB Overview */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">데이터베이스 현황</h2>
        <span className="text-xs text-slate-600">{TABLES.length}개 테이블</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {TABLES.map((table) => {
          const s = stats[table] ?? { total: 0, draft: 0, published: 0, deprecated: 0 };
          const route = ROUTE_MAP[table] ?? "#";
          return (
            <Link key={table} href={route}
              className="glass glass-hover rounded-xl p-4 flex items-center justify-between group">
              <div>
                <p className="font-medium text-white text-sm group-hover:text-brand-300 transition-colors">
                  {TABLE_LABELS[table]}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-500">전체 {s.total}</span>
                  {s.draft > 0 && <span className="badge-draft text-xs px-2 py-0.5 rounded-full">초안 {s.draft}</span>}
                  {s.published > 0 && <span className="badge-published text-xs px-2 py-0.5 rounded-full">발행 {s.published}</span>}
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mt-10 glass rounded-xl p-5 border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" /> 빠른 작업
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/studio/rules/new" className="btn-secondary text-sm py-2">새 Rule 만들기</Link>
          <Link href="/studio/cases/new" className="btn-secondary text-sm py-2">새 Case 만들기</Link>
          <Link href="/studio/motions/new" className="btn-secondary text-sm py-2">새 Motion 만들기</Link>
          <Link href="/studio/history" className="btn-ghost text-sm py-2">수정 이력 보기</Link>
          <Link href="/studio/settings" className="btn-ghost text-sm py-2">Import / Export</Link>
        </div>
      </div>
    </div>
  );
}
