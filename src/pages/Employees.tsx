import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Building2,
  Shield,
  X,
  Check,
} from "lucide-react";
import Modal from "@/components/UI/Modal";
import Tag from "@/components/UI/Tag";
import { useEmployeeStore } from "@/store/employee";
import {
  DEPARTMENTS,
  PICKUP_POINTS,
  DIETARY_RESTRICTIONS,
  Department,
  PickupPoint,
  DietaryRestriction,
  Employee,
  UserRole,
} from "@/types";
import { cn } from "@/lib/utils";
import { DEPARTMENT_COLOR } from "@/utils/colors";

const DIETARY_COLOR: Record<DietaryRestriction, string> = {
  无辣: "success",
  素食: "purple",
  海鲜过敏: "danger",
  花生过敏: "warning",
  香菜: "info",
  葱: "pink",
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "管理员",
  leader: "负责人",
  employee: "员工",
};
const ROLE_COLOR: Record<UserRole, string> = {
  admin: "danger",
  leader: "purple",
  employee: "default",
};

interface FormState {
  name: string;
  department: Department;
  pickupPoint: PickupPoint;
  dietaryRestrictions: DietaryRestriction[];
  phoneLast4: string;
  role: UserRole;
}

const emptyForm: FormState = {
  name: "",
  department: "技术部",
  pickupPoint: "前台A区",
  dietaryRestrictions: [],
  phoneLast4: "",
  role: "employee",
};

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } =
    useEmployeeStore();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<Department | "all">("all");
  const [pointFilter, setPointFilter] = useState<PickupPoint | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    let list = employees;
    if (deptFilter !== "all")
      list = list.filter((e) => e.department === deptFilter);
    if (pointFilter !== "all")
      list = list.filter((e) => e.pickupPoint === pointFilter);
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(kw) ||
          e.phoneLast4.includes(kw)
      );
    }
    return list.sort((a, b) => {
      if (a.role !== b.role) return a.role === "admin" ? -1 : b.role === "admin" ? 1 : a.role === "leader" ? -1 : 1;
      return a.name.localeCompare(b.name, "zh");
    });
  }, [employees, search, deptFilter, pointFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      department: emp.department,
      pickupPoint: emp.pickupPoint,
      dietaryRestrictions: [...emp.dietaryRestrictions],
      phoneLast4: emp.phoneLast4,
      role: emp.role,
    });
    setModalOpen(true);
  };

  const submitForm = () => {
    if (!form.name.trim() || !form.phoneLast4.trim()) return;
    if (editing) {
      updateEmployee(editing.id, form);
    } else {
      addEmployee(form);
    }
    setModalOpen(false);
  };

  const toggleDietary = (d: DietaryRestriction) => {
    setForm((f) => ({
      ...f,
      dietaryRestrictions: f.dietaryRestrictions.includes(d)
        ? f.dietaryRestrictions.filter((x) => x !== d)
        : [...f.dietaryRestrictions, d],
    }));
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-800">
            员工档案
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            维护员工基础信息，取餐点和忌口将用于分装提醒
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> 新增员工
        </button>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索姓名或手机号后四位"
            className="input-base pl-10"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value as Department | "all")}
          className="select-base max-w-[160px]"
        >
          <option value="all">全部部门</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={pointFilter}
          onChange={(e) =>
            setPointFilter(e.target.value as PickupPoint | "all")
          }
          className="select-base max-w-[160px]"
        >
          <option value="all">全部取餐点</option>
          {PICKUP_POINTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <Tag variant="brand" size="md">
          共 {filtered.length} 人
        </Tag>
      </div>

      {filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-neutral-400">暂无匹配的员工</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((emp, i) => (
            <div
              key={emp.id}
              className={cn(
                "card-hover p-5 flex flex-col gap-4 animate-fade-in-up"
              )}
              style={{ animationDelay: `${Math.min(i * 30, 240)}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                  style={{ backgroundColor: emp.avatarColor }}
                >
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-neutral-800 truncate">
                      {emp.name}
                    </h3>
                    <Tag
                      variant={ROLE_COLOR[emp.role] as any}
                      dot
                    >
                      <Shield className="w-3 h-3" />
                      {ROLE_LABEL[emp.role]}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                    <Building2
                      className="w-3 h-3 shrink-0"
                      style={{ color: DEPARTMENT_COLOR[emp.department] }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: DEPARTMENT_COLOR[emp.department] }}
                    >
                      {emp.department}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span className="text-neutral-600">{emp.pickupPoint}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span className="text-neutral-600 font-mono tracking-wider">
                    ****{emp.phoneLast4}
                  </span>
                </div>
              </div>

              {emp.dietaryRestrictions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {emp.dietaryRestrictions.map((d) => (
                    <Tag
                      key={d}
                      variant={DIETARY_COLOR[d] as any}
                    >
                      {d}
                    </Tag>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">无特殊忌口</p>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => openEdit(emp)}
                  className="flex-1 btn-secondary !py-2 text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" /> 编辑
                </button>
                <button
                  onClick={() => setDeleteTarget(emp)}
                  className="flex-1 btn-danger !py-2 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "编辑员工信息" : "新增员工"}
        subtitle={editing ? "修改员工档案信息" : "录入新员工基础档案"}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={submitForm}
              disabled={!form.name.trim() || !form.phoneLast4.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {editing ? "保存修改" : "确认新增"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                姓名 <span className="text-danger-500">*</span>
              </label>
              <input
                className="input-base"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                手机号后四位 <span className="text-danger-500">*</span>
              </label>
              <input
                className="input-base font-mono"
                value={form.phoneLast4}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phoneLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                placeholder="如 8888"
                maxLength={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                所属部门
              </label>
              <select
                className="select-base"
                value={form.department}
                onChange={(e) =>
                  setForm({
                    ...form,
                    department: e.target.value as Department,
                  })
                }
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                取餐点
              </label>
              <select
                className="select-base"
                value={form.pickupPoint}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pickupPoint: e.target.value as PickupPoint,
                  })
                }
              >
                {PICKUP_POINTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              角色权限
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "leader", "employee"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={cn(
                    "py-2.5 rounded-xl border text-sm font-medium transition-all",
                    form.role === r
                      ? "border-brand-400 bg-brand-50 text-brand-600 shadow-sm"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              忌口/饮食偏好
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map((d) => {
                const active = form.dietaryRestrictions.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDietary(d)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      active
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300"
                    )}
                  >
                    {active && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="确认删除员工"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={confirmDelete} className="btn-danger">
              <Trash2 className="w-4 h-4" /> 确认删除
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          确定要删除员工
          <span className="font-semibold text-neutral-800 mx-1">
            {deleteTarget?.name}
          </span>
          吗？此操作无法撤销。
        </p>
      </Modal>
    </div>
  );
}
