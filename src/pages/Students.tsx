import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import Modal from "@/components/Modal";
import { CLASSES, SIZES } from "@/types";
import type { Student, Size } from "@/types";

const emptyForm: Omit<Student, "id" | "createdAt"> = {
  className: CLASSES[0],
  name: "",
  height: 130,
  weight: 30,
  originalSize: "M",
  phone: "",
  remark: "",
};

export default function Students() {
  const { students, addStudent, updateStudent, deleteStudent } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        s.name.includes(search) ||
        s.phone.includes(search) ||
        s.className.includes(search);
      const matchClass = !filterClass || s.className === filterClass;
      return matchSearch && matchClass;
    });
  }, [students, search, filterClass]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(s: Student) {
    setEditingId(s.id);
    setForm({
      className: s.className,
      name: s.name,
      height: s.height,
      weight: s.weight,
      originalSize: s.originalSize,
      phone: s.phone,
      remark: s.remark,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      updateStudent(editingId, form);
    } else {
      addStudent(form);
    }
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">学生档案</h3>
            <p className="text-xs text-zinc-500 mt-1">共 {students.length} 名学生</p>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            新增学生
          </button>
        </div>
        <div className="px-6 py-4 border-b border-zinc-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="pl-9 pr-4 py-2 w-64 input"
              placeholder="搜索姓名、班级、电话..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              className="select w-40"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">全部班级</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>班级</th>
                <th>姓名</th>
                <th>身高(cm)</th>
                <th>体重(kg)</th>
                <th>原尺码</th>
                <th>联系电话</th>
                <th>备注</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="whitespace-nowrap">{s.className}</td>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.height}</td>
                  <td>{s.weight}</td>
                  <td>
                    <span className="badge bg-primary-50 text-primary-700 border border-primary-100">
                      {s.originalSize}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-zinc-600">{s.phone}</td>
                  <td className="text-zinc-500 max-w-xs truncate">{s.remark || "-"}</td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-primary-600 mr-1"
                      onClick={() => openEdit(s)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-md text-zinc-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        if (confirm(`确定删除学生「${s.name}」吗？`)) {
                          deleteStudent(s.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400">
                    暂无学生数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "编辑学生档案" : "新增学生档案"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              取消
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {editingId ? "保存修改" : "确认新增"}
            </button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">班级</label>
              <select
                className="select"
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">姓名 *</label>
              <input
                className="input"
                placeholder="请输入学生姓名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">身高 (cm)</label>
              <input
                type="number"
                className="input"
                min={80}
                max={200}
                value={form.height}
                onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">体重 (kg)</label>
              <input
                type="number"
                className="input"
                min={10}
                max={150}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">原尺码</label>
              <select
                className="select"
                value={form.originalSize}
                onChange={(e) => setForm({ ...form, originalSize: e.target.value as Size })}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">联系电话</label>
              <input
                className="input"
                placeholder="家长联系电话"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="特殊体质、注意事项等"
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
