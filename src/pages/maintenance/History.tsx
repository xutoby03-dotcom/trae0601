import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  History,
  Search,
  Building2,
  Calendar,
  User,
  Phone,
  Package,
  ChevronRight,
  Filter,
  X,
  Clock,
} from "lucide-react";
import { useStationStore } from "../../store/stationStore";
import { useRepairStore } from "../../store/repairStore";
import { useInspectionStore } from "../../store/inspectionStore";
import { StationStatusBadge } from "../../components/ui/StatusBadge";
import { formatDateTime, formatMoney } from "../../utils/formatters";
import { clsx } from "clsx";

const FAULT_CATEGORY_LABELS: Record<string, string> = {
  hardware: "硬件故障",
  software: "软件故障",
  electrical: "电路故障",
  connector: "接口故障",
  network: "网络故障",
  other: "其他问题",
};

export default function MaintenanceHistory() {
  const [searchParams] = useSearchParams();
  const initialStationId = searchParams.get("stationId") || "";

  const stations = useStationStore((s) => s.stations);
  const maintenanceRecords = useRepairStore((s) => s.maintenanceRecords);
  const tickets = useRepairStore((s) => s.tickets);
  const inspectionRecords = useInspectionStore((s) => s.records);

  const [filterStationId, setFilterStationId] = useState(initialStationId);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const buildings = useMemo(
    () => [...new Set(stations.map((s) => s.building))].sort(),
    [stations]
  );

  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter((record) => {
      if (filterStationId && record.stationId !== filterStationId) return false;

      const station = useStationStore.getState().getStationById(record.stationId);
      if (filterCategory && record.faultCategory !== filterCategory) return false;

      if (filterStartDate) {
        if (new Date(record.completedAt) < new Date(filterStartDate)) return false;
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59);
        if (new Date(record.completedAt) > end) return false;
      }

      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const stationCode = station?.code.toLowerCase() || "";
        const match =
          stationCode.includes(kw) ||
          record.faultReason.toLowerCase().includes(kw) ||
          record.technician.toLowerCase().includes(kw) ||
          record.notes.toLowerCase().includes(kw);
        if (!match) return false;
      }

      return true;
    });
  }, [
    maintenanceRecords,
    filterStationId,
    filterStartDate,
    filterEndDate,
    filterCategory,
    searchKeyword,
  ]);

  const clearFilters = () => {
    setFilterStationId("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterCategory("");
    setSearchKeyword("");
  };

  const hasFilters =
    filterStationId || filterStartDate || filterEndDate || filterCategory || searchKeyword;

  const totalCost = filteredRecords.reduce((sum, r) => sum + r.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <History className="w-7 h-7 text-primary-500" />
            维修历史
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            查看所有充电桩的维修记录和维护详情
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/maintenance/faults" className="btn-secondary">
            <Clock className="w-4 h-4" />
            故障桩列表
          </Link>
          <Link to="/maintenance/record" className="btn-primary">
            创建记录
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-xs text-slate-500 mb-1.5">维修记录总数</div>
          <div className="text-2xl font-bold text-slate-800 font-display">
            {filteredRecords.length}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500 mb-1.5">涉及充电桩</div>
          <div className="text-2xl font-bold text-primary-600 font-display">
            {new Set(filteredRecords.map((r) => r.stationId)).size}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500 mb-1.5">维修总成本</div>
          <div className="text-2xl font-bold text-danger-600 font-display">
            {formatMoney(totalCost)}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-slate-500 mb-1.5">覆盖楼栋</div>
          <div className="text-2xl font-bold text-success-600 font-display">
            {new Set(
              filteredRecords
                .map((r) => useStationStore.getState().getStationById(r.stationId)?.building)
                .filter(Boolean)
            ).size}
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">筛选条件</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-slate-500 hover:text-danger-500 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="input pl-9"
              placeholder="搜索桩号、故障原因、维修人..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <div>
            <select
              className="input"
              value={filterStationId}
              onChange={(e) => setFilterStationId(e.target.value)}
            >
              <option value="">全部充电桩</option>
              {buildings.map((building) => (
                <optgroup key={building} label={building}>
                  {stations
                    .filter((s) => s.building === building)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.location}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <select
              className="input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">全部故障类型</option>
              {Object.entries(FAULT_CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              className="input"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-title">维修记录列表</h2>
          <div className="text-xs text-slate-500">
            共 {filteredRecords.length} 条记录
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <div>暂无维修记录</div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-primary-500 hover:text-primary-600"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((record) => {
              const station = useStationStore.getState().getStationById(record.stationId);
              const relatedTicket = record.repairTicketId
                ? tickets.find((t) => t.id === record.repairTicketId)
                : undefined;
              const relatedInspection = inspectionRecords.find(
                (r) => r.stationId === record.stationId && r.hasAbnormal
              );
              const expanded = expandedId === record.id;

              return (
                <div key={record.id} className="group">
                  <div
                    className={clsx(
                      "p-5 cursor-pointer transition-colors",
                      expanded ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                    )}
                    onClick={() => setExpandedId(expanded ? null : record.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                        <WrenchReplacement />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {station && (
                            <span className="font-semibold text-slate-800">
                              {station.code}
                            </span>
                          )}
                          {station && <StationStatusBadge status={station.status} />}
                          <span className="badge-primary">
                            {FAULT_CATEGORY_LABELS[record.faultCategory] ||
                              record.faultCategory}
                          </span>
                          {record.partsReplaced.length > 0 && (
                            <span className="badge-warning flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {record.partsReplaced.length} 件配件
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-slate-600 mb-2 line-clamp-1">
                          {record.faultReason}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          {station && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {station.building} · {station.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {record.technician}
                          </span>
                          {record.technicianPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {record.technicianPhone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateTime(record.completedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {record.totalCost > 0 && (
                          <div className="text-right">
                            <div className="text-xs text-slate-500">维修成本</div>
                            <div className="font-semibold text-danger-600 font-display">
                              {formatMoney(record.totalCost)}
                            </div>
                          </div>
                        )}
                        <ChevronRight
                          className={clsx(
                            "w-5 h-5 text-slate-300 transition-transform duration-200",
                            expanded && "rotate-90 text-primary-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-5 pb-5 pt-0 border-t-0">
                      <div className="ml-16 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">详细故障描述</div>
                            <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-700 border border-slate-100">
                              {record.faultReason}
                            </div>
                          </div>
                          {record.notes && (
                            <div>
                              <div className="text-xs text-slate-500 mb-1">维修备注</div>
                              <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-700 border border-slate-100">
                                {record.notes}
                              </div>
                            </div>
                          )}
                          {(relatedTicket || relatedInspection) && (
                            <div className="flex gap-2 flex-wrap">
                              {relatedTicket && (
                                <Link
                                  to={`/repairs/tickets/${relatedTicket.id}`}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-warning-50 text-warning-600 border border-warning-100 hover:bg-warning-100 transition-colors"
                                >
                                  关联工单：{relatedTicket.ticketNo}
                                </Link>
                              )}
                              {relatedInspection && (
                                <span className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 border border-primary-100">
                                  关联巡检异常
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {record.partsReplaced.length > 0 && (
                            <div>
                              <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                                <Package className="w-3.5 h-3.5" />
                                更换配件清单
                              </div>
                              <div className="rounded-lg border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-50 text-xs text-slate-500">
                                    <tr>
                                      <th className="px-3 py-2 text-left font-medium">
                                        配件名称
                                      </th>
                                      <th className="px-3 py-2 text-center font-medium w-16">
                                        数量
                                      </th>
                                      <th className="px-3 py-2 text-right font-medium w-20">
                                        单价
                                      </th>
                                      <th className="px-3 py-2 text-right font-medium w-20">
                                        小计
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {record.partsReplaced.map((p, idx) => (
                                      <tr key={idx}>
                                        <td className="px-3 py-2 text-slate-700">
                                          {p.name}
                                        </td>
                                        <td className="px-3 py-2 text-center text-slate-600">
                                          {p.quantity}
                                        </td>
                                        <td className="px-3 py-2 text-right text-slate-600">
                                          {formatMoney(p.unitPrice)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium text-slate-800">
                                          {formatMoney(p.quantity * p.unitPrice)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {record.afterPhotos.length > 0 && (
                            <div>
                              <div className="text-xs text-slate-500 mb-1.5">维修后照片</div>
                              <div className="grid grid-cols-3 gap-2">
                                {record.afterPhotos.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt=""
                                    className="aspect-video object-cover rounded-lg border border-slate-200"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function WrenchReplacement() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary-500"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
