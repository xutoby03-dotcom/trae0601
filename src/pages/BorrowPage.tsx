import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, BookOpen, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { GRADES } from "@/types";
import { CLASSES } from "@/data/mockData";
import Toast from "@/components/Toast";
import { gradeColor, addDays, getToday } from "@/utils/helpers";

export default function BorrowPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const book = useAppStore((state) =>
    state.books.find((b) => b.id === bookId)
  );
  const borrowBook = useAppStore((state) => state.borrowBook);
  const cabinet = useAppStore((state) =>
    state.cabinets.find((c) => c.id === book?.cabinetId)
  );

  const [className, setClassName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState(addDays(14));
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!book) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">未找到该图书</p>
        <Link to="/" className="text-primary-600 hover:underline">
          返回柜格总览
        </Link>
      </div>
    );
  }

  if (book.status !== "available") {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">📖</div>
        <p className="text-gray-700 font-medium mb-2">这本书已被借出</p>
        <p className="text-gray-500 text-sm mb-4">请选择其他图书</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          浏览柜格
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !studentName) return;

    setSubmitting(true);
    setTimeout(() => {
      borrowBook({
        bookId: book.id,
        studentName,
        className,
        expectedReturnDate,
      });
      setSubmitting(false);
      setShowToast(true);
      setTimeout(() => navigate("/"), 1500);
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        返回柜格
      </Link>

      <div className="bg-white rounded-2xl shadow-book overflow-hidden border border-cream-200">
        <div className="p-6 bg-gradient-to-r from-forest-50 to-cream-100 border-b border-cream-200">
          <div className="flex gap-5">
            <div className="w-28 h-40 flex-shrink-0 rounded-xl overflow-hidden shadow-book">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
                {book.title}
              </h2>
              <p className="text-gray-600 text-sm mb-3">作者：{book.author}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium ${gradeColor(
                    book.suitableGrade
                  )}`}
                >
                  {book.suitableGrade}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-cream-200 text-gray-700 border border-cream-300">
                  {book.category}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                所在柜格：{cabinet?.name || "未分配"}
              </p>
              <p className="text-xs text-gray-500">
                捐赠者：{book.donorClass} · {book.donorName}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <h3 className="font-serif text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-500" />
            填写借阅信息
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              选择班级
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
              {GRADES.map((grade) => (
                <div key={grade} className="col-span-3">
                  <p className="text-xs text-gray-500 font-medium mt-2 mb-1 px-1">
                    {grade}
                  </p>
                </div>
              ))}
              {CLASSES.map((cls) => (
                <label
                  key={cls.id}
                  className={`cursor-pointer text-sm px-3 py-2 rounded-lg border text-center transition-all ${
                    className === cls.name
                      ? "bg-primary-500 text-white border-primary-500 shadow-md"
                      : "bg-white border-cream-300 hover:border-primary-300 hover:bg-primary-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="class"
                    value={cls.name}
                    checked={className === cls.name}
                    onChange={(e) => setClassName(e.target.value)}
                    className="hidden"
                  />
                  {cls.name.replace(cls.grade, "")}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              你的姓名
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="请输入你的姓名"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              预计归还日期
            </label>
            <div className="flex gap-2 flex-wrap mb-3">
              {[7, 14, 21, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setExpectedReturnDate(addDays(days))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    expectedReturnDate === addDays(days)
                      ? "bg-forest-500 text-white"
                      : "bg-cream-200 text-gray-700 hover:bg-cream-300"
                  }`}
                >
                  {days}天后
                </button>
              ))}
            </div>
            <input
              type="date"
              required
              min={getToday()}
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            />
          </div>

          <button
            type="submit"
            disabled={!className || !studentName || submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {submitting ? (
              "处理中..."
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                确认借阅
              </>
            )}
          </button>
        </form>
      </div>

      {showToast && (
        <Toast
          message="借阅成功！记得按时归还哦～"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
