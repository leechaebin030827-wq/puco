import type { BehaviorRule, ParsedScenario, ScoredRule } from "./types";

export interface ValidationWarning {
  constraintId: string;
  constraintName: string;
  description: string;
  severity: "medium" | "high" | "critical";
  affectedRuleIds: string[];
  motionModification?: string;
  projectionModification?: string;
}

export interface ValidationResult {
  warnings: ValidationWarning[];
  modifiedRules: ScoredRule[];
}

/**
 * Hard-coded constraint checks enforced in code.
 */
export function validateConstraints(
  scoredRules: ScoredRule[],
  scenario: ParsedScenario
): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const modifiedRules: ScoredRule[] = scoredRules.map((sr) => ({
    ...sr,
    rule: { ...sr.rule, motionModifier: { ...sr.rule.motionModifier } },
  }));

  // CON-01: No projection onto user face/eyes
  // (Enforced via projection target surface restriction — flag if projection target is "user face")
  // We check by tagging: if rule has projection toward eye-level and user is very close
  if (scenario.distance === "too_close") {
    const projectionRules = modifiedRules.filter((sr) =>
      sr.rule.projectionIds.length > 0
    );
    if (projectionRules.length > 0) {
      warnings.push({
        constraintId: "CON-01",
        constraintName: "얼굴/눈 투사 금지",
        description: "사용자가 매우 가까이 있어 투사 방향에 주의가 필요합니다. 투사 대상을 안전한 표면으로 제한합니다.",
        severity: "critical",
        affectedRuleIds: projectionRules.map((sr) => sr.rule.id),
        projectionModification: "투사면을 Table 또는 Floor로 고정합니다.",
      });
    }
  }

  // CON-02: Limit large motion when user is too close
  if (scenario.distance === "too_close") {
    for (const sr of modifiedRules) {
      const amp = sr.rule.motionModifier.amplitude;
      if (amp === "medium" || amp === "large" || amp === "exaggerated") {
        sr.rule.motionModifier.amplitude = "small";
        sr.rule.motionModifier.speed = "slow";
        warnings.push({
          constraintId: "CON-02",
          constraintName: "근접 시 큰 모션 제한",
          description: "사용자가 너무 가까이 있어 모션 진폭과 속도를 줄입니다.",
          severity: "critical",
          affectedRuleIds: [sr.rule.id],
          motionModification: "진폭 → Small, 속도 → Slow로 제한됩니다.",
        });
      }
    }
  }

  // CON-04: No definitive confirm/success feedback on low confidence
  if (scenario.confidence === "low") {
    const confirmRules = modifiedRules.filter(
      (sr) => sr.rule.intentId === "GOAL-05" || sr.rule.intentId === "GOAL-10"
    );
    if (confirmRules.length > 0) {
      warnings.push({
        constraintId: "CON-04",
        constraintName: "낮은 신뢰도에서 확정 피드백 금지",
        description: "인식 신뢰도가 낮아 확정적인 완료/확인 피드백을 제공하지 않습니다.",
        severity: "high",
        affectedRuleIds: confirmRules.map((sr) => sr.rule.id),
        motionModification: "끄덕임(MOT-09)을 제거하고 기울임(MOT-11)으로 대체합니다.",
        projectionModification: "완료 아이콘(PRO-07) 대신 중립 표현을 사용합니다.",
      });
    }
  }

  // CON-05: No sudden large motion when user is not attentive
  if (scenario.userStates.includes("user_inattentive")) {
    for (const sr of modifiedRules) {
      const amp = sr.rule.motionModifier.amplitude;
      const speed = sr.rule.motionModifier.speed;
      if (amp === "large" || speed === "very_fast" || speed === "fast") {
        sr.rule.motionModifier.amplitude = "minimal";
        sr.rule.motionModifier.speed = "very_slow";
        warnings.push({
          constraintId: "CON-05",
          constraintName: "비주시 시 급격한 모션 금지",
          description: "사용자가 PUCO를 보고 있지 않아 갑작스러운 큰 움직임을 피합니다.",
          severity: "high",
          affectedRuleIds: [sr.rule.id],
          motionModification: "진폭 → Minimal, 속도 → Very Slow로 조정합니다.",
        });
      }
    }
  }

  // CON-07: No projection if surface not available
  if (scenario.environmentStates.includes("projection_surface_unavailable") &&
      !scenario.environmentStates.includes("projection_surface_available")) {
    const projectionRules = modifiedRules.filter((sr) =>
      sr.rule.projectionIds.length > 0
    );
    if (projectionRules.length > 0) {
      warnings.push({
        constraintId: "CON-07",
        constraintName: "표면 없이 임의 투사 금지",
        description: "투사 가능한 표면이 감지되지 않아 투사를 수행하지 않습니다. 모션으로만 의사를 전달합니다.",
        severity: "high",
        affectedRuleIds: projectionRules.map((sr) => sr.rule.id),
        projectionModification: "투사를 비활성화합니다. 모션만 사용합니다.",
      });
    }
  }

  // CON-09: Multiple users — flag for explicit target selection
  if (scenario.userStates.includes("multiple_users_present")) {
    warnings.push({
      constraintId: "CON-09",
      constraintName: "다중 사용자 대상 명시",
      description: "여러 사용자가 동시에 감지되어 상호작용 대상을 명시적으로 선택해야 합니다.",
      severity: "high",
      affectedRuleIds: modifiedRules.map((sr) => sr.rule.id),
    });
  }

  // CON-12: Conflicting sensor data
  if (
    scenario.distance === "too_close" &&
    scenario.userStates.includes("user_absent")
  ) {
    warnings.push({
      constraintId: "CON-12",
      constraintName: "센서 충돌 시 신뢰도 낮춤",
      description: "카메라와 거리센서 정보가 모순됩니다. 전체 신뢰도를 낮추고 재확인을 요청합니다.",
      severity: "high",
      affectedRuleIds: modifiedRules.map((sr) => sr.rule.id),
    });
  }

  return { warnings, modifiedRules };
}
