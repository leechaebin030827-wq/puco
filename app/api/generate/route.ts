import { NextRequest, NextResponse } from "next/server";
import { parseScenario } from "@/lib/scenarioParser";
import { z } from "zod";

const RequestSchema = z.object({
  input: z.string().min(2).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input } = RequestSchema.parse(body);

    // Stage 1: Parse scenario
    const parsed = parseScenario(input);

    // Stage 2-11: Generate behavior using local rule engine
    // (Supabase data fetch will be wired after DB setup)
    const behavior = generateBehaviorLocally(parsed, input);

    return NextResponse.json({ success: true, parsed, behavior });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "입력이 올바르지 않습니다." }, { status: 400 });
    }
    console.error("Generate error:", err);
    return NextResponse.json({ success: false, error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}

function generateBehaviorLocally(parsed: ReturnType<typeof parseScenario>, rawInput: string) {
  const {
    userStates, environmentStates, objectStates, taskStates,
    detectedTargets, likelyIntent, brightness, distance, confidence, keywords,
  } = parsed;

  const hasUser = userStates.includes("user_present") || userStates.includes("user_approaching");
  const hasSurface = environmentStates.includes("projection_surface_available");
  const hasObject = objectStates.includes("target_object_present");
  const needsGuide = taskStates.includes("user_needs_guidance") || taskStates.includes("task_not_started");
  const isClose = distance === "too_close";
  const isDim = brightness === "dim";
  const isBright = brightness === "bright";
  const isLowConfidence = confidence === "low";

  const warnings: string[] = [];
  if (isClose) warnings.push("CON-02: 사용자가 너무 가까워 모션 진폭과 속도를 제한합니다.");
  if (!hasSurface && (likelyIntent === "guide" || hasObject)) warnings.push("CON-07: 투사 가능한 표면이 감지되지 않아 투사를 보류합니다.");
  if (isLowConfidence) warnings.push("CON-04: 인식 신뢰도가 낮아 확정 피드백을 제공하지 않습니다.");

  const intentLabels: Record<string, string> = {
    guide: "안내 (Guide)", acknowledge: "인식 (Acknowledge)", confirm: "확인 (Confirm)",
    attract: "주의 끌기 (Attract)", invite: "초대 (Invite)", clarify: "재요청 (Clarify)",
    complete: "완료 (Complete)", wait: "대기 (Wait)", withdraw: "종료 (Withdraw)",
    warn: "경고 (Warn)", observe: "관찰 (Observe)", recover: "복구 (Recover)",
  };

  // Camera output
  const cameraTargets = ["사용자"];
  if (hasObject) cameraTargets.push("물체");
  if (hasSurface) cameraTargets.push("투사 가능한 표면");
  if (detectedTargets.includes("paper")) cameraTargets.push("종이");
  if (detectedTargets.includes("drawing_tool")) cameraTargets.push("필기도구");

  // ToF output
  const tofStates = [];
  if (distance === "near") tofStates.push("사용자가 상호작용 범위 내 (0.5–1.5m)에 있습니다.");
  if (distance === "too_close") tofStates.push("사용자가 최소 안전 거리(0.4m) 이하에 있습니다. 모션 제한이 활성화됩니다.");
  if (distance === "far") tofStates.push("사용자가 상호작용 범위 밖에 있습니다.");
  if (distance === "medium") tofStates.push("사용자가 적정 상호작용 거리에 있습니다.");

  // Microphone
  const micOutputs = ["주변 소음 수준을 모니터링합니다."];
  if (rawInput.includes("불러") || rawInput.includes("이름")) micOutputs.push("사용자 호출음 감지를 활성화합니다.");

  // Motion
  const motionSeq = [];
  if (hasUser) motionSeq.push("PUCO는 사용자를 향해 " + (isClose ? "매우 천천히" : "천천히") + " 방향을 전환합니다.");
  if (needsGuide && hasSurface) {
    motionSeq.push("종이 쪽으로 몸을 " + (isClose ? "미세하게" : "작고 부드럽게") + " 앞으로 숙여 관심을 표현합니다.");
    motionSeq.push("투사 위치를 가리키듯 프로젝터 방향을 정밀하게 조정합니다.");
  }
  if (likelyIntent === "acknowledge" || likelyIntent === "confirm") {
    if (!isLowConfidence) motionSeq.push("짧고 또렷하게 한 번 끄덕입니다.");
    else motionSeq.push("한쪽으로 살짝 기울이며 재입력을 기다립니다.");
  }
  if (likelyIntent === "complete") {
    motionSeq.push("몸을 세우고 리듬감 있게 두 번 끄덕입니다.");
    motionSeq.push("천천히 힘을 풀듯 중립 자세로 복귀합니다.");
  }
  if (motionSeq.length === 0) motionSeq.push("현재 자세를 유지하며 사용자 반응을 기다립니다.");

  // Projection
  const projContent = [];
  const projBrightness = isBright
    ? "밝은 환경에서 선 굵기와 대비를 높입니다."
    : isDim
    ? "어두운 환경에서 밝기를 낮추고 부드럽게 페이드인합니다."
    : "주변 밝기에 맞춰 대비를 자동 조정합니다.";

  if (!hasSurface) {
    projContent.push("투사 가능한 표면이 감지되지 않아 투사를 보류합니다. 좌우를 천천히 살피며 표면을 탐색합니다.");
  } else {
    if (needsGuide) projContent.push("투사면에 작업 가이드 애니메이션을 천천히 페이드인합니다.");
    if (likelyIntent === "guide") projContent.push("화살표로 사용자가 따라갈 방향을 표시합니다.");
    if (likelyIntent === "confirm" && !isLowConfidence) projContent.push("확인 아이콘을 확장 효과와 함께 1–2초 표시합니다.");
    if (likelyIntent === "complete") projContent.push("완료 아이콘을 확장 효과로 표시하고 2–3초 후 페이드아웃합니다.");
    if (projContent.length === 0) projContent.push("관련 정보를 투사면에 페이드인합니다.");
    projContent.push(projBrightness);
  }

  // Sound
  const soundOutputs = [];
  if (likelyIntent === "acknowledge") soundOutputs.push("짧은 확인음을 낮은 볼륨으로 재생합니다.");
  if (likelyIntent === "complete") soundOutputs.push("완료를 알리는 상승 톤 신호음을 재생합니다.");
  if (likelyIntent === "warn") soundOutputs.push("경고음을 즉시 재생합니다.");
  if (soundOutputs.length === 0) soundOutputs.push("별도 소리 출력 없이 모션과 프로젝션으로만 표현합니다.");

  // Monitoring
  const monitorExpected = [];
  if (likelyIntent === "guide") monitorExpected.push("사용자가 안내 방향으로 이동하거나 작업을 시작한다.");
  if (likelyIntent === "acknowledge") monitorExpected.push("사용자가 다음 제스처를 수행하거나 PUCO를 계속 바라본다.");
  if (likelyIntent === "complete") monitorExpected.push("사용자가 만족 반응을 보이거나 자리를 떠난다.");
  if (monitorExpected.length === 0) monitorExpected.push("사용자의 다음 행동 또는 반응을 기다립니다.");

  // Recovery
  const recovery = {
    uncertain: isLowConfidence
      ? ["끄덕이지 않고 몸을 작게 기울이며 재입력을 기다립니다.", "확인 프로젝션을 표시하지 않습니다."]
      : ["신뢰도가 낮아지면 확정 표현 대신 기울임 동작으로 전환합니다."],
    noResponse: ["1차 무반응: 동일 Intent를 더 명확한 방식으로 한 번 표현합니다.", "2차 무반응: 반복하지 않고 대기 또는 종료로 전환합니다."],
    userLeft: ["투사와 추적을 즉시 종료합니다.", "천천히 힘을 풀듯 중립 자세로 복귀합니다."],
    unsafe: ["모든 동작을 즉시 멈춥니다.", "경고 그래픽을 최대 대비로 즉시 표시합니다.", "안전 거리 확보 후 상황을 재평가합니다."],
    unavailableCapability: ["투사면이 없으면 모션으로만 안내합니다.", "인식 실패 시 좌우를 살피며 탐색합니다."],
  };

  // Usage example
  let usageExample = "";
  if (taskStates.includes("task_not_started") && hasSurface) {
    usageExample = `${keywords.slice(0, 3).join("·")}가 감지되었습니다. PUCO는 사용자와 ${detectedTargets.includes("paper") ? "종이" : "대상"}의 위치를 확인하고 투사면에 가이드를 표시합니다. 작업이 시작되면 가이드 밝기를 낮추고 조용히 관찰합니다. 작업이 완료되면 끄덕이며 완료를 표현합니다.`;
  } else if (likelyIntent === "acknowledge") {
    usageExample = `사용자가 PUCO 방향으로 손을 들었습니다. PUCO는 즉시 사용자를 향해 방향을 전환하고 끄덕이며 인식을 알립니다. 투사면에 확인 아이콘이 잠깐 나타났다 사라집니다.`;
  } else {
    usageExample = `${keywords.slice(0, 2).join("·")} 상황에서 PUCO는 ${intentLabels[likelyIntent] ?? "적절한 행동"}을 수행합니다. 상황이 변화하면 실시간으로 반응을 조정합니다.`;
  }

  return {
    situationAnalysis: {
      trigger: rawInput,
      userState: userStates.map((s) => s.replace(/_/g, " ")),
      environmentState: environmentStates.map((s) => s.replace(/_/g, " ")),
      objectState: objectStates.map((s) => s.replace(/_/g, " ")),
      taskState: taskStates.map((s) => s.replace(/_/g, " ")),
      intent: intentLabels[likelyIntent] ?? likelyIntent,
    },
    camera: {
      targets: cameraTargets,
      conditions: [
        `카메라 신뢰도: ${confidence === "high" ? "높음" : confidence === "medium" ? "보통" : "낮음"}`,
        hasSurface ? "투사 가능한 평면 확인됨" : "투사 가능한 평면 미감지",
        isBright ? "밝은 환경 — 선 굵기와 대비를 높입니다" : isDim ? "어두운 환경 — 급격한 점멸을 피합니다" : "표준 조명 환경",
      ],
      lowConfidenceResponse: ["확정 행동 없이 기울임 동작으로 재확인 유도", "투사 없이 모션으로만 대응", "2회 이후 대기 상태로 전환"],
    },
    tof: {
      states: tofStates.length ? tofStates : ["사용자 거리를 측정 중입니다."],
      changeConditions: [
        "천천히 접근 시: 주의 집중 모드 진입",
        "빠른 접근 시: 안전 우선 모드 즉시 활성화",
        "이탈 감지 시: 추적과 투사를 순차 종료",
      ],
      safetyConditions: isClose
        ? ["모션 진폭 제한 활성화 (CON-02)", "빠른 모션 금지", "관절 이동 최소화"]
        : ["정상 거리 — 제약 없음"],
    },
    microphone: {
      outputs: micOutputs,
      direction: "소리 발생 방향을 추적하여 PUCO 방향 전환에 반영합니다.",
      status: "소리 방향 추적 활성화, 음성 인식 비활성화 (현재 Capability 범위 외)",
    },
    interpretation: {
      meaning: `상황 분석 결과: ${intentLabels[likelyIntent] ?? likelyIntent} 상황`,
      confidence: confidence === "high" ? "높음" : confidence === "medium" ? "보통" : "낮음",
      riskLevel: isClose ? "중간" : "낮음",
    },
    motion: {
      target: hasUser ? "사용자" : "지정 없음",
      sequence: motionSeq,
      speed: isClose ? ["매우 천천히 (CON-02 적용)"] : ["천천히", "보통 속도"],
      amplitude: isClose ? ["미세하게 (CON-02 적용)"] : ["작게", "적당히"],
      quality: ["부드럽게", "조심스럽게"],
      rhythm: likelyIntent === "acknowledge" ? ["한 번"] : likelyIntent === "complete" ? ["두 번"] : ["단일"],
      holdCondition: "사용자가 반응하거나 다음 단계로 이동할 때까지",
      exitMotion: "자연스럽게 중립 자세로 복귀합니다",
    },
    projection: {
      content: projContent,
      targetSurface: hasSurface ? ["책상 표면", "가장 가까운 평면"] : ["표면 탐색 중"],
      brightness: [projBrightness],
      scaleAndContrast: isBright ? ["크기 중간, 높은 대비"] : ["크기 중간, 낮은 대비"],
      transitions: ["페이드인으로 등장", "페이드아웃으로 종료"],
      duration: needsGuide ? ["작업이 완료될 때까지 유지"] : ["1–3초 유지 후 자동 종료"],
    },
    sound: {
      outputs: soundOutputs,
      volume: likelyIntent === "warn" ? "높음" : "낮음",
      duration: "0.3–1.0초",
      startCondition: "행동 시작과 동시",
      stopCondition: "사운드 파일 재생 완료",
    },
    timing: {
      sequence: [
        "0ms — 센서 입력 수신",
        "50ms — Perception 처리",
        "100ms — Context 추출",
        "150ms — Interpretation 결정",
        "200ms — Intent 및 Policy 선택",
        "250ms — 모션 시작",
        hasSurface ? "300ms — 투사 시작 (페이드인)" : "300ms — 표면 탐색 모션",
        likelyIntent === "acknowledge" ? "350ms — 확인음 재생" : "350ms — 모니터링 시작",
        "모니터링 → 사용자 반응 감지 → 성공/재시도/종료 결정",
      ],
    },
    monitoring: {
      expectedResponse: monitorExpected,
      successCondition: ["사용자가 의도한 행동을 시작하거나 완료한다", "사용자가 PUCO를 향해 시선을 유지한다"],
      timeout: "5초 무반응 시 1차 에스컬레이션, 10초 무반응 시 대기 또는 종료",
    },
    recovery,
    usageExample,
    selectedRuleIds: ["LOCAL-ENGINE"],
    warnings,
  };
}
