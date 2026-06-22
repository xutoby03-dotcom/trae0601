export type FlowEventType = 'created' | 'picked' | 'opened' | 'wrongly_taken' | 'missed' | 'reissued';

export type EnvelopeStatus = 'pending' | 'picked' | 'opened' | 'missed' | 'reissued';

export interface Session {
  id: string;
  roomName: string;
  scriptName: string;
  date: string;
  characters: string[];
}

export interface Envelope {
  id: string;
  sessionId: string;
  name: string;
  content: string;
  actNumber: number;
  ownerCharacter: string;
  isKeyEvidence: boolean;
  status: EnvelopeStatus;
}

export interface FlowEvent {
  id: string;
  envelopeId: string;
  eventType: FlowEventType;
  triggeredBy: string;
  timestamp: string;
  note?: string;
}

export interface EnvelopeFormData {
  name: string;
  content: string;
  actNumber: number;
  ownerCharacter: string;
  isKeyEvidence: boolean;
}

export const FLOW_EVENT_LABELS: Record<FlowEventType, string> = {
  created: '封套创建',
  picked: '玩家领取',
  opened: '玩家打开',
  wrongly_taken: '被误拿',
  missed: '被遗漏',
  reissued: '主持人补发',
};

export const FLOW_EVENT_COLORS: Record<FlowEventType, string> = {
  created: 'bg-parchment-200 text-ink-800 border-parchment-400',
  picked: 'bg-seal-green text-parchment-50 border-green-900',
  opened: 'bg-ink-700 text-parchment-50 border-ink-900',
  wrongly_taken: 'bg-seal-amber text-ink-900 border-yellow-700',
  missed: 'bg-seal-red text-parchment-50 border-red-900',
  reissued: 'bg-blue-700 text-parchment-50 border-blue-900',
};

export const STATUS_LABELS: Record<EnvelopeStatus, string> = {
  pending: '待领取',
  picked: '已领取',
  opened: '已打开',
  missed: '已遗漏',
  reissued: '已补发',
};

export const STATUS_COLORS: Record<EnvelopeStatus, string> = {
  pending: 'bg-parchment-200 text-ink-800 border-parchment-400',
  picked: 'bg-seal-green text-parchment-50 border-green-900',
  opened: 'bg-ink-700 text-parchment-50 border-ink-900',
  missed: 'bg-seal-red text-parchment-50 border-red-900',
  reissued: 'bg-blue-700 text-parchment-50 border-blue-900',
};
