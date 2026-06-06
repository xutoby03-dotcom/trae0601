import Mp3Encoder from 'lamejs';

export async function encodeToMP3(audioBuffer: AudioBuffer): Promise<Blob> {
  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;
  const samples = audioBuffer.length;
  
  const kbps = 192;
  const encoder = new Mp3Encoder.Mp3Encoder(channels, sampleRate, kbps);
  
  const samplesLeft = audioBuffer.getChannelData(0);
  const samplesRight = channels > 1 ? audioBuffer.getChannelData(1) : samplesLeft;
  
  const mp3Data: Int8Array[] = [];
  
  const sampleBlockSize = 1152;
  
  for (let i = 0; i < samples; i += sampleBlockSize) {
    const leftChunk = new Int16Array(sampleBlockSize);
    const rightChunk = new Int16Array(sampleBlockSize);
    
    for (let j = 0; j < sampleBlockSize && i + j < samples; j++) {
      leftChunk[j] = Math.max(-1, Math.min(1, samplesLeft[i + j])) * 32767;
      rightChunk[j] = Math.max(-1, Math.min(1, samplesRight[i + j])) * 32767;
    }
    
    const mp3buf = channels > 1 
      ? encoder.encodeBuffer(leftChunk, rightChunk)
      : encoder.encodeBuffer(leftChunk);
    
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }
  
  const endBuf = encoder.flush();
  if (endBuf.length > 0) {
    mp3Data.push(endBuf);
  }
  
  return new Blob(mp3Data, { type: 'audio/mp3' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function recordToMP3(
  audioContext: AudioContext,
  destinationNode: MediaStreamAudioDestinationNode,
  duration: number
): Promise<Blob> {
  const stream = destinationNode.stream;
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm',
  });
  
  const chunks: BlobPart[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  
  return new Promise((resolve) => {
    mediaRecorder.onstop = async () => {
      const webmBlob = new Blob(chunks, { type: 'audio/webm' });
      
      const arrayBuffer = await webmBlob.arrayBuffer();
      const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const mp3Blob = await encodeToMP3(decodedBuffer);
      resolve(mp3Blob);
    };
    
    mediaRecorder.start();
    
    setTimeout(() => {
      mediaRecorder.stop();
    }, duration);
  });
}
