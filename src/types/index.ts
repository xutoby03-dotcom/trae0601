export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export type JsonType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface TreeNode {
  key: string;
  value: JsonValue;
  type: JsonType;
  path: string;
  children?: TreeNode[];
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: TreeNode | null;
}

export type ViewMode = 'view' | 'compare' | 'table';

export interface DiffResult {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldValue?: JsonValue;
  newValue?: JsonValue;
}

export interface TableColumn {
  key: string;
  title: string;
}

export interface TableRow {
  [key: string]: JsonValue;
}
