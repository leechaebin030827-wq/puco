import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

type BehaviorCase = {
  id: string;
  code: string;
  name_ko: string;
  scenario_input: string;
  scenario_categories: string[] | null;
  usage_example: string | null;
};

export default async function ExamplesPage() {
  let cases: BehaviorCase[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("behavior_cases")
      .select("id, code, name_ko, scenario_input, scenario_categories, usage_example")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("published_at", { ascending: false });
    cases = (data ?? []) as BehaviorCase[];
  } catch { /* Supabase not configured */ }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">예시 사례</h1>
          <p className="text-zinc-500">발행된 Behavior Case를 탐색합니다. Studio에서 Published로 전환한 사례만 표시됩니다.</p>
        </div>

        {cases.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <BookOpen className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-600 mb-2">아직 발행된 사례가 없습니다.</p>
            <p className="text-zinc-500 text-sm">Supabase 연결 후 Studio에서 Behavior Case를 Published로 전환하면 이 페이지에 표시됩니다.</p>
            <Link href="/generate" className="btn-primary mt-6 inline-flex text-sm">
              지금 생성해보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cases.map((c) => (
              <div key={c.id} className="glass glass-hover rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-published text-xs px-2 py-0.5 rounded-full">발행됨</span>
                  <span className="text-xs text-zinc-500 font-mono">{c.code}</span>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">{c.name_ko}</h3>
                <p className="text-sm text-zinc-600 line-clamp-2 mb-3">{c.scenario_input}</p>
                {c.scenario_categories && c.scenario_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {c.scenario_categories.map((cat) => (
                      <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-600">{cat}</span>
                    ))}
                  </div>
                )}
                {c.usage_example && (
                  <p className="text-xs text-zinc-500 line-clamp-2 italic">"{c.usage_example}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
