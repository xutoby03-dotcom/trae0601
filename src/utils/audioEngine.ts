import type { DeckId, DeckState } from '../types';
import { createDeckNodes, createReverbImpulse } from './effects';
import { calculateBeatPhase, isBeatAligned } from './bpmDetector';
import { useDJStore } from '../store/useDJStore';

interface DeckAudioNodes {
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  lowFilter: BiquadFilterNode;
  midFilter: BiquadFilterNode;
  highFilter: BiquadFilterNode;
  reverbNode: ConvolverNode | null;
  reverbGain: GainNode;
  delayNode: DelayNode;
  delayFeedback: GainNode;
  delayGain: GainNode;
  filterNode: BiquadFilterNode;
  crossfadeGain: GainNode;
  analyser: AnalyserNode;
  startOffset: number;
  startTime: number;
  reverbReady: boolean;
}

class AudioEngineSingleton {
  private static instance: AudioEngineSingleton;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private deckNodes: { A: DeckAudioNodes | null; B: DeckAudioNodes | null } = { A: null, B: null };
  private rafId: number | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AudioEngineSingleton {
    if (!AudioEngineSingleton.instance) {
      AudioEngineSingleton.instance = new AudioEngineSingleton();
    }
    return AudioEngineSingleton.instance;
  }

  initAudioContext(): AudioContext {
    if (this.audioContext) return this.audioContext;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.audioContext = ctx;
    return ctx;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    const ctx = this.initAudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.value = useDJStore.getState().mixer.masterVolume;

    const masterAnalyser = ctx.createAnalyser();
    masterAnalyser.fftSize = 256;

    const destinationNode = ctx.createMediaStreamDestination();

    masterGain.connect(masterAnalyser);
    masterAnalyser.connect(ctx.destination);
    masterAnalyser.connect(destinationNode);

    this.masterGain = masterGain;
    this.masterAnalyser = masterAnalyser;
    this.destinationNode = destinationNode;

    await Promise.all([
      this.initDeck('A'),
      this.initDeck('B'),
    ]);

    this.isInitialized = true;
    this.startUpdateLoop();
  }

  private async initDeck(deckId: DeckId): Promise<void> {
    const ctx = this.initAudioContext();
    const nodes = createDeckNodes(ctx);

    const deckNodes: DeckAudioNodes = {
      source: null,
      ...nodes,
      reverbNode: null,
      startOffset: 0,
      startTime: 0,
      reverbReady: false,
    };

    try {
      const reverbImpulse = await createReverbImpulse(ctx, 2, 2);
      const reverbNode = ctx.createConvolver();
      reverbNode.buffer = reverbImpulse;

      nodes.reverbGain.connect(reverbNode);
      reverbNode.connect(nodes.crossfadeGain);

      deckNodes.reverbNode = reverbNode;
      deckNodes.reverbReady = true;
    } catch (e) {
      console.error('Failed to create reverb:', e);
    }

    if (this.masterGain) {
      nodes.analyser.connect(this.masterGain);
    }

    this.deckNodes[deckId] = deckNodes;
  }

  private startUpdateLoop(): void {
    const update = () => {
      const state = useDJStore.getState();
      const ctx = this.audioContext;

      if (!ctx) {
        this.rafId = requestAnimationFrame(update);
        return;
      }

      (['A', 'B'] as DeckId[]).forEach((deckId) => {
        const nodes = this.deckNodes[deckId];
        const deck = state[`deck${deckId}`];

        if (nodes && nodes.source && deck.isPlaying) {
          const elapsed = ctx.currentTime - nodes.startTime;
          const playbackRate = 1 + deck.pitch / 100;
          let currentTime = nodes.startOffset + elapsed * playbackRate;

          if (deck.loopEnabled && currentTime >= deck.loopEnd) {
            const loopDuration = deck.loopEnd - deck.loopStart;
            currentTime = deck.loopStart + ((currentTime - deck.loopStart) % loopDuration);
            nodes.startOffset = deck.loopStart;
            nodes.startTime = ctx.currentTime;
          }

          if (currentTime > deck.duration) {
            currentTime = deck.duration;
          }

          state.setDeckCurrentTime(deckId, currentTime);

          const phase = calculateBeatPhase(currentTime, deck.bpm);
          state.setBeatPhase(deckId, phase);

          this.updateDeckParams(deckId, deck);
        }
      });

      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(state.mixer.masterVolume, ctx.currentTime, 0.01);
      }

      this.rafId = requestAnimationFrame(update);
    };

    this.rafId = requestAnimationFrame(update);
  }

  updateDeckParams(deckId: DeckId, deckState: DeckState): void {
    const ctx = this.audioContext;
    const nodes = this.deckNodes[deckId];
    if (!nodes || !ctx) return;

    nodes.gainNode.gain.setTargetAtTime(deckState.volume, ctx.currentTime, 0.01);

    nodes.lowFilter.gain.setTargetAtTime(deckState.eq.low, ctx.currentTime, 0.01);
    nodes.midFilter.gain.setTargetAtTime(deckState.eq.mid, ctx.currentTime, 0.01);
    nodes.highFilter.gain.setTargetAtTime(deckState.eq.high, ctx.currentTime, 0.01);

    if (nodes.reverbReady) {
      nodes.reverbGain.gain.setTargetAtTime(deckState.effects.reverb, ctx.currentTime, 0.01);
    }

    nodes.delayGain.gain.setTargetAtTime(deckState.effects.delay, ctx.currentTime, 0.01);

    if (deckState.effects.filter > 0) {
      const filterFreq = deckState.effects.filterType === 'lowpass'
        ? 20000 * (1 - deckState.effects.filter) + 200
        : 200 + (20000 - 200) * deckState.effects.filter;
      nodes.filterNode.type = deckState.effects.filterType;
      nodes.filterNode.frequency.setTargetAtTime(filterFreq, ctx.currentTime, 0.02);
    } else {
      nodes.filterNode.frequency.setTargetAtTime(20000, ctx.currentTime, 0.02);
    }

    const crossfadeValue = useDJStore.getState().mixer.crossfader;
    const crossfadeA = deckId === 'A'
      ? Math.max(0, Math.min(1, (1 - crossfadeValue) / 2 + 0.5))
      : Math.max(0, Math.min(1, (crossfadeValue + 1) / 2));
    nodes.crossfadeGain.gain.setTargetAtTime(crossfadeA, ctx.currentTime, 0.01);
  }

  playDeck(deckId: DeckId): void {
    const ctx = this.audioContext;
    const state = useDJStore.getState();
    const deckState = state[`deck${deckId}`];
    const nodes = this.deckNodes[deckId];

    if (!ctx || !nodes || !deckState.audioBuffer) return;

    if (nodes.source) {
      try {
        nodes.source.stop();
      } catch (e) {}
    }

    const source = ctx.createBufferSource();
    source.buffer = deckState.audioBuffer;
    source.playbackRate.value = 1 + deckState.pitch / 100;
    source.loop = deckState.loopEnabled;

    if (deckState.loopEnabled) {
      source.loopStart = deckState.loopStart;
      source.loopEnd = deckState.loopEnd;
    }

    source.connect(nodes.gainNode);
    nodes.source = source;
    nodes.startOffset = deckState.currentTime;
    nodes.startTime = ctx.currentTime;

    source.start(0, deckState.currentTime);
    state.setDeckPlaying(deckId, true);

    source.onended = () => {
      if (deckState.loopEnabled) {
        state.setDeckCurrentTime(deckId, deckState.loopStart);
      }
    };
  }

  stopDeck(deckId: DeckId): void {
    const nodes = this.deckNodes[deckId];
    const state = useDJStore.getState();

    if (!nodes || !nodes.source) return;

    try {
      nodes.source.stop();
    } catch (e) {}

    nodes.source = null;
    state.setDeckPlaying(deckId, false);
  }

  syncDeck(deckId: DeckId): void {
    const ctx = this.audioContext;
    const state = useDJStore.getState();
    const targetDeckId: DeckId = deckId === 'A' ? 'B' : 'A';
    const sourceDeck = state[`deck${deckId}`];
    const targetDeck = state[`deck${targetDeckId}`];
    const nodes = this.deckNodes[deckId];

    if (!ctx || !nodes || sourceDeck.detectedBPM === 0 || targetDeck.detectedBPM === 0) {
      return;
    }

    const targetBPM = targetDeck.detectedBPM;
    const sourceBPM = sourceDeck.detectedBPM;

    const pitchRatio = targetBPM / sourceBPM;
    const pitch = (pitchRatio - 1) * 100;
    const clampedPitch = Math.max(-50, Math.min(50, pitch));

    state.setDeckPitch(deckId, clampedPitch);

    const targetBeatDuration = 60 / targetBPM;
    const targetBeatPhase = targetDeck.beatPhase;
    const targetBeatTime = targetBeatPhase * targetBeatDuration;

    const sourceBeatDuration = 60 / (targetBPM);
    const currentSourceBeatTime = sourceDeck.beatPhase * sourceBeatDuration;

    const phaseDiff = targetBeatTime - currentSourceBeatTime;
    const adjustedDiff = phaseDiff > sourceBeatDuration / 2
      ? phaseDiff - sourceBeatDuration
      : phaseDiff < -sourceBeatDuration / 2
        ? phaseDiff + sourceBeatDuration
        : phaseDiff;

    let newCurrentTime = sourceDeck.currentTime + adjustedDiff;

    if (newCurrentTime < 0) newCurrentTime = 0;
    if (newCurrentTime > sourceDeck.duration) newCurrentTime = sourceDeck.duration;

    state.setDeckCurrentTime(deckId, newCurrentTime);

    if (nodes.source && sourceDeck.isPlaying) {
      try {
        nodes.source.stop();
      } catch (e) {}

      const source = ctx.createBufferSource();
      source.buffer = sourceDeck.audioBuffer;
      source.playbackRate.value = 1 + clampedPitch / 100;
      source.loop = sourceDeck.loopEnabled;

      if (sourceDeck.loopEnabled) {
        source.loopStart = sourceDeck.loopStart;
        source.loopEnd = sourceDeck.loopEnd;
      }

      source.connect(nodes.gainNode);
      nodes.source = source;
      nodes.startOffset = newCurrentTime;
      nodes.startTime = ctx.currentTime;

      source.start(0, newCurrentTime);

      source.onended = () => {
        if (sourceDeck.loopEnabled) {
          state.setDeckCurrentTime(deckId, sourceDeck.loopStart);
        }
      };
    }
  }

  togglePlay(deckId: DeckId): void {
    const deckState = useDJStore.getState()[`deck${deckId}`];
    if (deckState.isPlaying) {
      this.stopDeck(deckId);
    } else {
      this.playDeck(deckId);
    }
  }

  seekDeck(deckId: DeckId, time: number): void {
    const state = useDJStore.getState();
    const deckState = state[`deck${deckId}`];
    if (!deckState.audioBuffer) return;

    const clampedTime = Math.max(0, Math.min(deckState.duration, time));
    state.setDeckCurrentTime(deckId, clampedTime);

    if (deckState.isPlaying) {
      this.playDeck(deckId);
    }
  }

  updateLoop(deckId: DeckId): void {
    const deckState = useDJStore.getState()[`deck${deckId}`];
    const nodes = this.deckNodes[deckId];
    if (!deckState.isPlaying || !deckState.loopEnabled || !nodes || !nodes.source) return;

    nodes.source.loop = true;
    nodes.source.loopStart = deckState.loopStart;
    nodes.source.loopEnd = deckState.loopEnd;
  }

  getDestinationStream(): MediaStream | undefined {
    return this.destinationNode?.stream;
  }

  getWaveformData(deckId: DeckId): Uint8Array | null {
    const nodes = this.deckNodes[deckId];
    if (!nodes) return null;

    const dataArray = new Uint8Array(nodes.analyser.frequencyBinCount);
    nodes.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getMasterWaveformData(): Uint8Array | null {
    if (!this.masterAnalyser) return null;

    const dataArray = new Uint8Array(this.masterAnalyser.frequencyBinCount);
    this.masterAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getBeatsAligned(): boolean {
    const state = useDJStore.getState();
    return isBeatAligned(state.deckA.beatPhase, state.deckB.beatPhase);
  }

  destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    (['A', 'B'] as DeckId[]).forEach((deckId) => {
      const nodes = this.deckNodes[deckId];
      if (nodes?.source) {
        try {
          nodes.source.stop();
        } catch (e) {}
      }
    });

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
  }
}

export const audioEngine = AudioEngineSingleton.getInstance();
