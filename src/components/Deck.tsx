import React, { useCallback } from 'react';
import { useDJStore } from '../store/useDJStore';
import { useAudioControls } from '../hooks/useAudioControls';
import { detectBPM } from '../utils/bpmDetector';
import { audioEngine } from '../utils/audioEngine';
import { VirtualDeck } from './VirtualDeck';
import { Waveform } from './Waveform';
import { VolumeFader } from './VolumeFader';
import { EQKnob } from './EQKnob';
import { EffectsPanel } from './EffectsPanel';
import { BPMDisplay } from './BPMDisplay';
import { PitchSlider } from './PitchSlider';
import { CueButtons } from './CueButtons';
import { LoopControls } from './LoopControls';
import type { DeckId, DeckState } from '../types';

interface DeckProps {
  deckId: DeckId;
  color: string;
  beatsAligned?: boolean;
}

export const Deck: React.FC<DeckProps> = ({ deckId, color, beatsAligned }) => {
  const deck = useDJStore((state) => state[`deck${deckId}`] as DeckState);
  const {
    setDeckBuffer,
    setDeckVolume,
    setDeckBPM,
    setDeckPitch,
    setDeckEQ,
    setDeckEffects,
    setCuePoint,
    jumpToCue,
    setLoop,
    setDeckCurrentTime,
  } = useDJStore();
  
  const { togglePlay, seekDeck } = useAudioControls();

  const handleUpload = useCallback(async (file: File) => {
    const audioContext = audioEngine.getAudioContext();
    if (!audioContext) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setDeckBuffer(deckId, audioBuffer, file.name);
      
      const detectedBPM = await detectBPM(audioBuffer);
      setDeckBPM(deckId, detectedBPM);
    } catch (error) {
      console.error('Error loading audio file:', error);
      alert('Error loading audio file. Please try an MP3 file.');
    }
  }, [deckId, setDeckBuffer, setDeckBPM]);

  const handlePlayPause = useCallback(() => {
    togglePlay(deckId);
  }, [deckId, togglePlay]);

  const handleCue = useCallback(() => {
    setDeckCurrentTime(deckId, 0);
    seekDeck(deckId, 0);
  }, [deckId, setDeckCurrentTime, seekDeck]);

  const handleSetCue = useCallback((index: number) => {
    setCuePoint(deckId, index, deck.currentTime);
  }, [deckId, deck.currentTime, setCuePoint]);

  const handleJumpToCue = useCallback((index: number) => {
    jumpToCue(deckId, index);
    seekDeck(deckId, deck.cuePoints[index]);
  }, [deckId, deck.cuePoints, jumpToCue, seekDeck]);

  const handleToggleLoop = useCallback(() => {
    setLoop(deckId, !deck.loopEnabled, deck.loopBeats);
  }, [deckId, deck.loopEnabled, deck.loopBeats, setLoop]);

  const handleSetLoopBeats = useCallback((beats: 1 | 2 | 4 | 8) => {
    setLoop(deckId, true, beats);
  }, [deckId, setLoop]);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-gray-900/50 border-2 border-gray-700">
      <div className="flex items-center justify-between">
        <h2 
          className="text-2xl font-bold tracking-widest"
          style={{ color, textShadow: `0 0 20px ${color}50` }}
        >
          DECK {deckId}
        </h2>
      </div>

      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-4">
          <VirtualDeck
            isPlaying={deck.isPlaying}
            fileName={deck.fileName}
            currentTime={deck.currentTime}
            duration={deck.duration}
            color={color}
            onPlayPause={handlePlayPause}
            onUpload={handleUpload}
            onCue={handleCue}
          />
          
          <BPMDisplay
            bpm={deck.bpm}
            detectedBPM={deck.detectedBPM}
            isPlaying={deck.isPlaying}
            beatPhase={deck.beatPhase}
            isAligned={beatsAligned}
            color={color}
          />
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <Waveform
            audioBuffer={deck.audioBuffer}
            currentTime={deck.currentTime}
            duration={deck.duration}
            onSeek={(time) => seekDeck(deckId, time)}
            color={color}
            cuePoints={deck.cuePoints}
          />

          <div className="flex justify-around items-start">
            <div className="flex flex-col items-center gap-4">
              <VolumeFader
                value={deck.volume}
                onChange={(v) => setDeckVolume(deckId, v)}
                label="VOLUME"
                color={color}
              />
            </div>

            <div className="flex gap-4">
              <EQKnob
                value={deck.eq.low}
                label="LOW"
                onChange={(v) => setDeckEQ(deckId, { low: v })}
                color={color}
              />
              <EQKnob
                value={deck.eq.mid}
                label="MID"
                onChange={(v) => setDeckEQ(deckId, { mid: v })}
                color={color}
              />
              <EQKnob
                value={deck.eq.high}
                label="HIGH"
                onChange={(v) => setDeckEQ(deckId, { high: v })}
                color={color}
              />
            </div>

            <PitchSlider
              value={deck.pitch}
              onChange={(v) => setDeckPitch(deckId, v)}
              color={color}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <CueButtons
          cuePoints={deck.cuePoints}
          onSetCue={handleSetCue}
          onJumpToCue={handleJumpToCue}
          disabled={!deck.audioBuffer}
        />
        
        <LoopControls
          loopEnabled={deck.loopEnabled}
          loopBeats={deck.loopBeats}
          onToggleLoop={handleToggleLoop}
          onSetBeats={handleSetLoopBeats}
          disabled={!deck.audioBuffer}
        />
        
        <EffectsPanel
          effects={deck.effects}
          onChange={(effects) => setDeckEffects(deckId, effects)}
          deckColor={color}
        />
      </div>
    </div>
  );
};
