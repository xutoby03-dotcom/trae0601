import type { AnsiState } from '../types/terminal';

export interface AnsiSegment {
  text: string;
  state: AnsiState;
}

const STANDARD_COLORS: Record<number, string> = {
  30: '#000000',
  31: '#ff0000',
  32: '#00ff00',
  33: '#ffff00',
  34: '#0000ff',
  35: '#ff00ff',
  36: '#00ffff',
  37: '#ffffff',
  40: '#000000',
  41: '#ff0000',
  42: '#00ff00',
  43: '#ffff00',
  44: '#0000ff',
  45: '#ff00ff',
  46: '#00ffff',
  47: '#ffffff',
};

const BRIGHT_COLORS: Record<number, string> = {
  90: '#555555',
  91: '#ff5555',
  92: '#55ff55',
  93: '#ffff55',
  94: '#5555ff',
  95: '#ff55ff',
  96: '#55ffff',
  97: '#ffffff',
  100: '#555555',
  101: '#ff5555',
  102: '#55ff55',
  103: '#ffff55',
  104: '#5555ff',
  105: '#ff55ff',
  106: '#55ffff',
  107: '#ffffff',
};

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function resetState(): AnsiState {
  return {
    foreground: undefined,
    background: undefined,
    bold: false,
    italic: false,
    underline: false,
  };
}

function parseSgrCodes(codes: number[], currentState: AnsiState): AnsiState {
  const newState = { ...currentState };

  for (const code of codes) {
    switch (code) {
      case 0:
        return resetState();
      case 1:
        newState.bold = true;
        break;
      case 3:
        newState.italic = true;
        break;
      case 4:
        newState.underline = true;
        break;
      case 22:
        newState.bold = false;
        break;
      case 23:
        newState.italic = false;
        break;
      case 24:
        newState.underline = false;
        break;
      case 39:
        newState.foreground = undefined;
        break;
      case 49:
        newState.background = undefined;
        break;
      default:
        if (code >= 30 && code <= 37) {
          newState.foreground = STANDARD_COLORS[code];
        } else if (code >= 40 && code <= 47) {
          newState.background = STANDARD_COLORS[code];
        } else if (code >= 90 && code <= 97) {
          newState.foreground = BRIGHT_COLORS[code];
        } else if (code >= 100 && code <= 107) {
          newState.background = BRIGHT_COLORS[code];
        }
        break;
    }
  }

  return newState;
}

export function parseAnsi(text: string): AnsiSegment[] {
  const segments: AnsiSegment[] = [];
  let currentState: AnsiState = resetState();
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '\x1b' && text[i + 1] === '[') {
      if (currentText) {
        segments.push({ text: currentText, state: { ...currentState } });
        currentText = '';
      }

      let j = i + 2;
      let codeStr = '';

      while (j < text.length && /[0-9;]/.test(text[j])) {
        codeStr += text[j];
        j++;
      }

      if (j < text.length && text[j] === 'm') {
        const codes = codeStr
          .split(';')
          .filter(Boolean)
          .map((c) => parseInt(c, 10));
        currentState = parseSgrCodes(codes, currentState);
        i = j + 1;
      } else {
        currentText += '\x1b[';
        i = i + 2;
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
