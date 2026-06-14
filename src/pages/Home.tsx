import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useReminderService } from '../hooks/useReminderService';
import { useWeatherEffect } from '../hooks/useWeatherEffect';
import { calculateStats } from '../utils/helpers';
import { AREAS } from '../data/constants';
import { WeatherBanner } from '../components/WeatherBanner';
import { ReminderBanner } from '../components/ReminderBanner';
import { AreaCard } from '../components/AreaCard';
import { CollectModal } from '../components/CollectModal';
import { ClothesRecord } from '../types';
import { Plus, Droplets, Clock, Shirt, AlertTriangle } from 'lucide-react';

const Home: React.FC = () => {
  const { records, weather, getRecordsByLocation, initStore, isLoading } = useStore();
  const [selectedRecord, setSelectedRecord] = useState<ClothesRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useReminderService();
  const { bgGradient, textColor } = useWeatherEffect(weather.condition);

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const stats = calculateStats(records);
  const dryingRecords = records.filter(r => r.status === 'drying');
  const totalItems = dryingRecords.reduce((sum, r) => sum + r.quantity, 0);

  const handleCollect = (record: ClothesRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🧺</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000 pb-20 md:pb-8 md:pt-20`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold font-display text-shadow">
              <span className="md:hidden">🧺</span>
              <span className="hidden md:inline">🧺 晾衣管家</span>
            </h1>
            <div className={`text-sm ${textColor} opacity-70`}>
              {currentTime.toLocaleDateString('zh-CN', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <p className={`${textColor} opacity-80`}>
            管理阳台晾晒，智能提醒不再忘收
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <WeatherBanner />
          <ReminderBanner />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card p-4 card-hover">
            <div className="flex items-center gap-2 text-sky-600 mb-2">
              <Shirt size={20} />
              <span className="text-sm font-medium">晾晒中</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{dryingRecords.length}</div>
            <div className="text-sm text-gray-500">批衣物 / {totalItems} 件</div>
          </div>
          <div className="card p-4 card-hover">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <Droplets size={20} />
              <span className="text-sm font-medium">本周返潮</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.weeklyDampCount}</div>
            <div className="text-sm text-gray-500">次</div>
          </div>
          <div className="card p-4 card-hover">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Clock size={20} />
              <span className="text-sm font-medium">最久晾晒</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {dryingRecords.length > 0 
                ? Math.max(...dryingRecords.map(r => 
                    Math.floor((currentTime.getTime() - new Date(r.startTime).getTime()) / 3600000)
                  ))
                : 0}
            </div>
            <div className="text-sm text-gray-500">小时</div>
          </div>
          <div className="card p-4 card-hover">
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <AlertTriangle size={20} />
              <span className="text-sm font-medium">待收厚衣</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.thickClothesPending.length}</div>
            <div className="text-sm text-gray-500">件需提前安排</div>
          </div>
        </div>

        <div className="space-y-4">
          {AREAS.map(area => (
            <AreaCard
              key={area.id}
              area={area}
              records={getRecordsByLocation(area.id)}
              onCollect={handleCollect}
            />
          ))}
        </div>

        {dryingRecords.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4 animate-float">🌤️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2 font-display">阳台上干干净净</h3>
            <p className="text-gray-500 mb-6">有衣物要晾晒吗？点击下方按钮添加记录</p>
            <Link to="/add" className="btn-primary inline-flex items-center gap-2">
              <Plus size={20} />
              添加晾晒记录
            </Link>
          </div>
        )}
      </div>

      <Link
        to="/add"
        className="fixed right-6 bottom-24 md:bottom-6 z-30 w-14 h-14 bg-sky-500 text-white rounded-full shadow-xl shadow-sky-500/40 flex items-center justify-center hover:bg-sky-600 hover:scale-110 transition-all duration-300 group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </Link>

      {selectedRecord && (
        <CollectModal
          record={selectedRecord}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
