import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Wrench, CheckCircle, Filter, DollarSign, Calendar, User, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/store';
import { REPAIR_STATUS_COLORS, REPAIR_STATUS_LABELS, type RepairStatus, type Repair } from '@/types';
import CompleteRepairModal from '@/components/CompleteRepairModal';

export default function RepairList() {
  const { repairs, devices, completeRepair } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all');

  const deviceMap = useMemo(() => {
    const map = new Map<string, (typeof devices)[number]>();
    devices.forEach((d) => map.set(d.id, d));
    return map;
  }, [devices]);

  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      const device = deviceMap.get(r.deviceId);
      const matchSearch =
        r.faultDescription.toLowerCase().includes(search.toLowerCase()) ||
        r.handler.toLowerCase().includes(search.toLowerCase()) ||
        (device?.code.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [repairs, deviceMap, search, statusFilter]);

  const stats = useMemo(() => {
    const totalCost = repairs.reduce((sum, r) => sum + r.cost, 0);
    return {
      total: repairs.length,
      repairing: repairs.filter((r) => r.status === 'repairing').length,
      completed: repairs.filter((r) => r.status === 'completed').length,
      totalCost,
    };
  }, [repairs]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);

  const handleOpenComplete = (repair: Repair) => {
    setSelectedRepair(repair);
    setModalOpen(true);
  };

  const handleConfirmComplete = (data: { afterPhoto: string; cost: number }) => {
    if (selectedRepair) {
      completeRepair(selectedRepair.id, data);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">维修管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            维修中 <span className="text-amber-600 font-medium">{stats.repairing}</span> · 已完成{' '}
            <span className="text-emerald-600 font-medium">{stats.completed}</span> · 累计费用{' '}
            <span className="text-rose-600 font-medium">¥{stats.totalCost.toLocaleString()}</span>
          </p>
        </div>
        <Link to="/repairs/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          新建维修单
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索设备、故障描述、处理人..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RepairStatus | 'all')}
              className="input w-36"
            >
              <option value="all">全部状态</option>
              {Object.entries(REPAIR_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepairs.length === 0 ? (
          <div className="col-span-full card p-16 text-center">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无维修记录</p>
          </div>
        ) : (
          filteredRepairs.map((repair) => {
            const device = deviceMap.get(repair.deviceId);
            const isRepairing = repair.status === 'repairing';
            return (
              <div
                key={repair.id}
                className={`card overflow-hidden transition-all hover:shadow-md ${
                  isRepairing ? 'ring-1 ring-amber-200' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    {device && (
                      <img
                        src={device.photo}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">
                          {device?.code || '未知设备'}
                        </span>
                        <span className={`badge ${REPAIR_STATUS_COLORS[repair.status]}`}>
                          {REPAIR_STATUS_LABELS[repair.status]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{device?.category}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mb-4 line-clamp-2 min-h-[40px]">
                    {repair.faultDescription}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      <span>{repair.handler}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {repair.startDate}
                        {repair.completeDate && ` → ${repair.completeDate}`}
                      </span>
                    </div>
                    {repair.cost > 0 && (
                      <div className="flex items-center gap-2 text-rose-600 font-medium">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>¥{repair.cost.toLocaleString()}</span>
                      </div>
                    )}
                    {repair.status === 'completed' && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {repair.afterPhoto ? (
                            <img
                              src={repair.afterPhoto}
                              alt="维修后"
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              已完成
                            </p>
                            <p className="text-xs text-slate-400">
                              完成于 {repair.completeDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-stretch border-t border-slate-100">
                  <Link
                    to={`/repairs/${repair.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50/50 transition-colors border-r border-slate-100"
                  >
                    <Eye className="w-4 h-4" />
                    详情
                  </Link>
                  {isRepairing && (
                    <button
                      onClick={() => handleOpenComplete(repair)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      完成维修
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedRepair && (
        <CompleteRepairModal
          repair={selectedRepair}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmComplete}
        />
      )}
    </div>
  );
}
