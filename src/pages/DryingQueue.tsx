import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "@/store";
import { DRYING_LOCATIONS, getCategory } from "@/data/constants";
import {
  formatDateTime,
  formatDuration,
  calcDryingProgress,
  formatDate,
} from "@/utils/format";
import EquipmentPhoto from "@/components/EquipmentPhoto";
import {
  Sun,
  MapPin,
  RefreshCw,
  CheckCircle2,
  Plus,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  Umbrella,
  Filter,
  AlertCircle,
  Check,
} from "lucide-react";
import type { DryingRecord } from "@/types";

export default function DryingQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const [activeFilter, setActiveFilter] = useState<"all" | "pending">(
    filterParam === "pending" ? "pending" : "all"
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [newEquipmentId, setNewEquipmentId] = useState("");
  const [newLocation, setNewLocation] = useState(DRYING_LOCATIONS[0]);

  useEffect(() => {
    if (filterParam === "pending") {
      setActiveFilter("pending");
    } else if (filterParam === "all" || !filterParam) {
      setActiveFilter("all");
    }
  }, [filterParam]);

  const handleFilterChange = (filter: "all" | "pending") => {
    setActiveFilter(filter);
    setSearchParams(filter === "all" ? {} : { filter });
  };

  const dryingRecords = useStore((s) => s.dryingRecords);
  const equipment = useStore((s) => s.equipment);
  const addDryingRecord = useStore((s) => s.addDryingRecord);
  const updateDryingRecord = useStore((s) => s.updateDryingRecord);
  const recordFlip = useStore((s) => s.recordFlip);
  const completeDrying = useStore((s) => s.completeDrying);

  const activeDrying = useMemo(
    () => dryingRecords.filter((d) => d.status === "drying"),
    [dryingRecords]
  );
  const pendingLocation = useMemo(
    () => activeDrying.filter((d) => d.location === "待分配"),
    [activeDrying]
  );
  const assignedDrying = useMemo(
    () => activeDrying.filter((d) => d.location !== "待分配"),
    [activeDrying]
  );
  const completedDrying = useMemo(
    () => dryingRecords.filter((d) => d.status === "completed"),
    [dryingRecords]
  );

  const displayList = useMemo(() => {
    if (activeFilter === "pending") return pendingLocation;
    return assignedDrying;
  }, [activeFilter, pendingLocation, assignedDrying]);

  const getEquipment = (id: string) => equipment.find((e) => e.id === id);

  const availableEquipment = useMemo(
    () =>
      equipment.filter(
        (e) =>
          e.status === "available" &&
          !dryingRecords.some((d) => d.equipmentId === e.id && d.status === "drying")
      ),
    [equipment, dryingRecords]
  );

  const handleAddDrying = () => {
    if (!newEquipmentId) return;
    addDryingRecord({
      equipmentId: newEquipmentId,
      location: newLocation,
      startTime: new Date().toISOString(),
    });
    setNewEquipmentId("");
    setNewLocation(DRYING_LOCATIONS[0]);
    setShowAddForm(false);
  };

  const handleLocationChange = (recordId: string, location: string) => {
    const record = dryingRecords.find((d) => d.id === recordId);
    const wasPending = record?.location === "待分配";
    updateDryingRecord(recordId, { location });
    setEditingLocationId(null);
    if (wasPending && location !== "待分配" && activeFilter === "pending") {
      handleFilterChange("all");
    }
  };

  const handleFlip = (record: DryingRecord) => {
    recordFlip(record.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky2-100 flex items-center justify-center">
            <Sun className="w-5 h-5 text-sky2-600" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-forest-800">晾晒管理</h1>
            <p className="text-sm text-forest-500">
              正在晾晒 {activeDrying.length} 件装备
              {pendingLocation.length > 0 && (
                <span className="ml-2 text-amber-600">
                  （{pendingLocation.length} 件待分配位置）
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-sky"
        >
          <Plus className="w-4 h-4" />
          手动添加晾晒
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-forest-500 mr-2">
          <Filter className="w-4 h-4" />
          筛选：
        </div>
        <button
          onClick={() => handleFilterChange("all")}
          className={`tag ${
            activeFilter === "all"
              ? "bg-sky2-500 text-white shadow-sm"
              : "bg-sky2-50 text-sky2-700 hover:bg-sky2-100"
          }`}
        >
          全部队列 ({assignedDrying.length})
        </button>
        <button
          onClick={() => handleFilterChange("pending")}
          className={`tag ${
            activeFilter === "pending"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          待分配位置 ({pendingLocation.length})
        </button>
      </div>

      {activeFilter === "pending" && pendingLocation.length > 0 && (
        <div className="card border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                以下装备刚从露营回来，需要分配晾晒位置
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                点击每张卡片上的位置选择框，分配到阳台、庭院等晾晒点后，它们会自动进入普通晾晒队列
              </p>
            </div>
          </div>
        </div>
      )}

      {activeFilter === "pending" && pendingLocation.length === 0 && (
        <div className="card p-8 text-center border-forest-100">
          <div className="w-16 h-16 rounded-2xl bg-forest-100 flex items-center justify-center mx-auto mb-3">
            <Check className="w-8 h-8 text-forest-600" />
          </div>
          <h3 className="font-serif font-semibold text-forest-800 text-lg">
            所有装备都已分配晾晒位置
          </h3>
          <p className="text-forest-500 mt-1">
            切换到"全部"筛选查看所有晾晒中的装备
          </p>
          <button
            onClick={() => handleFilterChange("all")}
            className="btn btn-secondary mt-4"
          >
            查看全部晾晒
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="card p-5 animate-fade-in-up">
          <h3 className="font-semibold text-forest-800 mb-4 flex items-center gap-2">
            <Umbrella className="w-4 h-4 text-sky2-500" />
            添加晾晒记录
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">选择装备</label>
              <select
                value={newEquipmentId}
                onChange={(e) => setNewEquipmentId(e.target.value)}
                className="input"
              >
                <option value="">-- 请选择装备 --</option>
                {availableEquipment.map((eq) => {
                  const cat = getCategory(eq.category);
                  return (
                    <option key={eq.id} value={eq.id}>
                      {cat.emoji} {eq.name} ({eq.code})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="label">晾晒位置</label>
              <select
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="input"
              >
                {DRYING_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleAddDrying}
              disabled={!newEquipmentId}
              className="btn btn-primary"
            >
              确认添加
            </button>
          </div>
        </div>
      )}

      {activeFilter === "all" && displayList.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky2-50 flex items-center justify-center mx-auto mb-4">
            <Sun className="w-8 h-8 text-sky2-400" />
          </div>
          <h3 className="font-semibold text-forest-800 mb-1">暂无晾晒中的装备</h3>
          <p className="text-sm text-forest-500">
            露营归来后装备需要晾晒时，从这里添加记录
          </p>
        </div>
      )}

      {displayList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((record) => {
            const eq = getEquipment(record.equipmentId);
            if (!eq) return null;
            const cat = getCategory(eq.category);
            const progress = calcDryingProgress(record.startTime);
            const isPending = record.location === "待分配";
            const editing = editingLocationId === record.id || isPending;

            return (
              <div
                key={record.id}
                className={`card animate-fade-in-up ${
                  isPending
                    ? "border-amber-300/80 ring-2 ring-amber-100"
                    : "border-sky2-200/80"
                }`}
              >
                <div
                  className={`h-1.5 ${
                    isPending
                      ? "bg-gradient-to-r from-amber-400 to-orange-300"
                      : "bg-gradient-to-r from-sky2-400 to-sky2-300"
                  }`}
                />
                <div className="p-5">
                  <div className="flex gap-4 mb-4">
                    <EquipmentPhoto
                      photo={eq.photo}
                      category={eq.category}
                      className="w-20 h-20 rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div
                            className={`badge ${cat.bgColor} ${cat.color} mb-1.5`}
                          >
                            {cat.emoji} {cat.name}
                          </div>
                          <h3 className="font-semibold text-forest-800 truncate">
                            {eq.name}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-2">
                        {editing ? (
                          <div className="flex gap-2">
                            <select
                              defaultValue={record.location}
                              className="input flex-1 py-1.5 text-sm"
                              autoFocus
                              onBlur={(e) =>
                                handleLocationChange(record.id, e.target.value)
                              }
                              onChange={(e) =>
                                handleLocationChange(record.id, e.target.value)
                              }
                            >
                              {DRYING_LOCATIONS.map((loc) => (
                                <option key={loc} value={loc}>
                                  {loc}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingLocationId(record.id)}
                            className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
                              isPending
                                ? "text-amber-700 hover:text-amber-600 font-medium"
                                : "text-forest-600 hover:text-sky2-600"
                            }`}
                          >
                            <MapPin className={`w-4 h-4 ${isPending ? "text-amber-500" : "text-sky2-500"}`} />
                            <span>{record.location}</span>
                            <span className={`text-xs ${isPending ? "text-amber-500" : "text-forest-400"}`}>
                              ({isPending ? "点击分配位置" : "点击编辑"})
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-forest-600">
                      <Clock className="w-4 h-4 text-forest-400" />
                      <span>开始：{formatDateTime(record.startTime)}</span>
                      <span className="text-forest-300">·</span>
                      <span className="text-sky2-700 font-medium">
                        已晾晒 {formatDuration(record.startTime)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-forest-500">晾干进度</span>
                        <span className="font-semibold text-sky2-700">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-sky2-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky2-400 to-sky2-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-forest-400 mt-1">
                        以24小时为基准计算
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-forest-100">
                    {record.flipTime ? (
                      <div className="flex items-center gap-1.5 text-sm text-forest-600">
                        <CheckCircle2 className="w-4 h-4 text-forest-500" />
                        <span>
                          已翻面 · {formatDateTime(record.flipTime)}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleFlip(record)}
                        className="btn btn-secondary !py-1.5 !px-3 text-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        未翻面
                      </button>
                    )}
                    <button
                      onClick={() => completeDrying(record.id)}
                      className="btn btn-primary !py-1.5 !px-4 text-sm"
                    >
                      收回入库
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-4 hover:bg-forest-50/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-forest-500" />
            <span className="font-semibold text-forest-800">已完成晾晒历史</span>
            <span className="badge bg-forest-100 text-forest-700">
              {completedDrying.length} 条
            </span>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-forest-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-forest-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-forest-100 overflow-x-auto">
            {completedDrying.length === 0 ? (
              <div className="p-8 text-center text-sm text-forest-500">
                暂无历史记录
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-forest-50/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-forest-700">
                      装备
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-forest-700">
                      位置
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-forest-700">
                      开始时间
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-forest-700">
                      完成时间
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-forest-700">
                      晾晒时长
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-forest-700">
                      翻面
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100">
                  {completedDrying.map((record) => {
                    const eq = getEquipment(record.equipmentId);
                    return (
                      <tr key={record.id} className="hover:bg-forest-50/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {eq ? getCategory(eq.category).emoji : "📦"}
                            </span>
                            <span className="text-forest-800 font-medium">
                              {eq?.name || "未知装备"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-forest-600">
                          {record.location}
                        </td>
                        <td className="px-4 py-3 text-forest-600">
                          {formatDate(record.startTime)}
                        </td>
                        <td className="px-4 py-3 text-forest-600">
                          {formatDate(record.endTime)}
                        </td>
                        <td className="px-4 py-3 text-sky2-700 font-medium">
                          {formatDuration(record.startTime, record.endTime)}
                        </td>
                        <td className="px-4 py-3">
                          {record.flipTime ? (
                            <span className="badge bg-forest-100 text-forest-700">
                              <CheckCircle2 className="w-3 h-3" />
                              已翻面
                            </span>
                          ) : (
                            <span className="badge bg-gray-100 text-gray-600">
                              未翻面
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
