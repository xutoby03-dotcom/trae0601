import { Mp3Encoder } from 'lamejs';

export const audioBufferToMp3 = (audioBuffer: AudioBuffer, kbps: number = 192): Blob => {
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  const leftData = audioBuffer.getChannelData(0);
  const rightData = channels > 1 ? audioBuffer.getChannelData(1) : leftData;

  const left = new Int16Array(length);
  const right = new Int16Array(length);

  for (let i = 0; i < length; i++) {
    left[i] = Math.max(-1, Math.min(1, leftData[i])) * 0x7FFF;
    right[i] = Math.max(-1, Math.min(1, rightData[i])) * 0x7FFF;
  }

  const encoder = new Mp3Encoder(channels, sampleRate, kbps);
  
  const maxSamples = 1152;
  const mp3Data: Int8Array[] = [];
  
  let remaining = length;
  let offset = 0;
  
  while (remaining > 0) {
    const chunkSize = Math.min(maxSamples, remaining);
    const leftChunk = left.subarray(offset, offset + chunkSize);
    const rightChunk = right.subarray(offset, offset + chunkSize);
    
    const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    remaining -= chunkSize;
    offset += chunkSize;
  }
  
  const mp3buf = encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  const totalLength = mp3Data.reduce((sum, arr) => sum + arr.length, 0);
  const output = new Uint8Array(totalLength);
  let pos = 0;
  for (const buf of mp3Data) {
    output.set(buf, pos);
    pos += buf.length;
  }

  return new Blob([output], { type: 'audio/mp3' });
};
