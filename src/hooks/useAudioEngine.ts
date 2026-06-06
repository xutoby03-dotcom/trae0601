import { useEffect, useState } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { useDJStore } from '../store/useDJStore';
import type { DeckId } from '../types';

export function useAudioEngine() {
  const deckA = useDJStore((s) => s.deckA);
  const deckB = useDJStore((s) => s.deckB);
  const mixer = useDJStore((s) => s.mixer);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    audioEngine.init().then(() => {
      setIsReady(true);
    });

    return () => {
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      audioEngine.updateDeckParams('A', deckA);
    }
  }, [deckA, isReady]);

  useEffect(() => {
    if (isReady) {
      audioEngine.updateDeckParams('B', deckB);
    }
  }, [deckB, isReady]);

  const playDeck = (deckId: DeckId) => audioEngine.playDeck(deckId);
  const stopDeck = (deckId: DeckId) => audioEngine.stopDeck(deckId);
  const togglePlay = (deckId: DeckId) => audioEngine.togglePlay(deckId);
  const seekDeck = (deckId: DeckId, time: number) => audioEngine.seekDeck(deckId, time);
  const updateLoop = (deckId: DeckId) => audioEngine.updateLoop(deckId);
  const getDestinationStream = () => audioEngine.getDestinationStream();
  const getWaveformData = (deckId: DeckId) => audioEngine.getWaveformData(deckId);
  const getMasterWaveformData = () => audioEngine.getMasterWaveformData();
  const beatsAligned = audioEngine.getBeatsAligned();

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
    isReady,
  };
}
