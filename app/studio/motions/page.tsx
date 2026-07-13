import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/studio/DataTable";
import { formatDistanceToNow } from "@/lib/utils";

export default async function Page() {
  await requireAdmin();
  let data: Record<string, unknown>[] = [];
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("motion_primitives")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    data = (rows ?? []) as Record<string, unknown>[];
  } catch { /* Supabase not configured */ }

  const columns = [
    { key: "code", label: "Code" },
    { key: "name_ko", label: "이름" },
    { key: "primary_actuator", label: "주요 관절" },
    { key: "default_speed", label: "기본 속도" },
    { key: "status", label: "상태" },
    {
      key: "updated_at", label: "수정일",
      render: (r: Record<string, unknown>) =>
        r.updated_at ? <span className="text-slate-500 text-xs">{formatDistanceToNow(String(r.updated_at))}</span> : <span className="text-slate-600">—</span>
    },
  ];

  return (
    <DataTable
      title="Motion Primitives"
      description="PUCO의 Head·Body·Leg 움직임 최소 단위. 각도 없이 자연어로 기술합니다."
      data={data}
      columns={columns}
      newHref="/studio/motions/new"
    />
  );
}
