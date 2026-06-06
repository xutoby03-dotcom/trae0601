let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

export const resumeAudioContext = async (): Promise<void> => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

export const playClick = (
  frequency: number = 1000,
  duration: number = 0.05,
  volume: number = 0.5,
  startTime: number = 0
): void => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.001);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration);
};

export const playNote = (
  midiNote: number,
  duration: number = 0.5,
  volume: number = 0.5,
  startTime: number = 0,
  type: OscillatorType = 'triangle'
): void => {
  const ctx = getAudioContext();
  const frequency = midiToFrequency(midiNote);

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(volume * 0.8, ctx.currentTime + startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration);
};

export const playChord = (
  midiNotes: number[],
  duration: number = 1.5,
  volume: number = 0.4,
  startTime: number = 0
): void => {
  midiNotes.forEach((note, index) => {
    playNote(note, duration, volume, startTime + index * 0.02);
  });
};

export const midiToFrequency = (midi: number): number => {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

export const frequencyToMidi = (frequency: number): number => {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const midiToNoteName = (midi: number): string => {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
};

export const noteNameToMidi = (noteName: string): number => {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60;

  const [, note, octaveStr] = match;
  const noteIndex = NOTE_NAMES.indexOf(note);
  const octave = parseInt(octaveStr, 10);

  return (octave + 1) * 12 + noteIndex;
};
