import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  AlertTriangle,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { Button, Avatar, Badge } from '@/components/ui';
import { useUserStore } from '@/stores/useUserStore';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { cn } from '@/utils/cn';

interface HeaderProps {
  onMenuClick: () => void;
}

const weatherIcons: Record<string, typeof Sun> = {
  晴天: Sun,
  多云: Cloud,
  阴天: Cloud,
  小雨: CloudRain,
  中雨: CloudRain,
  大雨: CloudRain,
  雷阵雨: CloudRain,
  小雪: CloudSnow,
  中雪: CloudSnow,
  大雪: CloudSnow,
  雾: Cloud,
  霾: Wind,
};

const alertLevelColors: Record<string, string> = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, logout } = useUserStore();
  const { currentWeather, fetchCurrentWeather, hasAlert, currentAlert } = useWeatherStore();
  const { unreadCount, fetchUnreadReminders } = useReminderStore();

  useEffect(() => {
    fetchCurrentWeather();
    fetchUnreadReminders();
  }, [fetchCurrentWeather, fetchUnreadReminders]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const WeatherIcon = currentWeather ? weatherIcons[currentWeather.condition] || Sun : Sun;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            icon={<Menu className="h-5 w-5" />}
            onClick={onMenuClick}
          />
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <span className="text-sm font-bold text-white">桌</span>
            </div>
            <span className="text-lg font-bold text-gray-800 hidden sm:block">桌椅管理系统</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {currentWeather && (
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              {hasAlert && currentAlert && (
                <span
                  className={cn(
                    'h-2 w-2 animate-pulse rounded-full',
                    alertLevelColors[currentAlert.level] || 'bg-yellow-500',
                  )}
                />
              )}
              <WeatherIcon className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {currentWeather.condition}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(currentWeather.temperature)}°C
              </span>
              {hasAlert && currentAlert && (
                <Badge variant="warning" className="hidden xs:flex">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  预警
                </Badge>
              )}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="relative"
            icon={<Bell className="h-5 w-5" />}
            onClick={() => navigate('/reminders')}
          >
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.username}
                size="sm"
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {currentUser?.username}
              </span>
            </Button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="border-b border-gray-100 p-3">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser?.role === 'manager' ? '店长' : '店员'}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                    >
                      <User className="h-4 w-4" />
                      个人中心
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      系统设置
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
