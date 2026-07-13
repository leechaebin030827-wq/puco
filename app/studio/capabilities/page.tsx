import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/studio/DataTable";
import { formatDistanceToNow } from "@/lib/utils";

export default async function CapabilitiesPage() {
  await requireAdmin();

  let data: Record<string, unknown>[] = [];
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("capabilities")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    data = (rows ?? []) as Record<string, unknown>[];
  } catch { /* Supabase not configured yet */ }

  const columns = [
    { key: "code", label: "Code" },
    { key: "name_ko", label: "이름" },
    { key: "sensor_type", label: "센서 유형" },
    { key: "modality", label: "Input/Output" },
    { key: "status", label: "상태" },
    { key: "updated_at", label: "수정일", render: (r: Record<string, unknown>) =>
      r.updated_at ? <span className="text-slate-500 text-xs">{formatDistanceToNow(String(r.updated_at))}</span> : "—"
    },
  ];

  return (
    <DataTable
      title="Capabilities"
      description="PUCO가 실제로 사용할 수 있는 하드웨어 기능"
      data={data}
      columns={columns}
      newHref="/studio/capabilities/new"
    />
  );
}
