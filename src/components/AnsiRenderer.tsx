import React, { useMemo } from 'react';
import type { AnsiState } from '@/types/terminal';

interface AnsiRendererProps {
  text: string;
  initialState?: AnsiState;
}

interface ParsedSegment {
  text: string;
  state: AnsiState;
}

const COLOR_MAP: Record<number, string> = {
  30: 'var(--color-black)',
  31: 'var(--color-red)',
  32: 'var(--color-green)',
  33: 'var(--color-yellow)',
  34: 'var(--color-blue)',
  35: 'var(--color-magenta)',
  36: 'var(--color-cyan)',
  37: 'var(--color-white)',
  90: 'var(--color-bright-black)',
  91: 'var(--color-bright-red)',
  92: 'var(--color-bright-green)',
  93: 'var(--color-bright-yellow)',
  94: 'var(--color-bright-blue)',
  95: 'var(--color-bright-magenta)',
  96: 'var(--color-bright-cyan)',
  97: 'var(--color-bright-white)',
};

const BG_COLOR_MAP: Record<number, string> = {
  40: 'var(--color-black)',
  41: 'var(--color-red)',
  42: 'var(--color-green)',
  43: 'var(--color-yellow)',
  44: 'var(--color-blue)',
  45: 'var(--color-magenta)',
  46: 'var(--color-cyan)',
  47: 'var(--color-white)',
  100: 'var(--color-bright-black)',
  101: 'var(--color-bright-red)',
  102: 'var(--color-bright-green)',
  103: 'var(--color-bright-yellow)',
  104: 'var(--color-bright-blue)',
  105: 'var(--color-bright-magenta)',
  106: 'var(--color-bright-cyan)',
  107: 'var(--color-bright-white)',
};

function resetState(): AnsiState {
  return {
    foreground: undefined,
    background: undefined,
    bold: false,
    italic: false,
    underline: false,
  };
}

function parseAnsi(text: string, initialState?: AnsiState): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let currentState: AnsiState = { ...resetState(), ...initialState };
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '\x1b' && text[i + 1] === '[') {
      if (currentText) {
        segments.push({ text: currentText, state: { ...currentState } });
        currentText = '';
      }

      let j = i + 2;
      while (j < text.length && text[j] !== 'm') {
        j++;
      }

      if (j < text.length) {
        const codes = text.slice(i + 2, j).split(';').map(Number);
        for (const code of codes) {
          if (code === 0) {
            currentState = resetState();
          } else if (code === 1) {
            currentState.bold = true;
          } else if (code === 3) {
            currentState.italic = true;
          } else if (code === 4) {
            currentState.underline = true;
          } else if (code === 22) {
            currentState.bold = false;
          } else if (code === 23) {
            currentState.italic = false;
          } else if (code === 24) {
            currentState.underline = false;
          } else if (code === 39) {
            currentState.foreground = undefined;
          } else if (code === 49) {
            currentState.background = undefined;
          } else if (code in COLOR_MAP) {
            currentState.foreground = COLOR_MAP[code];
          } else if (code in BG_COLOR_MAP) {
            currentState.background = BG_COLOR_MAP[code];
          }
        }
        i = j + 1;
      } else {
        i++;
      }
    } else {
      currentText += text[i];
      i++;
    }
  }

  if (currentText) {
    segments.push({ text: currentText, state: { ...currentState } });
  }

  return segments;
}

export const AnsiRenderer: React.FC<AnsiRendererProps> = ({ text, initialState }) => {
  const segments = useMemo(() => parseAnsi(text, initialState), [text, initialState]);

  return (
    <>
      {segments.map((segment, index) => {
        const className = [
          segment.state.bold ? 'ansi-bold' : '',
          segment.state.italic ? 'ansi-italic' : '',
          segment.state.underline ? 'ansi-underline' : '',
        ].filter(Boolean).join(' ');

        const style: React.CSSProperties = {};
        if (segment.state.foreground) {
          style.color = segment.state.foreground;
        }
        if (segment.state.background) {
          style.backgroundColor = segment.state.background;
        }

        if (className || Object.keys(style).length > 0) {
          return (
            <span key={index} className={className || undefined} style={style}>
              {segment.text}
            </span>
          );
        }

        return <React.Fragment key={index}>{segment.text}</React.Fragment>;
      })}
    </>
  );
};

export default AnsiRenderer;
