import { useEffect, useState } from "react";
import { useStore } from "@/store";
import Button from "@/components/Button";
import Drawer from "@/components/Drawer";
import StatusBadge from "@/components/StatusBadge";
import { Input, Select } from "@/components/FormFields";
import type { Vehicle, VehicleStatus, VehicleType, VehicleWithArea } from "@/types";
import { VEHICLE_TYPES, STATUS_LABELS, formatDate, daysBetween } from "@/utils";
import { Pencil, Trash2, Plus, Phone, Calendar, MapPin, Camera } from "lucide-react";

type VehicleForm = Omit<Vehicle, "id" | "createdAt">;

const emptyForm: VehicleForm = {
  plateNumber: "",
  vehicleType: "电动车",
  ownerPhone: "",
  areaId: "",
  photoUrl: "",
  status: "normal",
  lastMovedAt: new Date().toISOString(),
};

export default function VehicleList() {
  const { vehicles, areas, fetchVehicles, fetchAreas, createVehicle, updateVehicle, deleteVehicle } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleWithArea | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [filterArea, setFilterArea] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchAreas();
    fetchVehicles();
  }, [fetchAreas, fetchVehicles]);

  useEffect(() => {
    fetchVehicles({
      areaId: filterArea || undefined,
      status: (filterStatus as VehicleStatus) || undefined,
    });
  }, [filterArea, filterStatus, fetchVehicles]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (v: VehicleWithArea) => {
    setEditing(v);
    setForm({
      plateNumber: v.plateNumber,
      vehicleType: v.vehicleType,
      ownerPhone: v.ownerPhone,
      areaId: v.areaId,
      photoUrl: v.photoUrl,
      status: v.status,
      lastMovedAt: v.lastMovedAt,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateVehicle(editing.id, form);
      } else {
        await createVehicle(form);
      }
      setDrawerOpen(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此车辆登记信息吗？")) return;
    await deleteVehicle(id);
  };

  const filtered = vehicles.filter(
    (v) =>
      v.plateNumber.includes(keyword) ||
      v.ownerPhone.includes(keyword),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">车辆管理</h2>
          <p className="mt-1 text-sm text-slate-500">居民车辆登记 · 共 {vehicles.length} 辆</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> 登记车辆
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索车牌或电话..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-56 pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-slate-600">
                <th className="px-5 py-3 font-medium">车辆照片</th>
                <th className="px-5 py-3 font-medium">车牌/编号</th>
                <th className="px-5 py-3 font-medium">车型</th>
                <th className="px-5 py-3 font-medium">车主电话</th>
                <th className="px-5 py-3 font-medium">停放区域</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium">未挪动天数</th>
                <th className="px-5 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const days = daysBetween(v.lastMovedAt);
                return (
                  <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-14 h-14 rounded-md bg-slate-100 overflow-hidden">
                        {v.photoUrl ? (
                          <img src={v.photoUrl} alt={v.plateNumber} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Camera size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono font-semibold text-slate-800">{v.plateNumber}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{v.vehicleType}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone size={13} className="text-slate-400" />
                        {v.ownerPhone || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={13} className="text-primary-500" />
                        {v.areaName}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span className={days >= 15 ? "text-danger-600 font-semibold" : "text-slate-700"}>
                          {days} 天
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(v.lastMovedAt)}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          title="编辑"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                    暂无车辆数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "编辑车辆信息" : "登记车辆"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="车牌/编号"
            required
            placeholder="如：京A·12345"
            value={form.plateNumber}
            onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
          />
          <Select
            label="车型"
            value={form.vehicleType}
            onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
            options={VEHICLE_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Input
            label="车主电话"
            placeholder="手机号码"
            value={form.ownerPhone}
            onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
          />
          <Select
            label="停放区域"
            required
            value={form.areaId}
            onChange={(e) => setForm({ ...form, areaId: e.target.value })}
            options={[
              { value: "", label: "请选择区域" },
              ...areas.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
          <Select
            label="车辆状态"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
            options={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          />
          <Input
            label="车辆照片 URL"
            placeholder="图片链接地址"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />
          {form.photoUrl && (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <img src={form.photoUrl} alt="预览" className="w-full h-40 object-cover" />
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1">
              {editing ? "保存修改" : "登记车辆"}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
