import { useState } from "react";
import { FileText, Image, CheckCircle2 } from "lucide-react";
import { useBookStore } from "@/store/bookStore";

interface DamageFormProps {
  recordId: string;
  onClose: () => void;
}

export default function DamageForm({ recordId, onClose }: DamageFormProps) {
  const { returnDamagedBook } = useBookStore();
  const [formData, setFormData] = useState({
    damageNote: "",
    damagePhoto: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.damageNote.trim()) return;
    returnDamagedBook(recordId, formData.damageNote, formData.damagePhoto || undefined);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-orange-800">破损归还说明</h4>
          <p className="text-sm text-orange-600 mt-0.5">请详细记录图书的破损情况，便于后续修复或处理</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">破损说明 *</label>
        <textarea
          value={formData.damageNote}
          onChange={(e) => setFormData({ ...formData, damageNote: e.target.value })}
          placeholder="例如：封面有折痕、第15页有涂鸦、书脊脱胶等..."
          rows={4}
          className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">破损照片链接（可选）</label>
        <div className="relative">
          <Image className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
          <input
            type="url"
            value={formData.damagePhoto}
            onChange={(e) => setFormData({ ...formData, damagePhoto: e.target.value })}
            placeholder="请输入照片链接"
            className="w-full px-4 py-2.5 pl-11 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
        </div>
        {formData.damagePhoto && (
          <div className="mt-3 w-32 h-32 rounded-xl overflow-hidden border border-amber-200">
            <img src={formData.damagePhoto} alt="破损预览" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <button type="button" onClick={onClose} className="btn-secondary">
          取消
        </button>
        <button type="submit" className="btn-danger flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>确认破损归还</span>
        </button>
      </div>
    </form>
  );
}
