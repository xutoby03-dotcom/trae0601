import { useEffect, useState } from 'react';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { Card, Button, Loading } from '@/components/ui';
import type { AlertType, AlertLevel } from '@/types';
import { CloudRain, Wind, AlertTriangle, Thermometer, Droplets, Wind as WindIcon, X } from 'lucide-react';
import { formatDateTime } from '@/utils/date';
import { cn } from '@/utils/cn';

interface WeatherAlertProps {
  onDismiss?: () => void;
  showDetails?: boolean;
}

const alertTypeConfig: Record<AlertType, { icon: typeof CloudRain; label: string }> = {
  rain: { icon: CloudRain, label: '暴雨' },
  wind: { icon: Wind, label: '大风' },
  typhoon: { icon: WindIcon, label: '台风' },
};

const alertLevelConfig: Record<AlertLevel, { label: string; color: string; bgColor: string }> = {
  blue: { label: '蓝色', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  yellow: { label: '黄色', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
  orange: { label: '橙色', color: 'text-orange-600', bgColor: 'bg-orange-500' },
  red: { label: '红色', color: 'text-red-600', bgColor: 'bg-red-500' },
};

export default function WeatherAlert({ onDismiss, showDetails = true }: WeatherAlertProps) {
  const { currentWeather, hasAlert, currentAlert, loading, fetchCurrentWeather } = useWeatherStore();
  const [flashing, setFlashing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchCurrentWeather();
  }, [fetchCurrentWeather]);

  useEffect(() => {
    if (hasAlert && currentAlert?.level === 'red') {
      const interval = setInterval(() => {
        setFlashing(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [hasAlert, currentAlert?.level]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (dismissed || !currentWeather) {
    return null;
  }

  if (!hasAlert || !currentAlert) {
    if (!showDetails) return null;
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10 text-info">
              <CloudRain className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{currentWeather.condition}</h4>
              <p className="text-sm text-gray-500">
                {currentWeather.temperature}°C · 湿度 {currentWeather.humidity}%
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Wind className="h-3.5 w-3.5" />
              {currentWeather.windSpeed} km/h
            </div>
            <div className="mt-1 flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" />
              降水概率 {currentWeather.rainProbability}%
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const typeConfig = alertTypeConfig[currentAlert.type];
  const levelConfig = alertLevelConfig[currentAlert.level];
  const TypeIcon = typeConfig.icon;
  const isRedAlert = currentAlert.level === 'red';

  return (
    <Card
      className={cn(
        'overflow-hidden p-4 transition-all duration-300',
        isRedAlert && flashing
          ? 'border-danger bg-danger/10'
          : isRedAlert
          ? 'border-danger/50 bg-danger/5'
          : `border-${currentAlert.level}-500/50 bg-${currentAlert.level}-500/5`
      )}
    >
      {isRedAlert && (
        <div
          className={cn(
            'absolute inset-x-0 top-0 h-1 transition-opacity duration-300',
            levelConfig.bgColor,
            flashing ? 'opacity-100' : 'opacity-50'
          )}
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300',
            isRedAlert && flashing
              ? 'bg-danger text-white animate-pulse'
              : `${levelConfig.bgColor}/20 ${levelConfig.color}`
          )}>
            <TypeIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn('h-4 w-4', levelConfig.color)} />
              <span className={cn('text-xs font-medium', levelConfig.color)}>
                {levelConfig.label}{typeConfig.label}预警
              </span>
            </div>
            <h4 className={cn(
              'mt-1 font-semibold',
              isRedAlert && flashing ? 'text-danger' : levelConfig.color
            )}>
              请注意！{levelConfig.label}{typeConfig.label}预警信号
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              请及时收摊并做好防护措施，确保桌椅等设施安全。
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showDetails && currentWeather && (
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-white/50 p-3">
          <div className="text-center">
            <Thermometer className="mx-auto h-4 w-4 text-gray-500" />
            <p className="mt-1 text-xs text-gray-500">温度</p>
            <p className="font-medium text-gray-900">{currentWeather.temperature}°C</p>
          </div>
          <div className="text-center">
            <Wind className="mx-auto h-4 w-4 text-gray-500" />
            <p className="mt-1 text-xs text-gray-500">风速</p>
            <p className="font-medium text-gray-900">{currentWeather.windSpeed} km/h</p>
          </div>
          <div className="text-center">
            <Droplets className="mx-auto h-4 w-4 text-gray-500" />
            <p className="mt-1 text-xs text-gray-500">降水概率</p>
            <p className="font-medium text-gray-900">{currentWeather.rainProbability}%</p>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>更新于 {formatDateTime(currentWeather.createdAt)}</span>
        <Button variant="outline" size="sm">
          立即收摊
        </Button>
      </div>
    </Card>
  );
}
