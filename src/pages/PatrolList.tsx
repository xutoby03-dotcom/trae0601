import { useEffect, useState } from "react";
import { useStore } from "@/store";
import Button from "@/components/Button";
import Drawer from "@/components/Drawer";
import StatusBadge from "@/components/StatusBadge";
import { Select, Textarea, Input } from "@/components/FormFields";
import type { VehicleStatus } from "@/types";
import { STATUS_LABELS, formatDateTime } from "@/utils";
import { Plus, User, Clock, MapPin, Camera, MessageSquare } from "lucide-react";

interface PatrolForm {
  vehicleId: string;
  areaId: string;
  status: VehicleStatus;
  remark: string;
  photoUrl: string;
  patrolUser: string;
}

export default function PatrolList() {
  const { patrols, areas, vehicles, fetchPatrols, fetchAreas, fetchVehicles, createPatrol } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterArea, setFilterArea] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState<PatrolForm>({
    vehicleId: "",
    areaId: "",
    status: "normal",
    remark: "",
    photoUrl: "",
    patrolUser: "系统管理员",
  });

  useEffect(() => {
    fetchAreas();
    fetchVehicles();
    fetchPatrols();
  }, [fetchAreas, fetchVehicles, fetchPatrols]);

  useEffect(() => {
    fetchPatrols({
      areaId: filterArea || undefined,
      status: (filterStatus as VehicleStatus) || undefined,
    });
  }, [filterArea, filterStatus, fetchPatrols]);

  const filteredVehicles = vehicles.filter((v) => !form.areaId || v.areaId === form.areaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
      await createPatrol({
        ...form,
        areaId: selectedVehicle?.areaId || form.areaId,
      });
      setDrawerOpen(false);
      setForm({
        vehicleId: "",
        areaId: "",
        status: "normal",
        remark: "",
        photoUrl: "",
        patrolUser: "系统管理员",
      });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">巡查记录</h2>
          <p className="mt-1 text-sm text-slate-500">日常巡检与异常标记 · 共 {patrols.length} 条记录</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus size={16} /> 新增巡查
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <Select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            options={[
              { value: "", label: "全部区域" },
              ...areas.map((a) => ({ value: a.id, label: a.name })),
            ]}
            className="w-48"
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "", label: "全部状态" },
              ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
            ]}
            className="w-40"
          />
        </div>

        {patrols.length === 0 ? (
          <div className="py-16 text-center text-slate-400">暂无巡查记录</div>
        ) : (
          <div className="p-6">
            <ol className="relative border-l-2 border-slate-100 space-y-6">
              {patrols.map((p) => (
                <li key={p.id} className="pl-6 relative">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-primary-500" />
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-primary-200 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-slate-800">{p.plateNumber}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {p.areaName}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} /> {p.patrolUser}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {formatDateTime(p.patrolTime)}
                          </span>
                        </div>
                      </div>
                      {p.vehiclePhotoUrl && (
                        <div className="w-20 h-16 rounded-md overflow-hidden bg-slate-200 flex-shrink-0">
                          <img src={p.vehiclePhotoUrl} alt="车辆" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    {p.remark && (
                      <div className="flex items-start gap-2 text-sm text-slate-600 bg-white rounded-md p-3 border border-slate-100">
                        <MessageSquare size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <p>{p.remark}</p>
                      </div>
                    )}
                    {p.photoUrl && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                          <Camera size={12} /> 现场照片
                        </p>
                        <div className="w-40 h-28 rounded-md overflow-hidden bg-slate-200">
                          <img src={p.photoUrl} alt="现场" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="新增巡查记录">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="巡查区域"
            required
            value={form.areaId}
            onChange={(e) => setForm({ ...form, areaId: e.target.value, vehicleId: "" })}
            options={[
              { value: "", label: "请选择区域" },
              ...areas.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
          <Select
            label="巡查车辆"
            required
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            options={[
              { value: "", label: "请选择车辆" },
              ...filteredVehicles.map((v) => ({ value: v.id, label: `${v.plateNumber} · ${v.vehicleType}` })),
            ]}
          />
          <Select
            label="车辆状态"
            required
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
            options={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          />
          <Textarea
            label="巡查备注"
            placeholder="请描述现场情况..."
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
          />
          <Input
            label="现场照片 URL"
            placeholder="图片链接地址"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />
          <Input
            label="巡查人员"
            value={form.patrolUser}
            onChange={(e) => setForm({ ...form, patrolUser: e.target.value })}
          />
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1">
              提交巡查
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
