import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Ticket,
  Link as LinkIcon,
  ChevronRight,
  Sparkles,
  AlertCircle,
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

type QRMode = 'master' | { type: 'single'; regId: string; code: string; name: string };

export default function Checkin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    selectedSessionId,
    registrations,
    fetchSessions,
    setSelectedSessionId,
    refreshAllForSession,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'registered' | 'checked_in' | 'released'>('all');
  const [qrSession, setQrSession] = useState<any>(null);
  const [qrMode, setQrMode] = useState<QRMode>('master');
  const [highlightedRegId, setHighlightedRegId] = useState<string | null>(null);
  const [verifiedCodeInfo, setVerifiedCodeInfo] = useState<any>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const [paramApplied, setParamApplied] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (paramApplied) return;
    const urlSessionId = searchParams.get('sessionId');
    const urlRegId = searchParams.get('regId');
    const urlCode = searchParams.get('code');

    if (urlSessionId) {
      setSelectedSessionId(urlSessionId);
      setParamApplied(true);
      if (urlRegId) {
        setHighlightedRegId(urlRegId);
        setQrMode({ type: 'single', regId: urlRegId, code: urlCode || '', name: '' });
        if (urlCode) {
          api(`/api/checkin/verify-code?code=${encodeURIComponent(urlCode)}`)
            .then((d: any) => {
              if (d.valid && d.registration) {
                setVerifiedCodeInfo(d);
                setQrMode({
                  type: 'single',
                  regId: d.registration.id,
                  code: urlCode,
                  name: d.registration.name,
                });
              }
            })
            .catch(() => {});
        }
      }
    } else {
      setParamApplied(true);
    }
  }, [searchParams, paramApplied, setSelectedSessionId]);

  useEffect(() => {
    if (selectedSessionId) {
      refreshAllForSession(selectedSessionId);
      loadQrData(selectedSessionId);
    }
  }, [selectedSessionId, refreshAllForSession]);

  const loadQrData = async (sid: string) => {
    try {
      const data = await api(`/api/checkin/qrcode/${sid}`);
      setQrSession(data);
    } catch {}
  };

  const showToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2800);
  };

  const handleCheckin = async (id: string) => {
    try {
      const reg = await api<any>(`/api/checkin/${id}`, { method: 'POST' });
      await refreshAllForSession(selectedSessionId);
      showToast('success', `✓ ${reg.name || '居民'} 签到成功，已分配至${areaLabels[reg.area] || '座位'}`);
      if (verifiedCodeInfo?.registration?.id === id) setVerifiedCodeInfo(null);
    } catch (e: any) {
      showToast('error', e.message || '签到失败');
    }
  };

  const handleRelease = async (id: string) => {
    if (!confirm('确定释放该座位吗？迟到超时的座位可被他人使用，相关人数将在看板中回算。')) return;
    try {
      await api(`/api/checkin/release/${id}`, { method: 'POST' });
      await refreshAllForSession(selectedSessionId);
      showToast('info', '座位已释放，看板人数已回算更新');
    } catch (e: any) {
      showToast('error', e.message || '释放失败');
    }
  };

  const switchSession = (sid: string) => {
    setSelectedSessionId(sid);
    setQrMode('master');
    setHighlightedRegId(null);
    setVerifiedCodeInfo(null);
    setSearchParams({});
    setFilter('all');
    setSearch('');
  };

  const filtered = useMemo(() => {
    return registrations
      .filter((r) => (filter === 'all' ? true : r.status === filter))
      .filter((r) => r.name.includes(search) || r.phone.includes(search) || r.id.includes(search));
  }, [registrations, filter, search]);

  const stats = useMemo(() => {
    const validRegs = registrations.filter((r) => r.status !== 'released');
    return {
      total: validRegs.reduce((s, r) => s + r.peopleCount, 0),
      totalRegs: registrations.length,
      checkedIn: registrations.filter((r) => r.status === 'checked_in').reduce((s, r) => s + r.peopleCount, 0),
      pending: registrations.filter((r) => r.status === 'registered').reduce((s, r) => s + r.peopleCount, 0),
      released: registrations.filter((r) => r.status === 'released').reduce((s, r) => s + r.peopleCount, 0),
      releasedRegs: registrations.filter((r) => r.status === 'released').length,
    };
  }, [registrations]);

  const qrPayload = useMemo(() => {
    if (!qrSession) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (qrMode === 'master') {
      return `${origin}/checkin?sessionId=${qrSession.sessionId}`;
    }
    const reg = qrSession?.registrations?.find((r: any) => r.id === qrMode.regId);
    const code = qrMode.code || reg?.code || '';
    return `${origin}/checkin?sessionId=${qrSession.sessionId}&regId=${qrMode.regId}&code=${encodeURIComponent(code)}`;
  }, [qrSession, qrMode]);

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-card-hover border animate-fade-in-up ${
            toast.type === 'success'
              ? 'bg-forest text-white border-forest/50'
              : toast.type === 'error'
              ? 'bg-red-500 text-white border-red-400'
              : 'bg-night-teal-700 text-white border-night-teal-600'
          }`}
        >
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-night-teal-800 mb-1">扫码签到</h1>
          <p className="text-night-teal-500">居民到场扫码或管理员手动签到，管理座位分配</p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <SessionSelectorWrapper onChange={switchSession} currentId={selectedSessionId} />
        </div>
      </div>

      {verifiedCodeInfo && verifiedCodeInfo.registration.status !== 'checked_in' && (
        <div className="card p-6 opacity-0 animate-fade-in-up stagger-1 border-2 border-warm-orange-300 bg-warm-orange-50/40">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-orange-400 to-warm-orange-600 flex items-center justify-center shadow-glow animate-pulse-ring">
                <Ticket size={32} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-warm-orange-600 font-medium flex items-center gap-1">
                  <Sparkles size={14} /> 扫码识别到签到码
                </p>
                <p className="font-display text-2xl text-night-teal-800">
                  {verifiedCodeInfo.registration.name}，{verifiedCodeInfo.registration.peopleCount}人
                </p>
                <p className="text-sm text-night-teal-500">
                  {verifiedCodeInfo.session?.title} · {verifiedCodeInfo.session?.date} {verifiedCodeInfo.session?.time} · {verifiedCodeInfo.session?.venue}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCheckin(verifiedCodeInfo.registration.id)}
                className="btn-primary text-base !px-6 !py-3 flex items-center gap-2"
              >
                <CheckCircle size={20} /> 确认签到入场
              </button>
              <button
                onClick={() => setVerifiedCodeInfo(null)}
                className="btn-outline"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {qrSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card p-8 text-center opacity-0 animate-fade-in-up stagger-1 lg:col-span-1">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 rounded-3xl bg-warm-orange-400/20 animate-pulse-ring" />
              <div className="relative bg-white p-4 rounded-3xl border-4 border-night-teal-100">
                {qrPayload ? (
                  <QRCodeSVG
                    value={qrPayload}
                    size={200}
                    level="H"
                    includeMargin={false}
                    fgColor="#0d4f4f"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-night-teal-300">
                    <QrCode size={48} />
                  </div>
                )}
              </div>
            </div>

            {qrMode === 'master' ? (
              <>
                <h3 className="font-display text-xl text-night-teal-800 mb-1">
                  📽️ {qrSession.title}
                </h3>
                <p className="text-sm text-night-teal-500 mb-1">
                  📅 {qrSession.date} {qrSession.time}
                </p>
                <p className="text-sm text-night-teal-500">📍 {qrSession.venue}</p>
                <div className="mt-4 p-3 rounded-xl bg-night-teal-50 text-xs text-night-teal-600 text-left">
                  <p className="flex items-center gap-1.5 mb-1">
                    <LinkIcon size={12} /> 场次通用签到码
                  </p>
                  <p className="text-night-teal-500">居民扫码后可搜索自己的姓名或点击报名记录签到</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-warm-orange-600 font-medium mb-1 flex items-center justify-center gap-1">
                  <Ticket size={13} /> 个人专属签到码
                </p>
                <h3 className="font-display text-xl text-night-teal-800 mb-1">
                  {qrMode.name || '居民签到码'}
                </h3>
                <p className="text-sm text-night-teal-500 mb-1">
                  📽️ {qrSession.title}
                </p>
                <p className="text-sm text-night-teal-500">📅 {qrSession.date} {qrSession.time}</p>
                <div className="mt-4 p-3 rounded-xl bg-warm-orange-50 text-xs text-warm-orange-700 text-left">
                  <p className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} /> 扫码即自动识别
                  </p>
                  <p className="text-warm-orange-600">点击下方按钮确认即可入场</p>
                </div>
              </>
            )}

            <div className="mt-5 border-t border-night-teal-50 pt-5">
              <p className="text-xs text-night-teal-400 mb-3">切换二维码模式</p>
              <div className="space-y-2">
                <button
                  onClick={() => setQrMode('master')}
                  className={`w-full text-sm px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                    qrMode === 'master'
                      ? 'bg-night-teal-800 text-white shadow-md'
                      : 'bg-night-teal-50 text-night-teal-700 hover:bg-night-teal-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <QrCode size={16} /> 场次通用码
                  </span>
                  <ChevronRight size={16} />
                </button>
                {qrSession.registrations?.slice(0, 6).map((r: any) => (
                  <button
                    key={r.id}
                    onClick={() =>
                      setQrMode({ type: 'single', regId: r.id, code: r.code, name: r.name })
                    }
                    className={`w-full text-sm px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                      qrMode !== 'master' && qrMode.regId === r.id
                        ? 'bg-warm-orange-500 text-white shadow-md'
                        : 'bg-night-teal-50 text-night-teal-700 hover:bg-warm-orange-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Ticket size={16} /> {r.name} 的专属码
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
                {qrSession.registrations?.length > 6 && (
                  <p className="text-xs text-night-teal-400 pt-1">
                    + 还有 {qrSession.registrations.length - 6} 位居民
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatMini
                label="有效报名人数"
                value={stats.total}
                sub={`${stats.totalRegs} 个家庭`}
                icon={<Users size={18} />}
                color="bg-night-teal-100 text-night-teal-700"
                stagger="stagger-1"
              />
              <StatMini
                label="已签到入场"
                value={stats.checkedIn}
                icon={<CheckCircle size={18} />}
                color="bg-forest/15 text-forest"
                stagger="stagger-2"
              />
              <StatMini
                label="待签到 (待释放)"
                value={stats.pending}
                icon={<Clock size={18} />}
                color="bg-warm-orange-100 text-warm-orange-600"
                stagger="stagger-3"
              />
              <StatMini
                label="已释放座位"
                value={stats.released}
                sub={`${stats.releasedRegs} 条记录`}
                icon={<Unlock size={18} />}
                color="bg-night-teal-50 text-night-teal-500"
                stagger="stagger-4"
              />
            </div>

            <div className="card p-5 opacity-0 animate-fade-in-up stagger-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div className="flex gap-2 flex-wrap">
                  {(
                    [
                      { id: 'all', label: `全部 ${registrations.length}` },
                      { id: 'registered', label: '待签到' },
                      { id: 'checked_in', label: '已签到' },
                      { id: 'released', label: '已释放' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
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
                    placeholder="搜索姓名、电话、签到码..."
                    className="input-field pl-10 pr-4 py-2 w-64 !text-sm"
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
                      highlighted={highlightedRegId === r.id}
                      verified={verifiedCodeInfo?.registration?.id === r.id}
                      onCheckin={() => handleCheckin(r.id)}
                      onRelease={() => handleRelease(r.id)}
                      onShowQR={(name) => {
                        const regInfo = qrSession?.registrations?.find((x: any) => x.id === r.id);
                        setQrMode({
                          type: 'single',
                          regId: r.id,
                          code: regInfo?.code || '',
                          name,
                        });
                      }}
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

function SessionSelectorWrapper({
  onChange,
  currentId,
}: {
  onChange: (sid: string) => void;
  currentId: string;
}) {
  const { sessions, fetchSessions } = useAppStore();
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  const current = sessions.find((s) => s.id === currentId);
  const [open, setOpen] = useState(false);
  return (
    <SessionSelectorInternal
      sessions={sessions}
      current={current}
      open={open}
      setOpen={setOpen}
      onChange={onChange}
    />
  );
}

function SessionSelectorInternal({
  sessions,
  current,
  open,
  setOpen,
  onChange,
}: {
  sessions: any[];
  current: any;
  open: boolean;
  setOpen: (o: boolean) => void;
  onChange: (sid: string) => void;
}) {
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white shadow-card border border-night-teal-100 hover:shadow-card-hover transition-all"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warm-orange-400 to-warm-orange-600 flex items-center justify-center text-white font-display text-lg shrink-0">
          🎬
        </div>
        <div className="text-left">
          <p className="font-display text-lg text-night-teal-800 leading-tight">
            {current?.title || '选择场次'}
          </p>
          <p className="text-xs text-night-teal-500">
            {current ? `${current.date} ${current.time} · ${current.venue}` : '请选择电影场次'}
          </p>
        </div>
      </button>
      {open && (
        <div className="absolute right-6 mt-2 w-80 bg-white rounded-2xl shadow-card-hover border border-night-teal-100 overflow-hidden z-50">
          {sessions.length === 0 ? (
            <p className="p-4 text-sm text-night-teal-500 text-center">暂无场次</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onChange(s.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                  s.id === current?.id ? 'bg-warm-orange-50' : 'hover:bg-night-teal-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-night-teal-100 shrink-0">
                    {s.photo ? (
                      <img src={s.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎥</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-night-teal-800 truncate">{s.title}</p>
                    <p className="text-xs text-night-teal-500">
                      {s.date} {s.time}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatMini({
  label,
  value,
  sub,
  icon,
  color,
  stagger,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  stagger: string;
}) {
  return (
    <div className={`card p-4 opacity-0 animate-fade-in-up ${stagger}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-night-teal-500 truncate">{label}</p>
          <p className="font-display text-2xl text-night-teal-800 leading-tight">{value}</p>
          {sub && <p className="text-[10px] text-night-teal-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function CheckinRow({
  registration,
  stagger,
  highlighted,
  verified,
  onCheckin,
  onRelease,
  onShowQR,
}: {
  registration: Registration;
  stagger: string;
  highlighted?: boolean;
  verified?: boolean;
  onCheckin: () => void;
  onRelease: () => void;
  onShowQR: (name: string) => void;
}) {
  const statusMap = {
    registered: {
      label: '待签到',
      color: 'bg-warm-orange-100 text-warm-orange-700',
      icon: Clock,
    },
    checked_in: {
      label: '已签到',
      color: 'bg-forest/15 text-forest',
      icon: CheckCircle,
    },
    released: {
      label: '已释放',
      color: 'bg-night-teal-100 text-night-teal-500',
      icon: Unlock,
    },
  };
  const s = statusMap[registration.status];
  const StatusIcon = s.icon;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all opacity-0 animate-fade-in-up ${stagger} ${
        highlighted || verified
          ? 'bg-warm-orange-50/60 border-warm-orange-300 shadow-md ring-2 ring-warm-orange-200'
          : 'bg-cream/40 border-night-teal-50 hover:bg-cream/70'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={onCheckin}>
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-night-teal-100 to-night-teal-200 flex items-center justify-center shrink-0">
          <span className="font-display text-xl text-night-teal-700">
            {registration.name.charAt(0)}
          </span>
          {verified && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warm-orange-500 text-white flex items-center justify-center animate-pulse-ring">
              <AlertCircle size={12} />
            </span>
          )}
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
          {registration.status === 'registered' && (
            <p className="text-[11px] text-night-teal-400 mt-1.5 flex items-center gap-1">
              💡 点击整行即可快速签到
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 sm:justify-end flex-wrap">
        {registration.status === 'registered' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCheckin();
              }}
              className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5"
            >
              <CheckCircle size={15} /> 签到入场
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowQR(registration.name);
              }}
              className="btn-outline !py-2 !px-4 text-sm flex items-center gap-1.5"
            >
              <QrCode size={15} /> 个人码
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRelease();
              }}
              className="btn-outline !py-2 !px-4 text-sm flex items-center gap-1.5 !border-warm-orange-300 text-warm-orange-600 hover:!bg-warm-orange-50"
            >
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
