import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  placeholder?: string;
}

export function JsonEditor({ value, onChange, error, placeholder }: JsonEditorProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={value}
          height="100%"
          theme={oneDark}
          extensions={[json()]}
          onChange={handleChange}
          placeholder={placeholder || '在此粘贴 JSON...'}
          className="h-full text-sm font-mono"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
          }}
        />
      </div>
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-2 text-sm font-mono">
          {error}
        </div>
      )}
    </div>
  );
}
