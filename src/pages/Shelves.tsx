import { useState, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Boxes as ShelvesIcon,
  Plus,
  Pencil,
  Trash2,
  Eye,
  User,
  Phone,
  Camera,
  MapPin,
  Grid3X3,
  ArrowUpRight,
  Boxes,
  ArrowLeft,
  Search,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { useShelfStore } from '@/store/shelfStore';
import { usePackageStore } from '@/store/packageStore';
import { cn, getDelayLevel, getDelayLevelColor } from '@/utils';
import type { Shelf, ShelfSlot, PackageItem } from '@/types';
import { getSlotLabel } from '@/utils';

export default function ShelvesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Shelf | null>(null);
  const [form, setForm] = useState({
    name: '',
    area: '',
    floorCount: 4,
    slotsPerFloor: 6,
    cameraPoint: '',
    manager: '',
    managerPhone: '',
  });

  const shelves = useShelfStore((s) => s.shelves);
  const slots = useShelfStore((s) => s.slots);
  const addShelfRef = useRef(useShelfStore.getState().addShelf);
  const updateShelfRef = useRef(useShelfStore.getState().updateShelf);
  const deleteShelfRef = useRef(useShelfStore.getState().deleteShelf);
  const packages = usePackageStore((s) => s.packages);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', area: '', floorCount: 4, slotsPerFloor: 6, cameraPoint: '', manager: '', managerPhone: '' });
    setModalOpen(true);
  };

  const openEdit = (s: Shelf) => {
    setEditing(s);
    setForm({
      name: s.name,
      area: s.area,
      floorCount: s.floorCount,
      slotsPerFloor: s.slotsPerFloor,
      cameraPoint: s.cameraPoint,
      manager: s.manager,
      managerPhone: s.managerPhone,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.area || !form.manager) return;
    if (editing) {
      updateShelfRef.current(editing.id, form);
    } else {
      addShelfRef.current(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (s: Shelf) => {
    if (confirm(`确定删除货架【${s.name}】？`)) {
      deleteShelfRef.current(s.id);
    }
  };

  const shelfStatsMap = useMemo(() => {
    const map = new Map<string, { total: number; occ: number; rate: number; delayed: number }>();
    shelves.forEach((shelf) => {
      const shelfSlots = slots.filter((s) => s.shelfId === shelf.id);
      const total = shelfSlots.length;
      const occ = shelfSlots.filter((s) => s.isOccupied).length;
      const pkgs = packages.filter(
        (p) => p.shelfId === shelf.id && p.status === 'stored',
      );
      const delayed = pkgs.filter((p) => getDelayLevel(p.storedAt) !== 'normal').length;
      map.set(shelf.id, {
        total, occ,
        rate: total > 0 ? Math.round((occ / total) * 100) : 0,
        delayed,
      });
    });
    return map;
  }, [shelves, slots, packages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">货架档案</h1>
          <p className="text-sm text-slate-500 mt-1">管理小区快递架配置，共 {shelves.length} 个货架</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>
          新增货架
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {shelves.map((shelf) => {
          const stats = shelfStatsMap.get(shelf.id)!;
          return (
            <Card key={shelf.id} className="group hover:-translate-y-0.5 transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                      <ShelvesIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{shelf.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{shelf.area}</span>
                      </div>
                    </div>
                  </div>
                  {stats.delayed > 0 && (
                    <Badge variant="critical" size="md">{stats.delayed} 滞留</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2.5 rounded-xl bg-slate-50">
                    <div className="text-xs text-slate-500">总格口</div>
                    <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.total}</div>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-indigo-50">
                    <div className="text-xs text-indigo-500">已占用</div>
                    <div className="text-xl font-extrabold text-indigo-600 mt-0.5">{stats.occ}</div>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-emerald-50">
                    <div className="text-xs text-emerald-600">使用率</div>
                    <div className="text-xl font-extrabold text-emerald-600 mt-0.5">{stats.rate}%</div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      stats.rate >= 80 ? 'bg-gradient-to-r from-orange-400 to-red-500'
                        : stats.rate >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500',
                    )}
                    style={{ width: `${Math.min(stats.rate, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50">
                    <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{shelf.cameraPoint || '未配置'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50">
                    <Grid3X3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{shelf.floorCount}层 × {shelf.slotsPerFloor}格</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{shelf.manager}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{shelf.managerPhone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link to={`/shelves/${shelf.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                      查看详情
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(shelf)} title="编辑">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(shelf)} title="删除">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        <button
          onClick={openAdd}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <div className="font-bold">新增货架</div>
            <div className="text-xs mt-0.5">点击创建新的快递架</div>
          </div>
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? '编辑货架' : '新增货架'}
        subtitle={editing ? '修改快递架配置信息' : '录入新快递架的基础信息'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>{editing ? '保存修改' : '创建货架'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="货架名称"
            placeholder="如：东门快递架A"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="所在区域"
            placeholder="如：东门岗亭旁"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
          <Select
            label="层数"
            value={form.floorCount}
            onChange={(e) => setForm({ ...form, floorCount: Number(e.target.value) })}
          >
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} 层</option>
            ))}
          </Select>
          <Select
            label="每层格数"
            value={form.slotsPerFloor}
            onChange={(e) => setForm({ ...form, slotsPerFloor: Number(e.target.value) })}
          >
            {[3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>{n} 格/层</option>
            ))}
          </Select>
          <Input
            label="摄像头点位"
            placeholder="如：CAM-DM-001"
            value={form.cameraPoint}
            onChange={(e) => setForm({ ...form, cameraPoint: e.target.value })}
          />
          <div />
          <Input
            label="负责人姓名"
            placeholder="如：张建国"
            value={form.manager}
            onChange={(e) => setForm({ ...form, manager: e.target.value })}
          />
          <Input
            label="联系电话"
            placeholder="如：13800138001"
            value={form.managerPhone}
            onChange={(e) => setForm({ ...form, managerPhone: e.target.value })}
          />
        </div>
        <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-600 flex items-start gap-2">
          <Boxes className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            将创建 <strong>{form.floorCount} × {form.slotsPerFloor} = {form.floorCount * form.slotsPerFloor}</strong> 个格口，
            创建后可在详情页查看占用情况
          </span>
        </div>
      </Modal>
    </div>
  );
}

// ---------------- 货架详情页 ----------------

export function ShelfDetailPage() {
  const { id } = useParams();
  const shelves = useShelfStore((s) => s.shelves);
  const slots = useShelfStore((s) => s.slots);
  const packages = usePackageStore((s) => s.packages);
  const [search, setSearch] = useState('');

  const shelf = useMemo(() => shelves.find((x) => x.id === id), [shelves, id]);
  const shelfSlots = useMemo(() => slots.filter((x) => x.shelfId === id), [slots, id]);

  if (!shelf) {
    return (
      <div className="space-y-4">
        <Link to="/shelves">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>返回货架列表</Button>
        </Link>
        <Card>
          <div className="py-16 text-center text-slate-400">货架不存在或已删除</div>
        </Card>
      </div>
    );
  }

  const pkgMap = new Map<string, PackageItem>();
  packages.forEach((p) => {
    if (p.status === 'stored') pkgMap.set(p.shelfSlotId, p);
  });

  const filteredSlots = search
    ? shelfSlots.filter((s) => {
        const pkg = pkgMap.get(s.id);
        if (!pkg) return false;
        const kw = search.toLowerCase();
        return (
          pkg.recipientName.toLowerCase().includes(kw) ||
          pkg.phoneLast4.includes(kw) ||
          pkg.courierCompany.toLowerCase().includes(kw) ||
          getSlotLabel(s.floor, s.slotNumber).includes(search)
        );
      })
    : shelfSlots;

  // 按层分组
  const byFloor = new Map<number, ShelfSlot[]>();
  filteredSlots.forEach((s) => {
    if (!byFloor.has(s.floor)) byFloor.set(s.floor, []);
    byFloor.get(s.floor)!.push(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link to="/shelves" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> 返回货架列表
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{shelf.name}</h1>
          <p className="text-sm text-slate-500 mt-1">{shelf.area} · {shelf.floorCount}层 × {shelf.slotsPerFloor}格</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
            placeholder="搜索收件人/手机号/格口"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini label="总容量" value={shelfSlots.length} color="indigo" />
        <StatMini label="已占用" value={shelfSlots.filter((s) => s.isOccupied).length} color="violet" />
        <StatMini label="空闲" value={shelfSlots.filter((s) => !s.isOccupied).length} color="emerald" />
        <StatMini
          label="使用率"
          value={`${shelfSlots.length > 0 ? Math.round((shelfSlots.filter((s) => s.isOccupied).length / shelfSlots.length) * 100) : 0}%`}
          color="amber"
        />
      </div>

      <Card title="货架格口平面图" subtitle="点击占用格口查看包裹详情">
        <div className="space-y-5">
          {Array.from(byFloor.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([floor, floorSlots]) => (
              <div key={floor} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-md bg-slate-800 text-white text-xs font-bold">
                    {floor} 层
                  </div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
                  {floorSlots
                    .sort((a, b) => a.slotNumber - b.slotNumber)
                    .map((slot) => {
                      const pkg = pkgMap.get(slot.id);
                      const level = pkg ? getDelayLevel(pkg.storedAt) : 'normal';
                      return (
                        <div
                          key={slot.id}
                          className={cn(
                            'relative aspect-[4/3] rounded-xl border-2 flex flex-col items-center justify-center text-center p-1.5 transition-all duration-200 group cursor-pointer',
                            pkg
                              ? level === 'normal'
                                ? 'bg-emerald-50 border-emerald-300 hover:shadow-md hover:-translate-y-0.5'
                                : level === 'warning'
                                ? 'bg-amber-50 border-amber-400 hover:shadow-md hover:-translate-y-0.5 animate-pulse'
                                : level === 'danger'
                                ? 'bg-orange-50 border-orange-400 hover:shadow-md hover:-translate-y-0.5 animate-pulse'
                                : 'bg-red-50 border-red-400 hover:shadow-md hover:-translate-y-0.5 animate-pulse'
                              : 'bg-white border-slate-200 border-dashed hover:border-indigo-300 hover:bg-indigo-50/50',
                          )}
                        >
                          <div className="text-[11px] font-bold text-slate-700">
                            {floor}-{String(slot.slotNumber).padStart(2, '0')}
                          </div>
                          {pkg ? (
                            <>
                              <div className="text-[10px] text-slate-600 truncate w-full font-semibold mt-0.5">
                                {pkg.recipientName}
                              </div>
                              <div className="text-[9px] text-slate-500 truncate w-full mt-0.5">
                                {pkg.courierCompany.slice(0, 2)}
                              </div>
                              {level !== 'normal' && (
                                <span className={cn(
                                  'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm',
                                  getDelayLevelColor(level),
                                )} />
                              )}
                              {level !== 'normal' && (
                                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-black/60 flex items-center justify-center p-1 transition-all">
                                  <div className="text-white text-[9px] leading-tight text-center">
                                    {pkg.recipientName}<br />
                                    📱***{pkg.phoneLast4}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-[10px] text-slate-400 mt-1">空闲</div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <LegendDot color="bg-slate-200 border-slate-300 border-dashed" label="空闲格口" />
          <LegendDot color="bg-emerald-400" label="正常存放" />
          <LegendDot color="bg-amber-400" label="滞留24h+" />
          <LegendDot color="bg-orange-500" label="滞留48h+" />
          <LegendDot color="bg-red-500" label="滞留72h+" />
        </div>
      </Card>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-500',
  };
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
      <div className={cn('absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-15 bg-gradient-to-br', colors[color])} />
      <div className="relative">
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        <div className="mt-1 text-2xl font-extrabold text-slate-800">{value}</div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-3.5 h-3.5 rounded-md border shrink-0', color)} />
      <span>{label}</span>
    </div>
  );
}
