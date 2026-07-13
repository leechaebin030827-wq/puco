import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/studio/DataTable";
import { formatDistanceToNow } from "@/lib/utils";

export default async function Page() {
  await requireAdmin();
  let data: Record<string, unknown>[] = [];
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase.from("joints_and_poses").select("*").is("deleted_at", null).order("updated_at", { ascending: false });
    data = (rows ?? []) as Record<string, unknown>[];
  } catch { /* Supabase not configured */ }

  const columns = [
    { key: "code", label: "Code" },
    { key: "name_ko", label: "이름" },
    { key: "joint_group", label: "관절 그룹" },
    { key: "is_neutral", label: "중립 자세", render: (r: Record<string, unknown>) =>
      r.is_neutral ? <span className="badge-published text-xs px-2 py-0.5 rounded-full">중립</span> : <span className="text-slate-600 text-xs">—</span> },
    { key: "status", label: "상태" },
    { key: "updated_at", label: "수정일", render: (r: Record<string, unknown>) =>
      r.updated_at ? <span className="text-slate-500 text-xs">{formatDistanceToNow(String(r.updated_at))}</span> : <span className="text-slate-600">—</span> },
  ];

  return <DataTable title="Joints & Poses" description="Head·Body·Leg 관절 그룹과 기본 자세 정의" data={data} columns={columns} newHref="/studio/joints/new" />;
}
