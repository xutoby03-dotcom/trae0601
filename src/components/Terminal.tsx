import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AnsiRenderer } from './AnsiRenderer';
import type { TerminalLine, HistoryEntry } from '@/types/terminal';
import type { Theme } from '@/types/theme';

interface TerminalProps {
  paneId: string;
  tabId: string;
  theme?: Theme;
  scrollBack: TerminalLine[];
  currentCommand: string;
  inputBuffer: string;
  history: HistoryEntry[];
  historyIndex: number;
  isRunning: boolean;
  cwd: string;
  prompt: string;
  onCommand: (command: string) => void;
  onInterrupt: () => void;
  onKeyShortcut: (shortcut: string, data?: unknown) => void;
  onInputChange: (value: string, cursorPos: number) => void;
  onHistoryNavigate: (index: number) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  scrollBack,
  currentCommand,
  history,
  historyIndex,
  isRunning,
  cwd,
  prompt,
  onCommand,
  onInterrupt,
  onKeyShortcut,
  onInputChange,
  onHistoryNavigate,
}) => {
  const [inputValue, setInputValue] = useState(currentCommand);
  const [cursorPos, setCursorPos] = useState(currentCommand.length);
  const [showCursor, setShowCursor] = useState(true);
  const scrollBackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollBackRef.current) {
      scrollBackRef.current.scrollTop = scrollBackRef.current.scrollHeight;
    }
  }, [scrollBack]);

  useEffect(() => {
    setInputValue(currentCommand);
    setCursorPos(currentCommand.length);
  }, [currentCommand]);

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        onInterrupt();
        return;
      }

      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        onKeyShortcut('ctrl+r', { history });
        return;
      }

      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        onKeyShortcut('ctrl+l');
        return;
      }

      if (e.key === 'Enter' && !isRunning) {
        e.preventDefault();
        if (inputValue.trim()) {
          onCommand(inputValue);
        }
        setInputValue('');
        setCursorPos(0);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0) {
          const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
          onHistoryNavigate(newIndex);
          if (history[newIndex]) {
            setInputValue(history[newIndex].command);
            setCursorPos(history[newIndex].command.length);
          }
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          onHistoryNavigate(newIndex);
          if (history[newIndex]) {
            setInputValue(history[newIndex].command);
            setCursorPos(history[newIndex].command.length);
          } else {
            setInputValue('');
            setCursorPos(0);
          }
        } else {
          onHistoryNavigate(-1);
          setInputValue('');
          setCursorPos(0);
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCursorPos((prev) => Math.max(0, prev - 1));
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCursorPos((prev) => Math.min(inputValue.length, prev + 1));
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        setCursorPos(0);
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        setCursorPos(inputValue.length);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        onKeyShortcut('tab', { input: inputValue, cursorPos });
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (cursorPos > 0) {
          const newValue = inputValue.slice(0, cursorPos - 1) + inputValue.slice(cursorPos);
          setInputValue(newValue);
          setCursorPos(cursorPos - 1);
          onInputChange(newValue, cursorPos - 1);
        }
        return;
      }

      if (e.key === 'Delete') {
        e.preventDefault();
        if (cursorPos < inputValue.length) {
          const newValue = inputValue.slice(0, cursorPos) + inputValue.slice(cursorPos + 1);
          setInputValue(newValue);
          onInputChange(newValue, cursorPos);
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const newValue = inputValue.slice(0, cursorPos) + e.key + inputValue.slice(cursorPos);
        const newCursorPos = cursorPos + 1;
        setInputValue(newValue);
        setCursorPos(newCursorPos);
        onInputChange(newValue, newCursorPos);
        return;
      }

      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setCursorPos(0);
        return;
      }

      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setCursorPos(inputValue.length);
        return;
      }

      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const newValue = inputValue.slice(0, cursorPos);
        setInputValue(newValue);
        onInputChange(newValue, cursorPos);
        return;
      }

      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        const newValue = inputValue.slice(cursorPos);
        setInputValue(newValue);
        setCursorPos(0);
        onInputChange(newValue, 0);
        return;
      }
    },
    [inputValue, cursorPos, isRunning, history, historyIndex, onCommand, onInterrupt, onKeyShortcut, onInputChange, onHistoryNavigate]
  );

  const renderInputWithCursor = () => {
    const beforeCursor = inputValue.slice(0, cursorPos);
    const atCursor = inputValue[cursorPos] || ' ';
    const afterCursor = inputValue.slice(cursorPos + 1);

    return (
      <span className="terminal-input-content">
        {beforeCursor}
        <span className={cn('cursor', { 'opacity-0': !showCursor })}>{atCursor}</span>
        {afterCursor}
      </span>
    );
  };

  const getPrompt = () => {
    return prompt;
  };

  return (
    <div className="terminal-container" onClick={handleContainerClick}>
      <div ref={scrollBackRef} className="terminal-scrollback">
        {scrollBack.map((line, index) => (
          <div
            key={index}
            className={cn(
              'terminal-line',
              `terminal-line-${line.type}`
            )}
          >
            {line.ansiStates ? (
              <AnsiRenderer text={line.content} />
            ) : (
              line.content
            )}
          </div>
        ))}
      </div>

      <div ref={inputRowRef} className="terminal-input-row">
        <span className="terminal-prompt">{getPrompt()}</span>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={inputValue}
            onChange={() => {}}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              caretColor: 'transparent',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              opacity: 0,
            }}
          />
          <div className="terminal-input-content" style={{ pointerEvents: 'none' }}>
            {renderInputWithCursor()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
