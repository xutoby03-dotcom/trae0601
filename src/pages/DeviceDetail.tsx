import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, getEarLabel } from '@/store/useStore';
import {
  ArrowLeft,
  Edit2,
  Battery,
  Sparkles,
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import Modal from '@/components/Modal';
import DeviceForm from '@/components/DeviceForm';
import { BatteryForm, CleanForm } from '@/components/RecordForms';
import type { AnyRecord, RecordFilter } from '@/types';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Device } from '@/types';

type ModalType = 'edit' | 'battery' | 'clean' | null;

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getDeviceById = useStore((s) => s.getDeviceById);
  const batteryRecords = useStore((s) => s.batteryRecords);
  const cleanRecords = useStore((s) => s.cleanRecords);
  const feedbacks = useStore((s) => s.feedbacks);
  const getDeviceBatteryDaysLeft = useStore((s) => s.getDeviceBatteryDaysLeft);
  const getDeviceNextBatteryDate = useStore((s) => s.getDeviceNextBatteryDate);
  const getDeviceLastBatteryDate = useStore((s) => s.getDeviceLastBatteryDate);
  const updateDevice = useStore((s) => s.updateDevice);
  const addBatteryRecord = useStore((s) => s.addBatteryRecord);
  const addCleanRecord = useStore((s) => s.addCleanRecord);
  const deleteBatteryRecord = useStore((s) => s.deleteBatteryRecord);
  const deleteCleanRecord = useStore((s) => s.deleteCleanRecord);

  const device = id ? getDeviceById(id) : undefined;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [filter, setFilter] = useState<RecordFilter>('all');
  const [deleteRecord, setDeleteRecord] = useState<{ id: string; type: 'battery' | 'clean' } | null>(
    null,
  );

  const allRecords = useMemo((): AnyRecord[] => {
    if (!device) return [];
    const bat: AnyRecord[] = batteryRecords
      .filter((r) => r.deviceId === device.id)
      .map((r) => ({ ...r, recordType: 'battery' as const }));
    const cln: AnyRecord[] = cleanRecords
      .filter((r) => r.deviceId === device.id)
      .map((r) => ({ ...r, recordType: 'clean' as const }));
    const all = [...bat, ...cln].sort((a, b) => b.date.localeCompare(a.date));
    if (filter === 'battery') return all.filter((r) => r.recordType === 'battery');
    if (filter === 'clean') return all.filter((r) => r.recordType === 'clean');
    return all;
  }, [device, batteryRecords, cleanRecords, filter]);

  const pendingFeedbacks = feedbacks.filter(
    (f) => f.deviceId === device?.id && f.status === 'pending',
  );

  if (!device) {
    return (
      <div className="container py-16 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-accent-blue mb-3">设备未找到</h2>
        <p className="text-warm-400 mb-6">该设备可能已被删除</p>
        <button onClick={() => navigate('/devices')} className="btn-secondary">
          <ArrowLeft size={18} />
          返回设备列表
        </button>
      </div>
    );
  }

  const daysLeft = getDeviceBatteryDaysLeft(device.id);
  const nextDate = getDeviceNextBatteryDate(device.id);
  const lastBatteryDate = getDeviceLastBatteryDate(device.id);

  const handleUpdateDevice = (data: Omit<Device, 'id' | 'createdAt'>) => {
    updateDevice(device.id, data);
    setActiveModal(null);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-4 animate-fade-in-up">
        <button
          onClick={() => navigate('/devices')}
          className="w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center text-accent-blue hover:bg-brand-50 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-accent-blue">{device.name}</h2>
            <span
              className={`tag ${
                device.ear === 'left'
                  ? 'bg-blue-100 text-blue-700'
                  : device.ear === 'right'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {getEarLabel(device.ear)}
            </span>
          </div>
          <p className="text-warm-400 mt-1">{device.model}</p>
        </div>
        <button
          onClick={() => setActiveModal('edit')}
          className="btn-secondary"
        >
          <Edit2 size={18} />
          编辑
        </button>
        <button onClick={() => setActiveModal('battery')} className="btn-primary">
          <Battery size={18} />
          换电池
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card overflow-hidden p-0 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="h-52 bg-gradient-to-br from-brand-50 via-warm-50 to-brand-100 overflow-hidden">
              {device.photo ? (
                <img src={device.photo} alt={device.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl opacity-60">👂</span>
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div
                className={`p-4 rounded-2xl ${
                  daysLeft <= 1
                    ? 'bg-accent-red/10 border border-accent-red/20'
                    : daysLeft <= 3
                    ? 'bg-accent-orange/10 border border-accent-orange/20'
                    : 'bg-brand-50 border border-brand-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Battery
                      size={20}
                      className={daysLeft <= 1 ? 'text-accent-red' : 'text-brand-600'}
                    />
                    <span className="font-bold text-accent-blue">下次换电日期</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-2xl font-bold ${
                        daysLeft <= 1
                          ? 'text-accent-red animate-pulse-soft'
                          : daysLeft <= 3
                          ? 'text-accent-orange'
                          : 'text-brand-600'
                      }`}
                    >
                      {nextDate
                        ? format(parseISO(nextDate), 'M月d日', { locale: zhCN })
                        : '--'}
                    </span>
                    <p className="text-xs text-warm-400 mt-0.5">
                      {daysLeft === 0
                        ? '就是今天！'
                        : daysLeft === 1
                        ? '明天到期'
                        : `还有 ${daysLeft} 天`}
                    </p>
                  </div>
                </div>
                {nextDate && (
                  <p className="text-sm text-warm-500 mt-3 pt-3 border-t border-black/5">
                    📆 {format(parseISO(nextDate), 'yyyy年M月d日 EEEE', { locale: zhCN })}
                  </p>
                )}
                {lastBatteryDate && (
                  <p className="text-xs text-warm-400 mt-2">
                    上次更换：{format(parseISO(lastBatteryDate), 'M月d日', { locale: zhCN })}
                    （{device.batteryLifeDays}天一换）
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-warm-400">电池规格</p>
                    <p className="font-bold text-accent-blue">#{device.batterySize} 号</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-warm-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-warm-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-warm-400">验配门店</p>
                    <p className="font-bold text-accent-blue truncate">{device.storeName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-warm-400">保修期至</p>
                    <p className="font-bold text-accent-blue">{device.warrantyDate}</p>
                  </div>
                </div>
                {device.nextCheckup && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-warm-400">下次复诊</p>
                      <p className="font-bold text-accent-blue">{device.nextCheckup}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('clean')}
            className="w-full btn-warning justify-center py-4 text-lg animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <Sparkles size={22} />
            记录清洁维护
          </button>

          {pendingFeedbacks.length > 0 && (
            <div
              className="card p-5 bg-accent-red/5 border border-accent-red/20 animate-fade-in-up"
              style={{ animationDelay: '0.15s' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={20} className="text-accent-red" />
                <p className="font-bold text-accent-red">
                  {pendingFeedbacks.length} 条待处理异常
                </p>
              </div>
              <button
                onClick={() => navigate('/checklist')}
                className="w-full btn-danger"
              >
                查看复查清单
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-accent-blue">📋 历史记录</h3>
                <p className="text-sm text-warm-400 mt-1">
                  共 {allRecords.length} 条记录
                </p>
              </div>
              <div className="flex gap-2 p-1 bg-warm-50 rounded-xl">
                {[
                  { key: 'all' as RecordFilter, label: '全部', count: null },
                  {
                    key: 'battery' as RecordFilter,
                    label: '🔋 换电',
                    count: batteryRecords.filter((r) => r.deviceId === device.id).length,
                  },
                  {
                    key: 'clean' as RecordFilter,
                    label: '✨ 清洁',
                    count: cleanRecords.filter((r) => r.deviceId === device.id).length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === tab.key
                        ? 'bg-white text-accent-blue shadow-soft'
                        : 'text-warm-400 hover:text-accent-blue'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className="ml-1 text-xs opacity-70">({tab.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {allRecords.length === 0 ? (
              <div className="py-16 text-center text-warm-400">
                <div className="text-5xl mb-3">📝</div>
                <p>暂无记录，开始记录第一次换电池或清洁吧</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-warm-100" />
                <div className="space-y-5">
                  {allRecords.map((record, idx) => (
                    <div
                      key={record.id}
                      className="relative pl-16 animate-slide-in"
                      style={{ animationDelay: `${idx * 0.03}s` }}
                    >
                      <div
                        className={`absolute left-2 top-3 w-9 h-9 rounded-full flex items-center justify-center shadow-soft ${
                          record.recordType === 'battery'
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                            : 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                        }`}
                      >
                        {record.recordType === 'battery' ? (
                          <Battery size={16} />
                        ) : (
                          <Sparkles size={16} />
                        )}
                      </div>
                      <div className="bg-warm-50 rounded-2xl p-5 hover:shadow-soft transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-lg text-accent-blue">
                                {record.recordType === 'battery' ? '更换电池' : '清洁维护'}
                              </p>
                              <span className="tag bg-white text-warm-500 shadow-sm">
                                {format(parseISO(record.date), 'yyyy年M月d日', {
                                  locale: zhCN,
                                })}
                              </span>
                              {record.recordType === 'battery' && record.hasLeakage && (
                                <span className="tag bg-accent-red/10 text-accent-red">
                                  漏液
                                </span>
                              )}
                            </div>

                            {record.recordType === 'battery' ? (
                              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-warm-400">剩余电量</p>
                                  <p className="font-bold text-accent-blue">
                                    {record.remainingPercent}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-warm-400">更换人</p>
                                  <p className="font-bold text-accent-blue">
                                    {record.replacedBy}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {[
                                  { k: 'earplug', label: '耳塞' },
                                  { k: 'soundTube', label: '导声管' },
                                  { k: 'dryBox', label: '干燥盒' },
                                  { k: 'microphone', label: '麦克风口' },
                                ].map((item) =>
                                  (record as any)[item.k] ? (
                                    <span
                                      key={item.k}
                                      className="tag bg-green-100 text-green-700 gap-1"
                                    >
                                      <CheckCircle2 size={12} />
                                      {item.label}
                                    </span>
                                  ) : null,
                                )}
                                <span className="text-sm text-warm-400 ml-2 self-center">
                                  清洁人：
                                  <span className="font-bold text-accent-blue">
                                    {record.cleanedBy}
                                  </span>
                                </span>
                              </div>
                            )}

                            {record.notes && (
                              <p className="mt-3 text-sm text-warm-500 bg-white/60 rounded-xl px-4 py-2">
                                💬 {record.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              setDeleteRecord({ id: record.id, type: record.recordType })
                            }
                            className="w-9 h-9 rounded-xl bg-white hover:bg-red-50 flex items-center justify-center text-warm-300 hover:text-accent-red transition-all flex-shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={activeModal === 'edit'}
        onClose={() => setActiveModal(null)}
        title="✏️ 编辑设备"
        size="lg"
      >
        <DeviceForm
          device={device}
          onSubmit={handleUpdateDevice}
          onCancel={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        open={activeModal === 'battery'}
        onClose={() => setActiveModal(null)}
        title="🔋 换电池记录"
      >
        <BatteryForm
          device={device}
          onSubmit={(data) => {
            addBatteryRecord(data);
            setActiveModal(null);
          }}
          onCancel={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        open={activeModal === 'clean'}
        onClose={() => setActiveModal(null)}
        title="✨ 清洁维护记录"
      >
        <CleanForm
          device={device}
          onSubmit={(data) => {
            addCleanRecord(data);
            setActiveModal(null);
          }}
          onCancel={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        open={deleteRecord !== null}
        onClose={() => setDeleteRecord(null)}
        title="🗑️ 删除记录"
        subtitle="确定要删除这条记录吗？"
      >
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteRecord(null)} className="btn-secondary">
            取消
          </button>
          <button
            onClick={() => {
              if (deleteRecord) {
                if (deleteRecord.type === 'battery') {
                  deleteBatteryRecord(deleteRecord.id);
                } else {
                  deleteCleanRecord(deleteRecord.id);
                }
              }
              setDeleteRecord(null);
            }}
            className="btn-danger"
          >
            <Trash2 size={18} />
            确认删除
          </button>
        </div>
      </Modal>
    </div>
  );
}
