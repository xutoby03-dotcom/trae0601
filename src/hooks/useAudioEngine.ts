import { useRef, useCallback, useEffect } from 'react';
import { useAudioStore } from '@/store/audioStore';

const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const {
    audioBuffer,
    eqGains,
    volume,
    setAudioContext,
    setAnalyser,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsRecording,
    setAudioBuffer,
  } = useAudioStore();

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(audioContextRef.current);

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      setAnalyser(analyserRef.current);

      eqFiltersRef.current = EQ_FREQUENCIES.map((freq, index) => {
        const filter = audioContextRef.current!.createBiquadFilter();
        filter.type = index === 0 ? 'lowshelf' : index === EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = eqGains[index] || 0;
        return filter;
      });

      let prevNode: AudioNode = gainNodeRef.current;
      eqFiltersRef.current.forEach((filter) => {
        prevNode.connect(filter);
        prevNode = filter;
      });
      prevNode.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, [volume, eqGains, setAudioContext, setAnalyser]);

  const updateEqGain = useCallback((index: number, gain: number) => {
    if (eqFiltersRef.current[index]) {
      eqFiltersRef.current[index].gain.setTargetAtTime(gain, audioContextRef.current?.currentTime || 0, 0.01);
    }
  }, []);

  const updateVolume = useCallback((newVolume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(newVolume, audioContextRef.current?.currentTime || 0, 0.01);
    }
  }, []);

  const playBuffer = useCallback(async (buffer: AudioBuffer, offset: number = 0) => {
    const ctx = initAudioContext();
    
    if (sourceNodeRef.current) {
      if ('stop' in sourceNodeRef.current) {
        (sourceNodeRef.current as AudioBufferSourceNode).stop();
      }
      sourceNodeRef.current.disconnect();
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current!);
    sourceNodeRef.current = source;

    startTimeRef.current = ctx.currentTime - offset;
    source.start(0, offset);
    setIsPlaying(true);
    setDuration(buffer.duration);

    source.onended = () => {
      if (sourceNodeRef.current === source) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const updateTime = () => {
      if (audioContextRef.current && sourceNodeRef.current === source) {
        const currentTime = audioContextRef.current.currentTime - startTimeRef.current;
        if (currentTime < buffer.duration) {
          setCurrentTime(Math.min(currentTime, buffer.duration));
          animationFrameRef.current = requestAnimationFrame(updateTime);
        }
      }
    };
    animationFrameRef.current = requestAnimationFrame(updateTime);

    return source;
  }, [initAudioContext, setIsPlaying, setCurrentTime, setDuration]);

  const pause = useCallback(() => {
    if (sourceNodeRef.current) {
      if ('stop' in sourceNodeRef.current) {
        (sourceNodeRef.current as AudioBufferSourceNode).stop();
      }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
  }, [setIsPlaying]);

  const seekTo = useCallback((time: number) => {
    if (audioBuffer) {
      const wasPlaying = useAudioStore.getState().isPlaying;
      if (wasPlaying) {
        pause();
      }
      setCurrentTime(time);
      if (wasPlaying) {
        playBuffer(audioBuffer, time);
      }
    }
  }, [audioBuffer, playBuffer, pause, setCurrentTime]);

  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const ctx = initAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      source.connect(gainNodeRef.current!);
      sourceNodeRef.current = source;
      
      return stream;
    } catch (error) {
      console.error('Microphone access denied:', error);
      throw error;
    }
  }, [initAudioContext]);

  const stopMicrophone = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      let stream = mediaStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }

      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const ctx = initAudioContext();
        try {
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
          setAudioBuffer(audioBuffer);
        } catch (e) {
          console.error('Failed to decode recorded audio:', e);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [initAudioContext, setAudioBuffer, setIsRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  }, [setIsRecording]);

  const loadAudioFile = useCallback(async (file: File): Promise<AudioBuffer> => {
    const arrayBuffer = await file.arrayBuffer();
    const ctx = initAudioContext();
    const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    setAudioBuffer(buffer);
    setDuration(buffer.duration);
    return buffer;
  }, [initAudioContext, setAudioBuffer, setDuration]);

  const getAudioData = useCallback(() => {
    if (!analyserRef.current) return { frequency: new Uint8Array(0), time: new Uint8Array(0) };
    
    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
    const timeData = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    analyserRef.current.getByteFrequencyData(frequencyData);
    analyserRef.current.getByteTimeDomainData(timeData);
    
    return { frequency: frequencyData, time: timeData };
  }, []);

  const sliceAudio = useCallback(async (startTime: number, endTime: number): Promise<Blob> => {
    if (!audioBuffer) throw new Error('No audio loaded');
    
    const ctx = initAudioContext();
    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const length = endSample - startSample;
    
    const slicedBuffer = ctx.createBuffer(
      audioBuffer.numberOfChannels,
      length,
      sampleRate
    );
    
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const slicedData = slicedBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        slicedData[i] = channelData[startSample + i];
      }
    }
    
    const wavBlob = audioBufferToWav(slicedBuffer);
    return wavBlob;
  }, [audioBuffer, initAudioContext]);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as AudioBufferSourceNode).stop();
      } catch (e) {}
      sourceNodeRef.current.disconnect();
    }
    stopMicrophone();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopMicrophone]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    initAudioContext,
    playBuffer,
    pause,
    seekTo,
    loadAudioFile,
    startMicrophone,
    stopMicrophone,
    startRecording,
    stopRecording,
    getAudioData,
    updateEqGain,
    updateVolume,
    sliceAudio,
    cleanup,
  };
};

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);
  
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const intSample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, intSample < 0 ? intSample * 0x8000 : intSample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
