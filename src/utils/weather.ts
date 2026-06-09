import type { WeatherData } from '@/types'

export async function fetchWeather(): Promise<WeatherData> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&daily=precipitation_probability_max&timezone=Asia/Shanghai&forecast_days=1'
    )
    const data = await res.json()
    const prob = data?.daily?.precipitation_probability_max?.[0] ?? 0
    return {
      isRainy: prob >= 40,
      precipitationProbability: prob,
      description: prob >= 70 ? '今天有大雨' : prob >= 40 ? '今天可能下雨' : '今天天气晴好',
    }
  } catch {
    return { isRainy: false, precipitationProbability: 0, description: '天气信息获取失败' }
  }
}
