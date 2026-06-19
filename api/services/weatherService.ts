import type { Weather, WeatherCondition } from '../../shared/types.js';
import { getWeather, updateWeather } from '../data/database.js';

const shouldSkipWateringFor = (weather: Weather): { skip: boolean; reason: string } => {
  if (weather.condition === 'rainy') {
    return {
      skip: true,
      reason: '今日有雨，可跳过浇水 💧',
    };
  }
  return { skip: false, reason: '' };
};

const shouldIncreaseWateringFor = (weather: Weather): { increase: boolean; reason: string; frequencyMultiplier: number } => {
  if (weather.temperature >= 35 && weather.consecutiveHotDays >= 2) {
    return {
      increase: true,
      reason: `连续${weather.consecutiveHotDays}天高温（${weather.temperature}°C），建议浇水频率加倍 ☀️`,
      frequencyMultiplier: 2,
    };
  }
  if (weather.temperature >= 35) {
    return {
      increase: true,
      reason: `今日高温（${weather.temperature}°C），建议增加浇水频率 ☀️`,
      frequencyMultiplier: 1.5,
    };
  }
  return { increase: false, reason: '', frequencyMultiplier: 1 };
};

const getWateringAdviceFor = (weather: Weather): string[] => {
  const advice: string[] = [];
  if (weather.condition === 'rainy') {
    advice.push('今日有雨，无需浇水');
    advice.push('检查菜畦排水情况，避免积水');
  } else if (weather.temperature >= 35) {
    advice.push('高温天气，建议在清晨或傍晚浇水');
    advice.push('避免中午浇水，防止烫伤叶片');
    if (weather.consecutiveHotDays >= 2) {
      advice.push('连续高温，考虑临时增加遮阳设施');
    }
  } else if (weather.humidity < 40) {
    advice.push('空气干燥，注意增加浇水频率');
    advice.push('可适当喷水增加空气湿度');
  } else if (weather.humidity > 80) {
    advice.push('空气湿度大，减少浇水量');
    advice.push('注意通风，防止病害');
  } else {
    advice.push('天气条件良好，按正常频率浇水即可');
  }
  return advice;
};

const enrichWeather = (base: Weather): Weather => {
  const skip = shouldSkipWateringFor(base);
  const increase = shouldIncreaseWateringFor(base);
  const advice = getWateringAdviceFor(base);
  return {
    ...base,
    shouldSkipWatering: skip.skip,
    skipReason: skip.reason,
    shouldIncreaseWatering: increase.increase,
    increaseReason: increase.reason,
    highHeatWarning: base.temperature >= 35,
    wateringAdvice: advice,
  };
};

export const getCurrentWeather = (): Weather => {
  return enrichWeather(getWeather());
};

export const simulateWeatherChange = (): Weather => {
  const currentWeather = getWeather();
  const conditions: WeatherCondition[] = ['sunny', 'cloudy', 'rainy', 'hot'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

  let temperature = currentWeather.temperature;
  let consecutiveHotDays = currentWeather.consecutiveHotDays;

  if (randomCondition === 'hot') {
    temperature = 35 + Math.floor(Math.random() * 5);
    consecutiveHotDays++;
  } else if (randomCondition === 'rainy') {
    temperature = 22 + Math.floor(Math.random() * 6);
    consecutiveHotDays = 0;
  } else {
    temperature = 24 + Math.floor(Math.random() * 8);
    consecutiveHotDays = temperature >= 35 ? consecutiveHotDays + 1 : 0;
  }

  const humidity = randomCondition === 'rainy'
    ? 80 + Math.floor(Math.random() * 15)
    : 50 + Math.floor(Math.random() * 25);

  const forecasts: Record<WeatherCondition, string> = {
    sunny: `今日晴朗，气温${temperature}°C，适合浇水，注意避开中午高温时段`,
    cloudy: `今日多云，气温${temperature}°C，天气凉爽，适合园艺活动`,
    rainy: `今日有雨，气温${temperature}°C，可跳过浇水，注意排水`,
    hot: `高温预警！气温${temperature}°C，建议增加浇水频率，早晚浇水`,
  };

  const newWeather: Weather = {
    condition: randomCondition,
    temperature,
    consecutiveHotDays,
    humidity,
    forecast: forecasts[randomCondition],
  };

  const saved = updateWeather(newWeather);
  return enrichWeather(saved);
};

export const shouldSkipWatering = (): { skip: boolean; reason: string } => {
  return shouldSkipWateringFor(getWeather());
};

export const shouldIncreaseWatering = (): { increase: boolean; reason: string; frequencyMultiplier: number } => {
  return shouldIncreaseWateringFor(getWeather());
};

export const getWateringAdvice = (): string[] => {
  return getWateringAdviceFor(getWeather());
};
