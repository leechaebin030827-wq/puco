import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/studio/DataTable";
import { formatDistanceToNow } from "@/lib/utils";

export default async function Page() {
  await requireAdmin();
  let data: Record<string, unknown>[] = [];
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase.from("sound_primitives").select("*").is("deleted_at", null).order("updated_at", { ascending: false });
    data = (rows ?? []) as Record<string, unknown>[];
  } catch { /* Supabase not configured */ }

  const columns = [
    { key: "code", label: "Code" },
    { key: "name_ko", label: "이름" },
    { key: "sound_type", label: "소리 유형" },
    { key: "volume_level", label: "볼륨" },
    { key: "status", label: "상태" },
    { key: "updated_at", label: "수정일", render: (r: Record<string, unknown>) =>
      r.updated_at ? <span className="text-slate-500 text-xs">{formatDistanceToNow(String(r.updated_at))}</span> : <span className="text-slate-600">—</span> },
  ];

  return <DataTable title="Sound Primitives" description="스피커를 통한 비언어음·음성 출력의 최소 단위" data={data} columns={columns} newHref="/studio/sounds/new" />;
}
