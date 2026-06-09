export type NoiseType = 'renovation' | 'singing' | 'speaker' | 'pet' | 'other';
export type DecibelLevel = 'quiet' | 'moderate' | 'loud' | 'extreme';
export type ComplaintStatus = 'ongoing' | 'pending' | 'resolved' | 'recurring';
export type ActionType = 'visited' | 'contacted' | 'police' | 'rectification';

export interface Second {
  id: string;
  complaintId: string;
  userId: string;
  createdAt: string;
}

export interface Action {
  id: string;
  complaintId: string;
  type: ActionType;
  actionTime: string;
  note: string;
  operatorId: string;
  rectificationDeadline?: string;
}

export interface Complaint {
  id: string;
  location: string;
  noiseType: NoiseType;
  noiseTime: string;
  durationMinutes: number;
  decibelLevel: DecibelLevel;
  affectsRest: boolean;
  notes: string;
  photoUrls: string[];
  audioUrls: string[];
  status: ComplaintStatus;
  reporterId: string;
  createdAt: string;
  seconds: Second[];
  actions: Action[];
}

export const NOISE_TYPE_LABELS: Record<NoiseType, string> = {
  renovation: '装修噪音',
  singing: '夜间唱歌',
  speaker: '广场音响',
  pet: '宠物噪音',
  other: '其他噪音',
};

export const DECIBEL_LABELS: Record<DecibelLevel, string> = {
  quiet: '安静 (<40dB)',
  moderate: '较吵 (40-60dB)',
  loud: '很吵 (60-80dB)',
  extreme: '震耳 (>80dB)',
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  ongoing: '正在发生',
  pending: '待沟通',
  resolved: '已解决',
  recurring: '反复出现',
};

export const ACTION_LABELS: Record<ActionType, string> = {
  visited: '已上门',
  contacted: '已联系',
  police: '已报警',
  rectification: '约定整改',
};

export const NOISE_TYPE_COLORS: Record<NoiseType, string> = {
  renovation: 'bg-amber-500',
  singing: 'bg-purple-500',
  speaker: 'bg-rose-500',
  pet: 'bg-sky-500',
  other: 'bg-slate-500',
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  ongoing: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  recurring: 'bg-orange-100 text-orange-700',
};

export const DECIBEL_COLORS: Record<DecibelLevel, string> = {
  quiet: 'text-emerald-500',
  moderate: 'text-amber-500',
  loud: 'text-orange-500',
  extreme: 'text-red-500',
};
