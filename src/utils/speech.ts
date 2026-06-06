let currentUtterance: SpeechSynthesisUtterance | null = null;
let onEndCallback: (() => void) | null = null;

export const speak = (text: string, onEnd?: () => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    cancel();
    onEndCallback = onEnd || null;

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'zh-CN';
    currentUtterance.rate = 0.75;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(
        v => v.lang.includes('zh-CN') || v.lang.includes('zh') || v.lang.includes('cmn')
      );
      if (chineseVoice && currentUtterance) {
        currentUtterance.voice = chineseVoice;
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    currentUtterance.onend = () => {
      currentUtterance = null;
      if (onEndCallback) {
        onEndCallback();
        onEndCallback = null;
      }
      resolve();
    };

    currentUtterance.onerror = (event) => {
      currentUtterance = null;
      onEndCallback = null;
      reject(event);
    };

    window.speechSynthesis.speak(currentUtterance);
  });
};

export const pause = (): void => {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
};

export const resume = (): void => {
  if ('speechSynthesis' in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
};

export const cancel = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
    onEndCallback = null;
  }
};

export const isSpeaking = (): boolean => {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused;
};

export const isPaused = (): boolean => {
  return 'speechSynthesis' in window && window.speechSynthesis.paused;
};

export const isSupported = (): boolean => {
  return 'speechSynthesis' in window;
};
