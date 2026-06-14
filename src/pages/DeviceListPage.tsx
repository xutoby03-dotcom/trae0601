import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, AlertTriangle, Package, MapPin, Ruler, Eye, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { StatusBadge, InterfaceChip } from '../components/Badges';
import { useToast } from '../components/Toast';
import type { DisplayStatus, DisplayInterface, Display } from '../types';
import { cn } from '../lib/utils';

const statusFilterOptions: { value: DisplayStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'available', label: '可借用' },
  { value: 'borrowed', label: '已借出' },
  { value: 'maintenance', label: '维修中' },
  { value: 'missing', label: '配件缺失' },
];

const sizeOptions = [
  { value: 'all', label: '全部尺寸' },
  { value: '24', label: '24 英寸' },
  { value: '27', label: '27 英寸' },
  { value: '32', label: '32 英寸及以上' },
];

export default function DeviceListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const displays = useStore((s) => s.displays);
  const deleteDisplay = useStore((s) => s.deleteDisplay);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | 'all'>('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [interfaceFilter, setInterfaceFilter] = useState<DisplayInterface | 'all'>('all');
  const [viewer, setViewer] = useState<Display | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return displays.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (sizeFilter !== 'all') {
        const sz = parseInt(sizeFilter);
        if (sz === 32 ? d.size < 32 : d.size !== sz) return false;
      }
      if (interfaceFilter !== 'all' && !d.interfaces.includes(interfaceFilter)) return false;
      if (search && !d.code.toLowerCase().includes(search.toLowerCase())
        && !d.location.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [displays, search, statusFilter, sizeFilter, interfaceFilter]);

  const handleDelete = (id: string) => {
    deleteDisplay(id);
    toast.show('设备档案已删除', 'success');
    setConfirmDelete(null);
  };

  const allInterfaces = useMemo(() => {
    const set = new Set<DisplayInterface>();
    displays.forEach((d) => d.interfaces.forEach((i) => set.add(i)));
    return Array.from(set);
  }, [displays]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">设备档案</h2>
          <p className="text-sm text-zinc-500">共 {displays.length} 台显示器，当前可借用 {displays.filter(d => d.status === 'available').length} 台</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/devices/new')}
        >
          <Plus size={18} />
          新增设备
        </button>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="input pl-9"
              placeholder="搜索编号或放置点..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DisplayStatus | 'all')}>
            {statusFilterOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select className="input" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
            {sizeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select className="input" value={interfaceFilter} onChange={(e) => setInterfaceFilter(e.target.value as DisplayInterface | 'all')}>
            <option value="all">全部接口</option>
            {allInterfaces.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 flex items-center justify-center">
            <Package size={28} className="text-zinc-400" />
          </div>
          <p className="text-zinc-600 font-medium">暂无匹配的设备</p>
          <p className="text-sm text-zinc-400 mt-1">请调整筛选条件或新增设备</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((d) => (
            <article
              key={d.id}
              className="card card-hover overflow-hidden group"
            >
              <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                <img
                  src={d.photoUrl}
                  alt={d.code}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={d.status} />
                </div>
                <div className="absolute top-3 right-3">
                  <span className="chip bg-white/90 backdrop-blur-sm text-brand-700 font-bold shadow-sm">
                    {d.code}
                  </span>
                </div>
                {d.missingAccessories.length > 0 && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1.5 bg-rose-500/95 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-md">
                      <AlertTriangle size={13} />
                      缺少 {d.missingAccessories.join('、')}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                  <button
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                    onClick={() => setViewer(d)}
                  >
                    <Eye size={14} /> 查看
                  </button>
                  <button
                    className="btn-primary !py-1.5 !px-3 text-xs"
                    onClick={() => navigate(`/devices/${d.id}/edit`)}
                  >
                    <Edit3 size={14} /> 编辑
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-700">
                    <Ruler size={15} className="text-brand-500" />
                    <span className="font-semibold">{d.size} 英寸</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-700">
                    <MapPin size={15} className="text-brand-500" />
                    <span className="truncate max-w-[140px]">{d.location}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.interfaces.map((i) => (
                    <InterfaceChip key={i} type={i} />
                  ))}
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    <span className="font-medium text-zinc-700">{d.accessories.length}</span> 项配件
                    {d.damageCount > 0 && (
                      <span className="ml-3 text-rose-600">
                        损坏 {d.damageCount} 次
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-ghost !p-2 text-rose-500 hover:!bg-rose-50 hover:!text-rose-600"
                    onClick={() => setConfirmDelete(d.id)}
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewer(null)}>
          <div
            className="card w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{viewer.code}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">设备详情</p>
              </div>
              <button className="btn-ghost !p-2" onClick={() => setViewer(null)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-0 overflow-y-auto scrollbar-thin">
              <div className="aspect-square bg-zinc-100">
                <img src={viewer.photoUrl} alt={viewer.code} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={viewer.status} />
                  <span className="text-xs text-zinc-500">
                    {viewer.size} 英寸
                  </span>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">放置点</p>
                  <p className="text-sm font-medium text-zinc-800">{viewer.location}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1.5">接口类型</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewer.interfaces.map((i) => <InterfaceChip key={i} type={i} />)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1.5">配件清单</p>
                  <ul className="space-y-1">
                    {viewer.accessories.map((a, idx) => (
                      <li key={idx} className="text-sm flex items-center justify-between py-1.5 px-3 rounded-lg bg-zinc-50">
                        <span className="text-zinc-700">{a.name}</span>
                        <span className={cn('font-medium', viewer.missingAccessories.includes(a.name) ? 'text-rose-600' : 'text-zinc-600')}>
                          × {a.quantity}
                          {viewer.missingAccessories.includes(a.name) && ' (缺失)'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {viewer.notes && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-xs font-semibold text-amber-800 mb-1">备注信息</p>
                    <p className="text-sm text-amber-900">{viewer.notes}</p>
                  </div>
                )}
                <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-100">
                  损坏次数：<span className="font-semibold text-zinc-600">{viewer.damageCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="card p-6 w-full max-w-sm animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 mb-1">确认删除设备？</h3>
                <p className="text-sm text-zinc-500">删除后无法恢复，该设备的历史预约记录仍会保留。</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>取消</button>
              <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
