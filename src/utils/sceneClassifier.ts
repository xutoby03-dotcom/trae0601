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

export function calculateScenes(input: SceneCalcInput): SceneType[] {
  const { skinScore, clothScore, humidity, weather, timeline, scentFamily = '' } = input;
  const avgScore = (skinScore + clothScore) / 2;
  
  const diffusions = TIME_POINTS.map((tp) => timeline[tp].diffusion);
  const avgDiffusion = diffusions.reduce((a, b) => a + b, 0) / diffusions.length;
  const initialDiffusion = timeline['0min'].diffusion;
  const finalDiffusion = timeline['6h'].diffusion;
  const longevity = finalDiffusion >= 1 ? 1 : 0;
  const midLongevity = timeline['2h'].diffusion >= 2 ? 1 : 0;
  
  const weatherLower = weather.toLowerCase();
  const isRainyWeather = weatherLower.includes('雨') || weatherLower.includes('阴') || weatherLower.includes('rain') || weatherLower.includes('cloudy');
  
  const familyLower = scentFamily.toLowerCase();
  const hasFloral = familyLower.includes('花') || familyLower.includes('floral');
  const hasWoody = familyLower.includes('木') || familyLower.includes('woody') || familyLower.includes('木质');
  const hasFresh = familyLower.includes('清新') || familyLower.includes('fresh') || familyLower.includes('柑橘') || familyLower.includes('馥奇');
  const hasOriental = familyLower.includes('东方') || familyLower.includes('oriental');
  const hasSoft = familyLower.includes('白花') || familyLower.includes('草本') || familyLower.includes('soft');
  
  const scenes: SceneType[] = [];
  
  // 通勤：扩散适中、评分不低、留香稳定、清新/木质调加分
  let commuteScore = 0;
  if (avgDiffusion >= 2 && avgDiffusion <= 4) commuteScore += 2;
  if (avgScore >= 3.5) commuteScore += 2;
  if (avgScore >= 4) commuteScore += 1;
  if (midLongevity) commuteScore += 1;
  if (initialDiffusion <= 4) commuteScore += 1;
  if (hasFresh || hasWoody) commuteScore += 1;
  if (commuteScore >= 5) scenes.push('commute');
  
  // 约会：皮肤表现好、初期扩散适中、综合评分高、花香/东方调加分
  let dateScore = 0;
  if (skinScore >= 4) dateScore += 2;
  if (clothScore >= 4) dateScore += 1;
  if (avgScore >= 4) dateScore += 2;
  if (initialDiffusion >= 3 && initialDiffusion <= 4) dateScore += 1;
  if (midLongevity) dateScore += 1;
  if (longevity && finalDiffusion >= 2) dateScore += 1;
  if (hasFloral || hasOriental) dateScore += 1;
  if (dateScore >= 6) scenes.push('date');
  
  // 雨天：湿度高或天气有雨、扩散力强、木质/东方调、留香持久
  let rainyScore = 0;
  if (humidity >= 60) rainyScore += 2;
  if (isRainyWeather) rainyScore += 2;
  if (avgDiffusion >= 3) rainyScore += 1;
  if (avgDiffusion >= 4) rainyScore += 1;
  if (longevity && finalDiffusion >= 2) rainyScore += 2;
  if (midLongevity) rainyScore += 1;
  if (hasWoody || hasOriental) rainyScore += 1;
  if (rainyScore >= 6) scenes.push('rainy');
  
  // 睡前：扩散低、后期扩散贴身、综合舒适、柔和/花香
  let bedtimeScore = 0;
  if (avgDiffusion <= 3) bedtimeScore += 2;
  if (avgDiffusion <= 2) bedtimeScore += 1;
  if (finalDiffusion <= 2) bedtimeScore += 2;
  if (finalDiffusion <= 1) bedtimeScore += 1;
  if (initialDiffusion <= 3) bedtimeScore += 1;
  if (avgScore >= 3) bedtimeScore += 1;
  if (skinScore >= 3) bedtimeScore += 1;
  if (hasFloral || hasSoft) bedtimeScore += 1;
  if (bedtimeScore >= 6) scenes.push('bedtime');
  
  // 如果没有匹配到任何场景，根据综合评分给一个默认分类
  if (scenes.length === 0) {
    if (avgScore >= 4) {
      scenes.push('commute');
    } else if (avgDiffusion >= 3) {
      scenes.push('date');
    } else {
      scenes.push('bedtime');
    }
  }
  
  return scenes;
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
