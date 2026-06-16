import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, Droplets, Plus, ChevronRight, Sparkles, TrendingUp, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calculateStatistics, getQualifiedStatus, getStatusText, getWeeklyProgress } from '../utils/statistics';
import { formatDisplayDate, getTodayString } from '../utils/storage';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import AlertBanner from '../components/AlertBanner';
import Slider from '../components/Slider';
import Toggle from '../components/Toggle';
import { OdorLevel } from '../types';
import EmojiPicker, { odorOptions } from '../components/EmojiPicker';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { braces, records, reminders, inventories, init, initialized, addRecord, resolveReminder } = useStore();
  
  const [selectedBraces, setSelectedBraces] = useState<string>('');
  const [wearHours, setWearHours] = useState(20);
  const [isBrushed, setIsBrushed] = useState(true);
  const [isSoaked, setIsSoaked] = useState(true);
  const [tookBoxOut, setTookBoxOut] = useState(false);
  const [boxReturned, setBoxReturned] = useState(true);
  const [odorLevel, setOdorLevel] = useState<OdorLevel>(0);
  
  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [init, initialized]);
  
  useEffect(() => {
    if (braces.length > 0 && !selectedBraces) {
      setSelectedBraces(braces[0].id);
    }
  }, [braces, selectedBraces]);
  
  const unresolvedReminders = reminders.filter(r => !r.isResolved);
  const stats = calculateStatistics(records, inventories, braces);
  const weeklyProgress = getWeeklyProgress(records);
  const today = getTodayString();
  const todayRecord = records.find(r => r.recordDate === today && r.bracesId === selectedBraces);
  
  const currentBraces = braces.find(b => b.id === selectedBraces);
  const currentInventory = inventories.find(i => i.bracesId === selectedBraces);
  
  useEffect(() => {
    if (todayRecord) {
      setWearHours(todayRecord.wearHours);
      setIsBrushed(todayRecord.isBrushed);
      setIsSoaked(todayRecord.isSoaked);
      setTookBoxOut(todayRecord.tookBoxOut);
      setBoxReturned(todayRecord.boxReturned);
      setOdorLevel(todayRecord.odorLevel);
    }
  }, [todayRecord]);
  
  const handleQuickRecord = () => {
    if (!selectedBraces) return;
    
    addRecord({
      bracesId: selectedBraces,
      recordDate: today,
      wearHours,
      isBrushed,
      isSoaked,
      tookBoxOut,
      boxReturned,
      odorLevel,
    });
    
    if (isSoaked && currentInventory) {
      useStore.getState().updateInventory(selectedBraces, -1);
    }
  };
  
  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'missed_wear': return 'warning' as const;
      case 'overdue_clean': return 'error' as const;
      case 'lost_box': return 'error' as const;
      case 'low_stock': return 'warning' as const;
      default: return 'info' as const;
    }
  };
  
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  };
  
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-primary text-xl">加载中...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-warm-dark">
            早上好！<span className="text-gradient">🌞</span>
          </h1>
          <p className="text-gray-500 mt-1">{formatDisplayDate(today)}</p>
        </div>
        {braces.length > 1 && (
          <select
            value={selectedBraces}
            onChange={(e) => setSelectedBraces(e.target.value)}
            className="input-base w-auto"
          >
            {braces.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
      </div>
      
      {unresolvedReminders.length > 0 && (
        <div className="space-y-3">
          {unresolvedReminders.slice(0, 3).map(reminder => (
            <AlertBanner
              key={reminder.id}
              type={getReminderTypeColor(reminder.type)}
              title={reminder.title}
              description={reminder.description}
              action={{
                label: '去处理',
                onClick: () => navigate('/reminders'),
              }}
              onClose={() => resolveReminder(reminder.id)}
            />
          ))}
          {unresolvedReminders.length > 3 && (
            <button
              onClick={() => navigate('/reminders')}
              className="text-sm text-primary font-medium hover:underline"
            >
              查看全部 {unresolvedReminders.length} 条提醒 →
            </button>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="text-primary" size={24} />
            </div>
            <div className="text-3xl font-bold text-primary font-display">{stats.weeklyQualifiedDays}</div>
            <div className="text-sm text-gray-500">本周达标</div>
            <div className="text-xs text-gray-400">/ 7 天</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-accent-sky/10 flex items-center justify-center">
              <TrendingUp className="text-accent-sky" size={24} />
            </div>
            <div className="text-3xl font-bold text-accent-sky font-display">{stats.consecutiveDays}</div>
            <div className="text-sm text-gray-500">连续记录</div>
            <div className="text-xs text-gray-400">天</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-accent-yellow/10 flex items-center justify-center">
              <Package className="text-accent-yellow" size={24} />
            </div>
            <div className="text-3xl font-bold text-accent-yellow font-display">
              {currentInventory?.currentStock || 0}
            </div>
            <div className="text-sm text-gray-500">清洁片</div>
            <div className="text-xs text-gray-400">剩余</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>本周进度 📊</CardTitle>
          <button
            onClick={() => navigate('/records')}
            className="text-sm text-primary font-medium flex items-center gap-1"
          >
            查看全部 <ChevronRight size={16} />
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {weeklyProgress.map((day, index) => (
              <div key={day.date} className="flex-1 text-center">
                <div className="text-xs text-gray-500 mb-2">{getDayName(day.date).slice(1)}</div>
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center mb-1 transition-all ${
                    day.qualified
                      ? 'bg-primary text-white'
                      : day.hasRecord
                      ? 'bg-accent-yellow text-white'
                      : 'bg-warm-gray text-gray-400'
                  }`}
                >
                  {day.qualified ? '✓' : day.hasRecord ? '~' : '·'}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(day.date).getDate()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {currentBraces && (
        <Card>
          <CardHeader>
            <CardTitle>今日记录 ✏️</CardTitle>
            <p className="text-sm text-gray-500">{currentBraces.name}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Slider
              value={wearHours}
              onChange={setWearHours}
              label="佩戴时长"
              min={0}
              max={24}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Toggle checked={isBrushed} onChange={setIsBrushed} label="已刷洗 🪥" />
              <Toggle checked={isSoaked} onChange={setIsSoaked} label="已泡片 💧" />
              <Toggle checked={tookBoxOut} onChange={setTookBoxOut} label="带盒外出 📦" />
              <Toggle 
                checked={boxReturned} 
                onChange={setBoxReturned} 
                label="盒子已带回 ✅"
                disabled={!tookBoxOut}
              />
            </div>
            
            <EmojiPicker
              value={odorLevel}
              onChange={(v) => setOdorLevel(v as OdorLevel)}
              options={odorOptions}
              label="异味情况"
            />
            
            <button
              onClick={handleQuickRecord}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              保存今日记录
            </button>
          </CardContent>
        </Card>
      )}
      
      {records.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>最近记录 📝</CardTitle>
            <button
              onClick={() => navigate('/records')}
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              全部记录 <ChevronRight size={16} />
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {records
              .filter(r => r.bracesId === selectedBraces)
              .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
              .slice(0, 3)
              .map(record => {
                const status = getQualifiedStatus(record);
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-warm-gray/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <div>
                        <div className="font-medium">{formatDisplayDate(record.recordDate)}</div>
                        <div className="text-sm text-gray-500">
                          佩戴 {record.wearHours} 小时
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{getStatusText(status.status)}</div>
                      <div className="text-xs text-gray-400">
                        {record.isBrushed && '🪥'} {record.isSoaked && '💧'}
                      </div>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}
      
      {braces.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-5xl mb-4">🦷</div>
            <h3 className="text-xl font-bold font-display mb-2">还没有牙套档案</h3>
            <p className="text-gray-500 mb-4">点击下方按钮添加您的第一个牙套档案</p>
            <button
              onClick={() => navigate('/braces/new')}
              className="btn-primary"
            >
              添加牙套档案
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
