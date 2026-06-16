import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Input, useToast } from '@/components/ui';
import type { ReminderSettings as ReminderSettingsType } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { CloudRain, Wind, Clock, Bell, Volume2, Monitor, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

const defaultSettings: ReminderSettingsType = {
  rainAlertThreshold: 70,
  windAlertThreshold: 30,
  patrolReminderTimes: ['10:00', '14:00', '18:00'],
  autoCloseReminderTime: '21:00',
  weatherCheckInterval: 30,
  enableDesktopNotification: true,
  enableSound: true,
};

const STORAGE_KEY = 'reminder-settings';

const SettingIcon = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>{children}</div>
);

const ToggleSwitch = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    className={cn(
      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      checked ? 'bg-primary-500' : 'bg-gray-200',
      disabled && 'cursor-not-allowed opacity-50'
    )}
  >
    <span className={cn('pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out', checked ? 'translate-x-5' : 'translate-x-0')} />
  </button>
);

export default function ReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettingsType>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = getItem<ReminderSettingsType>(STORAGE_KEY);
    if (saved) setSettings(saved);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      setItem(STORAGE_KEY, settings);
      showToast.success('设置已保存');
    } catch (error) {
      showToast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => showToast.info('返回提醒中心');
  const handlePatrolTimeChange = (index: number, value: string) => {
    const newTimes = [...settings.patrolReminderTimes];
    newTimes[index] = value;
    setSettings({ ...settings, patrolReminderTimes: newTimes });
  };

  const handleAddPatrolTime = () => {
    if (settings.patrolReminderTimes.length >= 10) {
      showToast.warning('最多添加10个巡查时间');
      return;
    }
    setSettings({ ...settings, patrolReminderTimes: [...settings.patrolReminderTimes, '09:00'] });
  };

  const handleRemovePatrolTime = (index: number) => {
    if (settings.patrolReminderTimes.length <= 1) {
      showToast.warning('至少保留一个巡查时间');
      return;
    }
    setSettings({ ...settings, patrolReminderTimes: settings.patrolReminderTimes.filter((_, i) => i !== index) });
  };

  const handleToggle = (key: keyof ReminderSettingsType) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">提醒设置</h1>
          <p className="mt-1 text-gray-500">自定义提醒规则和通知方式</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SettingIcon color="bg-blue-100 text-blue-600"><CloudRain className="h-5 w-5" /></SettingIcon>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">降雨预警阈值</label>
                <p className="text-xs text-gray-500">降水概率超过此值时发送预警</p>
              </div>
              <Input type="number" value={settings.rainAlertThreshold} onChange={(e) => setSettings({ ...settings, rainAlertThreshold: Number(e.target.value) })} min={0} max={100} wrapperClassName="w-24" icon={<span className="text-xs text-gray-400">%</span>} />
            </div>

            <div className="flex items-center gap-3">
              <SettingIcon color="bg-cyan-100 text-cyan-600"><Wind className="h-5 w-5" /></SettingIcon>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">大风预警阈值</label>
                <p className="text-xs text-gray-500">风速超过此值时发送预警</p>
              </div>
              <Input type="number" value={settings.windAlertThreshold} onChange={(e) => setSettings({ ...settings, windAlertThreshold: Number(e.target.value) })} min={0} max={100} wrapperClassName="w-24" icon={<span className="text-xs text-gray-400">km/h</span>} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="mb-4 flex items-center gap-3">
              <SettingIcon color="bg-purple-100 text-purple-600"><Clock className="h-5 w-5" /></SettingIcon>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">巡查提醒时间</label>
                <p className="text-xs text-gray-500">在指定时间发送巡查提醒</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddPatrolTime} icon={<Plus className="h-4 w-4" />}>添加</Button>
            </div>
            <div className="space-y-2">
              {settings.patrolReminderTimes.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input type="time" value={time} onChange={(e) => handlePatrolTimeChange(index, e.target.value)} wrapperClassName="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => handleRemovePatrolTime(index)} disabled={settings.patrolReminderTimes.length <= 1} className="text-danger hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3">
              <SettingIcon color="bg-orange-100 text-orange-600"><Bell className="h-5 w-5" /></SettingIcon>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">自动收摊提醒时间</label>
                <p className="text-xs text-gray-500">每日指定时间提醒收摊</p>
              </div>
              <Input type="time" value={settings.autoCloseReminderTime} onChange={(e) => setSettings({ ...settings, autoCloseReminderTime: e.target.value })} wrapperClassName="w-32" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SettingIcon color="bg-green-100 text-green-600"><Monitor className="h-5 w-5" /></SettingIcon>
                <div>
                  <label className="block text-sm font-medium text-gray-700">桌面通知</label>
                  <p className="text-xs text-gray-500">启用浏览器桌面通知</p>
                </div>
              </div>
              <ToggleSwitch checked={settings.enableDesktopNotification} onChange={() => handleToggle('enableDesktopNotification')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SettingIcon color="bg-pink-100 text-pink-600"><Volume2 className="h-5 w-5" /></SettingIcon>
                <div>
                  <label className="block text-sm font-medium text-gray-700">声音提醒</label>
                  <p className="text-xs text-gray-500">收到提醒时播放提示音</p>
                </div>
              </div>
              <ToggleSwitch checked={settings.enableSound} onChange={() => handleToggle('enableSound')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-500">修改后请保存设置</p>
            <Button size="lg" onClick={handleSave} loading={loading} icon={<Save className="h-4 w-4" />}>保存设置</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
