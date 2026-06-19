import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, UserPlus, Ruler, Weight, Footprints, Phone, Music, Scissors } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { VoicePart, Student } from "@/types";

const VOICE_PARTS: VoicePart[] = ["女高音", "女低音", "男高音", "男低音", "童声"];

export default function StudentForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== "new";
  const { addStudent, updateStudent, getStudent } = useAppStore();

  const [form, setForm] = useState({
    name: "",
    className: "",
    height: 160,
    weight: 50,
    shoeSize: 38,
    voicePart: "女高音" as VoicePart,
    needAlter: false,
    contact: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      const student = getStudent(id);
      if (student) {
        setForm({
          name: student.name,
          className: student.className,
          height: student.height,
          weight: student.weight,
          shoeSize: student.shoeSize,
          voicePart: student.voicePart,
          needAlter: student.needAlter,
          contact: student.contact,
        });
      }
    }
  }, [isEdit, id, getStudent]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "请输入学生姓名";
    if (!form.className.trim()) newErrors.className = "请输入班级";
    if (form.height < 100 || form.height > 220) newErrors.height = "请输入合理的身高";
    if (form.weight < 20 || form.weight > 200) newErrors.weight = "请输入合理的体重";
    if (form.shoeSize < 20 || form.shoeSize > 50) newErrors.shoeSize = "请输入合理的鞋码";
    if (!form.contact.trim()) newErrors.contact = "请输入联系方式";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && id) {
      updateStudent(id, form as Partial<Student>);
    } else {
      addStudent(form);
    }
    navigate("/students");
  };

  return (
    <div className="animate-fade-slide-up">
      <Link to="/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回学生列表
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="card-static p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-600/30">
              {isEdit ? <Ruler className="w-7 h-7 text-white" /> : <UserPlus className="w-7 h-7 text-white" />}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                {isEdit ? "编辑学生档案" : "新增学生档案"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">请填写学生的详细信息，用于服装匹配</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`input-field ${errors.name ? "border-red-400 focus:ring-red-400/30" : ""}`}
                  placeholder="请输入学生姓名"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="label">
                  班级 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className={`input-field ${errors.className ? "border-red-400 focus:ring-red-400/30" : ""}`}
                  placeholder="例如：高二(3)班"
                />
                {errors.className && <p className="text-xs text-red-500 mt-1">{errors.className}</p>}
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  声部
                </label>
                <select
                  value={form.voicePart}
                  onChange={(e) => setForm({ ...form, voicePart: e.target.value as VoicePart })}
                  className="input-field"
                >
                  {VOICE_PARTS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  改裤长需求
                </label>
                <label className="flex items-center gap-3 cursor-pointer py-2.5">
                  <input
                    type="checkbox"
                    checked={form.needAlter}
                    onChange={(e) => setForm({ ...form, needAlter: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-slate-700">需要修改裤长</span>
                </label>
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  身高(cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                  className={`input-field ${errors.height ? "border-red-400 focus:ring-red-400/30" : ""}`}
                />
                {errors.height && <p className="text-xs text-red-500 mt-1">{errors.height}</p>}
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Weight className="w-4 h-4" />
                  体重(kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                  className={`input-field ${errors.weight ? "border-red-400 focus:ring-red-400/30" : ""}`}
                />
                {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight}</p>}
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Footprints className="w-4 h-4" />
                  鞋码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.shoeSize}
                  onChange={(e) => setForm({ ...form, shoeSize: Number(e.target.value) })}
                  className={`input-field ${errors.shoeSize ? "border-red-400 focus:ring-red-400/30" : ""}`}
                />
                {errors.shoeSize && <p className="text-xs text-red-500 mt-1">{errors.shoeSize}</p>}
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  联系方式 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className={`input-field ${errors.contact ? "border-red-400 focus:ring-red-400/30" : ""}`}
                  placeholder="手机号"
                />
                {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
              <button type="submit" className="btn-primary sm:ml-auto">
                <Save className="w-5 h-5" />
                {isEdit ? "保存修改" : "创建档案"}
              </button>
              <Link to="/students" className="btn-secondary">取消</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
