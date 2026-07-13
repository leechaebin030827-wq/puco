import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";

const ALL_TABLES = [
  "capabilities", "perceptions", "sensor_fusion_rules", "context_states",
  "interpretations", "intents", "behavior_policies", "joints_and_poses",
  "motion_primitives", "projection_primitives", "sound_primitives",
  "multimodal_compositions", "constraints", "monitoring_rules",
  "recovery_rules", "behavior_rules", "behavior_cases",
];

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") ?? "all";

  try {
    const supabase = await createClient();
    const tables = table === "all" ? ALL_TABLES : [table];

    const result: Record<string, unknown[]> = {};
    await Promise.all(
      tables.map(async (t) => {
        const { data } = await supabase
          .from(t)
          .select("*")
          .is("deleted_at", null);
        result[t] = data ?? [];
      })
    );

    const payload = table === "all" ? result : result[table] ?? [];
    const json = JSON.stringify(payload, null, 2);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="puco_${table}_export.json"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
