import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useDJStore } from '../store/useDJStore';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { audioEngine } from '../utils/audioEngine';
import { Deck } from './Deck';
import { Crossfader } from './Crossfader';
import { VolumeFader } from './VolumeFader';
import { RecordButton } from './RecordButton';
import { ProjectManager } from './ProjectManager';
import { encodeToMP3, downloadBlob } from '../utils/mp3Encoder';
import type { DJProject } from '../types';

export const Mixer: React.FC = () => {
  const {
    mixer,
    deckA,
    deckB,
    setCrossfader,
    setMasterVolume,
    setRecording,
    setDeckBuffer,
    setCuePoint,
    setDeckBPM,
  } = useDJStore();

  const { getDestinationStream, beatsAligned, isReady } = useAudioEngine();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [masterLevel, setMasterLevel] = useState(0);

  const handleStartRecording = useCallback(() => {
    const stream = getDestinationStream();
    if (!stream) return;

    recordedChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const webmBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      
      try {
        const audioContext = audioEngine.getAudioContext();
        if (!audioContext) return;

        const arrayBuffer = await webmBlob.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const mp3Blob = await encodeToMP3(decodedBuffer);
        
        setRecording(false, mp3Blob);
      } catch (error) {
        console.error('Error encoding MP3:', error);
        setRecording(false, webmBlob);
      }
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
  }, [getDestinationStream, setRecording]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleDownloadRecording = useCallback(() => {
    if (mixer.recordedBlob) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadBlob(mixer.recordedBlob, `dj-mix-${timestamp}.mp3`);
    }
  }, [mixer.recordedBlob]);

  const handleLoadProject = useCallback(async (project: DJProject) => {
    const audioContext = audioEngine.getAudioContext();
    if (!audioContext) return;

    if (project.deckA.audioData.byteLength > 0) {
      try {
        const float32Array = new Float32Array(project.deckA.audioData);
        const audioBuffer = audioContext.createBuffer(1, float32Array.length, audioContext.sampleRate);
        audioBuffer.copyToChannel(float32Array, 0);
        
        setDeckBuffer('A', audioBuffer, project.deckA.fileName);
        setDeckBPM('A', project.deckA.bpm);
        project.deckA.cuePoints.forEach((time, index) => {
          setCuePoint('A', index, time);
        });
      } catch (e) {
        console.error('Error loading deck A:', e);
      }
    }

    if (project.deckB.audioData.byteLength > 0) {
      try {
        const float32Array = new Float32Array(project.deckB.audioData);
        const audioBuffer = audioContext.createBuffer(1, float32Array.length, audioContext.sampleRate);
        audioBuffer.copyToChannel(float32Array, 0);
        
        setDeckBuffer('B', audioBuffer, project.deckB.fileName);
        setDeckBPM('B', project.deckB.bpm);
        project.deckB.cuePoints.forEach((time, index) => {
          setCuePoint('B', index, time);
        });
      } catch (e) {
        console.error('Error loading deck B:', e);
      }
    }
  }, [setDeckBuffer, setDeckBPM, setCuePoint]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 animate-pulse">
            WEB DJ MIXER
          </h1>
          <p className="text-gray-500 mt-2 text-sm tracking-wider">
            Professional DJ Mixing in Your Browser
          </p>
        </header>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <Deck deckId="A" color="#00f5ff" beatsAligned={beatsAligned} />
          <Deck deckId="B" color="#ff00ff" beatsAligned={beatsAligned} />
        </div>

        <div className="p-6 rounded-xl bg-gray-900/80 border-2 border-gray-700">
          <div className="flex items-center justify-between gap-8">
            <ProjectManager
              deckA={deckA}
              deckB={deckB}
              onLoadProject={handleLoadProject}
            />

            <div className="flex-1 max-w-xl">
              <Crossfader
                value={mixer.crossfader}
                onChange={setCrossfader}
              />
            </div>

            <div className="flex items-center gap-8">
              <VolumeFader
                value={mixer.masterVolume}
                onChange={setMasterVolume}
                label="MASTER"
                color="#ffffff"
                vertical={true}
              />

              <div className="w-16 h-64 flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-75"
                  style={{ height: `${masterLevel * 100}%`, opacity: 0.8 }}
                />
              </div>

              <RecordButton
                isRecording={mixer.isRecording}
                recordedBlob={mixer.recordedBlob}
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onDownload={handleDownloadRecording}
              />
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 text-gray-600 text-xs">
          <p>Upload MP3 files to each deck, then mix away!</p>
          <p className="mt-1">Double-click CUE buttons to set cue points</p>
        </footer>
      </div>
    </div>
  );
};
