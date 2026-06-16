import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gift,
  Upload,
  User,
  BookOpen,
  Tag,
  AlertTriangle,
  CheckCircle2,
  BookMarked,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { GRADES, CATEGORIES, APPROPRIATE_CATEGORIES } from "@/types";
import { CLASSES } from "@/data/mockData";
import Toast from "@/components/Toast";
import { gradeColor } from "@/utils/helpers";

export default function DonatePage() {
  const navigate = useNavigate();
  const submitDonation = useAppStore((state) => state.submitDonation);
  const existingBooks = useAppStore((state) => state.books);

  const [formData, setFormData] = useState({
    bookTitle: "",
    bookAuthor: "",
    suitableGrade: "",
    category: "",
    donorClass: "",
    donorName: "",
  });
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const warnings = useMemo(() => {
    const result: { type: "info" | "warning" | "error"; message: string }[] = [];

    if (formData.bookTitle && formData.bookAuthor) {
      const duplicates = existingBooks.filter(
        (b) =>
          b.title.toLowerCase() === formData.bookTitle.toLowerCase() &&
          b.author.toLowerCase() === formData.bookAuthor.toLowerCase()
      );
      if (duplicates.length >= 3) {
        result.push({
          type: "warning",
          message: `⚠️ 系统中已有 ${duplicates.length} 本相同书籍，可能因重复率过高被拒`,
        });
      } else if (duplicates.length > 0) {
        result.push({
          type: "info",
          message: `ℹ️ 系统中已有 ${duplicates.length} 本相同书籍`,
        });
      }
    }

    if (formData.suitableGrade && formData.category) {
      const appropriate = APPROPRIATE_CATEGORIES[formData.suitableGrade] || [];
      if (!appropriate.includes(formData.category)) {
        result.push({
          type: "warning",
          message: `⚠️ ${formData.suitableGrade}通常更适合：${appropriate.join("、")}，内容可能不适合低年级`,
        });
      }
    }

    return result;
  }, [formData, existingBooks]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateCover = () => {
    const seed = encodeURIComponent(
      `${formData.bookTitle || "book"} ${formData.category || "story"} illustration children`
    );
    const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${seed}&image_size=portrait_4_3`;
    setCoverPreview(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { bookTitle, bookAuthor, suitableGrade, category, donorClass, donorName } =
      formData;
    if (!bookTitle || !bookAuthor || !suitableGrade || !category || !donorClass || !donorName) {
      return;
    }

    const cover =
      coverPreview ||
      `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
        `${bookTitle} ${category} children book cover`
      )}&image_size=portrait_4_3`;

    setSubmitting(true);
    setTimeout(() => {
      submitDonation({
        bookTitle,
        bookAuthor,
        cover,
        suitableGrade,
        category,
        donorName,
        donorClass,
      });
      setSubmitting(false);
      setShowToast(true);
      setTimeout(() => navigate("/"), 1800);
    }, 800);
  };

  const isFormValid =
    formData.bookTitle &&
    formData.bookAuthor &&
    formData.suitableGrade &&
    formData.category &&
    formData.donorClass &&
    formData.donorName;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary-500" />
          我要捐书
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          让闲置的好书漂流起来，等待管理员审核后即可上架
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-book border border-cream-200">
          <h3 className="font-serif font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-500" />
            书籍封面
          </h3>
          <div className="flex items-start gap-5">
            {coverPreview ? (
              <div className="relative w-32 h-44 rounded-xl overflow-hidden shadow-book flex-shrink-0">
                <img
                  src={coverPreview}
                  alt="封面预览"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverPreview("")}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-md"
                >
                  更换
                </button>
              </div>
            ) : (
              <div className="w-32 h-44 rounded-xl border-2 border-dashed border-cream-300 bg-cream-50 flex flex-col items-center justify-center flex-shrink-0">
                <BookMarked className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 text-center px-2">
                  点击生成封面预览
                </p>
              </div>
            )}
            <div className="flex-1 pt-2">
              <button
                type="button"
                onClick={generateCover}
                disabled={!formData.bookTitle}
                className="px-4 py-2 rounded-xl bg-cream-200 text-gray-700 text-sm font-medium hover:bg-cream-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {coverPreview ? "重新生成封面" : "生成封面预览"}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                请先填写书名后生成封面预览，也可以留空自动生成
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-book border border-cream-200">
          <h3 className="font-serif font-bold text-gray-800 mb-5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-forest-500" />
            书籍信息
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                书名 *
              </label>
              <input
                type="text"
                required
                value={formData.bookTitle}
                onChange={(e) => updateField("bookTitle", e.target.value)}
                placeholder="请输入书籍名称"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作者 *
              </label>
              <input
                type="text"
                required
                value={formData.bookAuthor}
                onChange={(e) => updateField("bookAuthor", e.target.value)}
                placeholder="请输入作者姓名"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  适合年级 *
                </label>
                <select
                  required
                  value={formData.suitableGrade}
                  onChange={(e) => updateField("suitableGrade", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white"
                >
                  <option value="">请选择</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  书籍分类 *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white"
                >
                  <option value="">请选择</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-book border border-cream-200">
          <h3 className="font-serif font-bold text-gray-800 mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            捐赠者信息
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                捐赠班级 *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                {CLASSES.map((cls) => (
                  <label
                    key={cls.id}
                    className={`cursor-pointer text-sm px-3 py-2 rounded-lg border text-center transition-all ${
                      formData.donorClass === cls.name
                        ? "bg-primary-500 text-white border-primary-500 shadow-md"
                        : "bg-white border-cream-300 hover:border-primary-300 hover:bg-primary-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="donorClass"
                      value={cls.name}
                      checked={formData.donorClass === cls.name}
                      onChange={(e) => updateField("donorClass", e.target.value)}
                      className="hidden"
                    />
                    {cls.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                捐赠者姓名 *
              </label>
              <input
                type="text"
                required
                value={formData.donorName}
                onChange={(e) => updateField("donorName", e.target.value)}
                placeholder="请输入你的姓名"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
              />
            </div>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 animate-slide-up">
            <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              系统预检提示
            </h4>
            <ul className="space-y-1.5">
              {warnings.map((w, i) => (
                <li
                  key={i}
                  className={`text-sm ${
                    w.type === "error"
                      ? "text-red-700"
                      : w.type === "warning"
                      ? "text-amber-700"
                      : "text-blue-700"
                  }`}
                >
                  {w.message}
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600 mt-3">
              * 以上提示不影响提交，最终以管理员审核为准
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || submitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {submitting ? (
            "提交中..."
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              提交审核
            </>
          )}
        </button>
      </form>

      {showToast && (
        <Toast
          message="提交成功！等待管理员审核后即可上架 🌟"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
