import React, { useEffect, useState } from 'react';
import {
  User,
  Droplets,
  Calendar,
  Trophy,
  Sprout,
  Apple,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Settings,
  LogOut,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.js';
import { CROP_EMOJIS } from '@shared/types.js';
import { formatDate, formatRelativeTime } from '../utils/dateUtils.js';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    volunteers,
    checkIns,
    anomalies,
    gardenBeds,
    loading,
    fetchCurrentUser,
    fetchVolunteers,
    fetchCheckIns,
    fetchAnomalies,
    fetchGardenBeds,
    setCurrentUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'ranking'>('stats');

  useEffect(() => {
    fetchCurrentUser();
    fetchVolunteers();
    fetchCheckIns();
    fetchAnomalies();
    fetchGardenBeds();
  }, [fetchCurrentUser, fetchVolunteers, fetchCheckIns, fetchAnomalies, fetchGardenBeds]);

  if (!currentUser) {
    return (
      <div className="card text-center py-12">
        <AlertTriangle size={48} className="mx-auto mb-3 text-sun-500" />
        <p className="text-forest-600">请先登录后查看个人中心</p>
      </div>
    );
  }

  const myCheckIns = checkIns.filter((c) => c.volunteerId === currentUser.id);
  const myAnomalies = anomalies.filter(
    (a) => a.detectedByVolunteerId === currentUser.id && a.status === 'pending'
  );

  const today = formatDate(new Date());
  const myTodayCheckIns = myCheckIns.filter(
    (c) => formatDate(new Date(c.createdAt)) === today
  );

  const totalWater = myCheckIns.reduce((sum, c) => sum + c.waterAmount, 0);
  const totalHarvest = myCheckIns.reduce((sum, c) => sum + c.harvestAmount, 0);

  const volunteerRanking = [...volunteers]
    .map((v) => {
      const vCheckIns = checkIns.filter((c) => c.volunteerId === v.id);
      const vWater = vCheckIns.reduce((sum, c) => sum + c.waterAmount, 0);
      return { volunteer: v, checkInCount: vCheckIns.length, totalWater: vWater };
    })
    .sort((a, b) => b.checkInCount - a.checkInCount);

  const myRank =
    volunteerRanking.findIndex((v) => v.volunteer.id === currentUser.id) + 1;

  const recentCheckIns = myCheckIns
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      setCurrentUser(null);
      navigate('/');
    }
  };

  const getBedInfo = (bedId: string) => gardenBeds.find((b) => b.id === bedId);

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-primary-500 to-forest-700 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
            👨‍🌾
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold">{currentUser.name}</h1>
            <p className="text-primary-100 mt-1">{currentUser.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-sm">
                <Trophy size={16} className="text-sun-400" />
                排名 #{myRank}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Droplets size={16} className="text-sky-300" />
                浇水 {myCheckIns.length} 次
              </span>
              <span className="flex items-center gap-1 text-sm">
                <CheckCircle size={16} className="text-primary-200" />
                {myAnomalies.length === 0 ? '无待处理' : `${myAnomalies.length} 待处理`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{myTodayCheckIns.length}</div>
          <p className="text-sm text-forest-500 mt-1">今日打卡</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-sky-600">{totalWater.toFixed(1)}L</div>
          <p className="text-sm text-forest-500 mt-1">总浇水量</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-sun-600">{totalHarvest.toFixed(1)}kg</div>
          <p className="text-sm text-forest-500 mt-1">总采摘量</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-forest-600">#{myRank}</div>
          <p className="text-sm text-forest-500 mt-1">志愿者排名</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-cream-200">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'stats'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-forest-500 hover:text-forest-700'
          }`}
        >
          我的数据
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-forest-500 hover:text-forest-700'
          }`}
        >
          打卡历史
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'ranking'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-forest-500 hover:text-forest-700'
          }`}
        >
          排行榜
        </button>
      </div>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary-600" />
              近7天打卡
            </h3>
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = formatDate(date);
                const dayCheckIns = myCheckIns.filter(
                  (c) => formatDate(new Date(c.createdAt)) === dateStr
                );
                const dayWater = dayCheckIns.reduce((sum, c) => sum + c.waterAmount, 0);

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl"
                  >
                    <div className="w-16 text-sm text-forest-600">
                      {date.toLocaleDateString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(dayWater * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-medium text-primary-600">
                        {dayWater.toFixed(1)}L
                      </span>
                      <span className="text-xs text-forest-500 ml-1">
                        ({dayCheckIns.length}次)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Sprout size={20} className="text-primary-600" />
              照料的菜畦
            </h3>
            {currentUser.managedBedIds && currentUser.managedBedIds.length > 0 ? (
              <div className="space-y-3">
                {currentUser.managedBedIds.map((bedId) => {
                  const bed = getBedInfo(bedId);
                  if (!bed) return null;
                  return (
                    <div
                      key={bedId}
                      className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl cursor-pointer hover:bg-cream-100 transition-colors"
                      onClick={() => navigate('/garden-beds')}
                    >
                      <span className="text-3xl">
                        {CROP_EMOJIS[bed.crop] || '🌱'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-forest-800">
                          {bed.bedNumber} - {bed.crop}
                        </p>
                        <p className="text-sm text-forest-500">种植人: {bed.growerName}</p>
                      </div>
                      <ChevronRight size={18} className="text-forest-400" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-forest-500">
                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无负责的菜畦</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Apple size={20} className="text-sun-600" />
              采摘记录
            </h3>
            {myCheckIns.filter((c) => c.harvested).length > 0 ? (
              <div className="space-y-3">
                {myCheckIns
                  .filter((c) => c.harvested)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .slice(0, 5)
                  .map((checkIn) => {
                    const bed = getBedInfo(checkIn.gardenBedId);
                    return (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between p-3 bg-sun-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {bed ? CROP_EMOJIS[bed.crop] || '🍎' : '🍎'}
                          </span>
                          <div>
                            <p className="font-medium text-forest-800">
                              {bed?.crop || '未知作物'}
                            </p>
                            <p className="text-xs text-forest-500">
                              {formatRelativeTime(new Date(checkIn.createdAt))}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-sun-600">
                          {checkIn.harvestAmount} kg
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-forest-500">
                <Apple size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无采摘记录</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Info size={20} className="text-primary-600" />
              个人信息
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                <span className="text-forest-600 flex items-center gap-2">
                  <User size={16} /> 姓名
                </span>
                <span className="font-medium text-forest-800">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                <span className="text-forest-600 flex items-center gap-2">
                  <User size={16} /> 邮箱
                </span>
                <span className="font-medium text-forest-800">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                <span className="text-forest-600 flex items-center gap-2">
                  <User size={16} /> 角色
                </span>
                <span className="badge status-completed">
                  {currentUser.role === 'admin' ? '管理员' : '志愿者'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {recentCheckIns.length === 0 ? (
            <div className="card text-center py-12">
              <Clock size={48} className="mx-auto mb-3 text-forest-300" />
              <p className="text-forest-500">暂无打卡记录</p>
              <button
                onClick={() => navigate('/check-in')}
                className="btn btn-primary mt-4"
              >
                去打卡
              </button>
            </div>
          ) : (
            recentCheckIns.map((checkIn) => {
              const bed = getBedInfo(checkIn.gardenBedId);
              return (
                <div key={checkIn.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 rounded-xl">
                        <Droplets size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-forest-800">
                          {bed ? (
                            <>
                              {CROP_EMOJIS[bed.crop] || '🌱'} {bed.bedNumber} - {bed.crop}
                            </>
                          ) : (
                            '未知菜畦'
                          )}
                        </p>
                        <p className="text-sm text-forest-500">
                          {formatRelativeTime(new Date(checkIn.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">
                        {checkIn.waterAmount}L
                      </p>
                      {checkIn.harvested && (
                        <p className="text-sm text-sun-600">
                          采摘 {checkIn.harvestAmount}kg
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="card">
          <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-sun-600" />
            志愿者排行榜
          </h3>
          <div className="space-y-2">
            {volunteerRanking.map((item, index) => {
              const isMe = item.volunteer.id === currentUser.id;
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div
                  key={item.volunteer.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isMe
                      ? 'bg-primary-100 border-2 border-primary-300'
                      : 'bg-cream-50 hover:bg-cream-100'
                  }`}
                >
                  <div className="w-10 text-center text-2xl">
                    {index < 3 ? medals[index] : <span className="text-lg text-forest-500">#{index + 1}</span>}
                  </div>
                  <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center text-2xl">
                    👨‍🌾
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isMe ? 'text-primary-700' : 'text-forest-800'}`}>
                      {item.volunteer.name}
                      {isMe && <span className="ml-2 text-sm">(我)</span>}
                    </p>
                    <p className="text-sm text-forest-500">
                      {item.checkInCount} 次打卡 · {item.totalWater.toFixed(1)}L 浇水
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {item.checkInCount}
                    </p>
                    <p className="text-xs text-forest-500">打卡次数</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card bg-gradient-to-r from-cream-100 to-cream-50">
        <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} className="text-forest-600" />
          设置
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-red-50 transition-colors group"
          >
            <span className="flex items-center gap-3 text-red-600">
              <LogOut size={20} />
              退出登录
            </span>
            <ChevronRight size={18} className="text-forest-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
