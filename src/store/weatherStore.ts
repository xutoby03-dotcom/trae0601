import { create } from "zustand";
import type { WeatherData, WeatherType } from "@/types";
import { mockWeather } from "@/data/mockData";
import { createWeatherData } from "@/utils/weather";

interface WeatherStore {
  weather: WeatherData;
  setWeather: (data: Partial<WeatherData>) => void;
  simulateChange: () => void;
  resetToMock: () => void;
}

const scenarios: Array<Partial<WeatherData> & { weatherType: WeatherType }> = [
  { weatherType: "sunny", temperature: 28, humidity: 45, windSpeed: 3, rainProbability: 5 },
  { weatherType: "cloudy", temperature: 24, humidity: 68, windSpeed: 7, rainProbability: 35 },
  { weatherType: "rainy", temperature: 20, humidity: 92, windSpeed: 9, rainProbability: 95 },
  { weatherType: "windy", temperature: 22, humidity: 55, windSpeed: 18, rainProbability: 25 },
  { weatherType: "cloudy", temperature: 26, humidity: 78, windSpeed: 12.5, rainProbability: 65 },
];

let scenarioIdx = 0;

export const useWeatherStore = create<WeatherStore>((set) => ({
  weather: mockWeather,

  setWeather: (data) =>
    set((state) => ({
      weather: createWeatherData({ ...state.weather, ...data }),
    })),

  simulateChange: () => {
    scenarioIdx = (scenarioIdx + 1) % scenarios.length;
    const scenario = scenarios[scenarioIdx];
    set({ weather: createWeatherData({ ...scenario, timestamp: new Date().toISOString() }) });
  },

  resetToMock: () => set({ weather: mockWeather }),
}));
