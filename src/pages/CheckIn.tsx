import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Droplets,
  Search,
  MapPin,
  Sprout,
  Thermometer,
  Bug,
  Leaf,
  Apple,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Send,
  Info,
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import WeatherBanner from '../components/WeatherBanner.js';
import {
  CROP_EMOJIS,
  TIME_SLOT_LABELS,
  SHADE_CONDITION_LABELS,
  CROP_GROWTH_CYCLES,
} from '@shared/types.js';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  calculateGrowthProgress,
} from '../utils/dateUtils.js';
import type {
  GardenBed,
  CheckIn as CheckInType,
  TimeSlot,
  WeedLevel,
  Schedule,
} from '@shared/types.js';

interface LocationState {
  scheduleId?: string;
  gardenBedId?: string;
}

const CheckInPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const {
    currentUser,
    gardenBeds,
    checkIns,
    schedules,
    weather,
    anomalies,
    loading,
    fetchGardenBeds,
    fetchCheckIns,
    fetchSchedules,
    fetchWeather,
    fetchAnomalies,
    createCheckIn,
    simulateWeatherChange,
  } = useStore();

  const [selectedGardenBedId, setSelectedGardenBedId] = useState<string>(
    state?.gardenBedId || ''
  );
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBed, setFilterBed] = useState<string>('all');

  const [formData, setFormData] = useState({
    waterAmount: 5,
    soilMoisture: 50,
    hasPests: false,
    pestDetails: '',
    hasWeeds: false,
    weedLevel: 'none' as WeedLevel,
    harvestedAmount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchGardenBeds();
    fetchCheckIns();
    fetchWeather();
    fetchSchedules(formatDate(new Date()));
    fetchAnomalies();
  }, [fetchGardenBeds, fetchCheckIns, fetchSchedules, fetchWeather, fetchAnomalies]);

  const selectedGardenBed = gardenBeds.find((b) => b.id === selectedGardenBedId);
  const relatedSchedule = schedules.find((s) => s.id === state?.scheduleId);

  const filteredCheckIns = checkIns
    .filter((c) => {
      const bed = gardenBeds.find((b) => b.id === c.gardenBedId);
      const matchesBed = filterBed === 'all' || c.gardenBedId === filterBed;
      const matchesSearch =
        !searchTerm ||
        (bed &&
          (bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bed.crop.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesBed && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGardenBedId || !currentUser) return;

    const checkInData = {
      gardenBedId: selectedGardenBedId,
      volunteerId: currentUser.id,
      scheduleId: state?.scheduleId,
      ...formData,
    };

    const result = await createCheckIn(checkInData);
    if (result && result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('history');
      }, 2000);
    }
  };

  const getCheckInAnomalies = (checkInId: string) => {
    return anomalies.filter((a) => a.checkInId === checkInId && (!a.status || a.status === 'pending'));
  };

  const getPestSeverity = (checkIn: CheckInType) => {
    if (!checkIn.hasPests) {
      return { color: 'text-primary-600', label: '无虫害', icon: CheckCircle };
    }
    const details = checkIn.pestDetails || '';
    const isSevere = ['严重', '大量', '很多', '蚜虫', '红蜘蛛'].some(k => details.includes(k));
    if (isSevere) {
      return { color: 'text-red-600', label: '严重', icon: AlertTriangle };
    }
    return { color: 'text-orange-600', label: '有虫害', icon: Info };
  };

  const getWeedSeverity = (checkIn: CheckInType) => {
    switch (checkIn.weedLevel) {
      case 'none':
        return { color: 'text-primary-600', label: '无杂草', icon: CheckCircle };
      case 'mild':
        return { color: 'text-sun-600', label: '轻微', icon: Info };
      case 'moderate':
        return { color: 'text-orange-600', label: '中等', icon: AlertTriangle };
      case 'severe':
        return { color: 'text-red-600', label: '严重', icon: AlertTriangle };
      default:
        return { color: 'text-primary-600', label: '无杂草', icon: CheckCircle };
    }
  };

  const getMoistureStatus = (moisture: number) => {
    if (moisture >= 70) return { color: 'text-sky-600', label: '湿润' };
    if (moisture >= 40) return { color: 'text-primary-600', label: '适中' };
    if (moisture >= 20) return { color: 'text-sun-600', label: '偏干' };
    return { color: 'text-red-600', label: '干燥' };
  };

  if (!currentUser) {
    return (
      <div className="card text-center py-12">
        <AlertTriangle size={48} className="mx-auto mb-3 text-sun-500" />
        <p className="text-forest-600">请先登录后再打卡</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-forest-800">浇水打卡</h1>
          <p className="text-forest-600 mt-1">
            欢迎回来，{currentUser.name}！今天已有 {checkIns.filter((c) => c.volunteerId === currentUser.id && formatDate(new Date(c.createdAt)) === formatDate(new Date())).length} 次打卡
          </p>
        </div>
      </div>

      <WeatherBanner
        weather={weather}
        onRefresh={simulateWeatherChange}
        loading={loading}
      />

      {weather?.shouldSkipWatering && (
        <div className="card bg-sky-50 border-2 border-sky-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Droplets size={24} className="text-sky-600" />
            </div>
            <div>
              <h3 className="font-medium text-sky-800">雨天提示</h3>
              <p className="text-sky-700 text-sm mt-1">
                当前正在下雨，建议跳过今日浇水。如仍需浇水，请酌情减少浇水量。
              </p>
            </div>
          </div>
        </div>
      )}

      {weather?.highHeatWarning && (
        <div className="card bg-sun-50 border-2 border-sun-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sun-100 rounded-lg">
              <Thermometer size={24} className="text-sun-600" />
            </div>
            <div>
              <h3 className="font-medium text-sun-800">高温预警</h3>
              <p className="text-sun-700 text-sm mt-1">
                连续高温天气，请注意增加浇水频率，避免作物脱水。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-cream-200">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'form'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-forest-500 hover:text-forest-700'
          }`}
        >
          打卡记录
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-forest-500 hover:text-forest-700'
          }`}
        >
          历史记录
        </button>
      </div>

      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} className="card space-y-6">
          {showSuccess && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center gap-3 animate-scale-in">
              <CheckCircle size={24} className="text-primary-500" />
              <div>
                <p className="font-medium text-primary-800">打卡成功！</p>
                <p className="text-sm text-primary-600">感谢您的辛勤付出 🌱</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              选择菜畦 *
            </label>
            <select
              required
              value={selectedGardenBedId}
              onChange={(e) => setSelectedGardenBedId(e.target.value)}
              className="input w-full"
            >
              <option value="">请选择菜畦</option>
              {gardenBeds
                .filter((b) => b.status !== 'dormant')
                .sort((a, b) => a.bedNumber.localeCompare(b.bedNumber))
                .map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {CROP_EMOJIS[bed.crop] || '🌱'} {bed.bedNumber} - {bed.crop} ({bed.growerName})
                  </option>
                ))}
            </select>
          </div>

          {selectedGardenBed && (
            <div className="bg-cream-50 rounded-xl p-4 border border-cream-200">
              <h4 className="font-medium text-forest-800 mb-3 flex items-center gap-2">
                <Info size={18} className="text-primary-500" />
                菜畦信息
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-forest-500">作物</span>
                  <p className="font-medium text-forest-800">
                    {CROP_EMOJIS[selectedGardenBed.crop] || '🌱'} {selectedGardenBed.crop}
                  </p>
                </div>
                <div>
                  <span className="text-forest-500">种植人</span>
                  <p className="font-medium text-forest-800">{selectedGardenBed.growerName}</p>
                </div>
                <div>
                  <span className="text-forest-500">浇水频率</span>
                  <p className="font-medium text-forest-800">
                    每 {selectedGardenBed.wateringFrequency} 天
                  </p>
                </div>
                <div>
                  <span className="text-forest-500">遮阴</span>
                  <p className="font-medium text-forest-800">
                    {SHADE_CONDITION_LABELS[selectedGardenBed.shadeCondition]}
                  </p>
                </div>
              </div>
              {selectedGardenBed.lastWateredAt && (
                <div className="mt-3 pt-3 border-t border-cream-200">
                  <span className="text-forest-500 text-sm">上次浇水：</span>
                  <span className="text-forest-700 font-medium text-sm">
                    {formatRelativeTime(new Date(selectedGardenBed.lastWateredAt))}
                  </span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">
              <Droplets size={16} className="inline mr-1" />
              浇水量 (升)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={formData.waterAmount}
                onChange={(e) => setFormData({ ...formData, waterAmount: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={formData.waterAmount}
                onChange={(e) => setFormData({ ...formData, waterAmount: parseFloat(e.target.value) })}
                className="input w-24 text-center"
              />
              <span className="text-forest-600">升</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">
              <Sprout size={16} className="inline mr-1" />
              土壤湿度: {formData.soilMoisture}% ({getMoistureStatus(formData.soilMoisture).label})
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.soilMoisture}
                onChange={(e) => setFormData({ ...formData, soilMoisture: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className={`font-medium ${getMoistureStatus(formData.soilMoisture).color}`}>
                {getMoistureStatus(formData.soilMoisture).label}
              </span>
            </div>
            <div className="flex justify-between text-xs text-forest-400 mt-1">
              <span>0% 干燥</span>
              <span>50% 适中</span>
              <span>100% 湿润</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-2">
                <Bug size={16} className="inline mr-1" />
                虫害情况
              </label>
              <div className="card bg-cream-50 p-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPests}
                    onChange={(e) =>
                      setFormData({ ...formData, hasPests: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-primary-500"
                  />
                  <span className="text-forest-700">发现虫害</span>
                </label>
                {formData.hasPests && (
                  <div>
                    <label className="block text-xs text-forest-500 mb-1">虫害说明</label>
                    <input
                      type="text"
                      value={formData.pestDetails}
                      onChange={(e) =>
                        setFormData({ ...formData, pestDetails: e.target.value })
                      }
                      placeholder="例如：发现蚜虫、红蜘蛛等..."
                      className="input w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-700 mb-2">
                <Leaf size={16} className="inline mr-1" />
                杂草情况
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['none', 'mild', 'moderate', 'severe'] as WeedLevel[]).map((level) => {
                  const severity = getWeedSeverity({ weedLevel: level } as CheckInType);
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          weedLevel: level,
                          hasWeeds: level !== 'none',
                        })
                      }
                      className={`p-2 rounded-xl border-2 transition-all ${
                        formData.weedLevel === level
                          ? `border-primary-400 bg-primary-50 ${severity.color}`
                          : 'border-cream-200 bg-white text-forest-600 hover:border-cream-300'
                      }`}
                    >
                      <severity.icon size={20} className="mx-auto mb-1" />
                      <p className="text-xs font-medium">{severity.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-sun-50 to-cream-100 border-2 border-sun-200">
            <label className="flex items-center gap-3 mb-2">
              <Apple size={18} className="text-sun-500" />
              <span className="font-medium text-forest-800">采摘数量 (公斤)</span>
            </label>
            <div>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.harvestedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, harvestedAmount: parseFloat(e.target.value) || 0 })
                }
                className="input w-32"
                placeholder="0.0"
              />
              <p className="text-xs text-forest-500 mt-1">如果有采摘，请填写数量（公斤）</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="记录其他情况..."
              className="input min-h-[80px]"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedGardenBedId || loading}
            className="w-full btn btn-primary justify-center text-lg py-4"
          >
            <Send size={20} />
            {loading ? '提交中...' : '提交打卡'}
          </button>
        </form>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                placeholder="搜索菜畦编号、作物..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={filterBed}
              onChange={(e) => setFilterBed(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="all">全部菜畦</option>
              {gardenBeds
                .sort((a, b) => a.bedNumber.localeCompare(b.bedNumber))
                .map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bedNumber} - {bed.crop}
                  </option>
                ))}
            </select>
          </div>

          {filteredCheckIns.length === 0 ? (
            <div className="card text-center py-12">
              <Clock size={48} className="mx-auto mb-3 text-forest-300" />
              <p className="text-forest-500">暂无打卡记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCheckIns.slice(0, 50).map((checkIn) => {
                const bed = gardenBeds.find((b) => b.id === checkIn.gardenBedId);
                const checkInAnomalies = getCheckInAnomalies(checkIn.id);
                const pestInfo = getPestSeverity(checkIn);
                const weedInfo = getWeedSeverity(checkIn);
                const moistureInfo = getMoistureStatus(checkIn.soilMoisture);

                return (
                  <div key={checkIn.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
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
                            <Clock size={12} className="inline mr-1" />
                            {formatDateTime(new Date(checkIn.createdAt))}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-primary-600">
                        {checkIn.waterAmount}L
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="bg-cream-50 rounded-lg p-2">
                        <span className="text-forest-500">湿度</span>
                        <p className={`font-medium ${moistureInfo.color}`}>
                          {checkIn.soilMoisture}% {moistureInfo.label}
                        </p>
                      </div>
                      <div className="bg-cream-50 rounded-lg p-2">
                        <span className="text-forest-500">虫害</span>
                        <p className={`font-medium ${pestInfo.color}`}>{pestInfo.label}</p>
                      </div>
                      <div className="bg-cream-50 rounded-lg p-2">
                        <span className="text-forest-500">杂草</span>
                        <p className={`font-medium ${weedInfo.color}`}>{weedInfo.label}</p>
                      </div>
                      <div className="bg-cream-50 rounded-lg p-2">
                        <span className="text-forest-500">采摘</span>
                        <p className="font-medium text-sun-600">
                          {checkIn.harvestedAmount > 0 ? `${checkIn.harvestedAmount}kg` : '无'}
                        </p>
                      </div>
                    </div>

                    {checkInAnomalies.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-sm font-medium text-red-800 flex items-center gap-1">
                          <AlertTriangle size={14} className="text-red-500" />
                          检测到 {checkInAnomalies.length} 个异常
                        </p>
                        {checkInAnomalies.map((anomaly) => (
                          <p key={anomaly.id} className="text-sm text-red-600 mt-1">
                            • {anomaly.message || anomaly.description}
                          </p>
                        ))}
                      </div>
                    )}

                    {checkIn.notes && (
                      <div className="mt-3 pt-3 border-t border-cream-200">
                        <p className="text-sm text-forest-600">
                          <span className="text-forest-500">备注：</span>
                          {checkIn.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
