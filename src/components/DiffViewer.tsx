import { useMemo } from 'react';
import { getPathLineMap } from '@/utils/jsonUtils';

interface DiffViewerProps {
  oldText: string;
  newText: string;
  side: 'left' | 'right';
  diffs: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

export function DiffViewer({ oldText, newText, side, diffs }: DiffViewerProps) {
  const displayText = side === 'left' ? oldText : newText;

  const { lines, highlightLines } = useMemo(() => {
    const textLines = displayText.split('\n');

    const leftLineMap = getPathLineMap(oldText);
    const rightLineMap = getPathLineMap(newText);
    const lineMap = side === 'left' ? leftLineMap : rightLineMap;

    const highlightSet = new Set<number>();
    const lineTypeMap = new Map<number, 'added' | 'removed' | 'modified'>();

    const processPaths = (paths: string[], type: 'added' | 'removed' | 'modified') => {
      for (const path of paths) {
        const lineNum = lineMap.get(path);
        if (lineNum !== undefined) {
          highlightSet.add(lineNum);
          lineTypeMap.set(lineNum, type);
        }
      }
    };

    if (side === 'left') {
      processPaths(diffs.removed, 'removed');
      processPaths(diffs.modified, 'modified');
    } else {
      processPaths(diffs.added, 'added');
      processPaths(diffs.modified, 'modified');
    }

    return { lines: textLines, highlightLines: lineTypeMap };
  }, [displayText, oldText, newText, side, diffs]);

  return (
    <div className="h-full overflow-auto bg-gray-900 font-mono text-sm">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const lineType = highlightLines.get(lineNum);

            let bgClass = 'bg-transparent';
            if (lineType === 'removed') bgClass = 'bg-red-900/40';
            if (lineType === 'added') bgClass = 'bg-green-900/40';
            if (lineType === 'modified') bgClass = 'bg-yellow-900/40';

            return (
              <tr key={index} className={`${bgClass} hover:bg-gray-700/30`}>
                <td className="w-12 text-right pr-3 text-gray-500 select-none border-r border-gray-800 py-0.5 align-top">
                  {lineNum}
                </td>
                <td className="pl-3 pr-4 py-0.5 whitespace-pre align-top text-gray-300">
                  <span>{line || ' '}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
