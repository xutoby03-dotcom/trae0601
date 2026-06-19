import express from 'express';
import {
  getCurrentWeather,
  simulateWeatherChange,
  shouldSkipWatering,
  shouldIncreaseWatering,
  getWateringAdvice,
} from '../services/weatherService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const weather = getCurrentWeather();
  const skipAdvice = shouldSkipWatering();
  const increaseAdvice = shouldIncreaseWatering();
  const wateringAdvice = getWateringAdvice();
  
  res.json({
    success: true,
    data: {
      ...weather,
      shouldSkipWatering: skipAdvice.skip,
      skipReason: skipAdvice.reason,
      shouldIncreaseWatering: increaseAdvice.increase,
      increaseReason: increaseAdvice.reason,
      frequencyMultiplier: increaseAdvice.frequencyMultiplier,
      wateringAdvice,
    },
  });
});

router.post('/simulate', (req, res) => {
  const newWeather = simulateWeatherChange();
  const skipAdvice = shouldSkipWatering();
  const increaseAdvice = shouldIncreaseWatering();
  const wateringAdvice = getWateringAdvice();
  
  res.json({
    success: true,
    data: {
      ...newWeather,
      shouldSkipWatering: skipAdvice.skip,
      skipReason: skipAdvice.reason,
      shouldIncreaseWatering: increaseAdvice.increase,
      increaseReason: increaseAdvice.reason,
      frequencyMultiplier: increaseAdvice.frequencyMultiplier,
      wateringAdvice,
    },
  });
});

router.get('/advice', (req, res) => {
  const advice = getWateringAdvice();
  const weather = getCurrentWeather();
  
  res.json({
    success: true,
    data: {
      weather,
      advice,
    },
  });
});

export default router;
