import { useState } from "react";
import { User, GraduationCap, CalendarDays, Phone } from "lucide-react";
import { useBookStore } from "@/store/bookStore";

interface BorrowFormProps {
  bookId: string;
  onClose: () => void;
}

export default function BorrowForm({ bookId, onClose }: BorrowFormProps) {
  const { borrowBook } = useBookStore();
  const today = new Date().toISOString().split("T")[0];
  const defaultReturn = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    borrowerName: "",
    borrowerClass: "",
    expectedReturnDate: defaultReturn,
    contact: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.borrowerName.trim() || !formData.borrowerClass.trim()) return;
    borrowBook({ bookId, ...formData });
    onClose();
  };

  const fieldClass = "w-full px-4 py-2.5 pl-11 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">借阅人姓名 *</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              value={formData.borrowerName}
              onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
              placeholder="请输入学生姓名"
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">班级 *</label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              value={formData.borrowerClass}
              onChange={(e) => setFormData({ ...formData, borrowerClass: e.target.value })}
              placeholder="如：三(2)班"
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">预计归还日期</label>
          <div className="relative">
            <CalendarDays className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
            <input
              type="date"
              value={formData.expectedReturnDate}
              min={today}
              onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">联系方式</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="家长联系电话"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <button type="button" onClick={onClose} className="btn-secondary">
          取消
        </button>
        <button type="submit" className="btn-primary">
          确认借出
        </button>
      </div>
    </form>
  );
}
