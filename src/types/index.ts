export type Severity = "mild" | "attention" | "urgent";
export type AdviceType = "medication" | "exercise" | "diet";

export interface Report {
  id: string;
  institution: string;
  examDate: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Indicator {
  id: string;
  reportId: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  severity: Severity;
  doctorAdvice: string;
  followUpCycleDays: number;
  nextFollowUpDate: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  indicatorId: string;
  date: string;
  value: number;
  doctorFeedback: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Advice {
  id: string;
  indicatorId: string;
  type: AdviceType;
  content: string;
  completed: boolean;
  createdAt: string;
}

export const severityLabels: Record<Severity, string> = {
  mild: "轻微",
  attention: "关注",
  urgent: "尽快处理",
};

export const severityColors: Record<Severity, string> = {
  mild: "bg-severity-mild",
  attention: "bg-severity-attention",
  urgent: "bg-severity-urgent",
};

export const severityTextColors: Record<Severity, string> = {
  mild: "text-severity-mild",
  attention: "text-severity-attention",
  urgent: "text-severity-urgent",
};

export const adviceTypeLabels: Record<AdviceType, string> = {
  medication: "用药",
  exercise: "运动",
  diet: "饮食",
};

export const adviceTypeIcons: Record<AdviceType, string> = {
  medication: "💊",
  exercise: "🏃",
  diet: "🥗",
};
