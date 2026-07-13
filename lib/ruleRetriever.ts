import type { BehaviorRule, ParsedScenario, ScoredRule } from "./types";

// Priority sort order for combining rules
const PRIORITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// Intent name → GOAL-XX mapping
const INTENT_ID_MAP: Record<string, string> = {
  acknowledge: "GOAL-01",
  attract: "GOAL-02",
  invite: "GOAL-03",
  guide: "GOAL-04",
  confirm: "GOAL-05",
  clarify: "GOAL-06",
  encourage: "GOAL-07",
  warn: "GOAL-08",
  wait: "GOAL-09",
  complete: "GOAL-10",
  reject: "GOAL-11",
  recover: "GOAL-12",
  withdraw: "GOAL-13",
  observe: "GOAL-14",
  safety: "GOAL-15",
};

/**
 * Score a single rule against the parsed scenario.
 */
function scoreRule(rule: BehaviorRule, scenario: ParsedScenario): ScoredRule {
  let score = 0;
  const matchDetails: string[] = [];

  // Intent match (+5)
  const mappedIntent = INTENT_ID_MAP[scenario.likelyIntent];
  if (mappedIntent && rule.intentId === mappedIntent) {
    score += 5;
    matchDetails.push(`Intent match: ${rule.intentId}`);
  }

  // Context match (+3 each)
  const allScenarioContexts = [
    ...scenario.userStates,
    ...scenario.environmentStates,
    ...scenario.objectStates,
    ...scenario.taskStates,
  ];
  for (const ctx of rule.requiredContextIds) {
    if (allScenarioContexts.includes(ctx)) {
      score += 3;
      matchDetails.push(`Context match: ${ctx}`);
    }
  }

  // Target match (+2 each)
  for (const target of scenario.detectedTargets) {
    const found = rule.tags.some((t) =>
      t.toLowerCase().includes(target.toLowerCase())
    );
    if (found) {
      score += 2;
      matchDetails.push(`Target match: ${target}`);
    }
  }

  // Task match (+3 each)
  for (const ts of scenario.taskStates) {
    const taskTagMatch = rule.tags.some((t) => ts.includes(t) || t.includes("task"));
    if (taskTagMatch) {
      score += 3;
      matchDetails.push(`Task match: ${ts}`);
    }
  }

  // Brightness match (+1)
  if (
    (scenario.brightness === "bright" && rule.tags.includes("bright")) ||
    (scenario.brightness === "dim" && rule.tags.includes("dim"))
  ) {
    score += 1;
    matchDetails.push(`Brightness match: ${scenario.brightness}`);
  }

  // Distance safety penalty
  if (scenario.distance === "too_close" && !rule.tags.includes("safety")) {
    score -= 3;
    matchDetails.push("Penalty: too_close but not a safety rule");
  }

  // Safety rules get a big boost when safety is needed
  if (
    scenario.distance === "too_close" &&
    (rule.intentId === "GOAL-15" || rule.tags.includes("safety"))
  ) {
    score += 10;
    matchDetails.push("Safety rule priority boost");
  }

  return { rule, score, matchDetails };
}

/**
 * Check if two rules conflict (same motion group or contradicting intents).
 */
function rulesConflict(a: BehaviorRule, b: BehaviorRule): boolean {
  // Safety rules always override everything
  if (a.priority === "critical" || b.priority === "critical") {
    return a.priority !== "critical" || b.priority !== "critical";
  }
  // Don't combine Withdraw with Guide
  if (
    (a.intentId === "GOAL-13" && b.intentId === "GOAL-04") ||
    (b.intentId === "GOAL-13" && a.intentId === "GOAL-04")
  ) {
    return true;
  }
  return false;
}

/**
 * Retrieve and combine the best non-conflicting set of rules.
 * Priority order: Critical Safety → High → Task → Interaction → Expressive
 */
export function retrieveRules(rules: BehaviorRule[], scenario: ParsedScenario): ScoredRule[] {
  // Score all approved rules
  const scored = rules
    .filter((r) => r.status === "approved")
    .map((r) => scoreRule(r, scenario))
    .filter((sr) => sr.score > 0)
    .sort((a, b) => {
      // Primary: priority order
      const pDiff = PRIORITY_ORDER[b.rule.priority] - PRIORITY_ORDER[a.rule.priority];
      if (pDiff !== 0) return pDiff;
      // Secondary: score
      return b.score - a.score;
    });

  // Greedy combination: pick rules that don't conflict
  const selected: ScoredRule[] = [];
  for (const candidate of scored) {
    const conflicts = selected.some((s) => rulesConflict(s.rule, candidate.rule));
    if (!conflicts) {
      selected.push(candidate);
    }
    // Cap at 3 rules to keep output focused
    if (selected.length >= 3) break;
  }

  return selected;
}
