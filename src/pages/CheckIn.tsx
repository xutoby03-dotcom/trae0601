import { useEffect, useState } from 'react';
import { useAppStore, api } from '@/store/appStore';
import SessionSelector from '@/components/SessionSelector';
import { QRCodeSVG } from 'qrcode.react';
import type { Registration } from '../../shared/types';
import {
  QrCode,
  CheckCircle,
  Clock,
  Unlock,
  Search,
  Users,
  Heart,
  Baby,
  Accessibility,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const areaLabels: Record<string, string> = {
  A: 'A区 · 老人亲子',
  B: 'B区 · 普通观众',
  C: 'C区 · 野餐垫',
  wheelchair: '♿ 无障碍',
};

const areaColors: Record<string, string> = {
  A: 'bg-warm-orange-100 text-warm-orange-700',
  B: 'bg-night-teal-100 text-night-teal-700',
  C: 'bg-forest/15 text-forest',
  wheelchair: 'bg-night-teal-50 text-night-teal-600 border border-night-teal-200',
};

export default function Checkin() {
  const { selectedSessionId, registrations, fetchRegistrations } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'registered' | 'checked_in' | 'released'>('all');
  const [qrSession, setQrSession] = useState<any>(null);

  useEffect(() => {
    if (selectedSessionId) {
      fetchRegistrations(selectedSessionId);
      loadQrData(selectedSessionId);
    }
  }, [selectedSessionId, fetchRegistrations]);

  const loadQrData = async (sid: string) => {
    try {
      const data = await api(`/api/checkin/qrcode/${sid}`);
      setQrSession(data);
    } catch {}
  };

  const handleCheckin = async (id: string) => {
    await api(`/api/checkin/${id}`, { method: 'POST' });
    fetchRegistrations(selectedSessionId);
  };

  const handleRelease = async (id: string) => {
    if (!confirm('确定释放该座位吗？迟到超时的座位可被他人使用。')) return;
    await api(`/api/checkin/release/${id}`, { method: 'POST' });
    fetchRegistrations(selectedSessionId);
  };

  const filtered = registrations
    .filter((r) => (filter === 'all' ? true : r.status === filter))
    .filter((r) => r.name.includes(search) || r.phone.includes(search));

  const stats = {
    total: registrations.length,
    checkedIn: registrations.filter((r) => r.status === 'checked_in').length,
    pending: registrations.filter((r) => r.status === 'registered').length,
    released: registrations.filter((r) => r.status === 'released').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-night-teal-800 mb-1">扫码签到</h1>
          <p className="text-night-teal-500">居民到场扫码或管理员手动签到，管理座位分配</p>
        </div>
        <SessionSelector />
      </div>

      {qrSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card p-8 text-center opacity-0 animate-fade-in-up stagger-1 lg:col-span-1">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 rounded-3xl bg-warm-orange-400/20 animate-pulse-ring" />
              <div className="relative bg-white p-4 rounded-3xl border-4 border-night-teal-100">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'checkin',
                    sessionId: qrSession.sessionId,
                    title: qrSession.title,
                  })}
                  size={200}
                  level="H"
                  includeMargin={false}
                  fgColor="#0d4f4f"
                />
              </div>
            </div>
            <h3 className="font-display text-xl text-night-teal-800 mb-1">{qrSession.title}</h3>
            <p className="text-sm text-night-teal-500 mb-1">
              📅 {qrSession.date} {qrSession.time}
            </p>
            <p className="text-sm text-night-teal-500">📍 {qrSession.venue}</p>
            <p className="text-xs text-night-teal-400 mt-4">请让居民使用手机扫描此二维码</p>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatMini label="报名家庭" value={stats.total} icon={<Users size={18} />} color="bg-night-teal-100 text-night-teal-700" stagger="stagger-1" />
              <StatMini label="已签到" value={stats.checkedIn} icon={<CheckCircle size={18} />} color="bg-forest/15 text-forest" stagger="stagger-2" />
              <StatMini label="待签到" value={stats.pending} icon={<Clock size={18} />} color="bg-warm-orange-100 text-warm-orange-600" stagger="stagger-3" />
              <StatMini label="已释放" value={stats.released} icon={<Unlock size={18} />} color="bg-night-teal-50 text-night-teal-500" stagger="stagger-4" />
            </div>

            <div className="card p-5 opacity-0 animate-fade-in-up stagger-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div className="flex gap-2 flex-wrap">
                  {([
                    { id: 'all', label: '全部' },
                    { id: 'registered', label: '待签到' },
                    { id: 'checked_in', label: '已签到' },
                    { id: 'released', label: '已释放' },
                  ] as const).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        filter === f.id
                          ? 'bg-night-teal-800 text-white shadow-md'
                          : 'bg-night-teal-50 text-night-teal-600 hover:bg-night-teal-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night-teal-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜索姓名或电话..."
                    className="input-field pl-10 pr-4 py-2 w-56 !text-sm"
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center text-night-teal-400">
                  <QrCode size={48} className="mx-auto mb-3 opacity-30" />
                  <p>暂无签到记录</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filtered.map((r, i) => (
                    <CheckinRow
                      key={r.id}
                      registration={r}
                      stagger={`stagger-${(i % 6) + 1}`}
                      onCheckin={() => handleCheckin(r.id)}
                      onRelease={() => handleRelease(r.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatMini({
  label,
  value,
  icon,
  color,
  stagger,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  stagger: string;
}) {
  return (
    <div className={`card p-4 opacity-0 animate-fade-in-up ${stagger}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        <div>
          <p className="text-xs text-night-teal-500">{label}</p>
          <p className="font-display text-2xl text-night-teal-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

function CheckinRow({
  registration,
  stagger,
  onCheckin,
  onRelease,
}: {
  registration: Registration;
  stagger: string;
  onCheckin: () => void;
  onRelease: () => void;
}) {
  const statusMap = {
    registered: { label: '待签到', color: 'bg-warm-orange-100 text-warm-orange-700', icon: Clock },
    checked_in: { label: '已签到', color: 'bg-forest/15 text-forest', icon: CheckCircle },
    released: { label: '已释放', color: 'bg-night-teal-100 text-night-teal-500', icon: Unlock },
  };
  const s = statusMap[registration.status];
  const StatusIcon = s.icon;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-cream/40 border border-night-teal-50 opacity-0 animate-fade-in-up ${stagger} hover:bg-cream/70 transition-colors`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-night-teal-100 to-night-teal-200 flex items-center justify-center shrink-0">
          <span className="font-display text-xl text-night-teal-700">{registration.name.charAt(0)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-night-teal-800">{registration.name}</p>
            <span className={`badge ${s.color} flex items-center gap-1`}>
              <StatusIcon size={12} /> {s.label}
            </span>
            <span className={`badge ${areaColors[registration.area]} flex items-center gap-1`}>
              <MapPin size={12} /> {areaLabels[registration.area]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-night-teal-500">
            <span className="flex items-center gap-1">
              <Users size={12} /> {registration.peopleCount}人
            </span>
            {registration.elderlyCount > 0 && (
              <span className="flex items-center gap-1 text-warm-orange-600">
                <Heart size={12} /> 老人{registration.elderlyCount}
              </span>
            )}
            {registration.childCount > 0 && (
              <span className="flex items-center gap-1 text-night-teal-600">
                <Baby size={12} /> 小孩{registration.childCount}
              </span>
            )}
            {registration.needWheelchair && (
              <span className="flex items-center gap-1 text-forest">
                <Accessibility size={12} /> 轮椅位
              </span>
            )}
            <span>{registration.phone}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 sm:justify-end">
        {registration.status === 'registered' && (
          <>
            <button onClick={onCheckin} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
              <CheckCircle size={15} /> 签到
            </button>
            <button onClick={onRelease} className="btn-outline !py-2 !px-4 text-sm flex items-center gap-1.5 !border-warm-orange-300 text-warm-orange-600 hover:!bg-warm-orange-50">
              <RefreshCw size={15} /> 释放
            </button>
          </>
        )}
        {registration.status === 'checked_in' && (
          <span className="badge bg-forest/15 text-forest text-sm py-1.5 px-4">
            <CheckCircle size={14} className="inline mr-1" /> 已入场
          </span>
        )}
        {registration.status === 'released' && (
          <span className="badge bg-night-teal-100 text-night-teal-500 text-sm py-1.5 px-4">
            <Unlock size={14} className="inline mr-1" /> 座位已释放
          </span>
        )}
      </div>
    </div>
  );
}
