import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import {
  ArrowLeft,
  Building2,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  BellPlus,
  BellOff,
  Camera,
  Wrench,
  Route,
  Lightbulb,
  RefreshCcw,
  UserRound,
  Calendar,
  Timer,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import StatusTimelineView from '@/components/StatusTimeline';
import type { FaultStatus } from '@/shared/types';
import { STATUS_CONFIG, HANDLER_OPTIONS, BUILDINGS, PHENOMENON_OPTIONS } from '@/shared/constants';
import { formatDateTime, formatDuration, durationMinutes, relativeTime } from '@/utils/time';
import { buildElevatorCountMap, elevatorKey } from '@/utils/statistics';

export default function FaultDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [search] = useSearchParams();
  const { getTicketById, currentRole, updateStatus, subscriptions, toggleBuildingSubscribe, tickets } = useAppStore();
  const ticket = getTicketById(id || '');

  const historyCount = useMemo(() => {
    if (!ticket) return 0;
    const map = buildElevatorCountMap(tickets);
    return map[elevatorKey(ticket.elevator)] || 0;
  }, [tickets, ticket]);

  const [status, setStatus] = useState<FaultStatus>(ticket?.status || 'processing');
  const [handler, setHandler] = useState(ticket?.handler || '');
  const [customHandler, setCustomHandler] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>(2);
  const [detourTip, setDetourTip] = useState(ticket?.detourTip || '');
  const [remark, setRemark] = useState('');
  const [savedTip, setSavedTip] = useState(false);

  const isProperty = currentRole === 'property';
  const subscribed = ticket ? subscriptions.buildings.includes(ticket.elevator.building) : false;
  const building = ticket ? BUILDINGS.find((b) => b.code === ticket.elevator.building) : undefined;
  const phenom = ticket ? PHENOMENON_OPTIONS.find((p) => p.value === ticket.phenomenon) : undefined;

  const recoveryTime = useMemo(() => {
    if (!ticket || !ticket.recoveredAt) return null;
    return formatDuration(durationMinutes(ticket.occurredAt, ticket.recoveredAt));
  }, [ticket]);

  const totalOpenMin = useMemo(() => {
    if (!ticket) return 0;
    const end = ticket.recoveredAt || Date.now();
    return durationMinutes(ticket.occurredAt, end);
  }, [ticket]);

  function doUpdate(nextStatus: FaultStatus = status) {
    if (!ticket) return;
    const h = customHandler.trim() || handler;
    const est =
      nextStatus !== 'recovered' && typeof estimatedHours === 'number' && estimatedHours > 0
        ? Date.now() + estimatedHours * 3600 * 1000
        : undefined;
    updateStatus(ticket.id, nextStatus, {
      handler: h || undefined,
      estimatedRecoverAt: est,
      detourTip: detourTip.trim() || undefined,
      operator: h || '物业',
      remark: remark.trim() || undefined,
    });
    setSavedTip(true);
    setTimeout(() => setSavedTip(false), 1800);
    if (nextStatus !== status) setStatus(nextStatus);
  }

  if (!ticket) {
    return (
      <div className="container max-w-4xl py-10">
        <button onClick={() => nav('/')} className="btn-ghost -ml-3 mb-4">
          <ArrowLeft size={18} />
          返回首页
        </button>
        <div className="card p-16 text-center">
          <AlertTriangle size={36} className="mx-auto text-amber-500 mb-3" />
          <h2 className="font-bold text-slate-800 mb-1">工单不存在</h2>
          <p className="text-sm text-slate-500">该工单可能已被删除或链接无效。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6 pb-28 md:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button onClick={() => nav(-1)} className="btn-ghost -ml-3">
          <ArrowLeft size={18} />
          返回列表
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBuildingSubscribe(ticket.elevator.building)}
            className={`btn-outline ${subscribed ? 'border-brand-400 bg-brand-50 text-brand-600' : ''}`}
          >
            {subscribed ? (
              <>
                <BellOff size={15} />
                取消订阅本楼栋
              </>
            ) : (
              <>
                <BellPlus size={15} />
                订阅本楼栋
              </>
            )}
          </button>
        </div>
      </div>

      {search.get('reported') === '1' && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
          <div className="text-sm text-emerald-800">
            <span className="font-bold">上报成功！</span>
            物业人员将尽快接单处理，您可在此页面查看处理进度。
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <section className={`card p-5 md:p-6 border-l-4 ${ticket.hasTrapped ? 'border-l-red-500' : ticket.status === 'urgent' ? 'border-l-orange-400' : 'border-l-brand-500'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-black text-xl md:text-2xl text-slate-900 flex items-center gap-2">
                  <Building2 size={22} className="text-brand-500" />
                  {building?.name || ticket.elevator.building} {ticket.elevator.unit}{ticket.elevator.elevatorNo}
                </h1>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDateTime(ticket.occurredAt)} 发生
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User size={12} />
                    {ticket.reportedBy} 上报于 {relativeTime(ticket.reportedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Timer size={12} />
                    持续 {formatDuration(totalOpenMin)}
                  </span>
                  {recoveryTime && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 size={12} />
                      恢复用时 {recoveryTime}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={ticket.status} size="md" />
                {ticket.hasTrapped && (
                  <span className="tag bg-red-500 text-white">
                    <AlertTriangle size={12} />
                    人员被困 {ticket.trappedCount || ''}
                  </span>
                )}
                {ticket.elevator.floorCount && ticket.elevator.floorCount >= 20 && (
                  <span className="tag bg-orange-50 text-orange-700 border border-orange-200">
                    {ticket.elevator.floorCount}层高层
                  </span>
                )}
                {historyCount >= 2 && (
                  <span className="tag bg-yellow-50 text-yellow-700 border border-yellow-200">
                    <RefreshCcw size={12} />
                    历史 {historyCount} 次
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                  <Lightbulb size={12} /> 故障现象
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                    {phenom?.label}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1.5">详细描述</div>
                <p className="text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 text-sm">
                  {ticket.description}
                </p>
              </div>

              {ticket.photos.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Camera size={12} /> 现场照片 ({ticket.photos.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ticket.photos.map((p, i) =>
                      p.startsWith('data:') ? (
                        <img
                          key={i}
                          src={p}
                          alt={`现场${i + 1}`}
                          className="aspect-square rounded-xl object-cover border border-slate-200 cursor-zoom-in hover:shadow-pop transition-shadow"
                          onClick={() => window.open(p, '_blank')}
                        />
                      ) : (
                        <div
                          key={i}
                          className="aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs border border-slate-200"
                        >
                          <Camera size={24} className="mb-1 opacity-50" />
                          现场照片
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {ticket.detourTip && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <Route size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-amber-700 mb-0.5">物业绕行提示</div>
                    <div className="text-sm text-amber-800 leading-relaxed">{ticket.detourTip}</div>
                  </div>
                </div>
              )}

              {ticket.handler && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Wrench size={14} className="text-orange-500" />
                  负责维修：<span className="font-semibold text-slate-800">{ticket.handler}</span>
                  {ticket.estimatedRecoverAt && ticket.status !== 'recovered' && (
                    <>
                      <span className="text-slate-300">·</span>
                      <Clock size={14} className="text-brand-500" />
                      预计 <span className="font-semibold">{formatDateTime(ticket.estimatedRecoverAt)}</span> 恢复
                    </>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <h2 className="section-title mb-4">
              <div className="w-1 h-5 rounded-full bg-brand-500" />
              处理进度
            </h2>
            <StatusTimelineView timeline={ticket.timeline} />
          </section>
        </div>

        <div className="space-y-5">
          <section className="card p-5 md:p-6">
            <h2 className="section-title mb-4">
              <div className="w-1 h-5 rounded-full bg-orange-500" />
              {isProperty ? '物业处理操作' : '当前处理状态'}
            </h2>

            {isProperty ? (
              <div className="space-y-4">
                <div>
                  <label className="label">工单状态</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['processing', 'waiting_parts', 'recovered'] as FaultStatus[]).map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      const active = status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${active
                            ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-offset-1 ring-current/20`
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'}`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label flex items-center gap-1.5">
                    <UserRound size={13} />
                    维修师傅
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {HANDLER_OPTIONS.map((h) => {
                      const active = handler === h && !customHandler;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            setHandler(h);
                            setCustomHandler('');
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${active
                            ? 'bg-orange-50 text-orange-700 border-orange-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'}`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={customHandler}
                    onChange={(e) => setCustomHandler(e.target.value)}
                    placeholder="或自定义填写..."
                    className="input text-sm"
                  />
                </div>

                {status !== 'recovered' && (
                  <div>
                    <label className="label flex items-center gap-1.5">
                      <Clock size={13} />
                      预计恢复时间（小时后）
                    </label>
                    <input
                      type="number"
                      min={0.25}
                      step={0.25}
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))}
                      className="input text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="label flex items-center gap-1.5">
                    <Route size={13} />
                    绕行提示
                  </label>
                  <textarea
                    rows={2}
                    value={detourTip}
                    onChange={(e) => setDetourTip(e.target.value)}
                    className="input text-sm resize-none"
                    placeholder="例：请使用 2 号梯或走 B1 层货梯绕行..."
                  />
                </div>

                <div>
                  <label className="label">状态变更备注</label>
                  <input
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="input text-sm"
                    placeholder="例：已抵达现场开始排查..."
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => doUpdate()}
                    className="btn-primary w-full"
                  >
                    {savedTip ? (
                      <>
                        <CheckCircle2 size={16} />
                        已保存
                      </>
                    ) : (
                      <>
                        <Wrench size={16} />
                        更新状态
                      </>
                    )}
                  </button>
                  {ticket.status === 'urgent' && (
                    <button
                      onClick={() => {
                        setStatus('processing');
                        setTimeout(() => doUpdate('processing'), 0);
                      }}
                      className="btn-outline w-full"
                    >
                      <CheckCircle2 size={15} />
                      一键接单并开始处理
                    </button>
                  )}
                  {ticket.status !== 'recovered' && status === 'recovered' && (
                    <button
                      onClick={() => doUpdate('recovered')}
                      className="btn w-full bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      <CheckCircle2 size={16} />
                      确认已恢复运行
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <Row label="当前状态">
                  <StatusBadge status={ticket.status} size="sm" />
                </Row>
                <Row label="负责师傅">
                  <span className="text-slate-800 font-medium">{ticket.handler || '暂未指派'}</span>
                </Row>
                <Row label="预计恢复">
                  {ticket.estimatedRecoverAt && ticket.status !== 'recovered' ? (
                    <span className="text-slate-800 font-medium">{formatDateTime(ticket.estimatedRecoverAt)}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </Row>
                <Row label="绕行提示">
                  {ticket.detourTip ? (
                    <span className="text-slate-700 leading-relaxed">{ticket.detourTip}</span>
                  ) : (
                    <span className="text-slate-400">暂无</span>
                  )}
                </Row>
                <div className="pt-2 mt-2 border-t border-slate-100 text-xs text-slate-500">
                  您是住户身份，如需更新处理进度，请切换到物业角色或联系物业管理员。
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-20 shrink-0 text-slate-500 text-xs pt-0.5">{label}</div>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}
