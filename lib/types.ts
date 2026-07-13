// ─── Capability ─────────────────────────────────────────────────────────────
export type CapabilityType = "camera" | "distance_sensor" | "joint_motion" | "beam_projector";

export interface Capability {
  id: string;
  name: string;
  inputOutput: "Input" | "Output";
  function: string;
  availableData: string[];
  limitations: string;
  status: "Available" | "Experimental" | "Unavailable";
}

// ─── Perception ──────────────────────────────────────────────────────────────
export type ConfidenceLevel = "low" | "medium" | "high";

export interface PerceptionPrimitive {
  id: string;
  sensor: "camera" | "distance_sensor";
  category: string;
  target: string;
  observable: string;
  condition: string;
  confidence: ConfidenceLevel;
  outputStateIds: string[];
  failureCondition: string;
  tags: string[];
}

// ─── Context State ───────────────────────────────────────────────────────────
export type ContextCategory = "user" | "environment" | "object" | "task" | "system";
export type Priority = "low" | "medium" | "high" | "critical";

export interface ContextState {
  id: string;
  name: string;
  category: ContextCategory;
  description: string;
  evidenceIds: string[];
  priority: Priority;
}

// ─── Interpretation ──────────────────────────────────────────────────────────
export type RiskLevel = "none" | "low" | "medium" | "high";

export interface Interpretation {
  id: string;
  name: string;
  description: string;
  requiredEvidenceIds: string[];
  requiredContextIds: string[];
  confidenceRule: string;
  riskLevel: RiskLevel;
  recommendedIntentIds: string[];
}

// ─── Intent ──────────────────────────────────────────────────────────────────
export interface Intent {
  id: string;
  name: string;
  purpose: string;
  defaultPriority: Priority;
  useWhen: string;
  avoidWhen: string;
  tags: string[];
}

// ─── Behavior Policy ─────────────────────────────────────────────────────────
export type Explicitness = "subtle" | "moderate" | "explicit";
export type Intensity = "low" | "medium" | "high";
export type Persistence = "once" | "limited_repeat" | "hold";
export type Urgency = "normal" | "elevated" | "immediate";
export type Initiative = "reactive" | "proactive";

export interface BehaviorPolicy {
  id: string;
  name: string;
  initiative: Initiative;
  explicitness: Explicitness;
  intensity: Intensity;
  persistence: Persistence;
  urgency: Urgency;
  interruptionTolerance: "high" | "medium" | "low";
  description: string;
  applicableIntentIds: string[];
}

// ─── Motion ──────────────────────────────────────────────────────────────────
export type Speed =
  | "very_slow" | "slow" | "normal" | "fast" | "very_fast"
  | "accelerating" | "decelerating";

export type Amplitude = "minimal" | "small" | "medium" | "large" | "exaggerated";

export type MotionQuality =
  | "smooth" | "clear" | "careful" | "firm" | "light"
  | "elastic" | "hesitant" | "sharp" | "flowing" | "rhythmic";

export interface MotionModifier {
  speed?: Speed;
  amplitude?: Amplitude;
  qualities?: MotionQuality[];
  rhythm?: string;
}

export interface MotionPrimitive {
  id: string;
  name: string;
  category: "Orientation" | "Posture" | "Gesture" | "Tracking" | "Transition";
  target: "User" | "Object" | "Surface" | "Direction" | "None";
  actuatorGroups: string[];
  actionDescription: string;
  defaultSpeed: Speed;
  defaultAmplitude: Amplitude;
  motionQualities: MotionQuality[];
  rhythm: string;
  holdCondition: string;
  exitMotion: string;
  expressiveMeaning: string[];
  intentIds: string[];
  projectionIds: string[];
  constraintIds: string[];
  tags: string[];
}

// ─── Projection ──────────────────────────────────────────────────────────────
export interface ProjectionModifier {
  scale?: string;
  brightness?: string;
  contrast?: string;
  transitionIn?: string;
  transitionOut?: string;
}

export interface ProjectionPrimitive {
  id: string;
  name: string;
  function: "Point" | "Highlight" | "Guide" | "Inform" | "Confirm" | "Warn" | "Express";
  contentType: "Icon" | "Line" | "Shape" | "Text" | "Animation" | "Image";
  targetSurface: "Table" | "Wall" | "Object" | "Floor" | "Undefined Surface";
  placementMode: "Fixed" | "Surface Anchored" | "Target Tracking";
  scale: "Small" | "Medium" | "Large" | "Adaptive";
  brightnessRule: string;
  contrast: "Low" | "Medium" | "High";
  transitionIn: "Immediate" | "Fade In" | "Expand" | "Draw";
  transitionOut: "Immediate" | "Fade Out" | "Shrink" | "Dissolve";
  animationStyle: "Static" | "Pulse" | "Move" | "Trace" | "Blink";
  durationRule: string;
  stopCondition: string;
  fallback: string;
  intentIds: string[];
  motionIds: string[];
  constraintIds: string[];
  tags: string[];
}

// ─── Constraint ──────────────────────────────────────────────────────────────
export interface Constraint {
  id: string;
  name: string;
  category: "Safety" | "Hardware" | "Perception" | "Projection" | "Motion" | "Social";
  condition: string;
  restrictedBehavior: string;
  requiredResponse: string;
  priority: "medium" | "high" | "critical";
  relatedCapabilityIds: string[];
}

// ─── Feedback / Recovery ─────────────────────────────────────────────────────
export type ResultType =
  | "Success" | "Partial Success" | "No Response"
  | "Uncertain" | "Interrupted" | "Unsafe" | "System Failure" | "User Left";

export interface FeedbackRecovery {
  id: string;
  resultType: ResultType;
  expectedUserResponse: string;
  monitoringPerceptionIds: string[];
  timeoutCondition: string;
  motionFeedbackIds: string[];
  projectionFeedbackIds: string[];
  nextIntentIds: string[];
  recoveryDescription: string;
  maximumRepeat: number;
}

// ─── Behavior Rule ───────────────────────────────────────────────────────────
export interface BehaviorRule {
  id: string;
  name: string;
  trigger: string;
  requiredContextIds: string[];
  cameraPerceptionIds: string[];
  distancePerceptionIds: string[];
  conditionLogic: string;
  interpretationId: string;
  intentId: string;
  policyId: string;
  priority: Priority;
  motionIds: string[];
  motionModifier: MotionModifier;
  projectionIds: string[];
  projectionModifier: ProjectionModifier;
  expectedResponse: string;
  feedbackRecoveryIds: string[];
  constraintIds: string[];
  exitCondition: string;
  tags: string[];
  status: "draft" | "test" | "approved" | "deprecated";
}

// ─── Behavior Case ───────────────────────────────────────────────────────────
export interface BehaviorCase {
  id: string;
  scenarioInput: string;
  scenarioCategory: string[];
  extractedContextIds: string[];
  selectedRuleIds: string[];
  cameraOutput: string;
  distanceOutput: string;
  projectionOutput: string;
  motionOutput: string;
  exceptionOutput: string;
  usageExample: string;
  validationStatus: "draft" | "reviewed" | "approved";
}

// ─── Parser types ────────────────────────────────────────────────────────────
export interface ParsedScenario {
  rawInput: string;
  userStates: string[];
  environmentStates: string[];
  objectStates: string[];
  taskStates: string[];
  detectedTargets: string[];
  likelyIntent: string;
  brightness: "unknown" | "bright" | "normal" | "dim";
  distance: "unknown" | "too_close" | "near" | "medium" | "far";
  confidence: ConfidenceLevel;
  keywords: string[];
}

// ─── Generated Behavior ──────────────────────────────────────────────────────
export interface GeneratedBehavior {
  situationAnalysis: {
    trigger: string;
    userState: string[];
    environmentState: string[];
    objectState: string[];
    taskState: string[];
    intent: string;
  };
  camera: {
    targets: string[];
    conditions: string[];
    lowConfidenceResponse: string[];
  };
  distanceSensor: {
    states: string[];
    changeConditions: string[];
    safetyConditions: string[];
  };
  projection: {
    content: string[];
    targetSurface: string[];
    brightness: string[];
    scaleAndContrast: string[];
    transitions: string[];
    duration: string[];
  };
  motion: {
    target: string;
    sequence: string[];
    speed: string[];
    amplitude: string[];
    quality: string[];
    rhythm: string[];
    holdCondition: string;
    exitMotion: string;
  };
  monitoring: {
    expectedResponse: string[];
    successCondition: string[];
    timeout: string;
  };
  recovery: {
    uncertain: string[];
    noResponse: string[];
    userLeft: string[];
    unsafe: string[];
    unavailableCapability: string[];
  };
  usageExample: string;
  selectedRuleIds: string[];
  warnings: string[];
}

// ─── Scored Rule (for retriever) ─────────────────────────────────────────────
export interface ScoredRule {
  rule: BehaviorRule;
  score: number;
  matchDetails: string[];
}
