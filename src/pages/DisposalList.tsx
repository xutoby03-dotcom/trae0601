import { useEffect, useState } from "react";
import { useStore } from "@/store";
import Button from "@/components/Button";
import Drawer from "@/components/Drawer";
import StatusBadge from "@/components/StatusBadge";
import { Select, Textarea, Input } from "@/components/FormFields";
import type { DisposalType } from "@/types";
import { DISPOSAL_TYPES, formatDateTime, formatDate, daysBetween } from "@/utils";
import { AlertTriangle, Phone, MapPin, Calendar, Camera, User, CheckCircle, Clock } from "lucide-react";

interface DisposalForm {
  vehicleId: string;
  areaId: string;
  disposalType: DisposalType;
  disposalTime: string;
  photoUrl: string;
  remark: string;
  handledBy: string;
}

type TabKey = "pending" | "done";

export default function DisposalList() {
  const {
    pendingDisposals,
    disposals,
    areas,
    fetchPendingDisposals,
    fetchDisposals,
    fetchAreas,
    createDisposal,
  } = useStore();
  const [tab, setTab] = useState<TabKey>("pending");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [form, setForm] = useState<DisposalForm>({
    vehicleId: "",
    areaId: "",
    disposalType: "清运",
    disposalTime: new Date().toISOString().slice(0, 16),
    photoUrl: "",
    remark: "",
    handledBy: "系统管理员",
  });

  useEffect(() => {
    fetchAreas();
    fetchPendingDisposals();
    fetchDisposals();
  }, [fetchAreas, fetchPendingDisposals, fetchDisposals]);

  const openHandle = (vehicleId: string, areaId: string) => {
    setSelectedVehicleId(vehicleId);
    setForm({
      vehicleId,
      areaId,
      disposalType: "清运",
      disposalTime: new Date().toISOString().slice(0, 16),
      photoUrl: "",
      remark: "",
      handledBy: "系统管理员",
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDisposal({
        ...form,
        disposalTime: new Date(form.disposalTime).toISOString(),
      });
      setDrawerOpen(false);
      fetchPendingDisposals();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">处理清单</h2>
          <p className="mt-1 text-sm text-slate-500">
            超期未挪车辆处理 · 待处理 {pendingDisposals.length} 辆 · 已处理 {disposals.length} 辆
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 flex">
          <button
            onClick={() => setTab("pending")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "pending"
                ? "border-primary-600 text-primary-600 bg-primary-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock size={15} />
            待处理
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-danger-100 text-danger-600 font-semibold">
              {pendingDisposals.length}
            </span>
          </button>
          <button
            onClick={() => setTab("done")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "done"
                ? "border-primary-600 text-primary-600 bg-primary-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <CheckCircle size={15} />
            已处理
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-success-100 text-success-600 font-semibold">
              {disposals.length}
            </span>
          </button>
        </div>

        <div className="p-6">
          {tab === "pending" ? (
            pendingDisposals.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle size={48} className="mx-auto text-success-300" />
                <p className="mt-3 text-slate-500">暂无待处理车辆，继续保持！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingDisposals.map((v) => {
                  const area = areas.find((a) => a.id === v.areaId);
                  return (
                    <div
                      key={v.id}
                      className="rounded-xl border border-warning-200 bg-gradient-to-br from-warning-50 to-white p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          {v.photoUrl ? (
                            <img src={v.photoUrl} alt={v.plateNumber} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Camera size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-800 text-lg">{v.plateNumber}</span>
                                <StatusBadge status={v.status} />
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{v.vehicleType}</p>
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-danger-100 text-danger-700 text-xs font-semibold">
                              <AlertTriangle size={12} />
                              {v.daysUnmoved} 天未挪
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-slate-400" />
                              {v.ownerPhone || "无联系方式"}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-primary-500" />
                              {area?.name || v.areaName}
                            </div>
                            <div className="flex items-center gap-1.5 col-span-2">
                              <Calendar size={12} className="text-slate-400" />
                              最后挪动：{formatDate(v.lastMovedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-warning-200/60 flex justify-end">
                        <Button onClick={() => openHandle(v.id, v.areaId)}>记录处理结果</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : disposals.length === 0 ? (
            <div className="py-16 text-center text-slate-400">暂无已处理记录</div>
          ) : (
            <div className="space-y-3">
              {disposals.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 flex gap-4 hover:border-primary-200 transition-colors"
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                    {d.vehiclePhotoUrl ? (
                      <img src={d.vehiclePhotoUrl} alt="车辆" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Camera size={18} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-semibold text-slate-800">{d.plateNumber}</span>
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-success-50 text-success-600 border border-success-200 font-medium">
                        {d.disposalType}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={12} /> {d.areaName}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {d.ownerPhone || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> 停放 {d.daysUnmoved} 天
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} /> 处理人：{d.handledBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatDateTime(d.disposalTime)}
                      </span>
                    </div>
                    {d.remark && <p className="text-sm text-slate-600 mt-2">备注：{d.remark}</p>}
                  </div>
                  {d.photoUrl && (
                    <div className="w-20 h-16 rounded-md overflow-hidden bg-slate-200 flex-shrink-0">
                      <img src={d.photoUrl} alt="处理现场" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="记录处理结果" width="w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="处理方式"
            required
            value={form.disposalType}
            onChange={(e) => setForm({ ...form, disposalType: e.target.value as DisposalType })}
            options={DISPOSAL_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Input
            label="处理时间"
            required
            type="datetime-local"
            value={form.disposalTime}
            onChange={(e) => setForm({ ...form, disposalTime: e.target.value })}
          />
          <Textarea
            label="处理备注"
            placeholder="请描述处理情况..."
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
          />
          <Input
            label="处理照片 URL"
            placeholder="处理现场图片链接"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />
          {form.photoUrl && (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <img src={form.photoUrl} alt="预览" className="w-full h-40 object-cover" />
            </div>
          )}
          <Input
            label="处理人"
            value={form.handledBy}
            onChange={(e) => setForm({ ...form, handledBy: e.target.value })}
          />
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1">
              确认处理
            </Button>
          </div>
        </form>
      </Drawer>

      {/* keep unused import to avoid warning */}
      <span className="hidden">{selectedVehicleId}</span>
    </div>
  );
}
