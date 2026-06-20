export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateOverallScore(annotations: {
  sibilance: number;
  nasality: number;
  plosives: number;
  noiseFloor: number;
  emotion: number;
}): number {
  const negatives = annotations.sibilance + annotations.nasality + annotations.plosives + annotations.noiseFloor;
  const avgNegative = negatives / 4;
  const score = annotations.emotion * 0.5 + (10 - avgNegative) * 0.5;
  return Math.round(score * 10) / 10;
}

export function generateRecommendationReason(take: {
  name: string;
  microphone: string;
  preamp: string;
  distance: number;
  gain: number;
  roomPosition: string;
  popFilter: boolean;
  annotations: {
    sibilance: number;
    nasality: number;
    plosives: number;
    noiseFloor: number;
    emotion: number;
  };
  notes: string;
}): string {
  const reasons: string[] = [];
  const { annotations, microphone, preamp, distance, popFilter, roomPosition } = take;

  reasons.push(`**设备组合**：${microphone} + ${preamp} 是经过 A/B 对比后的最佳选择。`);

  if (annotations.emotion >= 8) {
    reasons.push(`**情绪表现优秀**：情绪得分 ${annotations.emotion}/10，人声感染力强，富有表现力。`);
  } else if (annotations.emotion >= 6) {
    reasons.push(`**情绪表现良好**：情绪得分 ${annotations.emotion}/10，人声自然真实。`);
  }

  if (annotations.sibilance <= 3) {
    reasons.push(`**齿音控制出色**：齿音仅 ${annotations.sibilance}/10，高频顺滑不刺耳。`);
  }

  if (annotations.plosives <= 3) {
    reasons.push(`**爆破音控制良好**：爆破音 ${annotations.plosives}/10${popFilter ? '，防喷罩效果明显' : ''}。`);
  }

  if (annotations.noiseFloor <= 2) {
    reasons.push(`**底噪极低**：底噪 ${annotations.noiseFloor}/10，信号纯净，后期空间大。`);
  }

  if (distance <= 15) {
    reasons.push(`**近距离拾音**：${distance}cm 距离提供了充足的细节和临场感。`);
  } else if (distance >= 25) {
    reasons.push(`**中远距离拾音**：${distance}cm 距离获得了自然的空间感。`);
  }

  if (roomPosition.includes('Booth') || roomPosition.includes('Vocal')) {
    reasons.push(`**声学环境优秀**：在 ${roomPosition} 录制，避免了房间驻波干扰。`);
  }

  if (take.notes) {
    reasons.push(`**制作人备注**：${take.notes}`);
  }

  const overallScore = calculateOverallScore(annotations);
  reasons.push(`**综合评分**：${overallScore}/10`);

  return reasons.join('\n\n');
}
