import { useMemo } from 'react';
import { diffLines } from 'diff';

interface DiffViewerProps {
  oldText: string;
  newText: string;
  side: 'left' | 'right';
}

export function DiffViewer({ oldText, newText, side }: DiffViewerProps) {
  const lineChanges = useMemo(() => {
    const changes = diffLines(oldText, newText);
    const leftLines: { text: string; type: 'normal' | 'removed' | 'empty' }[] = [];
    const rightLines: { text: string; type: 'normal' | 'added' | 'empty' }[] = [];

    for (const change of changes) {
      const lines = change.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();

      if (change.removed) {
        for (const line of lines) {
          leftLines.push({ text: line, type: 'removed' });
          rightLines.push({ text: '', type: 'empty' });
        }
      } else if (change.added) {
        for (const line of lines) {
          leftLines.push({ text: '', type: 'empty' });
          rightLines.push({ text: line, type: 'added' });
        }
      } else {
        for (const line of lines) {
          leftLines.push({ text: line, type: 'normal' });
          rightLines.push({ text: line, type: 'normal' });
        }
      }
    }

    return { leftLines, rightLines };
  }, [oldText, newText]);

  const lines = side === 'left' ? lineChanges.leftLines : lineChanges.rightLines;

  return (
    <div className="h-full overflow-auto bg-gray-900 font-mono text-sm">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, index) => {
            let bgClass = 'bg-transparent';
            if (line.type === 'removed') bgClass = 'bg-red-900/40';
            if (line.type === 'added') bgClass = 'bg-green-900/40';
            if (line.type === 'empty') bgClass = 'bg-gray-800/30';

            return (
              <tr key={index} className={`${bgClass} hover:bg-gray-700/30`}>
                <td className="w-12 text-right pr-3 text-gray-500 select-none border-r border-gray-800 py-0.5 align-top">
                  {line.type !== 'empty' && <span>{index + 1}</span>}
                </td>
                <td className="pl-3 pr-4 py-0.5 whitespace-pre align-top text-gray-300">
                  <span>{line.text || ' '}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
