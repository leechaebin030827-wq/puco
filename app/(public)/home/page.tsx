import Link from "next/link";
import { ArrowRight, Camera, Radio, Mic, Projector, Volume2, Move3d, Cpu } from "lucide-react";

const CAPABILITIES = [
  { icon: Camera, label: "RGB 카메라", desc: "사용자·제스처·물체·표면 인식", color: "from-blue-500 to-cyan-500" },
  { icon: Radio, label: "ToF 센서", desc: "거리 및 접근 속도 측정", color: "from-emerald-500 to-teal-500" },
  { icon: Mic, label: "마이크 어레이", desc: "소리 방향 및 음성 감지", color: "from-violet-500 to-purple-500" },
  { icon: Projector, label: "빔 프로젝터", desc: "정보·가이드·감정 투사", color: "from-orange-500 to-amber-500" },
  { icon: Volume2, label: "스피커", desc: "비언어음 및 음성 출력", color: "from-pink-500 to-rose-500" },
  { icon: Move3d, label: "관절 모션", desc: "Head·Body·Leg 자세와 동작", color: "from-indigo-500 to-blue-500" },
];

const GRAMMAR_STAGES = [
  { step: "01", label: "Perception", desc: "센서가 사실을 관찰한다" },
  { step: "02", label: "Fusion", desc: "여러 센서를 결합한다" },
  { step: "03", label: "Context", desc: "현재 상태를 파악한다" },
  { step: "04", label: "Interpretation", desc: "상황의 의미를 해석한다" },
  { step: "05", label: "Intent", desc: "달성할 목적을 결정한다" },
  { step: "06", label: "Express", desc: "모션·투사·소리로 표현한다" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* ─── Hero ─── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-900/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-500/30 text-brand-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            PUCO Behavior Grammar v1
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="gradient-text">행동 언어</span>로<br />
            <span className="text-white">설계하는 로봇</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PUCO Behavior Grammar는 로봇이 상황을 감지하고, 해석하고,<br className="hidden md:block" />
            관절·프로젝터·소리로 반응하는 방식을 설계하는 언어 체계입니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/generate" className="btn-primary text-base px-6 py-3">
              행동 생성해보기 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="btn-secondary text-base px-6 py-3">
              구조 살펴보기
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 text-xs">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-slate-700" />
          <span>스크롤</span>
        </div>
      </section>

      {/* ─── Capabilities ─── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">PUCO의 Capability</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            데이터베이스에 등록된 하드웨어 기능 안에서만 행동을 생성합니다.
            없는 센서나 출력을 임의로 만들지 않습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map((cap) => (
            <div key={cap.label} className="glass glass-hover rounded-2xl p-6 gradient-border">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center mb-4 shadow-lg`}>
                <cap.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{cap.label}</h3>
              <p className="text-sm text-slate-400">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Grammar Flow ─── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-brand-950/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">행동 생성 흐름</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              자연어 상황 입력 한 줄이 6단계를 거쳐 완성된 행동 명세로 변환됩니다.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-brand-500/50 via-accent-500/50 to-transparent hidden md:block" />

            <div className="space-y-4">
              {GRAMMAR_STAGES.map((stage, i) => (
                <div key={stage.step}
                  className="glass glass-hover rounded-xl p-5 flex items-center gap-5 cursor-default"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/30 to-accent-600/30 border border-brand-500/20 flex items-center justify-center">
                    <span className="text-brand-300 font-mono text-sm font-bold">{stage.step}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white">{stage.label}</span>
                    <span className="text-slate-500 mx-2">—</span>
                    <span className="text-slate-400 text-sm">{stage.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto shadow-xl">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            상황을 입력하면<br />PUCO가 어떻게 반응할지 알 수 있습니다
          </h2>
          <p className="text-slate-400">
            카메라·ToF·마이크가 무엇을 감지하고, 관절이 어떻게 움직이고,<br className="hidden md:block" />
            프로젝터가 무엇을 어디에 투사하고, 스피커가 어떤 소리를 내는지.
          </p>
          <Link href="/generate" className="btn-primary text-base px-8 py-3.5 inline-flex">
            지금 생성해보기 <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-slate-600 text-sm">
        <p>PUCO Behavior Grammar — 데이터베이스 기반 로봇 행동 언어 설계 도구</p>
      </footer>
    </div>
  );
}
