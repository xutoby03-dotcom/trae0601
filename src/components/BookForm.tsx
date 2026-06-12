import { useState } from "react";
import { BookOpen, User, GraduationCap, Package, Image, Tag } from "lucide-react";
import type { Book, BookStatus } from "@/types";
import { GRADE_LEVELS, STATUS_LABELS } from "@/types";
import { useBookStore } from "@/store/bookStore";

interface BookFormProps {
  book?: Book;
  onClose: () => void;
}

export default function BookForm({ book, onClose }: BookFormProps) {
  const { addBook, updateBook, boxes } = useBookStore();
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    donor: book?.donor || "",
    gradeLevel: book?.gradeLevel || GRADE_LEVELS[0],
    boxId: book?.boxId || (boxes[0]?.id ?? ""),
    coverImage: book?.coverImage || "",
    status: (book?.status || "in_box") as BookStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) return;

    const finalCover =
      formData.coverImage ||
      `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
        formData.title + " book cover illustration children"
      )}&image_size=portrait_4_3`;

    if (book) {
      updateBook(book.id, { ...formData, coverImage: finalCover });
    } else {
      addBook({ ...formData, coverImage: finalCover });
    }
    onClose();
  };

  const fieldClass = "w-full px-4 py-2.5 pl-11 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">书名 *</label>
          <div className="relative">
            <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入书名"
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">作者 *</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="请输入作者"
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">捐赠人</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="text"
              value={formData.donor}
              onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
              placeholder="请输入捐赠人"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">适合年级</label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
            <select
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              className={fieldClass + " appearance-none pr-10"}
            >
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">所属漂流箱</label>
          <div className="relative">
            <Package className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
            <select
              value={formData.boxId}
              onChange={(e) => setFormData({ ...formData, boxId: e.target.value })}
              className={fieldClass + " appearance-none pr-10"}
            >
              {boxes.map((box) => (
                <option key={box.id} value={box.id}>
                  {box.name} - {box.location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })}
              className={fieldClass + " appearance-none pr-10"}
            >
              {(Object.keys(STATUS_LABELS) as BookStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">封面图片链接（可选）</label>
          <div className="relative">
            <Image className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="留空将自动生成封面"
              className={fieldClass}
            />
          </div>
          {formData.coverImage && (
            <div className="mt-3 w-24 h-32 rounded-lg overflow-hidden border border-amber-200">
              <img src={formData.coverImage} alt="预览" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <button type="button" onClick={onClose} className="btn-secondary">
          取消
        </button>
        <button type="submit" className="btn-primary">
          {book ? "保存修改" : "添加图书"}
        </button>
      </div>
    </form>
  );
}
