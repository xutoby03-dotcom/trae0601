export interface Article {
  id: string;
  title: string;
  content: string;
  folderId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TypoItem {
  word: string;
  position: number;
  suggestion: string;
}

export interface RepeatedWord {
  word: string;
  count: number;
}

export type ArticleType = 'argumentative' | 'narrative' | 'expository' | 'other';

export interface AnalysisResult {
  totalChars: number;
  totalWords: number;
  paragraphCount: number;
  sentenceCount: number;
  typos: TypoItem[];
  repeatedWords: RepeatedWord[];
  readabilityScore: number;
  articleType: ArticleType;
  typeConfidence: number;
}

export type RewriteStyle = 'concise' | 'formal' | 'lively';

export interface Template {
  id: string;
  name: string;
  category: string;
  icon: string;
  content: string;
  description: string;
}

export type ExportFormat = 'docx' | 'markdown' | 'pdf';
