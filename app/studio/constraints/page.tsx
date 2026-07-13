import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/studio/DataTable";
import { formatDistanceToNow } from "@/lib/utils";

export default async function Page() {
  await requireAdmin();
  let data: Record<string, unknown>[] = [];
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase.from("constraints").select("*").is("deleted_at", null).order("updated_at", { ascending: false });
    data = (rows ?? []) as Record<string, unknown>[];
  } catch { /* Supabase not configured */ }

  const columns = [
    { key: "code", label: "Code" },
    { key: "name_ko", label: "이름" },
    { key: "category", label: "카테고리" },
    { key: "priority", label: "우선순위", render: (r: Record<string, unknown>) => {
      const p = String(r.priority ?? "");
      const cls = p === "critical" ? "badge-critical" : p === "high" ? "badge-warning" : "badge-draft";
      return <span className={`${cls} text-xs px-2 py-0.5 rounded-full`}>{p}</span>;
    }},
    { key: "status", label: "상태" },
    { key: "updated_at", label: "수정일", render: (r: Record<string, unknown>) =>
      r.updated_at ? <span className="text-slate-500 text-xs">{formatDistanceToNow(String(r.updated_at))}</span> : <span className="text-slate-600">—</span> },
  ];

  return <DataTable title="Constraints" description="PUCO가 절대 위반하면 안 되는 하드웨어·안전·UX 조건" data={data} columns={columns} newHref="/studio/constraints/new" />;
}
