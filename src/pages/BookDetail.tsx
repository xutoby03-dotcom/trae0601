import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Book,
  User,
  Gift,
  GraduationCap,
  Package,
  Edit3,
  Trash2,
  BookOpen,
  RotateCcw,
  AlertOctagon,
  MessageSquarePlus,
  Star,
  CalendarDays,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Modal from "@/components/Modal";
import BookForm from "@/components/BookForm";
import BorrowForm from "@/components/BorrowForm";
import DamageForm from "@/components/DamageForm";
import ReviewForm from "@/components/ReviewForm";
import { useBookStore } from "@/store/bookStore";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import type { BorrowRecord } from "@/types";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    books,
    boxes,
    deleteBook,
    getBorrowRecordsByBook,
    getReviewsByBook,
    getActiveBorrowRecord,
    returnBook,
  } = useBookStore();

  const book = books.find((b) => b.id === id);
  const borrowRecords = id ? getBorrowRecordsByBook(id) : [];
  const reviews = id ? getReviewsByBook(id) : [];
  const activeRecord = id ? getActiveBorrowRecord(id) : undefined;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [isDamageOpen, setIsDamageOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Book className="w-16 h-16 mb-4 text-amber-300" />
        <p className="text-lg">未找到该图书</p>
        <Link to="/books" className="btn-secondary mt-4">
          返回图书列表
        </Link>
      </div>
    );
  }

  const box = boxes.find((b) => b.id === book.boxId);
  const colors = STATUS_COLORS[book.status];

  const daysOverdue = () => {
    if (!activeRecord || activeRecord.status !== "overdue") return 0;
    const today = new Date();
    const expected = new Date(activeRecord.expectedReturnDate);
    return Math.ceil((today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleDelete = () => {
    if (confirm("确定要删除这本图书吗？相关借阅记录和短评也将被删除。")) {
      deleteBook(book.id);
      navigate("/books");
    }
  };

  const handleReturn = () => {
    if (activeRecord) {
      returnBook(activeRecord.id);
    }
  };

  const averageRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const getStatusBadge = (status: BorrowRecord["status"]) => {
    switch (status) {
      case "borrowing":
        return { label: "借阅中", cls: "bg-amber-100 text-amber-700" };
      case "returned":
        return { label: "已归还", cls: "bg-teal-100 text-teal-700" };
      case "overdue":
        return { label: "逾期", cls: "bg-red-100 text-red-700" };
      case "damaged":
        return { label: "破损", cls: "bg-orange-100 text-orange-700" };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-amber-100 flex items-center justify-center text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display text-3xl text-gray-800">图书详情</h2>
          <p className="text-gray-500 text-sm">查看图书信息、借阅记录和读者评价</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center">
            <div className="w-48 h-64 rounded-2xl overflow-hidden shadow-xl bg-amber-50">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Book className="w-16 h-16 text-amber-300" />
                </div>
              )}
            </div>

            <span className={`badge mt-5 ${colors.bg} ${colors.text} ${colors.border} border text-sm px-4 py-1.5`}>
              {STATUS_LABELS[book.status]}
            </span>

            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 mt-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(averageRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length}条)
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3 pt-6 border-t border-amber-50">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">作者</p>
                <p className="text-gray-800 font-medium">{book.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-teal-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">捐赠人</p>
                <p className="text-gray-800 font-medium">{book.donor || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">适合年级</p>
                <p className="text-gray-800 font-medium">{book.gradeLevel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">漂流箱</p>
                <p className="text-gray-800 font-medium">{box?.name || "未知"}</p>
                <p className="text-gray-400 text-xs">{box?.location}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-amber-50 flex flex-col gap-2.5">
            {(book.status === "in_box") && (
              <button onClick={() => setIsBorrowOpen(true)} className="btn-primary flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>借出图书</span>
              </button>
            )}
            {(book.status === "borrowed" || book.status === "overdue") && activeRecord && (
              <>
                <button onClick={handleReturn} className="btn-teal flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>正常归还</span>
                </button>
                <button onClick={() => setIsDamageOpen(true)} className="btn-secondary flex items-center justify-center gap-2">
                  <AlertOctagon className="w-4 h-4" />
                  <span>破损归还</span>
                </button>
              </>
            )}
            <button onClick={() => setIsReviewOpen(true)} className="btn-secondary flex items-center justify-center gap-2">
              <MessageSquarePlus className="w-4 h-4" />
              <span>写短评</span>
            </button>
            <div className="flex gap-2.5 pt-2">
              <button onClick={() => setIsEditOpen(true)} className="flex-1 py-2 px-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 text-sm">
                <Edit3 className="w-4 h-4" />
                <span>编辑</span>
              </button>
              <button onClick={handleDelete} className="flex-1 py-2 px-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 text-sm">
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeRecord && (
            <div
              className={`card p-5 animate-slide-up ${
                activeRecord.status === "overdue" ? "border-red-200 bg-red-50/50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    {activeRecord.status === "overdue" ? (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-600">逾期未还</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-amber-500" />
                        <span className="text-amber-600">借阅中</span>
                      </>
                    )}
                  </h3>
                  {activeRecord.status === "overdue" && (
                    <p className="text-red-500 text-sm mt-1 font-medium">
                      已逾期 {daysOverdue()} 天，请及时提醒归还
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">借阅人</p>
                  <p className="text-gray-800 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {activeRecord.borrowerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">班级</p>
                  <p className="text-gray-800 font-medium flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                    {activeRecord.borrowerClass}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">借出日期</p>
                  <p className="text-gray-800 font-medium flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                    {activeRecord.borrowDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">联系方式</p>
                  <p className="text-gray-800 font-medium flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {activeRecord.contact || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              借阅记录
            </h3>
            {borrowRecords.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">暂无借阅记录</div>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-amber-100" />
                <div className="space-y-4">
                  {borrowRecords.map((record) => {
                    const badge = getStatusBadge(record.status);
                    return (
                      <div key={record.id} className="relative pl-10">
                        <div
                          className={`absolute left-1 top-1 w-5 h-5 rounded-full border-2 border-white ${
                            record.status === "returned"
                              ? "bg-teal-500"
                              : record.status === "overdue"
                              ? "bg-red-500"
                              : record.status === "damaged"
                              ? "bg-orange-500"
                              : "bg-amber-500"
                          } shadow-sm flex items-center justify-center`}
                        >
                          {record.status === "returned" ? (
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <Clock className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{record.borrowerName}</span>
                              <span className="text-sm text-gray-500">{record.borrowerClass}</span>
                            </div>
                            <span className={`badge ${badge.cls}`}>{badge.label}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>借出: {record.borrowDate}</span>
                            <span>应还: {record.expectedReturnDate}</span>
                            {record.actualReturnDate && <span>实还: {record.actualReturnDate}</span>}
                          </div>
                          {record.damageNote && (
                            <div className="mt-2 p-2 bg-orange-50 rounded-lg text-xs text-orange-700 border border-orange-100">
                              <span className="font-medium">破损说明: </span>
                              {record.damageNote}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-teal-500" />
              读者短评 ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                还没有人写短评，快来做第一个吧！
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-gradient-to-br from-amber-50/50 to-teal-50/50 rounded-xl border border-amber-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                          {review.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{review.studentName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400 ml-1">{review.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-700 text-sm leading-relaxed">{review.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="编辑图书" size="lg">
        <BookForm book={book} onClose={() => setIsEditOpen(false)} />
      </Modal>

      <Modal isOpen={isBorrowOpen} onClose={() => setIsBorrowOpen(false)} title="借书登记">
        <BorrowForm bookId={book.id} onClose={() => setIsBorrowOpen(false)} />
      </Modal>

      <Modal isOpen={isDamageOpen} onClose={() => setIsDamageOpen(false)} title="破损归还登记">
        {activeRecord && <DamageForm recordId={activeRecord.id} onClose={() => setIsDamageOpen(false)} />}
      </Modal>

      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="写短评">
        <ReviewForm bookId={book.id} onClose={() => setIsReviewOpen(false)} />
      </Modal>
    </div>
  );
}
