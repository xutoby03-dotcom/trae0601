export async function createReverbImpulse(audioContext: AudioContext, duration: number = 2, decay: number = 2): Promise<AudioBuffer> {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  
  return impulse;
}

export function createDeckNodes(audioContext: AudioContext) {
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.8;
  
  const lowFilter = audioContext.createBiquadFilter();
  lowFilter.type = 'lowshelf';
  lowFilter.frequency.value = 250;
  lowFilter.gain.value = 0;
  
  const midFilter = audioContext.createBiquadFilter();
  midFilter.type = 'peaking';
  midFilter.frequency.value = 1000;
  midFilter.Q.value = 1;
  midFilter.gain.value = 0;
  
  const highFilter = audioContext.createBiquadFilter();
  highFilter.type = 'highshelf';
  highFilter.frequency.value = 4000;
  highFilter.gain.value = 0;
  
  const reverbGain = audioContext.createGain();
  reverbGain.gain.value = 0;
  
  const delayNode = audioContext.createDelay(5);
  delayNode.delayTime.value = 0.4;
  
  const delayFeedback = audioContext.createGain();
  delayFeedback.gain.value = 0.4;
  
  const delayGain = audioContext.createGain();
  delayGain.gain.value = 0;
  
  const filterNode = audioContext.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 20000;
  
  const crossfadeGain = audioContext.createGain();
  crossfadeGain.gain.value = 0.5;
  
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  
  gainNode.connect(lowFilter);
  lowFilter.connect(midFilter);
  midFilter.connect(highFilter);
  highFilter.connect(filterNode);
  
  highFilter.connect(reverbGain);
  highFilter.connect(delayNode);
  delayNode.connect(delayFeedback);
  delayFeedback.connect(delayNode);
  delayNode.connect(delayGain);
  
  filterNode.connect(crossfadeGain);
  reverbGain.connect(crossfadeGain);
  delayGain.connect(crossfadeGain);
  
  crossfadeGain.connect(analyser);
  
  return {
    gainNode,
    lowFilter,
    midFilter,
    highFilter,
    reverbGain,
    delayNode,
    delayFeedback,
    delayGain,
    filterNode,
    crossfadeGain,
    analyser,
  };
}
