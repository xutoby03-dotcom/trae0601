import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { isOverdue, isNightTime, formatDryingDuration } from '../utils/helpers';

export const useReminderService = () => {
  const { weather, addReminder, updateWeather, getDryingRecords } = useStore();
  const remindedRecordsRef = useRef<Set<string>>(new Set());
  const weatherRemindedRef = useRef<boolean>(false);
  const nightRemindedRef = useRef<boolean>(false);

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

  const checkWeatherReminders = useCallback(() => {
    const dryingRecords = getDryingRecords();
    
    if (dryingRecords.length === 0) return;

    if ((weather.condition === 'rainy' || weather.condition === 'foggy') && !weatherRemindedRef.current) {
      const conditionText = weather.condition === 'rainy' ? '下雨' : '起雾';
      addReminder(
        'weather',
        `⚠️ 天气变化：当前${conditionText}，阳台上还有${dryingRecords.length}批衣物，请尽快收取！`
      );
      weatherRemindedRef.current = true;
    } else if (weather.condition === 'sunny' || weather.condition === 'cloudy') {
      weatherRemindedRef.current = false;
    }
  }, [weather, getDryingRecords, addReminder]);

  const checkNightReminders = useCallback(() => {
    const dryingRecords = getDryingRecords();
    
    if (dryingRecords.length === 0) return;

    if (isNightTime() && !nightRemindedRef.current) {
      addReminder(
        'night',
        `🌙 已到夜间，阳台上还有${dryingRecords.length}批衣物未收取，夜间降温易返潮，请及时收衣！`
      );
      nightRemindedRef.current = true;
    } else if (!isNightTime()) {
      nightRemindedRef.current = false;
    }
  }, [getDryingRecords, addReminder]);

  useEffect(() => {
    const initialWeather = updateWeather();
    
    if (initialWeather.condition === 'rainy' || initialWeather.condition === 'foggy') {
      weatherRemindedRef.current = true;
    }
    if (isNightTime()) {
      nightRemindedRef.current = true;
    }
  }, [updateWeather]);

  useEffect(() => {
    checkTimeoutReminders();
    checkWeatherReminders();
    checkNightReminders();

    const timeoutInterval = setInterval(checkTimeoutReminders, 60000);
    const weatherInterval = setInterval(() => {
      const newWeather = updateWeather();
      if (newWeather.condition === 'rainy' || newWeather.condition === 'foggy') {
        checkWeatherReminders();
      }
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
