import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/studio/DataTable";
import { formatDistanceToNow } from "@/lib/utils";

export default async function Page() {
  await requireAdmin();
  let data: Record<string, unknown>[] = [];
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase.from("interpretations").select("*").is("deleted_at", null).order("updated_at", { ascending: false });
    data = (rows ?? []) as Record<string, unknown>[];
  } catch { /* Supabase not configured */ }

  const columns = [
    { key: "code", label: "Code" },
    { key: "name_ko", label: "이름" },
    { key: "risk_level", label: "위험도" },
    { key: "confidence_rule", label: "확신 규칙" },
    { key: "status", label: "상태" },
    { key: "updated_at", label: "수정일", render: (r: Record<string, unknown>) =>
      r.updated_at ? <span className="text-slate-500 text-xs">{formatDistanceToNow(String(r.updated_at))}</span> : <span className="text-slate-600">—</span> },
  ];

  return <DataTable title="Interpretations" description="Perception과 Context를 결합해 상황의 의미를 정의" data={data} columns={columns} newHref="/studio/interpretations/new" />;
}
