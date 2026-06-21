export type QuestionSource = 'onsite' | 'online';

export type QuestionStatus = 'pending' | 'queued' | 'answering' | 'answered' | 'merged';

export interface Question {
  id: string;
  content: string;
  asker: string;
  source: QuestionSource;
  topic: string;
  heat: number;
  status: QuestionStatus;
  createdAt: number;
  mergedFrom?: string[];
  similarIds?: string[];
}

export interface AnswerRecord {
  questionId: string;
  summary: string;
  followUpMaterials: string;
  answeredAt: number;
  speakerName?: string;
}

export interface EventConfig {
  id: string;
  title: string;
  topics: string[];
  createdAt: number;
}

export type SortMode = 'heat' | 'time' | 'topic';

export type FilterMode = 'all' | 'pending' | 'queued' | 'answered' | 'onsite' | 'online' | 'unanswered';
