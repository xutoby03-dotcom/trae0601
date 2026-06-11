import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Wrench,
  CheckCircle,
  Clock,
  User,
  Phone,
  Image,
  Plus,
  Monitor,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import Empty from "@/components/Empty";
import { FAULT_STATUS_LABELS } from "@/types";
import { formatDateTime, cn } from "@/lib/utils";
import type { FaultReport } from "@/types";

export default function FaultsPage() {
  const location = useLocation();
  const { rooms, faults, addFault, resolveFault, updateFault, getRoomById } =
    useStore();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFault, setSelectedFault] = useState<FaultReport | null>(null);
  const [preselectedRoomId, setPreselectedRoomId] = useState("");
  const [reportForm, setReportForm] = useState({
    roomId: "",
    description: "",
    reporter: "",
    reporterPhone: "",
    photos: [] as string[],
  });
  const [repairNote, setRepairNote] = useState("");

  const stateRoomId = (location.state as { roomId?: string })?.roomId;

  useEffect(() => {
    if (stateRoomId) {
      setPreselectedRoomId(stateRoomId);
      setReportForm((f) => ({ ...f, roomId: stateRoomId }));
      setIsReportModalOpen(true);
    }
  }, [stateRoomId]);

  const faultyRooms = rooms.filter((r) => r.status === "faulty");
  const availableRooms = rooms.filter(
    (r) => r.status !== "faulty" || r.status === "faulty"
  );

  const pendingFaults = faults.filter((f) => f.status === "pending");
  const repairingFaults = faults.filter((f) => f.status === "repairing");
  const resolvedFaults = faults.filter((f) => f.status === "resolved");

  const sortedFaults = [...faults].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleOpenReport = () => {
    if (rooms.length === 0) {
      alert("请先添加会议室");
      return;
    }
    setReportForm({
      roomId: preselectedRoomId || rooms[0]?.id || "",
      description: "",
      reporter: "",
      reporterPhone: "",
      photos: [],
    });
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.roomId) {
      alert("请选择会议室");
      return;
    }
    addFault({
      roomId: reportForm.roomId,
      description: reportForm.description,
      photos: reportForm.photos,
      reporter: reportForm.reporter,
      reporterPhone: reportForm.reporterPhone,
    });
    setIsReportModalOpen(false);
  };

  const handleViewDetail = (fault: FaultReport) => {
    setSelectedFault(fault);
    setRepairNote("");
    setIsDetailModalOpen(true);
  };

  const handleStartRepair = (id: string) => {
    updateFault(id, { status: "repairing" });
    if (selectedFault?.id === id) {
      setSelectedFault({ ...selectedFault, status: "repairing" });
    }
  };

  const handleResolve = () => {
    if (!selectedFault) return;
    if (!repairNote.trim()) {
      alert("请填写维修说明");
      return;
    }
    resolveFault(selectedFault.id, repairNote);
    setIsDetailModalOpen(false);
  };

  const handleAddPhoto = () => {
    const photoUrl = prompt("请输入照片URL（演示用）：");
    if (photoUrl) {
      setReportForm({
        ...reportForm,
        photos: [...reportForm.photos, photoUrl],
      });
    }
  };

  const FaultCard = ({ fault }: { fault: FaultReport }) => {
    const room = getRoomById(fault.roomId);

    return (
      <div
        className="bg-white rounded-xl p-4 shadow-soft cursor-pointer hover:shadow-card transition-all"
        onClick={() => handleViewDetail(fault)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                fault.status === "pending" && "bg-orange-100",
                fault.status === "repairing" && "bg-blue-100",
                fault.status === "resolved" && "bg-green-100"
              )}
            >
              <AlertTriangle
                size={20}
                className={cn(
                  fault.status === "pending" && "text-orange-600",
                  fault.status === "repairing" && "text-blue-600",
                  fault.status === "resolved" && "text-green-600"
                )}
              />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{room?.name || "未知会议室"}</h4>
              <p className="text-xs text-gray-500">
                上报时间：{formatDateTime(fault.createdAt)}
              </p>
            </div>
          </div>
          <StatusBadge variant={fault.status}>
            {FAULT_STATUS_LABELS[fault.status]}
          </StatusBadge>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {fault.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{fault.reporter}</span>
          </div>
          {fault.photos.length > 0 && (
            <div className="flex items-center gap-1">
              <Image size={12} />
              <span>{fault.photos.length}张照片</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">故障管理</h2>
          <p className="text-gray-500">上报和处理会议室投屏设备故障</p>
        </div>
        <button
          onClick={handleOpenReport}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all shadow-soft"
        >
          <Plus size={20} />
          上报故障
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingFaults.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Wrench size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">维修中</p>
              <p className="text-2xl font-bold text-gray-900">
                {repairingFaults.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已解决</p>
              <p className="text-2xl font-bold text-gray-900">
                {resolvedFaults.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {faults.length === 0 ? (
        <Empty
          message="暂无故障记录"
          description="设备运行良好，继续保持"
          icon={<AlertTriangle size={40} className="text-gray-400" />}
        />
      ) : (
        <div className="space-y-8">
          {pendingFaults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                待处理 ({pendingFaults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingFaults.map((fault) => (
                  <FaultCard key={fault.id} fault={fault} />
                ))}
              </div>
            </div>
          )}

          {repairingFaults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                维修中 ({repairingFaults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repairingFaults.map((fault) => (
                  <FaultCard key={fault.id} fault={fault} />
                ))}
              </div>
            </div>
          )}

          {resolvedFaults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                已解决 ({resolvedFaults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resolvedFaults.slice(0, 6).map((fault) => (
                  <FaultCard key={fault.id} fault={fault} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="上报故障"
        size="lg"
      >
        <form onSubmit={handleReportSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择会议室
            </label>
            <select
              value={reportForm.roomId}
              onChange={(e) =>
                setReportForm({ ...reportForm, roomId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              故障现象描述
            </label>
            <textarea
              value={reportForm.description}
              onChange={(e) =>
                setReportForm({ ...reportForm, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="请详细描述故障现象，如：投屏线接触不良、无线投屏搜不到设备等"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              故障照片
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {reportForm.photos.map((photo, index) => (
                <div
                  key={index}
                  className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden"
                >
                  <img
                    src={photo}
                    alt={`故障照片${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddPhoto}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-all"
              >
                <Image size={24} />
                <span className="text-xs mt-1">添加</span>
              </button>
            </div>
            <p className="text-xs text-gray-500">
              上传故障照片可以帮助管理员更快定位问题
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上报人
              </label>
              <input
                type="text"
                value={reportForm.reporter}
                onChange={(e) =>
                  setReportForm({ ...reportForm, reporter: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="您的姓名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话
              </label>
              <input
                type="tel"
                value={reportForm.reporterPhone}
                onChange={(e) =>
                  setReportForm({ ...reportForm, reporterPhone: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="联系电话"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all"
            >
              提交上报
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="故障详情"
        size="lg"
      >
        {selectedFault && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    selectedFault.status === "pending" && "bg-orange-100",
                    selectedFault.status === "repairing" && "bg-blue-100",
                    selectedFault.status === "resolved" && "bg-green-100"
                  )}
                >
                  <Monitor
                    size={24}
                    className={cn(
                      selectedFault.status === "pending" && "text-orange-600",
                      selectedFault.status === "repairing" && "text-blue-600",
                      selectedFault.status === "resolved" && "text-green-600"
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getRoomById(selectedFault.roomId)?.name || "未知会议室"}
                  </h3>
                  <StatusBadge variant={selectedFault.status}>
                    {FAULT_STATUS_LABELS[selectedFault.status]}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">故障描述</h4>
              <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                {selectedFault.description}
              </p>
            </div>

            {selectedFault.photos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">故障照片</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedFault.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={photo}
                        alt={`故障照片${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">上报人</h4>
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} className="text-gray-400" />
                  <span>{selectedFault.reporter}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">联系电话</h4>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{selectedFault.reporterPhone}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">上报时间</h4>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} className="text-gray-400" />
                <span>{formatDateTime(selectedFault.createdAt)}</span>
              </div>
            </div>

            {selectedFault.status === "resolved" && selectedFault.repairNote && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">维修说明</h4>
                <p className="text-gray-600 bg-green-50 rounded-xl p-4">
                  {selectedFault.repairNote}
                </p>
              </div>
            )}

            {(selectedFault.status === "pending" ||
              selectedFault.status === "repairing") && (
              <div className="pt-4 border-t border-gray-100">
                {selectedFault.status === "pending" && (
                  <button
                    onClick={() => handleStartRepair(selectedFault.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                  >
                    <Wrench size={18} />
                    开始维修
                  </button>
                )}
                {selectedFault.status === "repairing" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        维修说明
                      </label>
                      <textarea
                        value={repairNote}
                        onChange={(e) => setRepairNote(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="请填写维修完成情况说明"
                      />
                    </div>
                    <button
                      onClick={handleResolve}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
                    >
                      <CheckCircle size={18} />
                      维修完成，恢复可用
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
