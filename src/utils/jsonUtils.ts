import { JsonValue, JsonType, TreeNode, DiffResult, TableColumn, TableRow } from '@/types';

export function getPathLineMap(jsonStr: string): Map<string, number> {
  const lineMap = new Map<string, number>();
  const lines = jsonStr.split('\n');
  const pathStack: string[] = ['$'];
  let arrayIndexStack: number[] = [];

  lineMap.set('$', 1);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();

    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      pathStack.pop();
      if (trimmed.startsWith(']')) {
        arrayIndexStack.pop();
      }
      continue;
    }

    const keyMatch = trimmed.match(/^"([^"]+)"\s*:/);
    if (keyMatch) {
      const key = keyMatch[1];
      const parentPath = pathStack[pathStack.length - 1];
      const currentPath = parentPath + '.' + key;
      lineMap.set(currentPath, lineNum);

      const rest = trimmed.slice(keyMatch[0].length).trim();
      if (rest.startsWith('{')) {
        pathStack.push(currentPath);
      } else if (rest.startsWith('[')) {
        pathStack.push(currentPath);
        arrayIndexStack.push(0);
      }
      continue;
    }

    if (trimmed.startsWith('{') && pathStack.length > 0) {
      continue;
    }

    if (trimmed === '[' || trimmed.startsWith('[') && pathStack.length > 0) {
      continue;
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      continue;
    }

    if (trimmed === ',' || trimmed === '') {
      continue;
    }

    if (trimmed.match(/^\d/) || trimmed.startsWith('"') || trimmed === 'true' || trimmed === 'false' || trimmed === 'null') {
      if (arrayIndexStack.length > 0) {
        const arrPath = pathStack[pathStack.length - 1];
        const idx = arrayIndexStack[arrayIndexStack.length - 1];
        const elementPath = arrPath + '[' + idx + ']';
        lineMap.set(elementPath, lineNum);
        arrayIndexStack[arrayIndexStack.length - 1] = idx + 1;
      }
    }
  }

  return lineMap;
}

export function getJsonType(value: JsonValue): JsonType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonType;
}

export function parseJson(jsonStr: string): { data: JsonValue | null; error: string | null } {
  try {
    const data = JSON.parse(jsonStr);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export function formatJson(data: JsonValue, indent: number = 2): string {
  return JSON.stringify(data, null, indent);
}

export function minifyJson(data: JsonValue): string {
  return JSON.stringify(data);
}

export function buildTree(data: JsonValue, key: string = '$', path: string = '$'): TreeNode {
  const type = getJsonType(data);
  const node: TreeNode = { key, value: data, type, path };

  if (type === 'object' && data !== null) {
    node.children = Object.entries(data as Record<string, JsonValue>).map(([k, v]) =>
      buildTree(v, k, `${path}.${k}`)
    );
  } else if (type === 'array') {
    node.children = (data as JsonValue[]).map((v, i) =>
      buildTree(v, `[${i}]`, `${path}[${i}]`)
    );
  }

  return node;
}

export function getValueByPath(data: JsonValue, path: string): JsonValue | undefined {
  const parts = path.replace(/^\$/, '').split(/[.\[\]]/).filter(Boolean);
  let current: any = data;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function normalizeJsonPath(path: string): string {
  if (!path || path === '$') return '$';

  let result = path;

  result = result.replace(/\['([^']+)'\]/g, '.$1');
  result = result.replace(/\["([^"]+)"\]/g, '.$1');

  result = result.replace(/\.\[/g, '[');

  result = result.replace(/^\$\./, '$.');
  if (result === '$') return '$';

  return result;
}

export function getParentPaths(path: string): string[] {
  const parents: string[] = [];
  if (!path || path === '$') return parents;

  const parts: string[] = [];
  let current = '';
  let i = 0;

  while (i < path.length) {
    if (path[i] === '.') {
      if (current) {
        parts.push(current);
        current = '';
      }
      i++;
    } else if (path[i] === '[') {
      if (current) {
        parts.push(current);
        current = '';
      }
      const endBracket = path.indexOf(']', i);
      if (endBracket === -1) break;
      parts.push(path.slice(i, endBracket + 1));
      i = endBracket + 1;
    } else {
      current += path[i];
      i++;
    }
  }
  if (current) parts.push(current);

  let accumulator = '$';
  for (let j = 1; j < parts.length; j++) {
    const part = parts[j];
    if (part.startsWith('[')) {
      accumulator += part;
    } else {
      accumulator += '.' + part;
    }
    parents.push(accumulator);
  }

  return parents.slice(0, -1);
}

export function diffJson(oldData: JsonValue, newData: JsonValue, path: string = '$'): DiffResult[] {
  const results: DiffResult[] = [];
  const oldType = getJsonType(oldData);
  const newType = getJsonType(newData);

  if (oldType !== newType) {
    results.push({ type: 'modified', path, oldValue: oldData, newValue: newData });
    return results;
  }

  if (oldType === 'object' && oldData !== null && newData !== null) {
    const oldObj = oldData as Record<string, JsonValue>;
    const newObj = newData as Record<string, JsonValue>;
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      const currentPath = path === '$' ? `$.${key}` : `${path}.${key}`;
      if (!(key in oldObj)) {
        results.push({ type: 'added', path: currentPath, newValue: newObj[key] });
      } else if (!(key in newObj)) {
        results.push({ type: 'removed', path: currentPath, oldValue: oldObj[key] });
      } else {
        results.push(...diffJson(oldObj[key], newObj[key], currentPath));
      }
    }
  } else if (oldType === 'array') {
    const oldArr = oldData as JsonValue[];
    const newArr = newData as JsonValue[];
    const maxLen = Math.max(oldArr.length, newArr.length);

    for (let i = 0; i < maxLen; i++) {
      const currentPath = `${path}[${i}]`;
      if (i >= oldArr.length) {
        results.push({ type: 'added', path: currentPath, newValue: newArr[i] });
      } else if (i >= newArr.length) {
        results.push({ type: 'removed', path: currentPath, oldValue: oldArr[i] });
      } else {
        results.push(...diffJson(oldArr[i], newArr[i], currentPath));
      }
    }
  } else if (oldData !== newData) {
    results.push({ type: 'modified', path, oldValue: oldData, newValue: newData });
  }

  return results;
}

export function flattenToTable(data: JsonValue): { columns: TableColumn[]; rows: TableRow[] } {
  if (!Array.isArray(data)) {
    data = [data];
  }

  const arr = data as JsonValue[];
  const columnsSet = new Set<string>();
  const rows: TableRow[] = [];

  for (const item of arr) {
    const flatRow = flattenObject(item);
    rows.push(flatRow);
    Object.keys(flatRow).forEach((k) => columnsSet.add(k));
  }

  const columns = Array.from(columnsSet).map((key) => ({
    key,
    title: key,
  }));

  return { columns, rows };
}

function flattenObject(obj: any, prefix: string = ''): TableRow {
  const result: TableRow = {};

  if (obj === null || obj === undefined) {
    return result;
  }

  if (typeof obj !== 'object') {
    result[prefix || 'value'] = obj;
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result[newKey] = value as JsonValue;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      result[newKey] = JSON.stringify(value);
    } else {
      result[newKey] = value as JsonValue;
    }
  }

  return result;
}

export function jsonToYaml(data: JsonValue): string {
  return convertToYaml(data, 0);
}

function convertToYaml(data: JsonValue, indent: number): string {
  const spaces = '  '.repeat(indent);
  const type = getJsonType(data);

  if (type === 'null') return 'null';
  if (type === 'string') {
    const str = data as string;
    if (/[\n\r"\\:{}#&*!|>'"%@`\[\],;]/.test(str) || str.length === 0 || /^\s|\s$/.test(str)) {
      return JSON.stringify(str);
    }
    return str;
  }
  if (type === 'number' || type === 'boolean') return String(data);

  if (type === 'object' && data !== null) {
    const obj = data as Record<string, JsonValue>;
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';
    return entries
      .map(([key, value]) => {
        const valueType = getJsonType(value);
        if (valueType === 'object' || valueType === 'array') {
          return `${spaces}${key}:\n${convertToYaml(value, indent + 1)}`;
        }
        return `${spaces}${key}: ${convertToYaml(value, indent + 1)}`;
      })
      .join('\n');
  }

  if (type === 'array') {
    const arr = data as JsonValue[];
    if (arr.length === 0) return '[]';
    return arr
      .map((item) => {
        const itemType = getJsonType(item);
        if (itemType === 'object' || itemType === 'array') {
          return `${spaces}-\n${convertToYaml(item, indent + 1).replace(/^/gm, '  ')}`;
        }
        return `${spaces}- ${convertToYaml(item, indent + 1)}`;
      })
      .join('\n');
  }

  return '';
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
