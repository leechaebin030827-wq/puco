"use client";

import { useState } from "react";
import { ArrowRight, Camera, Radio, Mic, Projector, Volume2, Move3d, Clock, ShieldAlert, RefreshCcw, Lightbulb, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type BehaviorResult = {
  situationAnalysis: { trigger: string; userState: string[]; environmentState: string[]; objectState: string[]; taskState: string[]; intent: string };
  camera: { targets: string[]; conditions: string[]; lowConfidenceResponse: string[] };
  tof: { states: string[]; changeConditions: string[]; safetyConditions: string[] };
  microphone: { outputs: string[]; direction: string; status: string };
  interpretation: { meaning: string; confidence: string; riskLevel: string };
  motion: { target: string; sequence: string[]; speed: string[]; amplitude: string[]; quality: string[]; rhythm: string[]; holdCondition: string; exitMotion: string };
  projection: { content: string[]; targetSurface: string[]; brightness: string[]; scaleAndContrast: string[]; transitions: string[]; duration: string[] };
  sound: { outputs: string[]; volume: string; duration: string; startCondition: string; stopCondition: string };
  timing: { sequence: string[] };
  monitoring: { expectedResponse: string[]; successCondition: string[]; timeout: string };
  recovery: { uncertain: string[]; noResponse: string[]; userLeft: string[]; unsafe: string[]; unavailableCapability: string[] };
  usageExample: string;
  selectedRuleIds: string[];
  warnings: string[];
};

const EXAMPLES = [
  "아이가 책상 위에 종이를 놓고 PUCO와 함께 그림을 그리려고 한다.",
  "사용자가 PUCO에게 다가와 손을 들어 상호작용을 요청한다.",
  "사용자가 벽면 쪽으로 걸어가며 무언가를 확인하려 한다.",
  "어두운 방에서 사용자가 PUCO 앞에 앉아 기다리고 있다.",
  "여러 명이 PUCO 주변에 모여 있고 한 명이 손짓을 한다.",
];

function VisualCard({ icon: Icon, title, badge, children }: {
  icon: React.ElementType; title: string; badge?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-5 border border-zinc-200/80 bg-white/80 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center border border-zinc-200 flex-shrink-0">
            <Icon className="w-4 h-4 text-brand-500" />
          </div>
          <h3 className="font-semibold text-zinc-900 text-sm">{title}</h3>
        </div>
        {badge}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function GeneratePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BehaviorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.behavior);
      } else {
        setError(data.error ?? "오류가 발생했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-surface-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3">행동 생성기</h1>
          <p className="text-zinc-500">상황을 한국어로 입력하면 PUCO의 전체 행동 명세를 생성합니다.</p>
        </div>

        {/* Input */}
        <div className="glass rounded-2xl p-6 mb-6">
          <label className="block text-sm font-medium text-zinc-700 mb-3">상황 입력</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleGenerate(); }}
            placeholder="예: 아이가 책상 위에 종이를 놓고 PUCO와 함께 그림을 그리려고 한다."
            rows={3}
            className="input-dark resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2 flex-wrap">
              {EXAMPLES.slice(0, 3).map((ex, i) => (
                <button key={i} onClick={() => setInput(ex)}
                  className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 border border-brand-200 rounded-full px-3 py-1 transition-colors">
                  예시 {i + 1}
                </button>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={!input.trim() || loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "생성 중..." : "생성하기"}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">제약 조건 적용됨</span>
                </div>
                {result.warnings.map((w, i) => <p key={i} className="text-xs text-amber-800 mt-1">{w}</p>)}
              </div>
            )}

            {/* Dashboard Card Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left & Center Columns: Situation Analysis, Sensors, Motion (Spans 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Situation Analysis */}
                <VisualCard icon={Lightbulb} title="상황 분석 (WHEN / TRIGGER)"
                  badge={<span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-semibold">{result.situationAnalysis.intent}</span>}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-lg p-3">
                      <span className="text-xs font-semibold text-zinc-500 block mb-2">사용자 상태 (User)</span>
                      {result.situationAnalysis.userState.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.situationAnalysis.userState.map((s, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-white text-zinc-700 rounded border border-zinc-200">{s}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-zinc-400">—</span>}
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-lg p-3">
                      <span className="text-xs font-semibold text-zinc-500 block mb-2">작업 상태 (Task)</span>
                      {result.situationAnalysis.taskState.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.situationAnalysis.taskState.map((s, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-white text-zinc-700 rounded border border-zinc-200">{s}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-zinc-400">—</span>}
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-lg p-3">
                      <span className="text-xs font-semibold text-zinc-500 block mb-2">환경 상태 (Env)</span>
                      {result.situationAnalysis.environmentState.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.situationAnalysis.environmentState.map((s, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-white text-zinc-700 rounded border border-zinc-200">{s}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-zinc-400">—</span>}
                    </div>
                  </div>
                </VisualCard>

                {/* Sensor Senses Section */}
                <div className="border-t border-zinc-200/60 pt-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">SENSE - 센서 감지 명세</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Camera */}
                    <VisualCard icon={Camera} title="RGB 카메라 감지">
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1">인식 대상 (Targets)</span>
                        <div className="flex flex-wrap gap-1">
                          {result.camera.targets.map((t, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-zinc-50 text-zinc-700 rounded border border-zinc-200">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1">매칭 조건 (Conditions)</span>
                        <ul className="space-y-1 text-xs text-zinc-600 list-disc pl-4">
                          {result.camera.conditions.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      {result.camera.lowConfidenceResponse.length > 0 && (
                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[11px] font-semibold text-amber-600 block mb-1">신뢰도 저하 시 대응</span>
                          <div className="space-y-0.5">
                            {result.camera.lowConfidenceResponse.map((r, i) => (
                              <p key={i} className="text-[11px] text-zinc-500">• {r}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </VisualCard>

                    {/* ToF */}
                    <VisualCard icon={Radio} title="Laser ToF 센서 감지">
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1">거리 상태 분석</span>
                        <div className="space-y-0.5">
                          {result.tof.states.map((s, i) => (
                            <p key={i} className="text-xs text-zinc-700 font-medium">{s}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1">변화 조건 매칭</span>
                        <ul className="space-y-1 text-xs text-zinc-600 list-disc pl-4">
                          {result.tof.changeConditions.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      {result.tof.safetyConditions.length > 0 && (
                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[11px] font-semibold text-red-600 block mb-1">안전 제약 조건</span>
                          <div className="flex flex-wrap gap-1">
                            {result.tof.safetyConditions.map((s, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </VisualCard>

                    {/* Microphone */}
                    <VisualCard icon={Mic} title="마이크 어레이 감지"
                      badge={<span className="text-[10px] px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-600 font-medium">{result.microphone.status}</span>}>
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1">소리 감지 항목</span>
                        <ul className="space-y-1 text-xs text-zinc-600 list-disc pl-4">
                          {result.microphone.outputs.map((o, i) => <li key={i}>{o}</li>)}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-zinc-100">
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">음원 방향 추적 (Direction)</span>
                        <p className="text-xs text-zinc-700 font-medium">{result.microphone.direction}</p>
                      </div>
                    </VisualCard>
                  </div>
                </div>

                {/* Robot Motion */}
                <div className="border-t border-zinc-200/60 pt-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">EXPRESS - 관절 모션 출력</h4>
                  <VisualCard icon={Move3d} title="관절 모션 출력 (Joints & Motion)">
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 block mb-2">동작 시퀀스</span>
                      <div className="relative pl-4 border-l-2 border-zinc-200 space-y-3 ml-2">
                        {result.motion.sequence.map((step, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-brand-500 border-2 border-white" />
                            <p className="text-xs text-zinc-700 font-medium leading-normal">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100">
                      <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200/50">
                        <span className="text-[10px] font-semibold text-zinc-400 block mb-1">속도 (Speed)</span>
                        <div className="space-y-0.5">
                          {result.motion.speed.map((s, i) => (
                            <span key={i} className="text-xs font-semibold text-zinc-800 block">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200/50">
                        <span className="text-[10px] font-semibold text-zinc-400 block mb-1">크기 (Amplitude)</span>
                        <div className="space-y-0.5">
                          {result.motion.amplitude.map((a, i) => (
                            <span key={i} className="text-xs font-semibold text-zinc-800 block">{a}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200/50">
                        <span className="text-[10px] font-semibold text-zinc-400 block mb-1">질감 (Quality)</span>
                        <div className="flex flex-wrap gap-1">
                          {result.motion.quality.map((q, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-zinc-700">{q}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200/50">
                        <span className="text-[10px] font-semibold text-zinc-400 block mb-1">리듬 (Rhythm)</span>
                        <div className="space-y-0.5">
                          {result.motion.rhythm.map((r, i) => (
                            <span key={i} className="text-xs font-semibold text-zinc-800 block">{r}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-400 block mb-0.5">유지 조건</span>
                        <p className="text-xs text-zinc-700 bg-zinc-50 rounded p-2 border border-zinc-100">{result.motion.holdCondition}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-400 block mb-0.5">복귀 방식</span>
                        <p className="text-xs text-zinc-700 bg-zinc-50 rounded p-2 border border-zinc-100">{result.motion.exitMotion}</p>
                      </div>
                    </div>
                  </VisualCard>
                </div>

              </div>

              {/* Right Column: Interpretation, Timing, Multimodal Output, Monitoring & Safety (Spans 1 col) */}
              <div className="space-y-6">
                
                {/* Interpretation */}
                <VisualCard icon={Lightbulb} title="상황 해석 (INTERPRET)"
                  badge={
                    <div className="flex gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                        result.interpretation.confidence.includes("상") || result.interpretation.confidence.includes("High")
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}>
                        신뢰도: {result.interpretation.confidence}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                        result.interpretation.riskLevel.includes("상") || result.interpretation.riskLevel.includes("High") || result.interpretation.riskLevel.includes("위험")
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-zinc-100 border-zinc-200 text-zinc-600"
                      }`}>
                        위험: {result.interpretation.riskLevel}
                      </span>
                    </div>
                  }>
                  <div className="bg-zinc-50 border border-zinc-200/60 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 font-semibold mb-1">상황의 의미</p>
                    <p className="text-sm font-semibold text-zinc-800 leading-relaxed">
                      {result.interpretation.meaning}
                    </p>
                  </div>
                </VisualCard>

                {/* Multimodal Outputs */}
                <div className="border-t border-zinc-200/60 pt-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">EXPRESS - 타 기기 출력</h4>
                  <div className="space-y-4">
                    {/* Projection */}
                    <VisualCard icon={Projector} title="빔 프로젝터 출력">
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1">콘텐츠 명세</span>
                        <ul className="space-y-1 text-xs text-zinc-700 list-disc pl-4 font-medium">
                          {result.projection.content.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-zinc-100">
                        <div>
                          <span className="text-[10px] font-semibold text-zinc-400 block mb-0.5">투사 표면</span>
                          <div className="flex flex-wrap gap-1">
                            {result.projection.targetSurface.map((s, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-zinc-700">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-zinc-400 block mb-0.5">지속 조건</span>
                          <div className="space-y-0.5">
                            {result.projection.duration.map((d, i) => (
                              <p key={i} className="text-[10px] text-zinc-600 font-medium">{d}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </VisualCard>

                    {/* Sound */}
                    <VisualCard icon={Volume2} title="스피커 오디오 출력">
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1">오디오 리소스</span>
                        <ul className="space-y-1 text-xs text-zinc-700 list-disc pl-4 font-medium">
                          {result.sound.outputs.map((o, i) => <li key={i}>{o}</li>)}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 mb-1">
                            <span>볼륨 (Volume)</span>
                            <span className="text-brand-600 font-semibold">{result.sound.volume}</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full rounded-full" style={{ width: result.sound.volume.includes("%") ? result.sound.volume : "60%" }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-[10px] font-semibold text-zinc-400 block">시작</span>
                            <p className="text-zinc-600 leading-tight">{result.sound.startCondition}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-zinc-400 block">종료</span>
                            <p className="text-zinc-600 leading-tight">{result.sound.stopCondition}</p>
                          </div>
                        </div>
                      </div>
                    </VisualCard>
                  </div>
                </div>

                {/* Timing Sequence */}
                <VisualCard icon={Clock} title="멀티모달 타이밍 시퀀스">
                  <div className="relative pl-6 border-l border-zinc-200 ml-2 space-y-3.5">
                    {result.timing.sequence.map((s, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-brand-500 border border-white" />
                        <p className="text-xs text-zinc-700 font-medium leading-normal">{s}</p>
                      </div>
                    ))}
                  </div>
                </VisualCard>

                {/* Feedback Monitoring */}
                <VisualCard icon={Radio} title="피드백 모니터링 (MONITOR)">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 block mb-1">사용자 기대 반응</span>
                    <ul className="space-y-1 text-xs text-zinc-700 list-disc pl-4 font-medium">
                      {result.monitoring.expectedResponse.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-[11px] font-semibold text-zinc-400 block mb-1">성공 판단 조건</span>
                    <ul className="space-y-1 text-xs text-zinc-600 list-disc pl-4">
                      {result.monitoring.successCondition.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-400">타임아웃 감지</span>
                    <span className="text-xs px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-full font-semibold">{result.monitoring.timeout}</span>
                  </div>
                </VisualCard>

              </div>
            </div>

            {/* Exception Recovery */}
            <div className="border-t border-zinc-200/60 pt-6">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">RECOVER - 예외 상황 및 복구 시나리오</h4>
              <VisualCard icon={RefreshCcw} title="예외 상황 대응 및 복구">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-3">
                    <span className="text-[10px] font-bold text-zinc-500 block mb-1.5 uppercase tracking-wider">오인식/불확실 대응</span>
                    {result.recovery.uncertain.map((r, i) => (
                      <p key={i} className="text-xs text-zinc-600 leading-normal mb-1">• {r}</p>
                    ))}
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-3">
                    <span className="text-[10px] font-bold text-zinc-500 block mb-1.5 uppercase tracking-wider">사용자 무반응 대응</span>
                    {result.recovery.noResponse.map((r, i) => (
                      <p key={i} className="text-xs text-zinc-600 leading-normal mb-1">• {r}</p>
                    ))}
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-3">
                    <span className="text-[10px] font-bold text-zinc-500 block mb-1.5 uppercase tracking-wider">사용자 이탈 대응</span>
                    {result.recovery.userLeft.map((r, i) => (
                      <p key={i} className="text-xs text-zinc-600 leading-normal mb-1">• {r}</p>
                    ))}
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-3">
                    <span className="text-[10px] font-bold text-zinc-500 block mb-1.5 uppercase tracking-wider">물리적 위협/위험 대응</span>
                    {result.recovery.unsafe.map((r, i) => (
                      <p key={i} className="text-xs text-zinc-600 leading-normal mb-1">• {r}</p>
                    ))}
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-3 col-span-1 sm:col-span-2">
                    <span className="text-[10px] font-bold text-zinc-500 block mb-1.5 uppercase tracking-wider">출력 및 기능 예외 복구</span>
                    {result.recovery.unavailableCapability.map((r, i) => (
                      <p key={i} className="text-xs text-zinc-600 leading-normal mb-1">• {r}</p>
                    ))}
                  </div>
                </div>
              </VisualCard>
            </div>

            {/* Usage Example */}
            <div className="glass rounded-xl p-5 border border-zinc-200/80 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-semibold text-zinc-800">활용 예시 시나리오</span>
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed">{result.usageExample}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
