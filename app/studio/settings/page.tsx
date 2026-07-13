"use client";

import { Download, Upload, RefreshCw, AlertTriangle } from "lucide-react";

const TABLES = [
  { key: "capabilities", label: "Capabilities" },
  { key: "perceptions", label: "Perceptions" },
  { key: "sensor_fusion_rules", label: "Sensor Fusion Rules" },
  { key: "context_states", label: "Context States" },
  { key: "interpretations", label: "Interpretations" },
  { key: "intents", label: "Intents" },
  { key: "behavior_policies", label: "Behavior Policies" },
  { key: "joints_and_poses", label: "Joints & Poses" },
  { key: "motion_primitives", label: "Motion Primitives" },
  { key: "projection_primitives", label: "Projection Primitives" },
  { key: "sound_primitives", label: "Sound Primitives" },
  { key: "multimodal_compositions", label: "Multimodal Compositions" },
  { key: "constraints", label: "Constraints" },
  { key: "monitoring_rules", label: "Monitoring Rules" },
  { key: "recovery_rules", label: "Recovery Rules" },
  { key: "behavior_rules", label: "Behavior Rules" },
  { key: "behavior_cases", label: "Behavior Cases" },
];

export default function SettingsPage() {
  async function handleExport(table: string) {
    const res = await fetch(`/api/studio/export?table=${table}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `puco_${table}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    }
  }

  async function handleExportAll() {
    const res = await fetch("/api/studio/export?table=all");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `puco_grammar_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">설정</h1>
        <p className="text-slate-500 text-sm mt-1">데이터 Import, Export 및 시스템 설정</p>
      </div>

      {/* Export Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-slate-400" /> 데이터 Export
        </h2>

        {/* Export All */}
        <div className="glass rounded-xl p-5 mb-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">전체 데이터 JSON Export</p>
            <p className="text-sm text-slate-500 mt-0.5">모든 테이블을 하나의 JSON 파일로 내보냅니다.</p>
          </div>
          <button onClick={handleExportAll} className="btn-primary text-sm">
            <Download className="w-4 h-4" /> 전체 내보내기
          </button>
        </div>

        {/* Per-table export */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-slate-400">테이블별 Export</p>
          </div>
          {TABLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between px-4 py-3 border-b border-white/3 data-row">
              <span className="text-sm text-slate-300">{t.label}</span>
              <div className="flex gap-2">
                <button onClick={() => handleExport(t.key)} className="btn-ghost text-xs py-1.5 px-3">
                  JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Import Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-slate-400" /> 데이터 Import
        </h2>
        <div className="glass rounded-xl p-6">
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-brand-500/30 transition-colors cursor-pointer"
            onClick={() => document.getElementById("import-file")?.click()}>
            <Upload className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">JSON 파일을 선택하거나 여기에 놓으세요</p>
            <p className="text-slate-600 text-xs mt-1">import 전 Schema, ID 중복, Relation 참조를 검사합니다</p>
            <input type="file" id="import-file" accept=".json" className="hidden" />
          </div>
          <div className="mt-4 flex items-start gap-2 text-xs text-amber-400/80">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Import는 확인 전까지 DB에 반영되지 않습니다. 실패 시 전체 롤백됩니다.</span>
          </div>
        </div>
      </section>

      {/* Seed Restore */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-slate-400" /> 초기 데이터 복원
        </h2>
        <div className="glass rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Seed 데이터 복원</p>
            <p className="text-sm text-slate-500 mt-0.5">초기 Grammar 데이터를 다시 불러옵니다. 기존 데이터와 중복은 건너뜁니다.</p>
          </div>
          <button className="btn-secondary text-sm">
            <RefreshCw className="w-4 h-4" /> 복원
          </button>
        </div>
      </section>
    </div>
  );
}
