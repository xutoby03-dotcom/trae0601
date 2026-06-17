import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, getEarLabel, getFeedbackTypeEmoji, getFeedbackTypeLabel } from '@/store/useStore';
import { Battery, Package, AlertTriangle, CalendarDays, ArrowRight, Sparkles, Plus, ShoppingCart } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Modal from '@/components/Modal';
import StockModal from '@/components/StockModal';
import { BatteryForm, CleanForm, FeedbackForm } from '@/components/RecordForms';
import type { BatterySize } from '@/types';

type ModalType = 'battery' | 'clean' | 'feedback' | null;

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockDefaultSize, setStockDefaultSize] = useState<BatterySize | undefined>(undefined);

  const devices = useStore((s) => s.devices);
  const batteryStock = useStore((s) => s.batteryStock);
  const feedbacks = useStore((s) => s.feedbacks);
  const getDeviceBatteryDaysLeft = useStore((s) => s.getDeviceBatteryDaysLeft);
  const getDeviceNextBatteryDate = useStore((s) => s.getDeviceNextBatteryDate);
  const getDeviceById = useStore((s) => s.getDeviceById);
  const addBatteryRecord = useStore((s) => s.addBatteryRecord);
  const addCleanRecord = useStore((s) => s.addCleanRecord);
  const addFeedback = useStore((s) => s.addFeedback);

  const today = new Date();

  const batteryAlerts = useMemo(() => {
    return devices
      .map((d) => {
        const nextDate = getDeviceNextBatteryDate(d.id);
        return {
          device: d,
          daysLeft: getDeviceBatteryDaysLeft(d.id),
          nextDate,
        };
      })
      .filter((x) => x.daysLeft <= 3)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [devices, getDeviceBatteryDaysLeft, getDeviceNextBatteryDate]);

  const lowStockBatteries = useMemo(() => {
    return batteryStock
      .filter((s) => s.quantity <= 5)
      .sort((a, b) => a.quantity - b.quantity);
  }, [batteryStock]);

  const totalStock = batteryStock.reduce((sum, s) => sum + s.quantity, 0);

  const recentFeedbacks = useMemo(() => {
    return feedbacks
      .filter((f) => f.status === 'pending')
      .slice(0, 4);
  }, [feedbacks]);

  const checkupAlerts = useMemo(() => {
    return devices
      .filter((d) => d.nextCheckup)
      .map((d) => ({
        device: d,
        daysLeft: differenceInDays(parseISO(d.nextCheckup!), today),
      }))
      .filter((x) => x.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [devices]);

  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 6) return '夜深了，注意休息 🌙';
    if (hour < 12) return '早上好 ☀️';
    if (hour < 14) return '中午好 🍚';
    if (hour < 18) return '下午好 ☕';
    return '晚上好 🌆';
  }, []);

  const handleQuickAction = (type: ModalType) => {
    if (devices.length === 0) {
      alert('请先添加助听器设备');
      navigate('/devices');
      return;
    }
    setActiveModal(type);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-400 to-brand-300 p-8 shadow-card animate-fade-in-up">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-brand-100 text-lg">{greeting}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            今天是{format(today, 'yyyy年M月d日 EEEE', { locale: zhCN })}
          </h2>
          <p className="text-brand-50 mt-3 text-lg">
            共管理 <span className="font-bold text-white">{devices.length}</span> 台助听器，
            电池库存 <span className="font-bold text-white">{totalStock}</span> 颗
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => handleQuickAction('battery')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-600 rounded-2xl font-bold shadow-soft hover:shadow-hover transition-all hover:-translate-y-0.5"
            >
              <Battery size={20} />
              记录换电池
            </button>
            <button
              onClick={() => handleQuickAction('clean')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/20 backdrop-blur text-white rounded-2xl font-bold border-2 border-white/30 hover:bg-white/30 transition-all hover:-translate-y-0.5"
            >
              <Sparkles size={20} />
              做清洁
            </button>
            <button
              onClick={() => handleQuickAction('feedback')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-accent-red text-white rounded-2xl font-bold shadow-soft hover:bg-[#D35A40] transition-all hover:-translate-y-0.5"
            >
              <AlertTriangle size={20} />
              报异常
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-orange to-[#DEB650] flex items-center justify-center shadow-soft">
                <Battery size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-accent-blue">近期换电提醒</h3>
                <p className="text-sm text-warm-400">未来三天内需要更换电池</p>
              </div>
            </div>
            {batteryAlerts.length > 0 && (
              <span className="tag bg-accent-red/10 text-accent-red font-bold">
                {batteryAlerts.length} 台
              </span>
            )}
          </div>

          {batteryAlerts.length === 0 ? (
            <div className="py-12 text-center text-warm-400">
              <div className="text-5xl mb-3">😊</div>
              <p>所有设备电池状态良好</p>
            </div>
          ) : (
            <div className="space-y-3">
              {batteryAlerts.map(({ device, daysLeft, nextDate }) => (
                <div
                  key={device.id}
                  onClick={() => navigate(`/devices/${device.id}`)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-warm-50 hover:bg-brand-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{device.ear === 'left' ? '👈' : '👉'}</span>
                    <div>
                      <p className="font-bold text-accent-blue">{device.name}</p>
                      <p className="text-sm text-warm-400">
                        {getEarLabel(device.ear)} · #{device.batterySize}电池
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`inline-flex tag font-bold ${
                          daysLeft <= 1
                            ? 'bg-accent-red text-white animate-pulse-soft'
                            : daysLeft === 2
                            ? 'bg-accent-orange text-accent-blue'
                            : 'bg-brand-100 text-brand-700'
                        }`}
                      >
                        {daysLeft === 0
                          ? '今天到期'
                          : daysLeft === 1
                          ? '明天到期'
                          : `还有${daysLeft}天`}
                      </span>
                      {nextDate && (
                        <p className="text-sm text-warm-500 mt-1">
                          📅 {format(parseISO(nextDate), 'M月d日 EEEE', { locale: zhCN })}
                        </p>
                      )}
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-warm-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-soft">
                <Package size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-accent-blue">电池库存总览</h3>
                <p className="text-sm text-warm-400">低库存请及时补充备货</p>
              </div>
            </div>
            <button
              onClick={() => {
                setStockDefaultSize(undefined);
                setShowStockModal(true);
              }}
              className="btn-secondary py-2"
            >
              <Plus size={16} />
              补货
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {batteryStock.map((s) => {
              const isLow = s.quantity <= 5;
              const isVeryLow = s.quantity <= 2;
              const isOut = s.quantity === 0;
              return (
                <div
                  key={s.size}
                  className={`p-4 rounded-2xl text-center transition-all relative group ${
                    isOut
                      ? 'bg-accent-red/15 border-2 border-accent-red shadow-soft'
                      : isVeryLow
                      ? 'bg-accent-red/10 border-2 border-accent-red/50 animate-pulse-soft'
                      : isLow
                      ? 'bg-accent-orange/10 border-2 border-accent-orange/40'
                      : 'bg-warm-50 border-2 border-transparent hover:border-brand-200'
                  }`}
                >
                  {isOut && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent-red text-white text-xs font-bold rounded-full shadow-soft">
                      缺货！
                    </div>
                  )}
                  {isVeryLow && !isOut && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent-red text-white text-xs font-bold rounded-full shadow-soft">
                      紧急
                    </div>
                  )}
                  {isLow && !isVeryLow && !isOut && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent-orange text-accent-blue text-xs font-bold rounded-full shadow-soft">
                      偏低
                    </div>
                  )}
                  <p className="text-xs text-warm-400 mb-1">#{s.size}号电池</p>
                  <p
                    className={`text-4xl font-bold ${
                      isOut
                        ? 'text-accent-red'
                        : isVeryLow
                        ? 'text-accent-red animate-pulse-soft'
                        : isLow
                        ? 'text-accent-orange'
                        : 'text-accent-blue'
                    }`}
                  >
                    {s.quantity}
                  </p>
                  <p className="text-xs text-warm-400 mt-1">
                    {isOut ? '已缺货' : isVeryLow ? '库存紧急' : isLow ? '库存偏低' : '充足'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStockDefaultSize(s.size as BatterySize);
                      setShowStockModal(true);
                    }}
                    className="mt-3 w-full py-2 rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100 bg-brand-500 text-white hover:bg-brand-600"
                  >
                    + 补货
                  </button>
                </div>
              );
            })}
          </div>

          {lowStockBatteries.length > 0 && (
            <div
              className={`p-5 rounded-2xl border-2 ${
                lowStockBatteries.some((s) => s.quantity === 0)
                  ? 'bg-accent-red/10 border-accent-red/40 animate-pulse-soft'
                  : 'bg-accent-orange/10 border-accent-orange/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={22}
                  className={
                    lowStockBatteries.some((s) => s.quantity === 0)
                      ? 'text-accent-red mt-0.5'
                      : 'text-accent-orange mt-0.5'
                  }
                />
                <div className="flex-1">
                  <p
                    className={`font-bold ${
                      lowStockBatteries.some((s) => s.quantity === 0)
                        ? 'text-accent-red'
                        : 'text-accent-orange'
                    }`}
                  >
                    {lowStockBatteries.some((s) => s.quantity === 0)
                      ? '⚠️ 有电池已缺货！请立即补货'
                      : '⚠️ 以下电池库存偏低，建议尽快补货'}
                  </p>
                  <p className="text-sm text-warm-500 mt-1">
                    {lowStockBatteries
                      .map((s) =>
                        s.quantity === 0
                          ? `#${s.size}号 已缺货！`
                          : `#${s.size}号 仅剩 ${s.quantity} 颗`,
                      )
                      .join('，')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const needRestock = lowStockBatteries.find((s) => s.quantity === 0) ?? lowStockBatteries[0];
                    setStockDefaultSize(needRestock.size as BatterySize);
                    setShowStockModal(true);
                  }}
                  className="btn-primary py-2.5"
                >
                  <ShoppingCart size={16} />
                  去补货
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-red to-[#D35A40] flex items-center justify-center shadow-soft">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-accent-blue">最近异常反馈</h3>
                <p className="text-sm text-warm-400">待处理的问题记录</p>
              </div>
            </div>
            {recentFeedbacks.length > 0 && (
              <span className="tag bg-accent-red/10 text-accent-red font-bold">
                {recentFeedbacks.length} 条待处理
              </span>
            )}
          </div>

          {recentFeedbacks.length === 0 ? (
            <div className="py-12 text-center text-warm-400">
              <div className="text-5xl mb-3">🎉</div>
              <p>暂无待处理的异常反馈</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFeedbacks.map((fb) => {
                const device = getDeviceById(fb.deviceId);
                return (
                  <div
                    key={fb.id}
                    onClick={() => navigate('/checklist')}
                    className="flex items-start justify-between p-4 rounded-2xl bg-warm-50 hover:bg-accent-red/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getFeedbackTypeEmoji(fb.type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-accent-blue">
                            {getFeedbackTypeLabel(fb.type)}
                          </p>
                          <span className="text-xs text-warm-400">
                            {device?.name}
                          </span>
                        </div>
                        <p className="text-sm text-warm-500 mt-1 line-clamp-2">
                          {fb.description}
                        </p>
                        <p className="text-xs text-warm-400 mt-1">
                          {format(parseISO(fb.date), 'M月d日', { locale: zhCN })}反馈
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-warm-300 group-hover:text-accent-red group-hover:translate-x-1 transition-all mt-1 flex-shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => navigate('/checklist')}
            className="mt-4 w-full btn-secondary"
          >
            查看完整复查清单
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-brand-700 flex items-center justify-center shadow-soft">
                <CalendarDays size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-accent-blue">复诊提醒</h3>
                <p className="text-sm text-warm-400">下次验配门店复查</p>
              </div>
            </div>
          </div>

          {checkupAlerts.length === 0 ? (
            <div className="py-12 text-center text-warm-400">
              <div className="text-5xl mb-3">📅</div>
              <p>近期没有复诊安排</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkupAlerts.map(({ device, daysLeft }) => (
                <div
                  key={device.id}
                  onClick={() => navigate(`/devices/${device.id}`)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-warm-50 hover:from-brand-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-soft">
                      <CalendarDays size={22} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="font-bold text-accent-blue">{device.name}</p>
                      <p className="text-sm text-warm-400">
                        {device.storeName}
                      </p>
                      <p className="text-xs text-brand-600 mt-0.5">
                        {format(parseISO(device.nextCheckup!), 'yyyy年M月d日', {
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        daysLeft <= 7
                          ? 'text-accent-red'
                          : daysLeft <= 14
                          ? 'text-accent-orange'
                          : 'text-brand-600'
                      }`}
                    >
                      {daysLeft <= 0 ? '今天！' : `${daysLeft}天`}
                    </p>
                    <p className="text-xs text-warm-400">
                      {daysLeft <= 0 ? '就是今天' : '后到期'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={activeModal === 'battery'}
        onClose={() => setActiveModal(null)}
        title="🔋 记录换电池"
        subtitle="新电池已安装，旧电池请妥善回收"
      >
        <BatteryForm
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
        subtitle="定期清洁，保持助听器最佳状态"
      >
        <CleanForm
          onSubmit={(data) => {
            addCleanRecord(data);
            setActiveModal(null);
          }}
          onCancel={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        open={activeModal === 'feedback'}
        onClose={() => setActiveModal(null)}
        title="⚠️ 异常反馈"
        subtitle="提交后自动生成复查清单"
        size="lg"
      >
        <FeedbackForm
          onSubmit={(data) => {
            addFeedback(data);
            setActiveModal(null);
            navigate('/checklist');
          }}
          onCancel={() => setActiveModal(null)}
        />
      </Modal>

      <StockModal
        open={showStockModal}
        onClose={() => setShowStockModal(false)}
        defaultSize={stockDefaultSize}
      />
    </div>
  );
}
