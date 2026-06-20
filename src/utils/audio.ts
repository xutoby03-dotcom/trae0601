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

function getScoreLabel(score: number, isLowBetter: boolean): string {
  const normalized = isLowBetter ? 10 - score : score;
  if (normalized >= 8) return '出色';
  if (normalized >= 6) return '良好';
  if (normalized >= 4) return '一般';
  return '待优化';
}

function getScoreDescription(key: string, score: number): string {
  const isLowBetter = key !== 'emotion';
  const label = getScoreLabel(score, isLowBetter);

  switch (key) {
    case 'sibilance':
      return `齿音控制${label}（${score}/10）${
        score <= 2
          ? '，S/Z 音丝滑通透，几乎不需要后期处理'
          : score <= 4
            ? '，高频延伸自然，齿音轻微'
            : score <= 6
              ? '，存在一定齿音，可通过去齿音插件处理'
              : '，齿音偏重，需要后期精修'
      }`;
    case 'nasality':
      return `鼻音控制${label}（${score}/10）${
        score <= 2
          ? '，人声腔体打开，鼻音自然不闷'
          : score <= 4
            ? '，鼻音适中，不影响清晰度'
            : score <= 6
              ? '，略有鼻音，可通过 EQ 衰减 250-500Hz 改善'
              : '，鼻音偏重，建议调整拾音角度'
      }`;
    case 'plosives':
      return `爆破音控制${label}（${score}/10）${
        score <= 2
          ? '，P/B 音干净利落，无明显喷麦'
          : score <= 4
            ? '，爆破音轻微，防喷罩效果良好'
            : score <= 6
              ? '，存在少量喷麦，建议增加防喷罩距离'
              : '，爆破音明显，需要双层防喷罩或调整角度'
      }`;
    case 'noiseFloor':
      return `底噪控制${label}（${score}/10）${
        score <= 2
          ? '，信号纯净，前级增益搭配合理'
          : score <= 4
            ? '，底噪极低，后期空间充足'
            : score <= 6
              ? '，存在轻微底噪，可通过降噪插件处理'
              : '，底噪偏高，建议检查线路和接地'
      }`;
    case 'emotion':
      return `情绪表现${label}（${score}/10）${
        score >= 8
          ? '，人声感染力强，细节层次丰富'
          : score >= 6
            ? '，情绪到位，动态表现良好'
            : score >= 4
              ? '，情绪平稳，但缺少一些爆发力'
              : '，情绪偏平，建议调整演唱状态'
      }`;
    default:
      return `${label}（${score}/10）`;
  }
}

interface TakeWithAnnotations {
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
}

export function generateRecommendationReason(take: TakeWithAnnotations): string {
  const reasons: string[] = [];
  const { annotations, microphone, preamp, distance, gain, popFilter, roomPosition } = take;

  reasons.push(
    `**最终选择**：${microphone} + ${preamp}，拾音距离 ${distance}cm，增益 ${
      gain > 0 ? '+' : ''
    }${gain}dB，${roomPosition}${popFilter ? '，开启防喷罩' : '，未使用防喷罩'}。`
  );

  const annotationKeys = ['emotion', 'sibilance', 'plosives', 'noiseFloor', 'nasality'] as const;
  for (const key of annotationKeys) {
    reasons.push(`**${getScoreDescription(key, annotations[key])}**`);
  }

  const micCharacteristics: Record<string, string> = {
    'Neumann U87 Ai': 'U87 的中频饱满度为人声提供了温暖的基座，高频延伸细腻不刺耳，是人声录制的经典选择。',
    'Shure SM7B': 'SM7B 的中频突出特性让人声充满力量感，低频滚降有效减少了环境干扰，适合需要冲击力的风格。',
    'AKG C414 XLII': 'C414 的多指向特性和宽频响范围捕捉到了丰富的空间细节，空气感十足。',
    'Sony C800G': 'C800G 的电子管电路赋予人声独特的光泽和空气感，是高端人声录制的标杆。',
    'Telefunken ELA M 251': 'ELA M 251 的经典电子管音色温暖醇厚，中频密度极高，音乐性出众。',
    'Neumann KMS 105': 'KMS 105 的手持设计提供了出色的临场感，适合需要移动的演唱场景。',
  };

  const micName = microphone;
  for (const [key, desc] of Object.entries(micCharacteristics)) {
    if (micName.includes(key)) {
      reasons.push(`**麦克风特性**：${desc}`);
      break;
    }
  }

  const preampCharacteristics: Record<string, string> = {
    'Neve 1073': 'Neve 1073 的变压器耦合输出提供了经典的 British 音色，低频紧实有弹性。',
    'API 512c': 'API 512c 的 2520 运放带来了极具冲击力的低频和清晰的高频，适合需要力量感的人声。',
    'Universal Audio 6176': '6176 结合了 610 前级和 1176 压缩的经典组合，为人声增添了恰到好处的染色和质感。',
    'Focusrite ISA One': 'ISA One 的变压器耦合设计提供了纯净透明的增益，细节还原出色。',
    'Millennia HV-3C': 'HV-3C 的无染色设计忠实还原了麦克风本身的特性，适合追求自然音色的场景。',
    'Grace Design m101': 'm101 的纯净增益和极低底噪为人声提供了安静的基底。',
  };

  for (const [key, desc] of Object.entries(preampCharacteristics)) {
    if (preamp.includes(key)) {
      reasons.push(`**前级特性**：${desc}`);
      break;
    }
  }

  if (distance <= 12) {
    reasons.push(
      `**拾音距离**：${distance}cm 近距离拾音提供了极佳的细节和临场感， proximity effect 带来了自然的低频增益，适合细腻抒情的演唱。`
    );
  } else if (distance <= 18) {
    reasons.push(
      `**拾音距离**：${distance}cm 是人声录制的黄金距离，在细节和空间感之间取得了最佳平衡， proximity effect 适中。`
    );
  } else if (distance <= 25) {
    reasons.push(
      `**拾音距离**：${distance}cm 中距离拾音融入了更多房间自然混响，演唱自由度更高，适合需要空间感的风格。`
    );
  } else {
    reasons.push(
      `**拾音距离**：${distance}cm 远距离拾音获得了充足的房间自然混响，人声与空间融合度高，适合氛围感强的作品。`
    );
  }

  if (Math.abs(gain) <= 6) {
    reasons.push(
      `**增益设置**：${gain > 0 ? '+' : ''}${gain}dB 的增益设置处于合理范围，信噪比优秀，留足了后期调整空间。`
    );
  } else if (gain > 6) {
    reasons.push(
      `**增益设置**：+${gain}dB 的高增益搭配低灵敏度麦克风，需要注意前级底噪控制，但获得了更饱满的信号。`
    );
  } else {
    reasons.push(
      `**增益设置**：${gain}dB 的衰减设置适配了高输出麦克风，避免了信号过载，保留了最大动态。`
    );
  }

  if (roomPosition.includes('Center') || roomPosition.includes('0°')) {
    reasons.push(
      `**房间位置**：轴心位置拾取了最直接的声音，指向性最强，适合需要清晰度和聚焦感的人声。`
    );
  } else if (roomPosition.includes('Off-axis')) {
    reasons.push(
      `**房间位置**：偏离轴心的位置有效减少了齿音和爆破音，让高频更加顺滑，是常用的防喷技巧。`
    );
  } else if (roomPosition.includes('Booth')) {
    reasons.push(
      `**房间位置**：Vocal Booth 提供了良好的声学隔离，房间驻波影响最小，信号纯净度最高。`
    );
  } else if (roomPosition.includes('Corner')) {
    reasons.push(
      `**房间位置**：角落位置增加了自然的低频增益和房间反射，为人声增添了厚度和温暖感。`
    );
  } else if (roomPosition.includes('Room') || roomPosition.includes('ambient')) {
    reasons.push(
      `**房间位置**：房间位置拾取了更多自然混响，适合需要空间感和氛围感的演唱风格。`
    );
  }

  if (popFilter) {
    reasons.push(
      `**防喷罩**：开启防喷罩有效控制了 P/B 爆破音，同时不影响高频细节，是标准的人声录制配置。`
    );
  } else {
    reasons.push(
      `**防喷罩**：未使用防喷罩获得了更直接的高频细节，但爆破音需要后期处理，适合有经验的歌手。`
    );
  }

  if (take.notes) {
    reasons.push(`**制作人备注**：${take.notes}`);
  }

  const overallScore = calculateOverallScore(annotations);
  reasons.push(`**综合评分**：${overallScore}/10，${
    overallScore >= 8
      ? '是本次试音的最佳选择，各项指标均衡优秀。'
      : overallScore >= 6
        ? '整体表现良好，在关键指标上有突出表现。'
        : '有一定特点，但需要在后期制作中针对性优化。'
  }`);

  return reasons.join('\n\n');
}

export function generateAlternativesSection(
  selectedTake: TakeWithAnnotations,
  alternatives: TakeWithAnnotations[]
): string {
  if (alternatives.length === 0) return '';

  const lines: string[] = ['## 备选方案对比', ''];

  for (const alt of alternatives) {
    if (alt.name === selectedTake.name) continue;

    const score = calculateOverallScore(alt.annotations);
    const diffs: string[] = [];

    if (alt.microphone !== selectedTake.microphone) {
      diffs.push(`麦克风：${alt.microphone.split(' ').slice(0, 2).join(' ')}`);
    }
    if (alt.preamp !== selectedTake.preamp) {
      diffs.push(`前级：${alt.preamp.split(' ')[0]}`);
    }
    if (alt.distance !== selectedTake.distance) {
      diffs.push(`距离：${alt.distance}cm`);
    }
    if (alt.gain !== selectedTake.gain) {
      diffs.push(`增益：${alt.gain > 0 ? '+' : ''}${alt.gain}dB`);
    }
    if (alt.roomPosition !== selectedTake.roomPosition) {
      diffs.push(`位置：${alt.roomPosition}`);
    }

    const emotionDiff = alt.annotations.emotion - selectedTake.annotations.emotion;
    const noiseDiff = selectedTake.annotations.noiseFloor - alt.annotations.noiseFloor;

    const highlights: string[] = [];
    if (emotionDiff > 0) highlights.push(`情绪表现+${emotionDiff}`);
    if (emotionDiff < 0) highlights.push(`情绪表现${emotionDiff}`);
    if (noiseDiff > 0) highlights.push(`底噪控制+${noiseDiff}`);
    if (noiseDiff < 0) highlights.push(`底噪控制${noiseDiff}`);

    lines.push(`### ${alt.name}（评分 ${score}/10）`);
    lines.push('');
    lines.push(`- **差异**：${diffs.join(' / ')}`);
    lines.push(`- **对比**：${highlights.join('，') || '各项指标接近'}`);
    if (alt.notes) {
      lines.push(`- **备注**：${alt.notes}`);
    }
    lines.push('');
    lines.push(
      `> ${
        score > calculateOverallScore(selectedTake.annotations)
          ? '⚠️  综合评分高于最终选择，建议再次对比确认'
          : score === calculateOverallScore(selectedTake.annotations)
            ? '⚠️  综合评分与最终选择持平，可作为备份方案'
            : '评分稍低，可作为风格差异化备选'
      }`
    );
    lines.push('');
  }

  return lines.join('\n');
}
