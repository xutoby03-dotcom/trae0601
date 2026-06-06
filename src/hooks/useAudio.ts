import { useEffect, useRef, useCallback } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmOscillatorsRef = useRef<OscillatorNode[]>([]);
  const bgmGainRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, []);

  const playJumpSound = useCallback(() => {
    playTone(400, 0.1, 'square', 0.2);
    setTimeout(() => playTone(600, 0.1, 'square', 0.15), 50);
  }, [playTone]);

  const playSlideSound = useCallback(() => {
    playTone(200, 0.2, 'sawtooth', 0.15);
  }, [playTone]);

  const playCoinSound = useCallback(() => {
    playTone(880, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.15), 80);
  }, [playTone]);

  const playGameOverSound = useCallback(() => {
    playTone(200, 0.3, 'sawtooth', 0.3);
    setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.25), 200);
    setTimeout(() => playTone(100, 0.5, 'sawtooth', 0.2), 500);
  }, [playTone]);

  const bgmPatterns = [
    [262, 294, 330, 349, 392, 440, 494, 523],
    [330, 392, 494, 392, 330, 294, 330, 392],
    [220, 277, 330, 392, 440, 392, 330, 277],
  ];

  const startBGM = useCallback((patternIndex: number = 0, volume: number = 0.3) => {
    if (!audioContextRef.current || isPlayingRef.current) return;

    isPlayingRef.current = true;
    const pattern = bgmPatterns[patternIndex % bgmPatterns.length];
    let noteIndex = 0;

    bgmGainRef.current = audioContextRef.current.createGain();
    bgmGainRef.current.gain.value = volume;
    bgmGainRef.current.connect(audioContextRef.current.destination);

    const playNote = () => {
      if (!isPlayingRef.current || !audioContextRef.current || !bgmGainRef.current) return;

      const osc = audioContextRef.current.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = pattern[noteIndex % pattern.length];
      osc.connect(bgmGainRef.current);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 0.3);

      bgmOscillatorsRef.current.push(osc);
      osc.onended = () => {
        const idx = bgmOscillatorsRef.current.indexOf(osc);
        if (idx > -1) bgmOscillatorsRef.current.splice(idx, 1);
      };

      noteIndex++;
      setTimeout(playNote, 400);
    };

    playNote();
  }, []);

  const stopBGM = useCallback(() => {
    isPlayingRef.current = false;
    bgmOscillatorsRef.current.forEach((osc) => {
      try { osc.stop(); } catch { /* ignore */ }
    });
    bgmOscillatorsRef.current = [];
    if (bgmGainRef.current) {
      bgmGainRef.current.disconnect();
      bgmGainRef.current = null;
    }
  }, []);

  const setBGMVolume = useCallback((volume: number) => {
    if (bgmGainRef.current) {
      bgmGainRef.current.gain.value = volume;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopBGM();
    };
  }, [stopBGM]);

  return {
    initAudioContext,
    playJumpSound,
    playSlideSound,
    playCoinSound,
    playGameOverSound,
    startBGM,
    stopBGM,
    setBGMVolume,
  };
};
