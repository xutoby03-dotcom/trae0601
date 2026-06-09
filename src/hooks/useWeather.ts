import { useState, useEffect } from 'react'
import { fetchWeather } from '@/utils/weather'
import type { WeatherData } from '@/types'

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    isRainy: false,
    precipitationProbability: 0,
    description: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeather().then((data) => {
      setWeather(data)
      setLoading(false)
    })
  }, [])

  return { weather, loading }
}
