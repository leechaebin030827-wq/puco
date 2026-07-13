import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "@/lib/utils";
import { History, RotateCcw } from "lucide-react";

type Revision = {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_code: string | null;
  action: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  actor_id: string | null;
  created_at: string;
};

const ACTION_LABELS: Record<string, string> = {
  create: "생성",
  update: "수정",
  publish: "발행",
  deprecate: "지원 종료",
  delete: "삭제",
  restore: "복원",
};

const ACTION_COLORS: Record<string, string> = {
  create: "text-emerald-600",
  update: "text-blue-600",
  publish: "text-green-600",
  deprecate: "text-zinc-500",
  delete: "text-red-600",
  restore: "text-amber-600",
};

export default async function HistoryPage() {
  await requireAdmin();
  let revisions: Revision[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("revisions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    revisions = (data ?? []) as Revision[];
  } catch { /* Supabase not configured */ }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <History className="w-6 h-6 text-zinc-500" /> 수정 이력
        </h1>
        <p className="text-zinc-500 text-sm mt-1">모든 데이터 변경 기록. 이전 버전으로 복원할 수 있습니다.</p>
      </div>

      {revisions.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center bg-white/80">
          <History className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <p className="text-zinc-600">Supabase 연결 후 수정 이력이 표시됩니다.</p>
          <p className="text-zinc-400 text-xs mt-1">데이터를 생성·수정하면 이 페이지에 자동으로 기록됩니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {revisions.map((rev) => (
            <div key={rev.id} className="glass glass-hover rounded-xl px-5 py-4 flex items-center justify-between bg-white/80">
              <div className="flex items-center gap-4">
                <span className={`text-sm font-semibold ${ACTION_COLORS[rev.action] ?? "text-zinc-600"}`}>
                  {ACTION_LABELS[rev.action] ?? rev.action}
                </span>
                <div>
                  <p className="text-sm text-zinc-900 font-medium">
                    <span className="text-zinc-400 font-mono text-xs mr-2">{rev.entity_type}</span>
                    {rev.entity_code ?? rev.entity_id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-zinc-400">{formatDistanceToNow(rev.created_at)}</p>
                </div>
              </div>
              <button className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" /> 복원
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
