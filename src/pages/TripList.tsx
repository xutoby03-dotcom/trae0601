import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { formatDate } from "@/utils/format";
import {
  Plus,
  CalendarDays,
  MapPin,
  ChevronRight,
  Package,
  ClipboardList,
  Trash2,
  X,
  Save,
} from "lucide-react";
import type { TripStatus } from "@/types";

const statusStyles: Record<TripStatus, string> = {
  planning: "bg-sky2-100 text-sky2-700",
  ongoing: "bg-forest-100 text-forest-700",
  completed: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<TripStatus, string> = {
  planning: "筹备中",
  ongoing: "进行中",
  completed: "已结束",
};

export default function TripList() {
  const navigate = useNavigate();
  const { trips, addTrip, deleteTrip, getTripReturnChecks } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !location) return;

    addTrip({
      name,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      location,
      status: "planning",
      notes: notes || undefined,
    });

    setName("");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setNotes("");
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个活动吗？相关的装箱清单和归还检查记录也会被删除。")) {
      deleteTrip(id);
    }
  };

  const renderActionButton = (trip: { id: string; status: TripStatus }) => {
    const returnChecks = getTripReturnChecks(trip.id);
    const hasReturnCheck = returnChecks.length > 0;

    if (trip.status === "planning" || trip.status === "ongoing") {
      return (
        <button
          onClick={() => navigate(`/trips/${trip.id}/pack`)}
          className="btn btn-primary btn-sm"
        >
          <Package className="w-4 h-4" />
          装箱清单
        </button>
      );
    }

    if (trip.status === "completed") {
      if (hasReturnCheck) {
        return (
          <button
            onClick={() => navigate(`/trips/${trip.id}/check`)}
            className="btn btn-secondary btn-sm"
          >
            <ClipboardList className="w-4 h-4" />
            查看归还
          </button>
        );
      }
      return (
        <button
          onClick={() => navigate(`/trips/${trip.id}/check`)}
          className="btn btn-earth btn-sm"
        >
          <ClipboardList className="w-4 h-4" />
          开始归还检查
        </button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-forest-800">露营活动</h1>
          <p className="text-forest-500 mt-1">管理你的露营出行计划</p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          创建活动
        </button>
      </div>

      {formOpen && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-forest-800">新建露营活动</h2>
            <button
              onClick={() => setFormOpen(false)}
              className="p-1.5 rounded-lg hover:bg-forest-50 text-forest-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">活动名称 *</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：五一莫干山露营"
                  required
                />
              </div>
              <div>
                <label className="label">目的地 *</label>
                <input
                  type="text"
                  className="input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例如：浙江莫干山 4x4营地"
                  required
                />
              </div>
              <div>
                <label className="label">开始日期 *</label>
                <input
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">结束日期 *</label>
                <input
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">备注</label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="活动人数、特殊准备事项等..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button type="submit" className="btn btn-primary">
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays className="w-16 h-16 text-forest-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-forest-700 mb-2">暂无露营活动</h3>
          <p className="text-forest-500 mb-4">点击右上角"创建活动"开始规划你的下一次露营</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-forest-800 truncate">{trip.name}</h3>
                    <span className={`badge ${statusStyles[trip.status]} flex-shrink-0`}>
                      {statusLabels[trip.status]}
                    </span>
                  </div>
                  {trip.notes && (
                    <p className="text-sm text-forest-500 line-clamp-1">{trip.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="删除活动"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-forest-600">
                  <CalendarDays className="w-4 h-4 text-forest-400" />
                  <span>
                    {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-forest-600">
                  <MapPin className="w-4 h-4 text-forest-400" />
                  <span className="truncate">{trip.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-forest-100">
                {renderActionButton(trip)}
                <button
                  onClick={() => {
                    if (trip.status === "completed") {
                      navigate(`/trips/${trip.id}/check`);
                    } else {
                      navigate(`/trips/${trip.id}/pack`);
                    }
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  详情
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
