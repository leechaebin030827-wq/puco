import type { ParsedScenario, ConfidenceLevel } from "./types";

// ─── Keyword Dictionary ───────────────────────────────────────────────────────
// Maps Korean (and common English) keywords → context state IDs

const KEYWORD_MAP: Record<string, string[]> = {
  // User states
  "다가오다": ["user_approaching"],
  "가까이 오다": ["user_approaching"],
  "접근": ["user_approaching"],
  "다가가": ["user_approaching"],
  "떠나다": ["user_leaving"],
  "멀어지다": ["user_leaving"],
  "나가다": ["user_leaving"],
  "자리를 떠": ["user_leaving"],
  "쳐다보다": ["user_attentive"],
  "바라보다": ["user_attentive"],
  "바라볼": ["user_attentive"],
  "응시": ["user_attentive"],
  "보고 있": ["user_attentive"],
  "손이 바쁘다": ["user_hands_occupied"],
  "요리": ["user_hands_occupied"],
  "들고": ["user_hands_occupied"],
  "잡고": ["user_hands_occupied"],
  "쓰고": ["user_hands_occupied"],
  "기다리": ["user_waiting"],
  "멈춰": ["user_waiting"],
  "머물": ["user_waiting"],
  "망설": ["user_hesitating"],
  "손을 들": ["user_requesting_interaction"],
  "손바닥": ["user_requesting_interaction"],
  "손을 흔": ["user_requesting_interaction"],
  "제스처": ["user_requesting_interaction"],
  "손짓": ["user_requesting_interaction"],
  "가리키": ["user_requesting_interaction"],
  "아이": ["user_present"],
  "사용자": ["user_present"],
  "사람": ["user_present"],
  "어린이": ["user_present"],
  "학생": ["user_present"],
  "여러 명": ["multiple_users_present"],
  "두 명": ["multiple_users_present"],
  "여럿": ["multiple_users_present"],

  // Environment states
  "밝다": ["environment_bright"],
  "밝은": ["environment_bright"],
  "햇빛": ["environment_bright"],
  "낮에": ["environment_bright"],
  "어둡다": ["environment_dim"],
  "어두운": ["environment_dim"],
  "밤에": ["environment_dim"],
  "저녁": ["environment_dim"],

  // Object / Surface
  "종이": ["target_object_present", "projection_surface_available"],
  "책상": ["projection_surface_available", "target_object_present"],
  "테이블": ["projection_surface_available"],
  "벽": ["projection_surface_available"],
  "바닥": ["projection_surface_available"],
  "화이트보드": ["projection_surface_available"],
  "물체": ["target_object_present"],
  "상자": ["target_object_present"],
  "컵": ["target_object_present"],

  // Task states
  "그림": ["task_not_started", "user_needs_guidance"],
  "그리": ["task_not_started", "user_needs_guidance"],
  "작업": ["task_not_started"],
  "만들": ["task_not_started"],
  "시작": ["task_not_started"],
  "완료": ["task_completed"],
  "끝났": ["task_completed"],
  "마쳤": ["task_completed"],
  "도움": ["user_needs_guidance"],
  "안내": ["user_needs_guidance"],
  "방법": ["user_needs_guidance"],
  "모르": ["user_needs_guidance"],
  "진행": ["task_in_progress"],
  "하고 있": ["task_in_progress"],

  // Distance / Safety
  "너무 가깝": ["interaction_space_obstructed"],
  "바짝": ["interaction_space_obstructed"],
  "충돌": ["interaction_space_obstructed"],
  "위험": ["interaction_space_obstructed"],
  "빠르게 접근": ["interaction_space_obstructed"],
};

// Intent keyword map
const INTENT_KEYWORD_MAP: Record<string, string> = {
  "그리": "guide",
  "안내": "guide",
  "도움": "guide",
  "방법": "guide",
  "확인": "confirm",
  "완료": "complete",
  "끝": "complete",
  "경고": "warn",
  "위험": "warn",
  "충돌": "warn",
  "인식": "acknowledge",
  "반응": "acknowledge",
  "주의": "attract",
  "관심": "attract",
  "초대": "invite",
  "제안": "invite",
  "기다리": "wait",
  "불확실": "clarify",
  "다시": "clarify",
  "종료": "withdraw",
  "떠나": "withdraw",
  "관찰": "observe",
};

// Target detection map
const TARGET_MAP: Record<string, string> = {
  "사용자": "user",
  "아이": "user",
  "사람": "user",
  "학생": "user",
  "종이": "paper",
  "책상": "table_surface",
  "테이블": "table_surface",
  "벽": "wall_surface",
  "바닥": "floor_surface",
  "화이트보드": "whiteboard_surface",
  "물체": "object",
  "상자": "box",
  "컵": "cup",
  "필기도구": "drawing_tool",
  "연필": "drawing_tool",
  "펜": "drawing_tool",
  "크레용": "drawing_tool",
};

// ─── Main Parser ──────────────────────────────────────────────────────────────

export function parseScenario(input: string): ParsedScenario {
  const lower = input.toLowerCase();
  const detectedContextIds = new Set<string>();
  const detectedTargets = new Set<string>();
  const keywords: string[] = [];

  // Keyword matching for context states
  for (const [kw, states] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(kw)) {
      keywords.push(kw);
      states.forEach((s) => detectedContextIds.add(s));
    }
  }

  // Target detection
  for (const [kw, target] of Object.entries(TARGET_MAP)) {
    if (lower.includes(kw)) {
      detectedTargets.add(target);
    }
  }

  // Always assume user is present if mentioned
  if (detectedTargets.has("user") || detectedContextIds.has("user_approaching")) {
    detectedContextIds.add("user_present");
  }

  // Infer projection surface from targets
  if (detectedTargets.has("paper") || detectedTargets.has("table_surface")) {
    detectedContextIds.add("projection_surface_available");
  }

  // Determine brightness
  let brightness: ParsedScenario["brightness"] = "unknown";
  if (detectedContextIds.has("environment_bright")) brightness = "bright";
  else if (detectedContextIds.has("environment_dim")) brightness = "dim";

  // Determine distance
  let distance: ParsedScenario["distance"] = "medium";
  if (detectedContextIds.has("interaction_space_obstructed")) distance = "too_close";
  else if (detectedContextIds.has("user_approaching")) distance = "near";
  else if (detectedContextIds.has("user_leaving")) distance = "far";
  else if (detectedContextIds.has("user_waiting") || detectedContextIds.has("user_present")) distance = "near";

  // Intent detection
  let likelyIntent = "acknowledge";
  for (const [kw, intent] of Object.entries(INTENT_KEYWORD_MAP)) {
    if (lower.includes(kw)) {
      likelyIntent = intent;
      break;
    }
  }

  // Confidence based on how many context IDs were found
  let confidence: ConfidenceLevel = "low";
  if (detectedContextIds.size >= 3) confidence = "medium";
  if (detectedContextIds.size >= 5) confidence = "high";

  // Categorise states
  const userCategories = ["user_present","user_absent","user_attentive","user_inattentive",
    "user_approaching","user_leaving","user_waiting","user_hesitating",
    "user_hands_occupied","user_requesting_interaction","user_rejecting_interaction",
    "multiple_users_present"];
  const envCategories = ["environment_bright","environment_dim","projection_surface_available",
    "projection_surface_unavailable","projection_surface_occluded",
    "interaction_space_clear","interaction_space_obstructed"];
  const objCategories = ["target_object_present","target_object_missing",
    "target_object_moving","target_object_stationary"];
  const taskCategories = ["task_not_started","task_in_progress","task_paused",
    "task_completed","task_interrupted","user_needs_guidance","user_following_guidance"];

  const allIds = Array.from(detectedContextIds);
  const userStates = allIds.filter((id) => userCategories.includes(id));
  const environmentStates = allIds.filter((id) => envCategories.includes(id));
  const objectStates = allIds.filter((id) => objCategories.includes(id));
  const taskStates = allIds.filter((id) => taskCategories.includes(id));

  return {
    rawInput: input,
    userStates,
    environmentStates,
    objectStates,
    taskStates,
    detectedTargets: Array.from(detectedTargets),
    likelyIntent,
    brightness,
    distance,
    confidence,
    keywords: [...new Set(keywords)],
  };
}

// ─── AI Adapter Interface ─────────────────────────────────────────────────────
export interface ScenarioParserAdapter {
  parse(input: string): Promise<ParsedScenario>;
}

export class KeywordParserAdapter implements ScenarioParserAdapter {
  async parse(input: string): Promise<ParsedScenario> {
    return parseScenario(input);
  }
}
