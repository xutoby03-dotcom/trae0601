import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2 as TrashIcon,
  Camera,
  Ruler,
  Calendar,
  Sparkles,
  Info,
  X,
  CheckCircle,
  Maximize2,
  History,
  Wrench,
  Cpu,
} from 'lucide-react';
import Header from '../components/Header';
import {
  SectionTitle,
  AirQualityBadge,
  DeviceAlertBadge,
  DaysRemainingChip,
  FilterProgress,
  formatDate,
} from '../components/ui';
import { useAppStore } from '../store';
import type { Device, AirQuality } from '../types';

type DetailTab = 'basic' | 'replacement' | 'clean';

const TODAY = '2026-06-19';

function getAirQualityFromPM25(pm25: number): AirQuality {
  if (pm25 <= 35) return 'excellent';
  if (pm25 <= 75) return 'good';
  if (pm25 <= 115) return 'moderate';
  if (pm25 <= 150) return 'poor';
  return 'severe';
}

export default function Devices() {
  const devices = useAppStore((s) => s.devices);
  const replacements = useAppStore((s) => s.replacements);
  const cleanRecords = useAppStore((s) => s.cleanRecords);
  const thresholds = useAppStore((s) => s.thresholds);
  const getRemainingFilterDays = useAppStore((s) => s.getRemainingFilterDays);
  const getFilterPercent = useAppStore((s) => s.getFilterPercent);
  const addDevice = useAppStore((s) => s.addDevice);
  const deleteDevice = useAppStore((s) => s.deleteDevice);
  const markCleaned = useAppStore((s) => s.markCleaned);

  const [showForm, setShowForm] = useState(false);
  const [detailDevice, setDetailDevice] = useState<Device | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('basic');

  const [formRoom, setFormRoom] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formArea, setFormArea] = useState<number | ''>('');
  const [formFilterSpec, setFormFilterSpec] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formExpectedDays, setFormExpectedDays] = useState<number | ''>(180);
  const [formPM25, setFormPM25] = useState<number | ''>(35);

  const resetForm = () => {
    setFormRoom('');
    setFormModel('');
    setFormArea('');
    setFormFilterSpec('');
    setFormPurchaseDate('');
    setFormPhoto('');
    setFormExpectedDays(180);
    setFormPM25(35);
  };

  const handleSaveDevice = () => {
    if (
      !formRoom ||
      !formModel ||
      formArea === '' ||
      !formFilterSpec ||
      !formPurchaseDate ||
      formExpectedDays === '' ||
      formPM25 === ''
    ) {
      return;
    }

    const pm25Num = Number(formPM25);
    const airQuality = getAirQualityFromPM25(pm25Num);

    addDevice({
      room: formRoom,
      model: formModel,
      area: Number(formArea),
      filterSpec: formFilterSpec,
      purchaseDate: formPurchaseDate,
      photo: formPhoto || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20white%20air%20purifier%20minimalist%20clean&image_size=square_hd',
      lastCleanDate: TODAY,
      expectedFilterDays: Number(formExpectedDays),
      currentFilterStartDate: TODAY,
      pm25: pm25Num,
      airQuality,
      odorLevel: 0,
    });

    resetForm();
    setShowForm(false);
  };

  const handleMarkCleaned = (id: string) => {
    const confirmed = window.confirm('确认标记此设备已完成清灰维护？');
    if (confirmed) {
      markCleaned(id, '管理员');
    }
  };

  const handleDeleteDevice = (id: string, room: string) => {
    const confirmed = window.confirm(`确认删除「${room}」的设备？相关记录将一并删除。`);
    if (confirmed) {
      deleteDevice(id);
    }
  };

  const openDetail = (d: Device) => {
    setDetailDevice(d);
    setDetailTab('basic');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="设备档案管理" subtitle="一机一档，全生命周期可追溯" />

      <div className="px-8 py-6 flex flex-col gap-8">
        <div className="base-card p-6 animate-fade-in-up stagger-1">
          <SectionTitle
            icon={Cpu}
            title="净化器设备列表"
            desc={`共 ${devices.length} 台设备在运行`}
            action={
              <button className="primary-btn" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>新增设备</span>
              </button>
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {devices.map((device, index) => {
            const percent = getFilterPercent(device.id);
            const remainingDays = getRemainingFilterDays(device.id);
            const staggerClass = `stagger-${(index % 6) + 1}` as const;

            return (
              <div
                key={device.id}
                className={`base-card overflow-hidden animate-fade-in-up ${staggerClass}`}
              >
                <div className="relative">
                  <img
                    src={device.photo}
                    alt={device.room}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <DeviceAlertBadge deviceId={device.id} />
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-brand-700 text-sm font-bold px-3 py-1 rounded-full">
                    {device.room}
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-lg font-black text-brand-800">{device.model}</div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-brand-600">
                      <Ruler className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span className="text-brand-400">适用面积：</span>
                      <span className="font-bold">{device.area}㎡</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-600">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span className="text-brand-400">购买：</span>
                      <span className="font-bold">{formatDate(device.purchaseDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-600">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span className="text-brand-400">滤芯：</span>
                      <span className="font-bold truncate" title={device.filterSpec}>
                        {device.filterSpec}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-600">
                      <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span className="text-brand-400">清灰：</span>
                      <span className="font-bold">{formatDate(device.lastCleanDate)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <FilterProgress percent={percent} />
                  </div>

                  <div className="mt-3">
                    <DaysRemainingChip days={remainingDays} />
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-surface-border flex-wrap">
                    <button
                      className="ghost-btn !px-3 !py-1.5 text-xs"
                      onClick={() => openDetail(device)}
                    >
                      <Info className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span>详情</span>
                    </button>
                    <button
                      className="secondary-btn !px-3 !py-1.5 text-xs"
                      onClick={() => handleMarkCleaned(device.id)}
                    >
                      <Wrench className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span>标记清灰</span>
                    </button>
                    <button className="ghost-btn !px-3 !py-1.5 text-xs">
                      <Edit className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span>编辑</span>
                    </button>
                    <button
                      className="ghost-btn !px-3 !py-1.5 text-xs text-danger-600 hover:bg-danger-50"
                      onClick={() => handleDeleteDevice(device.id, device.room)}
                    >
                      <TrashIcon className="w-3.5 h-3.5" strokeWidth={1.8} />
                      <span>删除</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detailDevice && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm"
            onClick={() => setDetailDevice(null)}
          />
          <div className="absolute right-0 top-0 w-full max-w-2xl h-full bg-white shadow-2xl animate-slide-in-right">
            <div className="overflow-y-auto h-full p-6">
              <button
                className="fixed top-5 right-5 ghost-btn bg-white/80 backdrop-blur z-10"
                onClick={() => setDetailDevice(null)}
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>

              <img
                src={detailDevice.photo}
                alt={detailDevice.room}
                className="rounded-2xl h-56 w-full object-cover"
              />

              <div className="mt-4 flex items-center gap-3">
                <span className="bg-brand-50 text-brand-700 text-sm font-bold px-3 py-1 rounded-full border border-brand-100">
                  {detailDevice.room}
                </span>
                <AirQualityBadge level={detailDevice.airQuality} pm25={detailDevice.pm25} />
              </div>

              <h2 className="text-2xl font-black mt-4 text-brand-800">{detailDevice.model}</h2>

              <div className="text-sm mb-5 mt-6 border-b border-surface-border pb-3 flex gap-2">
                <button
                  className={`tab-btn ${detailTab === 'basic' ? 'tab-btn-active' : ''}`}
                  onClick={() => setDetailTab('basic')}
                >
                  基本信息
                </button>
                <button
                  className={`tab-btn ${detailTab === 'replacement' ? 'tab-btn-active' : ''}`}
                  onClick={() => setDetailTab('replacement')}
                >
                  更换历史
                </button>
                <button
                  className={`tab-btn ${detailTab === 'clean' ? 'tab-btn-active' : ''}`}
                  onClick={() => setDetailTab('clean')}
                >
                  清灰记录
                </button>
              </div>

              {detailTab === 'basic' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">房间</div>
                    <div className="font-bold text-brand-800">{detailDevice.room}</div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">型号</div>
                    <div className="font-bold text-brand-800">{detailDevice.model}</div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">适用面积</div>
                    <div className="font-bold text-brand-800">{detailDevice.area} ㎡</div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">滤芯规格</div>
                    <div className="font-bold text-brand-800">{detailDevice.filterSpec}</div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">购买日期</div>
                    <div className="font-bold text-brand-800">{formatDate(detailDevice.purchaseDate)}</div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">照片URL</div>
                    <div className="font-bold text-brand-800 truncate" title={detailDevice.photo}>
                      <Camera className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.8} />
                      已上传
                    </div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">清灰间隔阈值</div>
                    <div className="font-bold text-brand-800">{thresholds.cleanReminderDays} 天</div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">滤芯设计寿命</div>
                    <div className="font-bold text-brand-800">{detailDevice.expectedFilterDays} 天</div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">PM2.5</div>
                    <div className="font-bold text-brand-800">{detailDevice.pm25} μg/m³</div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4">
                    <div className="text-xs text-brand-400 mb-1">空气质量</div>
                    <div>
                      <AirQualityBadge level={detailDevice.airQuality} pm25={detailDevice.pm25} />
                    </div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4 col-span-2">
                    <div className="text-xs text-brand-400 mb-1">异味等级</div>
                    <div className="font-bold text-brand-800">
                      {detailDevice.odorLevel === 0
                        ? '无异味'
                        : detailDevice.odorLevel === 1
                        ? '轻微'
                        : detailDevice.odorLevel === 2
                        ? '明显'
                        : '强烈'}
                      （Level {detailDevice.odorLevel}）
                    </div>
                  </div>
                  <div className="base-card !shadow-none !rounded-xl p-4 col-span-2">
                    <div className="text-xs text-brand-400 mb-2">滤芯寿命进度</div>
                    <FilterProgress percent={getFilterPercent(detailDevice.id)} />
                    <div className="mt-3">
                      <DaysRemainingChip days={getRemainingFilterDays(detailDevice.id)} />
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'replacement' && (
                <div>
                  {replacements.filter((r) => r.deviceId === detailDevice.id).length === 0 ? (
                    <div className="text-center py-12 text-brand-400 text-sm">
                      暂无滤芯更换记录
                    </div>
                  ) : (
                    <div>
                      {replacements
                        .filter((r) => r.deviceId === detailDevice.id)
                        .map((record, index, arr) => {
                          const isLast = index === arr.length - 1;
                          return (
                            <div key={record.id} className={`flex gap-4 ${isLast ? 'pb-0' : 'pb-6'}`}>
                              <div className="w-20 shrink-0 text-right">
                                <div className="text-sm font-mono font-bold text-brand-700">
                                  {formatDate(record.date)}
                                </div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="w-3.5 h-3.5 rounded-full shrink-0 mt-1.5 bg-air-excellent" />
                                {!isLast && <div className="flex-1 w-0.5 bg-brand-100 mt-2" />}
                              </div>
                              <div className="flex-1 pb-1">
                                <span className="tag bg-air-excellent/10 text-air-excellent border border-air-excellent/30">
                                  滤芯更换
                                </span>
                                <div className="text-sm text-brand-800 font-bold mt-1.5">
                                  更换为「{record.newFilterSpec}」
                                </div>
                                <div className="text-xs text-brand-500 mt-1 space-y-0.5">
                                  <div>批次号：{record.newFilterBatch}</div>
                                  <div>旧滤芯使用：{record.oldFilterDays} 天</div>
                                  <div>操作人：{record.installer}</div>
                                  <div>更换后库存：{record.remainingStock} 件</div>
                                  {record.note && <div className="text-brand-400">备注：{record.note}</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'clean' && (
                <div>
                  {cleanRecords.filter((c) => c.deviceId === detailDevice.id).length === 0 ? (
                    <div className="text-center py-12 text-brand-400 text-sm">
                      暂无清灰维护记录
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cleanRecords
                        .filter((c) => c.deviceId === detailDevice.id)
                        .map((record) => (
                          <div
                            key={record.id}
                            className="base-card !shadow-none !rounded-xl p-4 flex items-start gap-4"
                          >
                            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                              <History className="w-5 h-5" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-bold text-brand-800">
                                  {formatDate(record.date)}
                                </div>
                                <span className="tag bg-brand-50 text-brand-600 border border-brand-100 shrink-0">
                                  操作人：{record.operator}
                                </span>
                              </div>
                              {record.note && (
                                <div className="text-xs text-brand-500 mt-1">{record.note}</div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          />
          <div className="relative max-w-2xl w-full base-card p-6 animate-fade-in-up">
            <button
              className="absolute top-4 right-4 ghost-btn"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            <SectionTitle title="新增净化器设备" />

            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <label className="label-base">房间名称 *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="如：客厅、主卧室"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">设备型号 *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="如：米家空气净化器 4 Pro"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">适用面积(㎡) *</label>
                <input
                  type="number"
                  className="input-base"
                  placeholder="60"
                  value={formArea}
                  onChange={(e) =>
                    setFormArea(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label className="label-base">滤芯规格 *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="如：米家 Pro-H 滤芯"
                  value={formFilterSpec}
                  onChange={(e) => setFormFilterSpec(e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">购买日期 *</label>
                <input
                  type="date"
                  className="input-base"
                  value={formPurchaseDate}
                  onChange={(e) => setFormPurchaseDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">照片URL</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="留空将使用默认图片"
                  value={formPhoto}
                  onChange={(e) => setFormPhoto(e.target.value)}
                />
              </div>
              <div>
                <label className="label-base">滤芯寿命天数</label>
                <input
                  type="number"
                  className="input-base"
                  placeholder="180"
                  value={formExpectedDays}
                  onChange={(e) =>
                    setFormExpectedDays(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label className="label-base">初始PM2.5(μg/m³)</label>
                <input
                  type="number"
                  className="input-base"
                  placeholder="35"
                  value={formPM25}
                  onChange={(e) =>
                    setFormPM25(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                取消
              </button>
              <button className="primary-btn" onClick={handleSaveDevice}>
                <CheckCircle className="w-4 h-4" strokeWidth={2} />
                <span>保存设备</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
