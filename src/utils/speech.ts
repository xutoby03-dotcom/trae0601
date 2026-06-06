let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    stop();

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'zh-CN';
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(
      v => v.lang.includes('zh') || v.lang.includes('cmn')
    );
    if (chineseVoice) {
      currentUtterance.voice = chineseVoice;
    }

    currentUtterance.onend = () => {
      currentUtterance = null;
      resolve();
    };

    currentUtterance.onerror = (event) => {
      currentUtterance = null;
      reject(event);
    };

    window.speechSynthesis.speak(currentUtterance);
  });
};

export const stop = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

export const isSpeaking = (): boolean => {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
};

export const isSupported = (): boolean => {
  return 'speechSynthesis' in window;
};
