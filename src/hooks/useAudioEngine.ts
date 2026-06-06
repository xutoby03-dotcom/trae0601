import { useEffect, useRef, useCallback } from 'react';
import { useDJStore } from '../store/useDJStore';
import type { DeckId, DeckState } from '../types';
import { createDeckNodes, createReverbImpulse } from '../utils/effects';
import { calculateBeatPhase, isBeatAligned } from '../utils/bpmDetector';

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
}

export function useAudioEngine() {
  const {
    initAudioContext,
    setDeckPlaying,
    setDeckCurrentTime,
    setBeatPhase,
    deckA,
    deckB,
    mixer,
  } = useDJStore();

  const deckNodesRef = useRef<{ A: DeckAudioNodes | null; B: DeckAudioNodes | null }>({
    A: null,
    B: null,
  });
  
  const masterGainRef = useRef<GainNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  const initAudio = useCallback(() => {
    if (isInitializedRef.current) return;
    
    const audioContext = initAudioContext();
    
    const masterGain = audioContext.createGain();
    masterGain.gain.value = mixer.masterVolume;
    
    const masterAnalyser = audioContext.createAnalyser();
    masterAnalyser.fftSize = 256;
    
    const destinationNode = audioContext.createMediaStreamDestination();
    
    masterGain.connect(masterAnalyser);
    masterAnalyser.connect(audioContext.destination);
    masterAnalyser.connect(destinationNode);
    
    masterGainRef.current = masterGain;
    masterAnalyserRef.current = masterAnalyser;
    destinationNodeRef.current = destinationNode;
    
    isInitializedRef.current = true;
  }, [initAudioContext, mixer.masterVolume]);

  const initDeck = useCallback(async (deckId: DeckId) => {
    const audioContext = initAudioContext();
    if (!audioContext) return;
    
    const nodes = createDeckNodes(audioContext);
    const reverbImpulse = await createReverbImpulse(audioContext, 2, 2);
    const reverbNode = audioContext.createConvolver();
    reverbNode.buffer = reverbImpulse;
    
    nodes.reverbGain.connect(reverbNode);
    reverbNode.connect(nodes.crossfadeGain);
    
    if (masterGainRef.current) {
      nodes.analyser.connect(masterGainRef.current);
    }
    
    deckNodesRef.current[deckId] = {
      source: null,
      ...nodes,
      reverbNode,
      startOffset: 0,
      startTime: 0,
    };
  }, [initAudioContext]);

  const updateDeckParams = useCallback((deckId: DeckId, deckState: DeckState) => {
    const audioContext = useDJStore.getState().audioContext;
    const nodes = deckNodesRef.current[deckId];
    if (!nodes || !audioContext) return;
    
    nodes.gainNode.gain.setTargetAtTime(deckState.volume, audioContext.currentTime, 0.01);
    
    nodes.lowFilter.gain.setTargetAtTime(deckState.eq.low, audioContext.currentTime, 0.01);
    nodes.midFilter.gain.setTargetAtTime(deckState.eq.mid, audioContext.currentTime, 0.01);
    nodes.highFilter.gain.setTargetAtTime(deckState.eq.high, audioContext.currentTime, 0.01);
    
    nodes.reverbGain.gain.setTargetAtTime(deckState.effects.reverb, audioContext.currentTime, 0.01);
    nodes.delayGain.gain.setTargetAtTime(deckState.effects.delay, audioContext.currentTime, 0.01);
    
    if (deckState.effects.filter > 0) {
      const filterFreq = deckState.effects.filterType === 'lowpass'
        ? 20000 * (1 - deckState.effects.filter) + 200
        : 200 + (20000 - 200) * deckState.effects.filter;
      nodes.filterNode.type = deckState.effects.filterType;
      nodes.filterNode.frequency.setTargetAtTime(filterFreq, audioContext.currentTime, 0.02);
    } else {
      nodes.filterNode.frequency.setTargetAtTime(20000, audioContext.currentTime, 0.02);
    }
    
    const crossfadeValue = mixer.crossfader;
    const crossfadeA = deckId === 'A' 
      ? Math.max(0, Math.min(1, (1 - crossfadeValue) / 2 + 0.5))
      : Math.max(0, Math.min(1, (crossfadeValue + 1) / 2));
    nodes.crossfadeGain.gain.setTargetAtTime(crossfadeA, audioContext.currentTime, 0.01);
  }, [mixer.crossfader]);

  const playDeck = useCallback((deckId: DeckId) => {
    const audioContext = initAudioContext();
    const deckState = useDJStore.getState()[`deck${deckId}`];
    const nodes = deckNodesRef.current[deckId];
    
    if (!audioContext || !nodes || !deckState.audioBuffer) return;
    
    if (nodes.source) {
      try {
        nodes.source.stop();
      } catch (e) {}
    }
    
    const source = audioContext.createBufferSource();
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
    nodes.startTime = audioContext.currentTime;
    
    source.start(0, deckState.currentTime);
    setDeckPlaying(deckId, true);
    
    source.onended = () => {
      if (deckState.loopEnabled) {
        setDeckCurrentTime(deckId, deckState.loopStart);
      }
    };
  }, [initAudioContext, setDeckPlaying, setDeckCurrentTime]);

  const stopDeck = useCallback((deckId: DeckId) => {
    const audioContext = initAudioContext();
    const nodes = deckNodesRef.current[deckId];
    
    if (!audioContext || !nodes || !nodes.source) return;
    
    try {
      nodes.source.stop();
    } catch (e) {}
    
    nodes.source = null;
    setDeckPlaying(deckId, false);
  }, [initAudioContext, setDeckPlaying]);

  const togglePlay = useCallback((deckId: DeckId) => {
    const deckState = useDJStore.getState()[`deck${deckId}`];
    if (deckState.isPlaying) {
      stopDeck(deckId);
    } else {
      playDeck(deckId);
    }
  }, [playDeck, stopDeck]);

  const seekDeck = useCallback((deckId: DeckId, time: number) => {
    const deckState = useDJStore.getState()[`deck${deckId}`];
    if (!deckState.audioBuffer) return;
    
    const clampedTime = Math.max(0, Math.min(deckState.duration, time));
    setDeckCurrentTime(deckId, clampedTime);
    
    if (deckState.isPlaying) {
      playDeck(deckId);
    }
  }, [setDeckCurrentTime, playDeck]);

  const updateLoop = useCallback((deckId: DeckId) => {
    const deckState = useDJStore.getState()[`deck${deckId}`];
    if (!deckState.isPlaying || !deckState.loopEnabled) return;
    
    const nodes = deckNodesRef.current[deckId];
    if (!nodes || !nodes.source) return;
    
    nodes.source.loop = true;
    nodes.source.loopStart = deckState.loopStart;
    nodes.source.loopEnd = deckState.loopEnd;
  }, []);

  useEffect(() => {
    initAudio();
    initDeck('A');
    initDeck('B');
    
    const updateLoop = () => {
      const state = useDJStore.getState();
      const audioContext = state.audioContext;
      
      if (!audioContext) {
        rafIdRef.current = requestAnimationFrame(updateLoop);
        return;
      }
      
      (['A', 'B'] as DeckId[]).forEach((deckId) => {
        const nodes = deckNodesRef.current[deckId];
        const deck = state[`deck${deckId}`];
        
        if (nodes && nodes.source && deck.isPlaying) {
          const elapsed = audioContext.currentTime - nodes.startTime;
          const playbackRate = 1 + deck.pitch / 100;
          let currentTime = nodes.startOffset + elapsed * playbackRate;
          
          if (deck.loopEnabled && currentTime >= deck.loopEnd) {
            const loopDuration = deck.loopEnd - deck.loopStart;
            currentTime = deck.loopStart + ((currentTime - deck.loopStart) % loopDuration);
            nodes.startOffset = deck.loopStart;
            nodes.startTime = audioContext.currentTime;
          }
          
          if (currentTime > deck.duration) {
            currentTime = deck.duration;
          }
          
          setDeckCurrentTime(deckId, currentTime);
          
          const phase = calculateBeatPhase(currentTime, deck.bpm);
          setBeatPhase(deckId, phase);
          
          updateDeckParams(deckId, deck);
        }
      });
      
      if (masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(state.mixer.masterVolume, audioContext.currentTime, 0.01);
      }
      
      rafIdRef.current = requestAnimationFrame(updateLoop);
    };
    
    rafIdRef.current = requestAnimationFrame(updateLoop);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [initAudio, initDeck, setDeckCurrentTime, setBeatPhase, updateDeckParams]);

  useEffect(() => {
    if (deckNodesRef.current['A']) updateDeckParams('A', deckA);
  }, [deckA, updateDeckParams]);

  useEffect(() => {
    if (deckNodesRef.current['B']) updateDeckParams('B', deckB);
  }, [deckB, updateDeckParams]);

  const getDestinationStream = useCallback(() => {
    return destinationNodeRef.current?.stream;
  }, []);

  const getWaveformData = useCallback((deckId: DeckId): Uint8Array | null => {
    const nodes = deckNodesRef.current[deckId];
    if (!nodes) return null;
    
    const dataArray = new Uint8Array(nodes.analyser.frequencyBinCount);
    nodes.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  const getMasterWaveformData = useCallback((): Uint8Array | null => {
    if (!masterAnalyserRef.current) return null;
    
    const dataArray = new Uint8Array(masterAnalyserRef.current.frequencyBinCount);
    masterAnalyserRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  const beatsAligned = isBeatAligned(deckA.beatPhase, deckB.beatPhase);

  return {
    playDeck,
    stopDeck,
    togglePlay,
    seekDeck,
    updateLoop,
    getDestinationStream,
    getWaveformData,
    getMasterWaveformData,
    beatsAligned,
  };
}
