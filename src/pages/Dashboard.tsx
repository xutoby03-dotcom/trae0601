import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Armchair,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  PlayCircle,
  StopCircle,
  PlusCircle,
  Bell,
  Clock,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, Loading } from '@/components/ui';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useStatisticsStore } from '@/stores/useStatisticsStore';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { useDailyRecordStore } from '@/stores/useDailyRecordStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { useUserStore } from '@/stores/useUserStore';
import ReminderCard from '@/components/reminders/ReminderCard';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import type { DailyRecord, AlertLevel } from '@/types';

interface StatCardProps {
  title: string;
  value: number;
  icon: typeof Armchair;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon className={cn('h-6 w-6', color)} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={cn('text-2xl font-bold', color)}>{value}</p>
        </div>
      </div>
    </Card>
  );
}

const alertLevelColors: Record<AlertLevel, string> = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

const alertLevelText: Record<AlertLevel, string> = {
  blue: '蓝色',
  yellow: '黄色',
  orange: '橙色',
  red: '红色',
};

const weatherIcons: Record<string, typeof Sun> = {
  晴天: Sun,
  多云: Cloud,
  阴天: Cloud,
  小雨: CloudRain,
  中雨: CloudRain,
  大雨: CloudRain,
  雷阵雨: CloudLightning,
};

const alertTypeText: Record<string, string> = {
  rain: '暴雨',
  wind: '大风',
  typhoon: '台风',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { currentWeather, hasAlert, currentAlert, loading: weatherLoading, fetchCurrentWeather } = useWeatherStore();
  const { getActiveBoothCount, getPendingIncidentCount } = useStatisticsStore();
  const { furniture, loading: furnitureLoading, fetchFurniture } = useFurnitureStore();
  const { currentRecord, loading: recordLoading, fetchRecords } = useDailyRecordStore();
  const { unreadReminders, loading: reminderLoading, fetchUnreadReminders } = useReminderStore();

  const [stats, setStats] = useState({ activeBooth: 0, normalCount: 0, lostCount: 0, pendingIncidents: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchCurrentWeather(), fetchFurniture(), fetchRecords(), fetchUnreadReminders()]);
    const [activeBooth, pendingIncidents] = await Promise.all([getActiveBoothCount(), getPendingIncidentCount()]);
    setStats({
      activeBooth,
      normalCount: furniture.filter(f => f.status === 'normal').length,
      lostCount: furniture.filter(f => f.status === 'lost').length,
      pendingIncidents,
    });
  };

  const loading = weatherLoading || furnitureLoading || recordLoading || reminderLoading;
  const WeatherIcon = currentWeather ? (weatherIcons[currentWeather.condition] || Sun) : Sun;

  const getStatusInfo = (record: DailyRecord | null) => {
    if (!record) return { text: '未开摊', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    if (record.status === 'completed') return { text: '已收摊', color: 'text-success', bgColor: 'bg-success/10' };
    if (record.status === 'abnormal') return { text: '异常', color: 'text-danger', bgColor: 'bg-danger/10' };
    return { text: '营业中', color: 'text-primary-500', bgColor: 'bg-primary-50' };
  };

  const statusInfo = getStatusInfo(currentRecord);
  const rainProb = currentWeather?.rainProbability || 0;

  const getDuration = () => {
    if (!currentRecord?.openTime) return '--';
    const end = currentRecord.closeTime ? new Date(currentRecord.closeTime) : new Date();
    const hours = Math.round((end.getTime() - new Date(currentRecord.openTime).getTime()) / (1000 * 60 * 60) * 10) / 10;
    return `${hours} 小时${!currentRecord.closeTime ? '（进行中）' : ''}`;
  };

  if (loading && !currentWeather) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">你好，{currentUser?.username || '用户'} 👋</h1>
          <p className="text-gray-500 mt-1">{format(new Date(), 'yyyy年MM月dd日 EEEE')}</p>
        </div>
        <Badge variant="info" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {currentUser?.role === 'manager' ? '店长' : '店员'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="在院桌椅数" value={stats.activeBooth} icon={Armchair} color="text-primary-500" bgColor="bg-primary-50" />
        <StatCard title="完好数" value={stats.normalCount} icon={CheckCircle} color="text-success" bgColor="bg-success/10" />
        <StatCard title="缺失数" value={stats.lostCount} icon={XCircle} color="text-danger" bgColor="bg-danger/10" />
        <StatCard title="待处理事件" value={stats.pendingIncidents} icon={AlertTriangle} color="text-warning" bgColor="bg-warning/10" />
      </div>

      <Card className={cn(hasAlert && currentAlert?.level === 'red' && 'border-danger bg-danger/5')}>
        <CardHeader title="今日天气" />
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn('h-16 w-16 rounded-2xl flex items-center justify-center', hasAlert ? 'bg-danger/10' : 'bg-primary-50')}>
                <WeatherIcon className={cn('h-8 w-8', hasAlert ? 'text-danger' : 'text-primary-500')} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{currentWeather?.condition || '--'}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Thermometer className="h-4 w-4" />{currentWeather?.temperature || '--'}°C</span>
                  <span className="flex items-center gap-1"><Droplets className="h-4 w-4" />{currentWeather?.humidity || '--'}%</span>
                  <span className="flex items-center gap-1"><Wind className="h-4 w-4" />{currentWeather?.windSpeed || '--'} km/h</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">降雨概率</p>
                <p className={cn('text-xl font-bold mt-1', rainProb >= 80 ? 'text-danger' : 'text-primary-500')}>{rainProb}%</p>
              </div>
              {hasAlert && currentAlert && (
                <div className={cn('px-4 py-3 rounded-xl flex items-center gap-2', alertLevelColors[currentAlert.level], 'text-white')}>
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                  <div>
                    <p className="font-semibold">{alertLevelText[currentAlert.level]}预警</p>
                    <p className="text-xs opacity-90">{alertTypeText[currentAlert.type] || currentAlert.type}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button size="lg" variant="primary" icon={<PlayCircle className="h-5 w-5" />} className="flex-col h-auto py-6" onClick={() => navigate('/daily/open')} disabled={currentRecord?.status === 'in-progress'}>
          <span className="text-base font-semibold">开摊</span>
          <span className="text-xs opacity-80 mt-1">开始营业</span>
        </Button>
        <Button size="lg" variant="secondary" icon={<StopCircle className="h-5 w-5" />} className="flex-col h-auto py-6" onClick={() => navigate('/daily/close')} disabled={!currentRecord || currentRecord?.status !== 'in-progress'}>
          <span className="text-base font-semibold">收摊</span>
          <span className="text-xs opacity-80 mt-1">结束营业</span>
        </Button>
        <Button size="lg" variant="outline" icon={<PlusCircle className="h-5 w-5" />} className="flex-col h-auto py-6" onClick={() => navigate('/incidents/new')}>
          <span className="text-base font-semibold">新增事件</span>
          <span className="text-xs opacity-80 mt-1">上报问题</span>
        </Button>
        <Button size="lg" variant="outline" icon={<Bell className="h-5 w-5" />} className="flex-col h-auto py-6 relative" onClick={() => navigate('/reminders')}>
          {unreadReminders.length > 0 && (
            <span className="absolute top-2 right-2 h-5 w-5 bg-danger text-white text-xs rounded-full flex items-center justify-center">{unreadReminders.length}</span>
          )}
          <span className="text-base font-semibold">查看提醒</span>
          <span className="text-xs opacity-80 mt-1">通知中心</span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="待办提醒" subtitle={`最近 ${Math.min(unreadReminders.length, 5)} 条未读提醒`} />
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {unreadReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>暂无待办提醒</p>
              </div>
            ) : (
              unreadReminders.slice(0, 5).map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)
            )}
            {unreadReminders.length > 5 && (
              <button onClick={() => navigate('/reminders')} className="w-full text-center text-sm text-primary-500 hover:text-primary-600 flex items-center justify-center gap-1 py-2">
                查看全部 <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="今日记录" />
          <CardContent>
            <div className="space-y-4">
              <div className={cn('p-4 rounded-xl flex items-center justify-between', statusInfo.bgColor)}>
                <div className="flex items-center gap-3">
                  <Calendar className={cn('h-6 w-6', statusInfo.color)} />
                  <div>
                    <p className={cn('font-semibold', statusInfo.color)}>{statusInfo.text}</p>
                    <p className="text-sm text-gray-500">{format(new Date(), 'yyyy-MM-dd')}</p>
                  </div>
                </div>
                <Badge className={cn('px-3 py-1', statusInfo.bgColor, statusInfo.color)}>{statusInfo.text}</Badge>
              </div>
              {currentRecord ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 flex items-center gap-2"><PlayCircle className="h-4 w-4 text-success" />开摊时间</span>
                    <span className="font-medium">{currentRecord.openTime ? format(new Date(currentRecord.openTime), 'HH:mm') : '--'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 flex items-center gap-2"><StopCircle className="h-4 w-4 text-danger" />收摊时间</span>
                    <span className="font-medium">{currentRecord.closeTime ? format(new Date(currentRecord.closeTime), 'HH:mm') : '--'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 flex items-center gap-2"><Armchair className="h-4 w-4 text-primary-500" />外摆数量</span>
                    <span className="font-medium">{currentRecord.furnitureCount} 件</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500 flex items-center gap-2"><Clock className="h-4 w-4 text-info" />营业时长</span>
                    <span className="font-medium">{getDuration()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <PlayCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>今日还未开摊</p>
                  <Button size="sm" className="mt-4" onClick={() => navigate('/daily/open')}>立即开摊</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
