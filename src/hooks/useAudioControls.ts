import { audioEngine } from '../utils/audioEngine';
import type { DeckId } from '../types';

export function useAudioControls() {
  const playDeck = (deckId: DeckId) => audioEngine.playDeck(deckId);
  const stopDeck = (deckId: DeckId) => audioEngine.stopDeck(deckId);
  const togglePlay = (deckId: DeckId) => audioEngine.togglePlay(deckId);
  const seekDeck = (deckId: DeckId, time: number) => audioEngine.seekDeck(deckId, time);
  const updateLoop = (deckId: DeckId) => audioEngine.updateLoop(deckId);
  const syncDeck = (deckId: DeckId) => audioEngine.syncDeck(deckId);
  const getWaveformData = (deckId: DeckId) => audioEngine.getWaveformData(deckId);
  const beatsAligned = audioEngine.getBeatsAligned();

  return {
    playDeck,
    stopDeck,
    togglePlay,
    seekDeck,
    updateLoop,
    syncDeck,
    getWaveformData,
    beatsAligned,
  };
}
