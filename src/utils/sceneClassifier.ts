import type { PerfumeRecord, SceneType, ScentNote, TimePoint } from '@/types';
import { TIME_POINTS } from '@/types';

interface SceneCalcInput {
  skinScore: number;
  clothScore: number;
  humidity: number;
  weather: string;
  timeline: Record<TimePoint, ScentNote>;
  scentFamily?: string;
}

export interface SceneWithReason {
  scene: SceneType;
  reason: string;
}

function buildReasons(
  input: SceneCalcInput
): { scenes: SceneType[]; sceneReasons: Map<SceneType, string[]> } {
  const { skinScore, clothScore, humidity, weather, timeline, scentFamily = '' } = input;
  const avgScore = (skinScore + clothScore) / 2;
  
  const diffusions = TIME_POINTS.map((tp) => timeline[tp].diffusion);
  const avgDiffusion = diffusions.reduce((a, b) => a + b, 0) / diffusions.length;
  const initialDiffusion = timeline['0min'].diffusion;
  const finalDiffusion = timeline['6h'].diffusion;
  const longevity = finalDiffusion >= 1;
  const midLongevity = timeline['2h'].diffusion >= 2;
  
  const weatherLower = weather.toLowerCase();
  const isRainyWeather = weatherLower.includes('雨') || weatherLower.includes('阴') || weatherLower.includes('rain') || weatherLower.includes('cloudy');
  
  const familyLower = scentFamily.toLowerCase();
  const hasFloral = familyLower.includes('花') || familyLower.includes('floral');
  const hasWoody = familyLower.includes('木') || familyLower.includes('woody') || familyLower.includes('木质');
  const hasFresh = familyLower.includes('清新') || familyLower.includes('fresh') || familyLower.includes('柑橘') || familyLower.includes('馥奇');
  const hasOriental = familyLower.includes('东方') || familyLower.includes('oriental');
  const hasSoft = familyLower.includes('白花') || familyLower.includes('草本') || familyLower.includes('soft');
  
  const sceneReasons = new Map<SceneType, string[]>();
  const scenes: SceneType[] = [];
  
  // 通勤
  {
    const reasons: string[] = [];
    let score = 0;
    if (avgDiffusion >= 2 && avgDiffusion <= 4) {
      score += 2;
      reasons.push('扩散适中');
    }
    if (avgScore >= 3.5) {
      score += 2;
      reasons.push('整体表现不错');
    }
    if (avgScore >= 4) {
      score += 1;
      reasons.push('高评分');
    }
    if (midLongevity) {
      score += 1;
      reasons.push('2小时仍有留香');
    }
    if (initialDiffusion <= 4) {
      score += 1;
      reasons.push('不会开场太冲');
    }
    if (hasFresh || hasWoody) {
      score += 1;
      reasons.push('清新/木质调百搭');
    }
    if (score >= 5) {
      scenes.push('commute');
      sceneReasons.set('commute', reasons.slice(0, 3));
    }
  }
  
  // 约会
  {
    const reasons: string[] = [];
    let score = 0;
    if (skinScore >= 4) {
      score += 2;
      reasons.push('皮肤表现出众');
    }
    if (clothScore >= 4) {
      score += 1;
      reasons.push('衣服上留香好');
    }
    if (avgScore >= 4) {
      score += 2;
      reasons.push('综合评分高');
    }
    if (initialDiffusion >= 3 && initialDiffusion <= 4) {
      score += 1;
      reasons.push('有存在感但不刺鼻');
    }
    if (midLongevity) {
      score += 1;
      reasons.push('2小时持续魅力');
    }
    if (longevity && finalDiffusion >= 2) {
      score += 1;
      reasons.push('6小时还有余香');
    }
    if (hasFloral || hasOriental) {
      score += 1;
      reasons.push('花香/东方调加分');
    }
    if (score >= 6) {
      scenes.push('date');
      sceneReasons.set('date', reasons.slice(0, 3));
    }
  }
  
  // 雨天
  {
    const reasons: string[] = [];
    let score = 0;
    if (humidity >= 60) {
      score += 2;
      reasons.push('高湿度下测试');
    }
    if (isRainyWeather) {
      score += 2;
      reasons.push('雨天实测表现好');
    }
    if (avgDiffusion >= 3) {
      score += 1;
      reasons.push('扩散力够');
    }
    if (avgDiffusion >= 4) {
      score += 1;
      reasons.push('扩散力强');
    }
    if (longevity && finalDiffusion >= 2) {
      score += 2;
      reasons.push('阴雨天持久留香');
    }
    if (midLongevity) {
      score += 1;
      reasons.push('中调稳定');
    }
    if (hasWoody || hasOriental) {
      score += 1;
      reasons.push('温润木质/东方调');
    }
    if (score >= 6) {
      scenes.push('rainy');
      sceneReasons.set('rainy', reasons.slice(0, 3));
    }
  }
  
  // 睡前
  {
    const reasons: string[] = [];
    let score = 0;
    if (avgDiffusion <= 3) {
      score += 2;
      reasons.push('扩散柔和');
    }
    if (avgDiffusion <= 2) {
      score += 1;
      reasons.push('扩散极低');
    }
    if (finalDiffusion <= 2) {
      score += 2;
      reasons.push('后期贴身不扰人');
    }
    if (finalDiffusion <= 1) {
      score += 1;
      reasons.push('6h几乎闻不到');
    }
    if (initialDiffusion <= 3) {
      score += 1;
      reasons.push('开场不冲');
    }
    if (avgScore >= 3) {
      score += 1;
      reasons.push('整体舒适');
    }
    if (skinScore >= 3) {
      score += 1;
      reasons.push('肤感温和');
    }
    if (hasFloral || hasSoft) {
      score += 1;
      reasons.push('柔和花香/草本调');
    }
    if (score >= 6) {
      scenes.push('bedtime');
      sceneReasons.set('bedtime', reasons.slice(0, 3));
    }
  }
  
  // 默认兜底
  if (scenes.length === 0) {
    if (avgScore >= 4) {
      scenes.push('commute');
      sceneReasons.set('commute', ['综合评分高', '日常百搭']);
    } else if (avgDiffusion >= 3) {
      scenes.push('date');
      sceneReasons.set('date', ['有一定扩散感', '存在感适中']);
    } else {
      scenes.push('bedtime');
      sceneReasons.set('bedtime', ['扩散低', '适合安静场合']);
    }
  }
  
  return { scenes, sceneReasons };
}

export function calculateScenes(input: SceneCalcInput): SceneType[] {
  return buildReasons(input).scenes;
}

export function calculateScenesWithReasons(input: SceneCalcInput): SceneWithReason[] {
  const { scenes, sceneReasons } = buildReasons(input);
  return scenes.map((scene) => ({
    scene,
    reason: sceneReasons.get(scene)?.join(' · ') || '综合表现适配',
  }));
}

export function calculateScenesFromRecord(
  record: Omit<PerfumeRecord, 'id' | 'createdAt' | 'scenes'> & { scenes?: SceneType[] }
): SceneType[] {
  return calculateScenes({
    skinScore: record.skinScore,
    clothScore: record.clothScore,
    humidity: record.humidity,
    weather: record.weather,
    timeline: record.timeline,
    scentFamily: record.scentFamily,
  });
}

export function calculateSceneReasonsFromRecord(
  record: Omit<PerfumeRecord, 'id' | 'createdAt' | 'scenes'> & { scenes?: SceneType[] }
): SceneWithReason[] {
  return calculateScenesWithReasons({
    skinScore: record.skinScore,
    clothScore: record.clothScore,
    humidity: record.humidity,
    weather: record.weather,
    timeline: record.timeline,
    scentFamily: record.scentFamily,
  });
}

export function getTopReason(
  record: Omit<PerfumeRecord, 'id' | 'createdAt' | 'scenes'> & { scenes?: SceneType[] }
): string {
  const reasons = calculateSceneReasonsFromRecord(record);
  if (reasons.length === 0) return '综合表现不错';
  return reasons[0].reason;
}
