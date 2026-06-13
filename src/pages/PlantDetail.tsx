import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  MapPin,
  Ruler,
  Calendar,
  Building2,
  Clock,
  Camera,
  AlertCircle,
  User,
  Phone,
} from "lucide-react";
import { useStore } from "@/store";
import {
  OPERATION_LABELS,
  PLANT_STATUS_LABELS,
  ISSUE_STATUS_LABELS,
} from "@/types";
import { formatDateTime, formatDate } from "@/utils/date";

const STATUS_STYLES: Record<string, string> = {
  healthy: "bg-forest-100 text-forest-700",
  warning: "bg-amber-100 text-amber-700",
  problem: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-forest-100 text-forest-700",
  closed: "bg-gray-100 text-gray-500",
};

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plant = useStore((s) => s.getPlantById(id || ""));
  const records = useStore((s) => s.getPlantRecords(id || ""));
  const issues = useStore((s) => s.getPlantIssues(id || ""));
  const supplier = useStore((s) =>
    plant ? s.getSupplierById(plant.supplierId) : undefined
  );
  const getStaffById = useStore((s) => s.getStaffById);
  const deletePlant = useStore((s) => s.deletePlant);

  if (!plant) {
    return (
      <div className="text-center py-16 text-forest-500">
        未找到该绿植信息
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("确定要删除这盆绿植的档案吗？相关的养护记录和问题也会被删除。")) {
      deletePlant(plant.id);
      navigate("/plants");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/plants")}
          className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回绿植列表
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/plants/${plant.id}/edit`)}
            className="btn btn-secondary"
          >
            <Edit3 className="w-4 h-4" />
            编辑
          </button>
          <button onClick={handleDelete} className="btn" style={{
            background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
            color: "white"
          }}>
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-forest-50">
          <div className="relative h-72 bg-cream-100">
            <img
              src={plant.photoUrl}
              alt={plant.species}
              className="w-full h-full object-cover"
            />
            <span
              className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-medium ${STATUS_STYLES[plant.status]}`}
            >
              {PLANT_STATUS_LABELS[plant.status]}
            </span>
          </div>
          <div className="p-6">
            <h1 className="font-serif text-2xl font-bold text-forest-800">
              {plant.species}
            </h1>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-forest-600">
                <MapPin className="w-5 h-5 text-forest-400" />
                <span>{plant.location}</span>
              </div>
              <div className="flex items-center gap-3 text-forest-600">
                <Ruler className="w-5 h-5 text-forest-400" />
                <span>盆径 Ø{plant.potDiameter}cm</span>
              </div>
              <div className="flex items-center gap-3 text-forest-600">
                <Clock className="w-5 h-5 text-forest-400" />
                <span>养护频率：{plant.maintenanceFrequency}</span>
              </div>
              <div className="flex items-center gap-3 text-forest-600">
                <Calendar className="w-5 h-5 text-forest-400" />
                <span>建档日期：{formatDate(plant.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-forest-600" />
              <h3 className="font-serif text-lg font-semibold text-forest-800">
                供应商信息
              </h3>
            </div>
            {supplier ? (
              <div className="bg-cream-50 rounded-xl p-5">
                <p className="font-medium text-forest-800">{supplier.name}</p>
                <div className="flex items-center gap-6 mt-3 text-sm text-forest-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {supplier.contact}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {supplier.phone}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-forest-400">暂无供应商信息</p>
            )}
          </div>

          {issues.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-warning" />
                <h3 className="font-serif text-lg font-semibold text-forest-800">
                  问题记录（{issues.length}）
                </h3>
              </div>
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-xl bg-cream-50 border border-cream-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-forest-800">
                            {issue.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[issue.status]}`}
                          >
                            {ISSUE_STATUS_LABELS[issue.status]}
                          </span>
                        </div>
                        <p className="text-sm text-forest-500 mt-1">
                          {issue.description}
                        </p>
                      </div>
                      <p className="text-xs text-forest-400 whitespace-nowrap ml-4">
                        截止：{formatDate(issue.deadline)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-forest-600" />
              <h3 className="font-serif text-lg font-semibold text-forest-800">
                养护历史（{records.length}）
              </h3>
            </div>
            {records.length === 0 ? (
              <p className="text-forest-400 text-center py-8">暂无养护记录</p>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-forest-100" />
                <div className="space-y-5">
                  {records.map((r, idx) => {
                    const staff = getStaffById(r.staffId);
                    return (
                      <div key={r.id} className="relative">
                        <div className="absolute -left-[18px] top-1 w-4 h-4 rounded-full bg-forest-500 border-4 border-white shadow" />
                        <div className="bg-cream-50 rounded-xl p-4 ml-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={staff?.avatar}
                                alt=""
                                className="w-6 h-6 rounded-full bg-white"
                              />
                              <span className="font-medium text-forest-800 text-sm">
                                {staff?.name}
                              </span>
                            </div>
                            <span className="text-xs text-forest-400">
                              {formatDateTime(r.checkinAt)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {r.operations.map((op) => (
                              <span
                                key={op}
                                className="text-xs px-2 py-1 bg-forest-100 text-forest-700 rounded-lg"
                              >
                                {OPERATION_LABELS[op]}
                              </span>
                            ))}
                          </div>
                          {r.notes && (
                            <p className="text-sm text-forest-500">{r.notes}</p>
                          )}
                          {r.photos.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {r.photos.map((p) => (
                                <div
                                  key={p.id}
                                  className="relative w-16 h-16 rounded-lg overflow-hidden bg-white"
                                >
                                  <img
                                    src={p.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5">
                                    {p.type === "before"
                                      ? "前"
                                      : p.type === "after"
                                      ? "后"
                                      : "详情"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
