export interface Play {
  id: string;
  name: string;
  description: string;
  totalScenes: number;
  createdAt: string;
}

export interface Scene {
  id: string;
  playId: string;
  name: string;
  order: number;
  description: string;
}

export interface Cue {
  id: string;
  sceneId: string;
  number: number;
  name: string;
  description: string;
}

export interface Prop {
  id: string;
  name: string;
  category: string;
  description: string;
}

export type PropFlowStatus = 'pending' | 'confirmed' | 'issue';

export interface PropFlow {
  id: string;
  cueId: string;
  propId: string;
  from: string;
  to: string;
  handler: string;
  receiver: string;
  status: PropFlowStatus;
  confirmedAt?: string;
}

export type IssueType = 'lost' | 'damaged' | 'wrong_position';

export interface Issue {
  id: string;
  propId: string;
  propFlowId: string;
  type: IssueType;
  description: string;
  reportedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string;
}

export type Priority = 'high' | 'medium' | 'low';

export interface CheckItem {
  id: string;
  propId: string;
  issueId?: string;
  priority: Priority;
  checked: boolean;
  checkedAt?: string;
  note?: string;
}

export interface PropFlowWithDetails extends PropFlow {
  prop: Prop;
  cueNumber: number;
  cueName: string;
}

export interface IssueWithDetails extends Issue {
  prop: Prop;
  propFlow: PropFlow;
  cueNumber: number;
  cueName: string;
  sceneName: string;
  playName: string;
}

export interface CheckItemWithDetails extends CheckItem {
  prop: Prop;
  issue?: Issue;
}
