import { useRef, useEffect, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useEditorStore } from '@/stores/useEditorStore';
import { useSqlStore } from '@/stores/useSqlStore';
import { Loader2 } from 'lucide-react';

export function SqlEditor() {
  const { sql, setSql, theme } = useEditorStore();
  const { currentDatabaseSchema, isInitializing } = useSqlStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange: OnChange = (value) => {
    setSql(value || '');
  };

  const getTableNames = useCallback(() => {
    if (!currentDatabaseSchema) return [];
    return currentDatabaseSchema.tables.map((t) => t.name);
  }, [currentDatabaseSchema]);

  const getColumnNames = useCallback(
    (tableName: string) => {
      if (!currentDatabaseSchema) return [];
      const table = currentDatabaseSchema.tables.find((t) => t.name.toLowerCase() === tableName.toLowerCase());
      return table ? table.columns.map((c) => c.name) : [];
    },
    [currentDatabaseSchema]
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const disposable = editorRef.current.onDidChangeModelContent(() => {
      const model = editorRef.current?.getModel();
      if (!model) return;
    });

    return () => disposable.dispose();
  }, []);

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
    'ORDER', 'BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'DISTINCT', 'AS', 'ON',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'NATURAL',
    'GROUP', 'HAVING', 'UNION', 'ALL', 'EXCEPT', 'INTERSECT',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
    'ALTER', 'DROP', 'TRUNCATE', 'INDEX', 'VIEW', 'DATABASE',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE', 'IFNULL',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'OVER', 'PARTITION',
    'WITH', 'RECURSIVE', 'CTE',
    'TRUE', 'FALSE', 'CAST', 'CONVERT',
  ];

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>正在初始化SQL引擎...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <Editor
        height="100%"
        defaultLanguage="sql"
        value={sql}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={monacoTheme}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          suggestOnTriggerCharacters: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFiles: false,
          },
        }}
        beforeMount={(monaco) => {
          monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems: (model, position) => {
              const word = model.getWordUntilPosition(position);
              const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
              };

              const suggestions: any[] = [];

              keywords.forEach((keyword) => {
                suggestions.push({
                  label: keyword,
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: keyword + ' ',
                  range,
                  detail: 'Keyword',
                });
              });

              getTableNames().forEach((tableName) => {
                suggestions.push({
                  label: tableName,
                  kind: monaco.languages.CompletionItemKind.Class,
                  insertText: tableName,
                  range,
                  detail: 'Table',
                });

                const columns = getColumnNames(tableName);
                columns.forEach((col) => {
                  suggestions.push({
                    label: `${tableName}.${col}`,
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: col,
                    range,
                    detail: `Column (${tableName})`,
                  });
                });
              });

              return { suggestions };
            },
          });
        }}
      />
    </div>
  );
}
