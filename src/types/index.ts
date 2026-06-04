export interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  hasIndex: boolean;
  foreignKeyRef?: string;
}

export interface ForeignKey {
  column: string;
  refTable: string;
  refColumn: string;
}

export interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
  rowCount?: number;
}

export interface Database {
  id: string;
  name: string;
  description: string;
  tables: Table[];
  sql: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  affectedRows?: number;
  error?: string;
  executionTime: number;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  databaseId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  expectedQuery: string;
  hint?: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  databaseId: string;
  createdAt: number;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  databaseId: string;
  result?: QueryResult;
  executedAt: number;
}

export interface Progress {
  completedProblems: number[];
  savedQueries: SavedQuery[];
  queryHistory: QueryHistoryItem[];
}

export interface ExecutionPlanNode {
  id: string;
  label: string;
  details: string;
  children: ExecutionPlanNode[];
}

export type Theme = 'light' | 'dark';

export interface AppState {
  theme: Theme;
  currentDatabaseId: string;
  currentProblemId: number | null;
  sql: string;
  result: QueryResult | null;
  isExecuting: boolean;
  showExecutionPlan: boolean;
  showSettings: boolean;
  showHistory: boolean;
}
