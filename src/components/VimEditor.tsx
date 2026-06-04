import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/theme';

interface VimEditorProps {
  filePath: string;
  content: string;
  onSave: (content: string) => void;
  onClose: () => void;
  theme?: Theme;
}

type VimMode = 'normal' | 'insert' | 'command';

interface VimCursor {
  row: number;
  col: number;
}

export const VimEditor: React.FC<VimEditorProps> = ({
  filePath,
  content,
  onSave,
  onClose,
}) => {
  const [mode, setMode] = useState<VimMode>('normal');
  const [lines, setLines] = useState<string[]>(() =>
    content ? content.split('\n') : ['']
  );
  const [originalContent] = useState<string[]>(() =>
    content ? content.split('\n') : ['']
  );
  const [cursor, setCursor] = useState<VimCursor>({ row: 0, col: 0 });
  const [commandBuffer, setCommandBuffer] = useState('');
  const [scrollOffset, setScrollOffset] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const isModified = JSON.stringify(lines) !== JSON.stringify(originalContent);

  useEffect(() => {
    if (mode === 'command' && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (editorRef.current) {
      const lineHeight = editorRef.current.scrollHeight / lines.length;
      const visibleLines = Math.floor(editorRef.current.clientHeight / lineHeight);
      const currentLine = cursor.row;

      if (currentLine < scrollOffset + 2) {
        setScrollOffset(Math.max(0, currentLine - 2));
      } else if (currentLine > scrollOffset + visibleLines - 3) {
        setScrollOffset(Math.max(0, Math.min(currentLine - visibleLines + 3, lines.length - visibleLines)));
      }
    }
  }, [cursor, scrollOffset, lines.length]);

  const clampCursor = useCallback((newCursor: VimCursor, currentLines: string[]): VimCursor => {
    const row = Math.max(0, Math.min(newCursor.row, currentLines.length - 1));
    const line = currentLines[row] || '';
    const col = Math.max(0, Math.min(newCursor.col, Math.max(0, line.length)));
    return { row, col };
  }, []);

  const enterInsertMode = useCallback(() => {
    setMode('insert');
  }, []);

  const enterCommandMode = useCallback(() => {
    setMode('command');
    setCommandBuffer(':');
  }, []);

  const enterNormalMode = useCallback(() => {
    setMode('normal');
    setCommandBuffer('');
  }, []);

  const moveCursor = useCallback((dx: number, dy: number) => {
    setCursor((prev) => {
      const newCursor = {
        row: prev.row + dy,
        col: prev.col + dx,
      };
      return clampCursor(newCursor, lines);
    });
  }, [lines, clampCursor]);

  const moveToLineStart = useCallback(() => {
    setCursor((prev) => ({ ...prev, col: 0 }));
  }, []);

  const moveToLineEnd = useCallback(() => {
    setCursor((prev) => ({
      ...prev,
      col: Math.max(0, lines[prev.row]?.length - 1 || 0),
    }));
  }, [lines]);

  const insertCharacter = useCallback((char: string) => {
    setLines((prev) => {
      const newLines = [...prev];
      const line = newLines[cursor.row] || '';
      newLines[cursor.row] = line.slice(0, cursor.col) + char + line.slice(cursor.col);
      return newLines;
    });
    setCursor((prev) => ({ ...prev, col: prev.col + char.length }));
  }, [cursor.row, cursor.col]);

  const insertNewline = useCallback(() => {
    setLines((prev) => {
      const newLines = [...prev];
      const line = newLines[cursor.row] || '';
      newLines[cursor.row] = line.slice(0, cursor.col);
      newLines.splice(cursor.row + 1, 0, line.slice(cursor.col));
      return newLines;
    });
    setCursor((prev) => ({ row: prev.row + 1, col: 0 }));
  }, [cursor.row, cursor.col]);

  const deleteCharacter = useCallback(() => {
    if (cursor.col === 0 && cursor.row > 0) {
      setLines((prev) => {
        const newLines = [...prev];
        const prevLine = newLines[cursor.row - 1] || '';
        const currentLine = newLines[cursor.row] || '';
        newLines[cursor.row - 1] = prevLine + currentLine;
        newLines.splice(cursor.row, 1);
        return newLines;
      });
      setCursor((prev) => ({
        row: prev.row - 1,
        col: lines[prev.row - 1]?.length || 0,
      }));
    } else if (cursor.col > 0) {
      setLines((prev) => {
        const newLines = [...prev];
        const line = newLines[cursor.row] || '';
        newLines[cursor.row] = line.slice(0, cursor.col - 1) + line.slice(cursor.col);
        return newLines;
      });
      setCursor((prev) => ({ ...prev, col: prev.col - 1 }));
    }
  }, [cursor.row, cursor.col, lines]);

  const executeCommand = useCallback(() => {
    const cmd = commandBuffer.trim();

    if (cmd === ':w' || cmd === ':wq') {
      onSave(lines.join('\n'));
    }

    if (cmd === ':q' || cmd === ':wq') {
      if (cmd === ':q' && isModified) {
        return;
      }
      onClose();
    }

    if (cmd === ':q!') {
      onClose();
    }

    enterNormalMode();
  }, [commandBuffer, lines, onSave, onClose, isModified, enterNormalMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'insert') {
        if (e.key === 'Escape') {
          e.preventDefault();
          enterNormalMode();
          setCursor((prev) => ({
            ...prev,
            col: Math.max(0, prev.col - 1),
          }));
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          deleteCharacter();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          insertNewline();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          moveCursor(-1, 0);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          moveCursor(1, 0);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveCursor(0, -1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveCursor(0, 1);
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          insertCharacter(e.key);
        }
      } else if (mode === 'normal') {
        if (e.key === 'i') {
          e.preventDefault();
          enterInsertMode();
        } else if (e.key === 'a') {
          e.preventDefault();
          enterInsertMode();
          setCursor((prev) => ({
            ...prev,
            col: Math.min(prev.col + 1, lines[prev.row]?.length || 0),
          }));
        } else if (e.key === 'A') {
          e.preventDefault();
          enterInsertMode();
          moveToLineEnd();
          setCursor((prev) => ({
            ...prev,
            col: (lines[prev.row]?.length || 0),
          }));
        } else if (e.key === 'o') {
          e.preventDefault();
          setLines((prev) => {
            const newLines = [...prev];
            newLines.splice(cursor.row + 1, 0, '');
            return newLines;
          });
          setCursor((prev) => ({ row: prev.row + 1, col: 0 }));
          enterInsertMode();
        } else if (e.key === 'O') {
          e.preventDefault();
          setLines((prev) => {
            const newLines = [...prev];
            newLines.splice(cursor.row, 0, '');
            return newLines;
          });
          setCursor((prev) => ({ row: prev.row, col: 0 }));
          enterInsertMode();
        } else if (e.key === 'h' || e.key === 'ArrowLeft') {
          e.preventDefault();
          moveCursor(-1, 0);
        } else if (e.key === 'l' || e.key === 'ArrowRight') {
          e.preventDefault();
          moveCursor(1, 0);
        } else if (e.key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault();
          moveCursor(0, 1);
        } else if (e.key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault();
          moveCursor(0, -1);
        } else if (e.key === '0') {
          e.preventDefault();
          moveToLineStart();
        } else if (e.key === '$') {
          e.preventDefault();
          moveToLineEnd();
        } else if (e.key === 'g') {
          e.preventDefault();
          setCursor({ row: 0, col: 0 });
        } else if (e.key === 'G') {
          e.preventDefault();
          setCursor({ row: lines.length - 1, col: 0 });
        } else if (e.key === 'x') {
          e.preventDefault();
          setLines((prev) => {
            const newLines = [...prev];
            const line = newLines[cursor.row] || '';
            newLines[cursor.row] = line.slice(0, cursor.col) + line.slice(cursor.col + 1);
            return newLines;
          });
        } else if (e.key === 'dd') {
          e.preventDefault();
          setLines((prev) => {
            const newLines = [...prev];
            if (newLines.length > 1) {
              newLines.splice(cursor.row, 1);
            } else {
              newLines[0] = '';
            }
            return newLines;
          });
          setCursor((prev) => clampCursor({ ...prev, col: 0 }, lines.length > 1 ? lines.slice(0, -1) : ['']));
        } else if (e.key === ':') {
          e.preventDefault();
          enterCommandMode();
        }
      } else if (mode === 'command') {
        if (e.key === 'Escape') {
          e.preventDefault();
          enterNormalMode();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          executeCommand();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          if (commandBuffer.length > 1) {
            setCommandBuffer((prev) => prev.slice(0, -1));
          } else {
            enterNormalMode();
          }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setCommandBuffer((prev) => prev + e.key);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, cursor, lines, commandBuffer, isModified, enterInsertMode, enterNormalMode, enterCommandMode, moveCursor, moveToLineStart, moveToLineEnd, insertCharacter, insertNewline, deleteCharacter, executeCommand, clampCursor]);

  const renderLine = (line: string, index: number) => {
    const isCurrentLine = index === cursor.row;
    const displayLine = line || ' ';

    if (isCurrentLine && mode === 'insert') {
      return (
        <span key={index} className={cn('vim-line', { 'current-line': isCurrentLine })}>
          {displayLine.slice(0, cursor.col)}
          <span className="vim-cursor" />
          {displayLine.slice(cursor.col)}
        </span>
      );
    } else if (isCurrentLine && mode === 'normal') {
      const col = Math.min(cursor.col, displayLine.length - 1);
      const char = displayLine[col] || ' ';
      return (
        <span key={index} className={cn('vim-line', { 'current-line': isCurrentLine })}>
          {displayLine.slice(0, col)}
          <span className="vim-cursor">{char}</span>
          {displayLine.slice(col + 1)}
        </span>
      );
    }

    return (
      <span key={index} className={cn('vim-line', { 'current-line': isCurrentLine })}>
        {displayLine}
      </span>
    );
  };

  return (
    <div className="vim-editor" onClick={() => editorRef.current?.focus()}>
      <div className="vim-header">
        <div>
          <span className="vim-filename">{filePath}</span>
          {isModified && <span className="vim-modified">[+]</span>}
        </div>
        <button className="vim-close" onClick={onClose} title="关闭">
          <X size={14} />
        </button>
      </div>

      <div className="vim-content">
        <div className="vim-line-numbers">
          {lines.map((_, index) => (
            <span
              key={index}
              className={cn('vim-line-number', { current: index === cursor.row })}
            >
              {index + 1}
            </span>
          ))}
        </div>

        <div ref={editorRef} className="vim-editor-area" tabIndex={0}>
          {lines.map((line, index) => renderLine(line, index))}
        </div>
      </div>

      <div className="vim-status-bar">
        <div className="flex items-center gap-3">
          <span className={cn('vim-mode-indicator', mode)}>
            {mode === 'normal' ? 'NORMAL' : mode === 'insert' ? 'INSERT' : 'COMMAND'}
          </span>
          {mode === 'command' && (
            <input
              ref={commandInputRef}
              type="text"
              className="vim-command-input"
              value={commandBuffer}
              onChange={(e) => setCommandBuffer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeCommand();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  enterNormalMode();
                }
              }}
            />
          )}
        </div>
        <span className="vim-position">
          {cursor.row + 1}:{cursor.col + 1}
        </span>
      </div>
    </div>
  );
};

export default VimEditor;
