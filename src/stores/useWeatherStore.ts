import { create } from 'zustand';
import { db } from '@/db';
import type { WeatherInfo, AlertType, AlertLevel } from '@/types';
import { generateId } from '@/utils/id';

interface WeatherState {
  currentWeather: WeatherInfo | null;
  weatherHistory: WeatherInfo[];
  hasAlert: boolean;
  currentAlert: { type: AlertType; level: AlertLevel } | null;
  loading: boolean;
  error: string | null;
}

interface WeatherActions {
  fetchCurrentWeather: (date?: string) => Promise<WeatherInfo | null>;
  fetchWeatherHistory: (startDate: string, endDate: string) => Promise<WeatherInfo[]>;
  saveWeather: (weather: Omit<WeatherInfo, 'id' | 'createdAt'>) => Promise<WeatherInfo>;
  checkAlerts: (weather: WeatherInfo) => { hasAlert: boolean; alertType?: AlertType; alertLevel?: AlertLevel };
  getWeatherByDate: (date: string) => Promise<WeatherInfo | null>;
  simulateWeather: (date?: string) => WeatherInfo;
  clearError: () => void;
}

export type WeatherStore = WeatherState & WeatherActions;

const weatherConditions = ['晴天', '多云', '阴天', '小雨', '中雨', '大雨', '雷阵雨', '小雪', '中雪', '大雪', '雾', '霾'];

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  currentWeather: null,
  weatherHistory: [],
  hasAlert: false,
  currentAlert: null,
  loading: false,
  error: null,

  fetchCurrentWeather: async (date) => {
    set({ loading: true, error: null });
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      let weather = await db.weatherInfo.where('recordDate').equals(targetDate).first();
      
      if (!weather) {
        weather = get().simulateWeather(targetDate);
        await db.weatherInfo.add(weather);
      }

      const alertInfo = get().checkAlerts(weather);
      set({ 
        currentWeather: weather, 
        hasAlert: alertInfo.hasAlert,
        currentAlert: alertInfo.alertType && alertInfo.alertLevel 
          ? { type: alertInfo.alertType, level: alertInfo.alertLevel } 
          : null,
        loading: false 
      });
      
      return weather;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取天气信息失败', loading: false });
      return null;
    }
  },

  fetchWeatherHistory: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const history = await db.weatherInfo
        .where('recordDate')
        .between(startDate, endDate, true, true)
        .toArray();
      
      set({ weatherHistory: history, loading: false });
      return history;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取天气历史失败', loading: false });
      throw error;
    }
  },

  saveWeather: async (weatherData) => {
    set({ loading: true, error: null });
    try {
      const existing = await db.weatherInfo.where('recordDate').equals(weatherData.recordDate).first();
      
      if (existing) {
        await db.weatherInfo.update(existing.id, weatherData);
        const updated = await db.weatherInfo.get(existing.id);
        
        const alertInfo = get().checkAlerts(updated);
        set({ 
          currentWeather: updated, 
          hasAlert: alertInfo.hasAlert,
          currentAlert: alertInfo.alertType && alertInfo.alertLevel 
            ? { type: alertInfo.alertType, level: alertInfo.alertLevel } 
            : null,
          loading: false 
        });
        return updated;
      } else {
        const newWeather: WeatherInfo = {
          ...weatherData,
          id: generateId('weather'),
          createdAt: new Date().toISOString(),
        };
        await db.weatherInfo.add(newWeather);
        
        const alertInfo = get().checkAlerts(newWeather);
        set({ 
          currentWeather: newWeather, 
          hasAlert: alertInfo.hasAlert,
          currentAlert: alertInfo.alertType && alertInfo.alertLevel 
            ? { type: alertInfo.alertType, level: alertInfo.alertLevel } 
            : null,
          loading: false 
        });
        return newWeather;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '保存天气信息失败', loading: false });
      throw error;
    }
  },

  checkAlerts: (weather) => {
    const result: { hasAlert: boolean; alertType?: AlertType; alertLevel?: AlertLevel } = { hasAlert: false };
    
    if (weather.hasAlert && weather.alertType && weather.alertLevel) {
      result.hasAlert = true;
      result.alertType = weather.alertType;
      result.alertLevel = weather.alertLevel;
      return result;
    }
    
    if (weather.rainProbability >= 80) {
      result.hasAlert = true;
      result.alertType = 'rain';
      result.alertLevel = weather.rainProbability >= 95 ? 'red' : weather.rainProbability >= 90 ? 'orange' : 'yellow';
    } else if (weather.windSpeed >= 80) {
      result.hasAlert = true;
      result.alertType = 'typhoon';
      result.alertLevel = weather.windSpeed >= 118 ? 'red' : weather.windSpeed >= 100 ? 'orange' : 'yellow';
    } else if (weather.windSpeed >= 50) {
      result.hasAlert = true;
      result.alertType = 'wind';
      result.alertLevel = weather.windSpeed >= 70 ? 'orange' : 'yellow';
    }
    
    return result;
  },

  getWeatherByDate: async (date) => {
    try {
      const weather = await db.weatherInfo.where('recordDate').equals(date).first();
      return weather || null;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '查询天气失败' });
      throw error;
    }
  },

  simulateWeather: (date) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const random = Math.random();
    
    let condition: string;
    let temperature: number;
    let humidity: number;
    let windSpeed: number;
    let rainProbability: number;
    let hasAlert = false;
    let alertType: AlertType | undefined;
    let alertLevel: AlertLevel | undefined;

    if (random < 0.1) {
      condition = '大雨';
      rainProbability = 90 + Math.random() * 10;
      windSpeed = 30 + Math.random() * 20;
      hasAlert = true;
      alertType = 'rain';
      alertLevel = rainProbability >= 95 ? 'red' : 'orange';
    } else if (random < 0.15) {
      condition = '雷阵雨';
      rainProbability = 85 + Math.random() * 15;
      windSpeed = 40 + Math.random() * 30;
      hasAlert = windSpeed >= 50;
      if (windSpeed >= 80) {
        alertType = 'typhoon';
        alertLevel = 'orange';
      } else if (windSpeed >= 50) {
        alertType = 'wind';
        alertLevel = 'yellow';
      }
    } else if (random < 0.25) {
      condition = '小雨';
      rainProbability = 60 + Math.random() * 20;
      windSpeed = 10 + Math.random() * 20;
    } else if (random < 0.35) {
      condition = '阴天';
      rainProbability = 20 + Math.random() * 30;
      windSpeed = 5 + Math.random() * 15;
    } else if (random < 0.5) {
      condition = '多云';
      rainProbability = 10 + Math.random() * 20;
      windSpeed = 5 + Math.random() * 15;
    } else {
      condition = '晴天';
      rainProbability = Math.random() * 15;
      windSpeed = Math.random() * 10;
    }

    const month = new Date(targetDate).getMonth();
    if (month >= 5 && month <= 8) {
      temperature = 25 + Math.random() * 10;
      humidity = 60 + Math.random() * 30;
    } else if (month >= 11 || month <= 1) {
      temperature = -5 + Math.random() * 10;
      humidity = 30 + Math.random() * 30;
    } else {
      temperature = 15 + Math.random() * 15;
      humidity = 40 + Math.random() * 30;
    }

    return {
      id: generateId('weather'),
      recordDate: targetDate,
      condition,
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
      rainProbability: Math.round(rainProbability),
      hasAlert,
      alertType,
      alertLevel,
      createdAt: new Date().toISOString(),
    };
  },

  clearError: () => {
    set({ error: null });
  },
}));
