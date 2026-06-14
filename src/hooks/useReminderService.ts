import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { isOverdue, isNightTime, formatDryingDuration } from '../utils/helpers';
import { WeatherCondition } from '../types';

export const useReminderService = () => {
  const { addReminder, updateWeather, getDryingRecords, incrementRemindCount } = useStore();
  const remindedRecordsRef = useRef<Set<string>>(new Set());
  const weatherRemindedRef = useRef<boolean>(false);
  const nightRemindedRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);

  const addReminderForAllDrying = useCallback((type: 'weather' | 'night', message: string) => {
    const dryingRecords = getDryingRecords();
    if (dryingRecords.length === 0) return;

    addReminder(type, message);

    dryingRecords.forEach(record => {
      incrementRemindCount(record.id);
    });
  }, [getDryingRecords, addReminder, incrementRemindCount]);

  const checkTimeoutReminders = useCallback(() => {
    const dryingRecords = getDryingRecords();
    
    dryingRecords.forEach(record => {
      const overdue = isOverdue(record.startTime, record.expectedDuration);
      const reminderKey = `timeout-${record.id}`;
      
      if (overdue && !remindedRecordsRef.current.has(reminderKey)) {
        addReminder(
          'timeout',
          `${record.responsiblePerson}负责的${record.clothingTypeLabel}（${record.quantity}件）已晾晒${formatDryingDuration(record.startTime)}，超过预计时长，请及时收取！`,
          record.id
        );
        remindedRecordsRef.current.add(reminderKey);
      }
    });
  }, [getDryingRecords, addReminder]);

  const checkWeatherReminders = useCallback((currentCondition?: WeatherCondition) => {
    const dryingRecords = getDryingRecords();
    if (dryingRecords.length === 0) return;

    const condition = currentCondition || useStore.getState().weather.condition;

    if ((condition === 'rainy' || condition === 'foggy') && !weatherRemindedRef.current) {
      const conditionText = condition === 'rainy' ? '下雨' : '起雾';
      addReminderForAllDrying(
        'weather',
        `⚠️ 天气变化：当前${conditionText}，阳台上还有${dryingRecords.length}批衣物，请尽快收取！`
      );
      weatherRemindedRef.current = true;
    } else if (condition === 'sunny' || condition === 'cloudy') {
      weatherRemindedRef.current = false;
    }
  }, [getDryingRecords, addReminderForAllDrying]);

  const checkNightReminders = useCallback(() => {
    const dryingRecords = getDryingRecords();
    if (dryingRecords.length === 0) return;

    if (isNightTime() && !nightRemindedRef.current) {
      addReminderForAllDrying(
        'night',
        `🌙 已到夜间，阳台上还有${dryingRecords.length}批衣物未收取，夜间降温易返潮，请及时收衣！`
      );
      nightRemindedRef.current = true;
    } else if (!isNightTime()) {
      nightRemindedRef.current = false;
    }
  }, [getDryingRecords, addReminderForAllDrying]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialWeather = updateWeather();

    checkTimeoutReminders();
    checkWeatherReminders(initialWeather.condition);
    checkNightReminders();

    const timeoutInterval = setInterval(checkTimeoutReminders, 60000);
    const weatherInterval = setInterval(() => {
      const newWeather = updateWeather();
      checkWeatherReminders(newWeather.condition);
    }, 30 * 60 * 1000);
    const nightInterval = setInterval(checkNightReminders, 5 * 60 * 1000);

    return () => {
      clearInterval(timeoutInterval);
      clearInterval(weatherInterval);
      clearInterval(nightInterval);
    };
  }, [checkTimeoutReminders, checkWeatherReminders, checkNightReminders, updateWeather]);

  return {
    checkTimeoutReminders,
    checkWeatherReminders,
    checkNightReminders
  };
};
