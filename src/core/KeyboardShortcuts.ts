export interface ShortcutContext {
  isRunning: boolean;
  hasSelection: boolean;
  inputValue: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface ShortcutResult {
  handled: boolean;
  action?: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

type KeyHandler = (e: KeyboardEvent, context: ShortcutContext) => ShortcutResult;

const keyHandlers: Record<string, KeyHandler> = {};

function registerShortcut(
  key: string,
  ctrl: boolean,
  handler: KeyHandler
): void {
  const combo = `${ctrl ? 'Ctrl+' : ''}${key.toLowerCase()}`;
  keyHandlers[combo] = handler;
}

registerShortcut('t', true, (e) => {
  e.preventDefault();
  return {
    handled: true,
    action: 'new-tab',
    preventDefault: true,
    stopPropagation: true,
  };
});

registerShortcut('w', true, (e) => {
  e.preventDefault();
  return {
    handled: true,
    action: 'close-tab',
    preventDefault: true,
    stopPropagation: true,
  };
});

registerShortcut('c', true, (e, context) => {
  if (context.hasSelection) {
    return { handled: false };
  }

  e.preventDefault();
  return {
    handled: true,
    action: context.isRunning ? 'interrupt' : 'cancel',
    preventDefault: true,
    stopPropagation: true,
  };
});

registerShortcut('l', true, (e) => {
  e.preventDefault();
  return {
    handled: true,
    action: 'clear-screen',
    preventDefault: true,
    stopPropagation: true,
  };
});

registerShortcut('r', true, (e) => {
  e.preventDefault();
  return {
    handled: true,
    action: 'search-history',
    preventDefault: true,
    stopPropagation: true,
  };
});

registerShortcut('Tab', false, (e) => {
  e.preventDefault();
  return {
    handled: true,
    action: 'auto-complete',
    preventDefault: true,
    stopPropagation: true,
  };
});

registerShortcut('ArrowUp', false, (e, context) => {
  if (context.selectionStart === 0 && context.selectionEnd === 0) {
    e.preventDefault();
    return {
      handled: true,
      action: 'history-up',
      preventDefault: true,
      stopPropagation: true,
    };
  }
  return { handled: false };
});

registerShortcut('ArrowDown', false, (e, context) => {
  if (
    context.selectionStart === context.inputValue.length &&
    context.selectionEnd === context.inputValue.length
  ) {
    e.preventDefault();
    return {
      handled: true,
      action: 'history-down',
      preventDefault: true,
      stopPropagation: true,
    };
  }
  return { handled: false };
});

registerShortcut('a', true, (e, context) => {
  if (!context.hasSelection) {
    e.preventDefault();
    return {
      handled: true,
      action: 'move-to-start',
      preventDefault: true,
      stopPropagation: true,
    };
  }
  return { handled: false };
});

registerShortcut('e', true, (e, context) => {
  if (!context.hasSelection) {
    e.preventDefault();
    return {
      handled: true,
      action: 'move-to-end',
      preventDefault: true,
      stopPropagation: true,
    };
  }
  return { handled: false };
});

registerShortcut('u', true, (e) => {
  e.preventDefault();
  return {
    handled: true,
    action: 'clear-line',
    preventDefault: true,
    stopPropagation: true,
  };
});

registerShortcut('d', true, (e, context) => {
  if (context.inputValue.length === 0 && !context.isRunning) {
    e.preventDefault();
    return {
      handled: true,
      action: 'exit',
      preventDefault: true,
      stopPropagation: true,
    };
  }
  return { handled: false };
});

export function handleKeyDown(
  e: KeyboardEvent,
  context: ShortcutContext
): ShortcutResult {
  const ctrl = e.ctrlKey || e.metaKey;
  const key = e.key === 'Tab' ? 'Tab' : e.key;
  const combo = `${ctrl ? 'Ctrl+' : ''}${key.toLowerCase()}`;

  const handler = keyHandlers[combo];
  if (handler) {
    return handler(e, context);
  }

  return { handled: false };
}

export const KeyboardShortcuts = {
  handleKeyDown,
};

export default KeyboardShortcuts;
