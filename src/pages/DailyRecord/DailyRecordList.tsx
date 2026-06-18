import { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Dog,
  Cat,
  PawPrint,
  Save,
  Zap,
  Upload,
  X,
  AlertCircle,
  Droplets,
  Activity,
  UtensilsCrossed,
  Brain,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import type { Pet, Stay, DailyRecord, Cage } from '../../../shared/types';
import {
  DEFECATION_NAMES,
  MENTAL_STATE_NAMES,
  SPECIES_NAMES,
} from '../../../shared/types';

interface TodayRecordItem {
  stay: Stay;
  pet: Pet;
  hasRecord: boolean;
  latestRecord?: DailyRecord;
}

interface QuickTemplate {
  name: string;
  icon: React.ReactNode;
  data: Partial<DailyRecord>;
}

const quickTemplates: QuickTemplate[] = [
  {
    name: '一切正常',
    icon: <CheckCircle className="w-4 h-4" />,
    data: {
      feeding: '早晚各一次，食欲良好',
      defecation: 'normal',
      defecationCount: 2,
      mentalState: 'excellent',
      waterIntake: '饮水正常',
      exercise: '户外活动30分钟',
      abnormal: false,
    },
  },
  {
    name: '食欲一般',
    icon: <UtensilsCrossed className="w-4 h-4" />,
    data: {
      feeding: '食欲一般，剩余少量食物',
      defecation: 'normal',
      defecationCount: 1,
      mentalState: 'good',
      waterIntake: '饮水正常',
      exercise: '室内活动',
      abnormal: false,
    },
  },
  {
    name: '精神欠佳',
    icon: <Brain className="w-4 h-4" />,
    data: {
      feeding: '进食正常',
      defecation: 'normal',
      defecationCount: 1,
      mentalState: 'fair',
      waterIntake: '饮水较少',
      exercise: '活动量较少',
      abnormal: true,
      abnormalDescription: '精神欠佳，活动量减少',
      handlingMeasures: '继续观察，定时测量体温',
    },
  },
];

export default function DailyRecordList() {
  const { user } = useAuthStore();
  const [todayRecords, setTodayRecords] = useState<TodayRecordItem[]>([]);
  const [cages, setCages] = useState<Map<number, Cage>>(new Map());
  const [selectedStayId, setSelectedStayId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<DailyRecord>>({
    feeding: '',
    defecation: 'normal',
    defecationCount: 1,
    mentalState: 'good',
    waterIntake: '',
    exercise: '',
    abnormal: false,
    abnormalDescription: '',
    abnormalPhotos: [],
    handlingMeasures: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, cagesRes] = await Promise.all([
        apiClient.get<TodayRecordItem[]>('/daily-records/today'),
        apiClient.get<Cage[]>('/cages'),
      ]);

      if (recordsRes.success && recordsRes.data) {
        setTodayRecords(recordsRes.data);
        if (recordsRes.data.length > 0 && !selectedStayId) {
          const firstUnrecorded = recordsRes.data.find((r) => !r.hasRecord);
          setSelectedStayId(
            firstUnrecorded ? firstUnrecorded.stay.id : recordsRes.data[0].stay.id
          );
        }
      }

      if (cagesRes.success && cagesRes.data) {
        const cageMap = new Map<number, Cage>();
        cagesRes.data.forEach((cage) => cageMap.set(cage.id, cage));
        setCages(cageMap);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const selected = todayRecords.find((r) => r.stay.id === selectedStayId);
    if (selected?.latestRecord) {
      setFormData(selected.latestRecord);
    } else {
      setFormData({
        feeding: '',
        defecation: 'normal',
        defecationCount: 1,
        mentalState: 'good',
        waterIntake: '',
        exercise: '',
        abnormal: false,
        abnormalDescription: '',
        abnormalPhotos: [],
        handlingMeasures: '',
      });
    }
  }, [selectedStayId, todayRecords]);

  const selectedItem = todayRecords.find((r) => r.stay.id === selectedStayId);

  const handleQuickFill = (template: QuickTemplate) => {
    setFormData((prev) => ({ ...prev, ...template.data }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setFormData((prev) => ({
      ...prev,
      abnormalPhotos: [...(prev.abnormalPhotos || []), ...newPhotos],
    }));
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      abnormalPhotos: prev.abnormalPhotos?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!selectedStayId || !user) return;

    if (!formData.feeding?.trim()) {
      alert('请填写喂食情况');
      return;
    }

    try {
      setSaving(true);
      const recordData = {
        ...formData,
        stayId: selectedStayId,
        recordDate: new Date().toISOString().split('T')[0],
        recordedBy: user.id,
      };

      if (selectedItem?.latestRecord) {
        await apiClient.put(`/daily-records/${selectedItem.latestRecord.id}`, recordData);
      } else {
        await apiClient.post(`/stays/${selectedStayId}/records`, recordData);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      fetchData();
    } catch (error) {
      console.error('保存记录失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const getSpeciesIcon = (species: Pet['species']) => {
    switch (species) {
      case 'dog':
        return Dog;
      case 'cat':
        return Cat;
      default:
        return PawPrint;
    }
  };

  const getCageName = (cageId?: number) => {
    if (!cageId) return '未分配';
    const cage = cages.get(cageId);
    return cage ? cage.name : '未知笼位';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const unrecordedCount = todayRecords.filter((r) => !r.hasRecord).length;
  const abnormalCount = todayRecords.filter(
    (r) => r.latestRecord?.abnormal
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500" />
            今日日常记录
          </h1>
          <p className="text-gray-500 mt-1">
            共 {todayRecords.length} 只在住宠物，
            <span className="text-amber-600 font-medium">
              {unrecordedCount} 只待记录
            </span>
            {abnormalCount > 0 && (
              <span className="text-red-600 font-medium ml-2">
                {abnormalCount} 只异常
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">在住宠物列表</h2>
              </div>
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {todayRecords.length === 0 ? (
                  <div className="p-8 text-center">
                    <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">暂无在住宠物</p>
                  </div>
                ) : (
                  todayRecords.map((item) => {
                    const SpeciesIcon = getSpeciesIcon(item.pet.species);
                    const isSelected = selectedStayId === item.stay.id;
                    const isAbnormal = item.latestRecord?.abnormal;

                    return (
                      <button
                        key={item.stay.id}
                        onClick={() => setSelectedStayId(item.stay.id)}
                        className={cn(
                          'w-full p-4 flex items-center gap-3 border-b border-gray-50 transition-all text-left',
                          isSelected
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-gray-50 border-l-4 border-l-transparent',
                          isAbnormal && 'bg-red-50/50'
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                            {item.pet.photoUrl ? (
                              <img
                                src={item.pet.photoUrl}
                                alt={item.pet.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <SpeciesIcon className="w-7 h-7 text-blue-300" />
                              </div>
                            )}
                          </div>
                          {item.stay.highRisk && (
                            <div className="absolute -top-1 -right-1">
                              <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 truncate">
                              {item.pet.name}
                            </span>
                            <SpeciesIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {getCageName(item.stay.cageId)}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-500">
                              {SPECIES_NAMES[item.pet.species]}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {item.hasRecord ? (
                            isAbnormal ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <AlertCircle className="w-3 h-3" />
                                异常
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3" />
                                已记录
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 animate-pulse">
                              <Clock className="w-3 h-3" />
                              待记录
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedItem ? (
              <div
                className={cn(
                  'bg-white rounded-2xl shadow-sm border overflow-hidden',
                  formData.abnormal
                    ? 'border-red-200 shadow-red-500/10'
                    : 'border-gray-100'
                )}
              >
                <div
                  className={cn(
                    'p-4 border-b flex items-center justify-between',
                    formData.abnormal
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                      {selectedItem.pet.photoUrl ? (
                        <img
                          src={selectedItem.pet.photoUrl}
                          alt={selectedItem.pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {(() => {
                            const Icon = getSpeciesIcon(selectedItem.pet.species);
                            return <Icon className="w-5 h-5 text-blue-300" />;
                          })()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedItem.pet.name} 的记录
                      </h2>
                      <p className="text-sm text-gray-500">
                        {getCageName(selectedItem.stay.cageId)} ·{' '}
                        {SPECIES_NAMES[selectedItem.pet.species]}
                      </p>
                    </div>
                  </div>

                  {formData.abnormal && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      异常记录
                    </span>
                  )}
                </div>

                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">快速记录</p>
                  <div className="flex flex-wrap gap-2">
                    {quickTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickFill(template)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-480px)] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                      喂食情况 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.feeding || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          feeding: e.target.value,
                        }))
                      }
                      placeholder="请描述今日喂食情况，包括食量、食欲等..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        排便情况 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {(
                          [
                            'normal',
                            'soft',
                            'diarrhea',
                            'constipation',
                            'none',
                          ] as const
                        ).map((type) => (
                          <button
                            key={type}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                defecation: type,
                              }))
                            }
                            className={cn(
                              'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                              formData.defecation === type
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            {DEFECATION_NAMES[type]}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">次数：</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                defecationCount: Math.max(
                                  0,
                                  (prev.defecationCount || 1) - 1
                                ),
                              }))
                            }
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-medium transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {formData.defecationCount || 0}
                          </span>
                          <button
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                defecationCount:
                                  (prev.defecationCount || 1) + 1,
                              }))
                            }
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-medium transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm text-gray-500">次</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        精神状态 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['excellent', 'good', 'fair', 'poor'] as const).map(
                          (state) => (
                            <button
                              key={state}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  mentalState: state,
                                }))
                              }
                              className={cn(
                                'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                                formData.mentalState === state
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              {MENTAL_STATE_NAMES[state]}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-gray-400" />
                        饮水量 <span className="text-gray-400 text-xs font-normal">（选填）</span>
                      </label>
                      <input
                        type="text"
                        value={formData.waterIntake || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            waterIntake: e.target.value,
                          }))
                        }
                        placeholder="例如：饮水正常、约500ml等"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        运动量 <span className="text-gray-400 text-xs font-normal">（选填）</span>
                      </label>
                      <input
                        type="text"
                        value={formData.exercise || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            exercise: e.target.value,
                          }))
                        }
                        placeholder="例如：户外活动30分钟、室内玩耍等"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle
                          className={cn(
                            'w-5 h-5',
                            formData.abnormal ? 'text-red-500' : 'text-gray-400'
                          )}
                        />
                        <div>
                          <p className="font-medium text-gray-900">是否异常</p>
                          <p className="text-sm text-gray-500">
                            开启后可记录异常情况和处理措施
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            abnormal: !prev.abnormal,
                          }))
                        }
                        className={cn(
                          'relative w-14 h-8 rounded-full transition-colors duration-300',
                          formData.abnormal ? 'bg-red-500' : 'bg-gray-300'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300',
                            formData.abnormal
                              ? 'translate-x-7'
                              : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {formData.abnormal && (
                    <div className="space-y-6 p-4 bg-red-50 rounded-xl border border-red-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          异常描述 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.abnormalDescription || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              abnormalDescription: e.target.value,
                            }))
                          }
                          placeholder="请详细描述异常症状，持续时间等..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          异常照片 <span className="text-gray-400 text-xs font-normal">（支持多图）</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {(formData.abnormalPhotos || []).map((photo, index) => (
                            <div
                              key={index}
                              className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                            >
                              <img
                                src={photo}
                                alt={`异常照片 ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-white">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500">上传照片</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          处理措施 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.handlingMeasures || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              handlingMeasures: e.target.value,
                            }))
                          }
                          placeholder="请描述已采取的处理措施..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {selectedItem.hasRecord ? (
                      <span>最后记录：{selectedItem.latestRecord?.createdAt}</span>
                    ) : (
                      <span className="text-amber-600">今日尚未记录</span>
                    )}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300',
                      saveSuccess
                        ? 'bg-green-500 text-white shadow-green-500/30'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5',
                      saving && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : saveSuccess ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {saving
                      ? '保存中...'
                      : saveSuccess
                      ? '保存成功'
                      : selectedItem.hasRecord
                      ? '更新记录'
                      : '保存记录'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  请选择一只宠物
                </h3>
                <p className="text-gray-500">从左侧列表选择要记录的宠物</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
