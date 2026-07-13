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

function OutputCard({ icon: Icon, title, children, defaultOpen = true }: {
  icon: React.ElementType; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-brand-500" />
          </div>
          <span className="font-semibold text-white text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-2">{children}</div>}
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-300">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
      <span>{text}</span>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-3 mb-1">{label}</p>;
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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">행동 생성기</h1>
          <p className="text-slate-400">상황을 한국어로 입력하면 PUCO의 전체 행동 명세를 생성합니다.</p>
        </div>

        {/* Input */}
        <div className="glass rounded-2xl p-6 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">상황 입력</label>
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
                  className="text-xs text-brand-400 hover:text-brand-300 border border-brand-500/30 rounded-full px-3 py-1 transition-colors hover:border-brand-400/50">
                  예시 {i + 1}
                </button>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={!input.trim() || loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "생성 중..." : "생성하기"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-3 animate-fadeInUp">
            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">제약 조건 적용됨</span>
                </div>
                {result.warnings.map((w, i) => <p key={i} className="text-xs text-amber-200/70 mt-1">{w}</p>)}
              </div>
            )}

            {/* Situation Analysis */}
            <OutputCard icon={Lightbulb} title="상황 분석">
              <div className="space-y-2">
                <p className="text-sm text-slate-300"><span className="text-slate-500">Intent: </span><span className="text-brand-300 font-medium">{result.situationAnalysis.intent}</span></p>
                {result.situationAnalysis.userState.length > 0 && (
                  <><SectionLabel label="사용자 상태" />{result.situationAnalysis.userState.map((s,i) => <ListItem key={i} text={s} />)}</>
                )}
                {result.situationAnalysis.taskState.length > 0 && (
                  <><SectionLabel label="작업 상태" />{result.situationAnalysis.taskState.map((s,i) => <ListItem key={i} text={s} />)}</>
                )}
                {result.situationAnalysis.environmentState.length > 0 && (
                  <><SectionLabel label="환경 상태" />{result.situationAnalysis.environmentState.map((s,i) => <ListItem key={i} text={s} />)}</>
                )}
              </div>
            </OutputCard>

            {/* Camera */}
            <OutputCard icon={Camera} title="RGB 카메라">
              <SectionLabel label="인식 대상" />{result.camera.targets.map((t,i) => <ListItem key={i} text={t} />)}
              <SectionLabel label="인식 조건" />{result.camera.conditions.map((c,i) => <ListItem key={i} text={c} />)}
              <SectionLabel label="낮은 신뢰도 대응" />{result.camera.lowConfidenceResponse.map((r,i) => <ListItem key={i} text={r} />)}
            </OutputCard>

            {/* ToF */}
            <OutputCard icon={Radio} title="Laser ToF 센서">
              <SectionLabel label="거리 상태" />{result.tof.states.map((s,i) => <ListItem key={i} text={s} />)}
              <SectionLabel label="거리 변화 조건" />{result.tof.changeConditions.map((c,i) => <ListItem key={i} text={c} />)}
              <SectionLabel label="안전 조건" />{result.tof.safetyConditions.map((s,i) => <ListItem key={i} text={s} />)}
            </OutputCard>

            {/* Microphone */}
            <OutputCard icon={Mic} title="마이크 어레이">
              {result.microphone.outputs.map((o,i) => <ListItem key={i} text={o} />)}
              <SectionLabel label="소리 방향" /><ListItem text={result.microphone.direction} />
              <SectionLabel label="상태" /><ListItem text={result.microphone.status} />
            </OutputCard>

            {/* Interpretation */}
            <OutputCard icon={Lightbulb} title="해석 (Interpretation)">
              <p className="text-sm text-slate-300">{result.interpretation.meaning}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-slate-500">신뢰도: <span className="text-slate-300">{result.interpretation.confidence}</span></span>
                <span className="text-xs text-slate-500">위험도: <span className="text-slate-300">{result.interpretation.riskLevel}</span></span>
              </div>
            </OutputCard>

            {/* Motion */}
            <OutputCard icon={Move3d} title="관절 모션 (Head · Body · Leg)">
              <SectionLabel label="동작 시퀀스" />
              {result.motion.sequence.map((s,i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-brand-400 font-mono text-xs mt-0.5 flex-shrink-0">{String(i+1).padStart(2,"0")}</span>
                  <span>{s}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <SectionLabel label="속도" />{result.motion.speed.map((s,i) => <ListItem key={i} text={s} />)}
                  <SectionLabel label="크기" />{result.motion.amplitude.map((a,i) => <ListItem key={i} text={a} />)}
                </div>
                <div>
                  <SectionLabel label="질감" />{result.motion.quality.map((q,i) => <ListItem key={i} text={q} />)}
                  <SectionLabel label="리듬" />{result.motion.rhythm.map((r,i) => <ListItem key={i} text={r} />)}
                </div>
              </div>
              <SectionLabel label="유지 조건" /><ListItem text={result.motion.holdCondition} />
              <SectionLabel label="복귀 방식" /><ListItem text={result.motion.exitMotion} />
            </OutputCard>

            {/* Projection */}
            <OutputCard icon={Projector} title="Pico 빔 프로젝터">
              <SectionLabel label="콘텐츠" />{result.projection.content.map((c,i) => <ListItem key={i} text={c} />)}
              <SectionLabel label="투사면" />{result.projection.targetSurface.map((s,i) => <ListItem key={i} text={s} />)}
              <SectionLabel label="밝기 · 크기 · 전환" />
              {[...result.projection.brightness, ...result.projection.scaleAndContrast, ...result.projection.transitions].map((s,i) => <ListItem key={i} text={s} />)}
              <SectionLabel label="지속 조건" />{result.projection.duration.map((d,i) => <ListItem key={i} text={d} />)}
            </OutputCard>

            {/* Sound */}
            <OutputCard icon={Volume2} title="스피커">
              {result.sound.outputs.map((o,i) => <ListItem key={i} text={o} />)}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-xs text-slate-500">볼륨: <span className="text-slate-300">{result.sound.volume}</span></div>
                <div className="text-xs text-slate-500">지속: <span className="text-slate-300">{result.sound.duration}</span></div>
              </div>
            </OutputCard>

            {/* Timing */}
            <OutputCard icon={Clock} title="멀티모달 타이밍" defaultOpen={false}>
              {result.timing.sequence.map((s,i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-slate-600 font-mono">{String(i+1).padStart(2,"0")}</span>
                  <span>{s}</span>
                </div>
              ))}
            </OutputCard>

            {/* Monitoring */}
            <OutputCard icon={Radio} title="모니터링">
              <SectionLabel label="기대 반응" />{result.monitoring.expectedResponse.map((r,i) => <ListItem key={i} text={r} />)}
              <SectionLabel label="성공 조건" />{result.monitoring.successCondition.map((c,i) => <ListItem key={i} text={c} />)}
              <SectionLabel label="타임아웃" /><ListItem text={result.monitoring.timeout} />
            </OutputCard>

            {/* Recovery */}
            <OutputCard icon={RefreshCcw} title="예외 대응 및 복구" defaultOpen={false}>
              <SectionLabel label="인식 불확실" />{result.recovery.uncertain.map((r,i) => <ListItem key={i} text={r} />)}
              <SectionLabel label="무반응" />{result.recovery.noResponse.map((r,i) => <ListItem key={i} text={r} />)}
              <SectionLabel label="사용자 이탈" />{result.recovery.userLeft.map((r,i) => <ListItem key={i} text={r} />)}
              <SectionLabel label="안전 위험" />{result.recovery.unsafe.map((r,i) => <ListItem key={i} text={r} />)}
              <SectionLabel label="Capability 범위 초과" />{result.recovery.unavailableCapability.map((r,i) => <ListItem key={i} text={r} />)}
            </OutputCard>

            {/* Usage Example */}
            <div className="glass rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold text-white">활용 예시</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{result.usageExample}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
