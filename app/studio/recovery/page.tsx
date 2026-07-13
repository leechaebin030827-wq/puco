import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/studio/DataTable";
import { formatDistanceToNow } from "@/lib/utils";

export default async function Page() {
  await requireAdmin();
  let data: Record<string, unknown>[] = [];
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase.from("recovery_rules").select("*").is("deleted_at", null).order("updated_at", { ascending: false });
    data = (rows ?? []) as Record<string, unknown>[];
  } catch { /* Supabase not configured */ }

  const columns = [
    { key: "code", label: "Code" },
    { key: "name_ko", label: "이름" },
    { key: "trigger_condition", label: "발동 조건" },
    { key: "status", label: "상태" },
    { key: "updated_at", label: "수정일", render: (r: Record<string, unknown>) =>
      r.updated_at ? <span className="text-slate-500 text-xs">{formatDistanceToNow(String(r.updated_at))}</span> : <span className="text-slate-600">—</span> },
  ];

  return <DataTable title="Recovery Rules" description="실패·중단·무반응 상황에서 PUCO가 어떻게 복구하는지 정의" data={data} columns={columns} newHref="/studio/recovery/new" />;
}
