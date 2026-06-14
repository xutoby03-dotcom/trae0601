import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Drawer from '@/components/common/Drawer';
import StatusBadge from '@/components/common/StatusBadge';
import { useLendStore } from '@/store/lendStore';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import type { Umbrella } from '@/types';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  FileWarning,
  History,
  MapPin,
  Phone,
  Tag,
  Umbrella as UmbrellaIcon,
  XCircle,
} from 'lucide-react';
import { formatDateTime, isOverdue } from '@/utils/dateUtils';

interface Props {
  umbrella: Umbrella | null;
  onClose: () => void;
}

const sizeLabel = { small: '单人（55cm）', medium: '双人（65cm）', large: '加大（75cm）' };

export default function UmbrellaDetail({ umbrella, onClose }: Props) {
  const navigate = useNavigate();
  const getStoreName = useUmbrellaStore((s) => s.getStoreName);
  const stores = useUmbrellaStore((s) => s.stores);
  const getActiveLend = useLendStore((s) => s.getActiveLendByUmbrella);
  const getHistory = useLendStore((s) => s.getHistoryByUmbrella);

  const activeLend = useMemo(
    () => (umbrella ? getActiveLend(umbrella.id) : undefined),
    [umbrella, getActiveLend]
  );

  const history = useMemo(
    () => (umbrella ? getHistory(umbrella.id) : []),
    [umbrella, getHistory]
  );

  if (!umbrella) return null;

  const store = stores.find((s) => s.id === umbrella.storeId);

  return (
    <Drawer
      open={!!umbrella}
      onClose={onClose}
      title={`雨伞档案 · ${umbrella.code}`}
      subtitle={umbrella.status === 'damaged' ? umbrella.damageNote : `${umbrella.color} · ${sizeLabel[umbrella.size]}`}
    >
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200">
          <div className="relative aspect-[16/10]">
            <img
              src={umbrella.photoUrl}
              alt={umbrella.code}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4">
              <StatusBadge status={umbrella.status} size="md" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoRow icon={<Tag className="h-4 w-4" />} label="雨伞编号">
            <span className="font-mono font-semibold text-slate-900">{umbrella.code}</span>
          </InfoRow>
          <InfoRow icon={<UmbrellaIcon className="h-4 w-4" />} label="颜色 / 尺寸">
            {umbrella.color} · {sizeLabel[umbrella.size]}
          </InfoRow>
          <InfoRow icon={<CheckCircle2 className="h-4 w-4" />} label="押金金额">
            <span className="font-semibold text-teal-700">¥{umbrella.deposit}</span>
          </InfoRow>
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="所在门店">
            {getStoreName(umbrella.storeId)}
          </InfoRow>
          <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="入库时间">
            {formatDateTime(umbrella.createdAt)}
          </InfoRow>
          <InfoRow icon={<History className="h-4 w-4" />} label="累计借出">
            {history.length} 次
          </InfoRow>
        </div>

        {store && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> 门店地址
            </div>
            <div className="mt-1 text-slate-700">{store.address}</div>
          </div>
        )}

        {activeLend ? (
          <section className="space-y-3 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-sc text-base font-semibold text-slate-900">
                当前借出中
              </h3>
              {isOverdue(activeLend.dueTime) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                  <FileWarning className="h-3 w-3" /> 已逾期
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow icon={<Phone className="h-4 w-4" />} label="顾客尾号">
                <span className="font-mono font-semibold">****{activeLend.phoneLast4}</span>
              </InfoRow>
              <InfoRow icon={<CheckCircle2 className="h-4 w-4" />} label="押金状态">
                {activeLend.depositStatus === 'paid' ? (
                  <span className="text-emerald-700 font-medium">已收取</span>
                ) : (
                  <span className="text-orange-700 font-medium">待收取</span>
                )}
              </InfoRow>
              <InfoRow icon={<Clock className="h-4 w-4" />} label="借出时间">
                {formatDateTime(activeLend.lendTime)}
              </InfoRow>
              <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="应归还时间">
                {formatDateTime(activeLend.dueTime)}
              </InfoRow>
              <div className="col-span-2">
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="预计归还门店">
                  {getStoreName(activeLend.expectedStoreId)}
                </InfoRow>
              </div>
            </div>
            <Link
              to="/return"
              className="btn-primary w-full justify-center mt-2"
            >
              办理归还
            </Link>
          </section>
        ) : (
          <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                {umbrella.status === 'damaged' ? (
                  <FileWarning className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {umbrella.status === 'available' && '可正常借出'}
                  {umbrella.status === 'damaged' && '当前破损待修，无法借出'}
                  {umbrella.status === 'scrapped' && '此伞已报废'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {umbrella.status === 'available' && `押金 ¥${umbrella.deposit}，48小时内归还`}
                  {umbrella.status === 'damaged' && umbrella.damageNote}
                </div>
              </div>
            </div>
            {umbrella.status === 'available' && (
              <Link to="/lend" className="btn-primary w-full justify-center mt-4">
                办理借出
              </Link>
            )}
          </section>
        )}

        <section className="space-y-3">
          <h3 className="font-serif-sc text-base font-semibold text-slate-900 flex items-center gap-2">
            <History className="h-4 w-4 text-teal-600" /> 借还历史
          </h3>
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400">
                暂无借还记录
              </div>
            ) : (
              history.map(({ lend, ret }, idx) => {
                const isOverdue_ = !ret && isOverdue(lend.dueTime);
                return (
                  <div
                    key={lend.id}
                    className="relative pl-8 pb-5 last:pb-0 animate-fadeInUp"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div
                      className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${
                        ret ? 'bg-emerald-100 text-emerald-600'
                          : isOverdue_ ? 'bg-orange-100 text-orange-600'
                          : 'bg-sky-100 text-sky-600'
                      }`}
                    >
                      {ret ? <CheckCircle2 className="h-3.5 w-3.5" />
                        : isOverdue_ ? <XCircle className="h-3.5 w-3.5" />
                        : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    {idx < history.length - 1 && (
                      <div className="absolute left-3.5 top-7 h-full w-px bg-slate-200" />
                    )}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm">
                          <span className="font-medium text-slate-800">顾客尾号</span>
                          <span className="ml-1.5 font-mono font-semibold">{lend.phoneLast4}</span>
                          {ret ? (
                            <span className="ml-2 text-emerald-600">已归还</span>
                          ) : isOverdue_ ? (
                            <span className="ml-2 text-orange-600 font-medium">逾期未还</span>
                          ) : (
                            <span className="ml-2 text-sky-600">借出中</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1.5 text-xs text-slate-500 space-y-0.5">
                        <div>借出：{formatDateTime(lend.lendTime)} → {getStoreName(lend.expectedStoreId)}</div>
                        {ret && (
                          <div>
                            归还：{formatDateTime(ret.returnTime)}
                            {ret.finalStatus === 'damaged' && (
                              <span className="ml-2 text-orange-600">· 质检异常</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <div className="flex gap-3 pt-2 border-t border-slate-100 sticky bottom-0 bg-white -mx-6 px-6 -mb-6 py-4">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            关闭
          </button>
          <button
            onClick={() => navigate(`/umbrellas/${umbrella.id}/edit`)}
            className="btn-primary flex-1 justify-center"
          >
            <Edit3 className="h-4 w-4" /> 编辑档案
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-sm text-slate-700">{children}</div>
    </div>
  );
}
