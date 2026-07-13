import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STRUCTURE = [
  {
    stage: "01", label: "Perception", color: "from-blue-600/30 to-cyan-600/30", border: "border-blue-500/20",
    items: ["RGB Camera — 사용자·제스처·물체·표면 인식", "Laser ToF — 거리 및 접근 속도 측정", "Microphone Array — 소리 방향·음성 감지"],
    desc: "PUCO는 세 가지 센서로 세계를 관찰합니다. 각 센서는 관찰 가능한 사실만 출력합니다.",
  },
  {
    stage: "02", label: "Sensor Fusion", color: "from-purple-600/30 to-violet-600/30", border: "border-purple-500/20",
    items: ["여러 센서 입력 결합", "모순 감지 및 신뢰도 계산", "Context State 생성"],
    desc: "단일 센서로 판단하지 않습니다. 여러 센서를 결합해 더 정확한 상황 인식을 만듭니다.",
  },
  {
    stage: "03", label: "Context", color: "from-indigo-600/30 to-blue-600/30", border: "border-indigo-500/20",
    items: ["user_present, user_approaching", "projection_surface_available", "task_not_started, user_needs_guidance"],
    desc: "Fusion된 데이터에서 현재 상황의 상태를 추출합니다. 데이터베이스에 등록된 Context만 사용합니다.",
  },
  {
    stage: "04", label: "Interpretation", color: "from-amber-600/30 to-orange-600/30", border: "border-amber-500/20",
    items: ["Perception + Context → 의미 부여", "위험도·신뢰도 판단", "적합한 Intent 후보 추천"],
    desc: "사실에서 의미로 변환합니다. '손이 올라왔다'가 아니라 '사용자가 상호작용을 요청한다'로 해석합니다.",
  },
  {
    stage: "05", label: "Intent & Policy", color: "from-emerald-600/30 to-teal-600/30", border: "border-emerald-500/20",
    items: ["Intent: Guide / Acknowledge / Warn...", "Behavior Policy: 강도·주도성·긴급도", "Constraint 우선 검증"],
    desc: "무엇을 달성할지(Intent)와 어떻게 행동할지(Policy)를 결정합니다.",
  },
  {
    stage: "06", label: "Expression", color: "from-rose-600/30 to-pink-600/30", border: "border-rose-500/20",
    items: ["Motion (Head·Body·Leg) — 자연어로 기술", "Projection (빔 프로젝터)", "Sound (스피커)"],
    desc: "세 가지 출력 채널을 조합합니다. Motion은 정확한 각도 없이 자연어 속도·크기·질감·리듬으로 표현합니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">PUCO Behavior Grammar 구조</h1>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PUCO의 행동은 자유롭게 생성되지 않습니다.<br />
            데이터베이스에 등록된 Capability, Primitive, Rule 안에서만 선택합니다.
          </p>
        </div>

        {/* Core Principle */}
        <div className="glass rounded-2xl p-6 mb-12 border border-brand-500/20">
          <h2 className="text-lg font-semibold text-white mb-3">핵심 원칙</h2>
          <div className="space-y-2 text-sm text-slate-400">
            <p>• PUCO는 <span className="text-white">데이터베이스에 없는 센서</span>를 사용하지 않습니다.</p>
            <p>• Motion은 <span className="text-white">정확한 각도나 좌표</span>로 표현하지 않고 자연어로 기술합니다.</p>
            <p>• <span className="text-white">Constraint</span>가 위반되면 행동 전에 경고하고 수정합니다.</p>
            <p>• 낮은 신뢰도에서는 <span className="text-white">확정 피드백을 제공하지 않습니다.</span></p>
          </div>
        </div>

        {/* Stage flow */}
        <div className="space-y-4">
          {STRUCTURE.map((s) => (
            <div key={s.stage} className={`glass rounded-2xl p-6 border ${s.border}`}>
              <div className="flex items-start gap-5">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} border ${s.border} flex items-center justify-center`}>
                  <span className="text-white font-mono text-sm font-bold">{s.stage}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{s.label}</h3>
                  <p className="text-sm text-slate-400 mb-3">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.items.map((item) => (
                      <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/generate" className="btn-primary text-base px-8 py-3">
            직접 생성해보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
