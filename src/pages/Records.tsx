import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, getEarLabel, getFeedbackTypeEmoji, getFeedbackTypeLabel } from '@/store/useStore';
import { Plus, Filter, Battery, Sparkles, CheckCircle2, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { BatteryForm, CleanForm } from '@/components/RecordForms';
import type { AnyRecord, RecordFilter, FeedbackType } from '@/types';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Records() {
  const navigate = useNavigate();
  const devices = useStore((s) => s.devices);
  const batteryRecords = useStore((s) => s.batteryRecords);
  const cleanRecords = useStore((s) => s.cleanRecords);
  const feedbacks = useStore((s) => s.feedbacks);
  const getDeviceById = useStore((s) => s.getDeviceById);
  const addBatteryRecord = useStore((s) => s.addBatteryRecord);
  const addCleanRecord = useStore((s) => s.addCleanRecord);
  const deleteBatteryRecord = useStore((s) => s.deleteBatteryRecord);
  const deleteCleanRecord = useStore((s) => s.deleteCleanRecord);

  const [filter, setFilter] = useState<RecordFilter>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState<null | 'battery' | 'clean'>(null);
  const [deleteRecord, setDeleteRecord] = useState<{ id: string; type: 'battery' | 'clean' } | null>(
    null,
  );

  const allRecords = useMemo((): AnyRecord[] => {
    let bat: AnyRecord[] = batteryRecords.map((r) => ({
      ...r,
      recordType: 'battery' as const,
    }));
    let cln: AnyRecord[] = cleanRecords.map((r) => ({
      ...r,
      recordType: 'clean' as const,
    }));
    if (deviceFilter !== 'all') {
      bat = bat.filter((r) => r.deviceId === deviceFilter);
      cln = cln.filter((r) => r.deviceId === deviceFilter);
    }
    if (filter === 'battery') cln = [];
    if (filter === 'clean') bat = [];
    return [...bat, ...cln].sort((a, b) => b.date.localeCompare(a.date));
  }, [batteryRecords, cleanRecords, filter, deviceFilter]);

  const recentFeedbacks = useMemo(
    () =>
      [...feedbacks]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [feedbacks],
  );

  if (devices.length === 0) {
    return (
      <div className="container py-16 text-center">
        <div className="text-6xl mb-6">👂</div>
        <h2 className="text-2xl font-bold text-accent-blue mb-3">请先添加设备</h2>
        <p className="text-warm-400 mb-6">添加助听器设备后才能开始记录</p>
        <button onClick={() => navigate('/devices')} className="btn-primary">
          <Plus size={18} />
          去添加设备
        </button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold text-accent-blue">📋 记录中心</h2>
          <p className="text-warm-400 mt-2">
            共 {batteryRecords.length + cleanRecords.length} 条维护记录
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowModal('clean')}
            className="btn-secondary"
          >
            <Sparkles size={18} />
            清洁记录
          </button>
          <button onClick={() => setShowModal('battery')} className="btn-primary">
            <Battery size={18} />
            换电池记录
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2 flex-1">
                <Filter size={18} className="text-warm-400" />
                <div className="flex p-1 bg-warm-50 rounded-xl w-full sm:w-auto">
                  {[
                    { key: 'all' as RecordFilter, label: '全部' },
                    { key: 'battery' as RecordFilter, label: '🔋 换电' },
                    { key: 'clean' as RecordFilter, label: '✨ 清洁' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-initial ${
                        filter === tab.key
                          ? 'bg-white text-accent-blue shadow-soft'
                          : 'text-warm-400 hover:text-accent-blue'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <select
                className="input sm:w-64"
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
              >
                <option value="all">全部设备</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {allRecords.length === 0 ? (
              <div className="py-20 text-center text-warm-400">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg mb-2">暂无符合条件的记录</p>
                <p className="text-sm">点击右上角按钮开始添加第一条记录</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-200 via-warm-100 to-warm-100 rounded-full" />
                <div className="space-y-5">
                  {allRecords.map((record, idx) => {
                    const device = getDeviceById(record.deviceId);
                    return (
                      <div
                        key={record.id}
                        className="relative pl-16 animate-slide-in"
                        style={{ animationDelay: `${idx * 0.03}s` }}
                      >
                        <div
                          className={`absolute left-2 top-4 w-9 h-9 rounded-full flex items-center justify-center shadow-card ${
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
                        <div className="bg-gradient-to-br from-warm-50 to-white rounded-2xl p-5 border border-warm-100 hover:shadow-card transition-all cursor-pointer group"
                          onClick={() => navigate(`/devices/${record.deviceId}`)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-3">
                                <p className="font-bold text-lg text-accent-blue">
                                  {record.recordType === 'battery' ? '🔋 更换电池' : '✨ 清洁维护'}
                                </p>
                                <span className="tag bg-white text-warm-500 border border-warm-100">
                                  {format(parseISO(record.date), 'MM月dd日 EEEE', {
                                    locale: zhCN,
                                  })}
                                </span>
                                {device && (
                                  <span className="tag bg-brand-50 text-brand-700">
                                    👂 {device.name}
                                  </span>
                                )}
                                {record.recordType === 'battery' && record.hasLeakage && (
                                  <span className="tag bg-accent-red/10 text-accent-red">
                                    ⚠️ 旧电池漏液
                                  </span>
                                )}
                              </div>

                              {record.recordType === 'battery' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  <div className="p-3 bg-white rounded-xl">
                                    <p className="text-xs text-warm-400">剩余电量</p>
                                    <p className="font-bold text-accent-blue text-lg">
                                      {record.remainingPercent}%
                                    </p>
                                  </div>
                                  <div className="p-3 bg-white rounded-xl">
                                    <p className="text-xs text-warm-400">更换人</p>
                                    <p className="font-bold text-accent-blue text-lg">
                                      {record.replacedBy}
                                    </p>
                                  </div>
                                  {device && (
                                    <div className="p-3 bg-white rounded-xl">
                                      <p className="text-xs text-warm-400">电池规格</p>
                                      <p className="font-bold text-accent-blue text-lg">
                                        #{device.batterySize}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <p className="text-xs text-warm-400 mb-2">清洁项目</p>
                                  <div className="flex flex-wrap gap-2">
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
                                      ) : (
                                        <span
                                          key={item.k}
                                          className="tag bg-warm-100 text-warm-400 gap-1 line-through"
                                        >
                                          {item.label}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                  <p className="text-sm text-warm-500 mt-3">
                                    清洁人：
                                    <span className="font-bold text-accent-blue">
                                      {record.cleanedBy}
                                    </span>
                                  </p>
                                </div>
                              )}

                              {record.notes && (
                                <div className="mt-4 p-4 bg-white/70 rounded-2xl border-l-4 border-brand-300">
                                  <p className="text-sm text-warm-600">💬 {record.notes}</p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteRecord({
                                  id: record.id,
                                  type: record.recordType,
                                });
                              }}
                              className="w-10 h-10 rounded-xl bg-white hover:bg-red-50 flex items-center justify-center text-warm-300 hover:text-accent-red transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
            <h3 className="text-lg font-bold text-accent-blue mb-4 flex items-center gap-2">
              📊 统计概览
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-white border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                      <Battery size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-warm-400">换电池</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {batteryRecords.length}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-warm-400">次</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-white border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-warm-400">清洁维护</p>
                      <p className="text-2xl font-bold text-green-600">
                        {cleanRecords.length}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-warm-400">次</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-accent-red/5 to-white border border-accent-red/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-red flex items-center justify-center text-white">
                      ⚠️
                    </div>
                    <div>
                      <p className="text-xs text-warm-400">待处理异常</p>
                      <p className="text-2xl font-bold text-accent-red">
                        {feedbacks.filter((f) => f.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-warm-400">条</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-bold text-accent-blue mb-4 flex items-center gap-2">
              🔔 最近异常
            </h3>
            {recentFeedbacks.length === 0 ? (
              <p className="text-sm text-warm-400 text-center py-6">暂无异常反馈</p>
            ) : (
              <div className="space-y-3">
                {recentFeedbacks.map((fb) => {
                  const device = getDeviceById(fb.deviceId);
                  return (
                    <div
                      key={fb.id}
                      onClick={() => navigate('/checklist')}
                      className="p-3 rounded-xl bg-warm-50 hover:bg-accent-red/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getFeedbackTypeEmoji(fb.type as FeedbackType)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-accent-blue">
                              {getFeedbackTypeLabel(fb.type as FeedbackType)}
                            </p>
                            {fb.status === 'pending' ? (
                              <span className="tag bg-accent-red/10 text-accent-red text-xs py-0.5">
                                待处理
                              </span>
                            ) : (
                              <span className="tag bg-green-100 text-green-700 text-xs py-0.5">
                                已解决
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-warm-400 mt-0.5">
                            {device?.name} ·{' '}
                            {format(parseISO(fb.date), 'M月d日', { locale: zhCN })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showModal === 'battery'}
        onClose={() => setShowModal(null)}
        title="🔋 记录换电池"
      >
        <BatteryForm
          onSubmit={(data) => {
            addBatteryRecord(data);
            setShowModal(null);
          }}
          onCancel={() => setShowModal(null)}
        />
      </Modal>

      <Modal
        open={showModal === 'clean'}
        onClose={() => setShowModal(null)}
        title="✨ 清洁维护记录"
      >
        <CleanForm
          onSubmit={(data) => {
            addCleanRecord(data);
            setShowModal(null);
          }}
          onCancel={() => setShowModal(null)}
        />
      </Modal>

      <Modal
        open={deleteRecord !== null}
        onClose={() => setDeleteRecord(null)}
        title="🗑️ 删除记录"
      >
        <div className="space-y-5">
          <p className="text-warm-500">确定要删除这条记录吗？此操作不可撤销。</p>
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
        </div>
      </Modal>
    </div>
  );
}
