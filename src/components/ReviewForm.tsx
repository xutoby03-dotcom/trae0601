import { useState } from "react";
import { User, Star, MessageSquare } from "lucide-react";
import { useBookStore } from "@/store/bookStore";

interface ReviewFormProps {
  bookId: string;
  onClose: () => void;
}

export default function ReviewForm({ bookId, onClose }: ReviewFormProps) {
  const { addReview } = useBookStore();
  const [formData, setFormData] = useState({
    studentName: "",
    rating: 5,
    content: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.content.trim()) return;
    addReview({ bookId, ...formData });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">你的名字 *</label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
            placeholder="请输入你的名字"
            className="w-full px-4 py-2.5 pl-11 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= formData.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300"
                } transition-colors`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">{formData.rating} 分</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">你的短评 *</label>
        <div className="relative">
          <MessageSquare className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-500" />
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="写下你对这本书的感想..."
            rows={4}
            className="w-full px-4 py-3 pl-11 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <button type="button" onClick={onClose} className="btn-secondary">
          取消
        </button>
        <button type="submit" className="btn-primary">
          发表短评
        </button>
      </div>
    </form>
  );
}
