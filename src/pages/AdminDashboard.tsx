import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CATEGORY_COLORS = [
  "#E87A3F",
  "#2D5A3D",
  "#CC5E2A",
  "#73AE86",
  "#F28C47",
  "#498E60",
  "#A84820",
  "#A8CBB3",
];

export default function AdminDashboard() {
  const books = useAppStore((state) => state.books);
  const borrowRecords = useAppStore((state) => state.borrowRecords);
  const donations = useAppStore((state) => state.donations);
  const cabinets = useAppStore((state) => state.cabinets);
  const markBookDamaged = useAppStore((state) => state.markBookDamaged);
  const markBookOffline = useAppStore((state) => state.markBookOffline);
  const reinstateBook = useAppStore((state) => state.reinstateBook);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const pendingCount = donations.filter((d) => d.status === "pending").length;

  const hotBooks = useMemo(
    () =>
      [...books]
        .filter((b) => b.status !== "offline")
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 10),
    [books]
  );

  const coldBooks = useMemo(
    () =>
      books
        .filter((b) => b.borrowCount <= 1 && b.status === "available")
        .sort((a, b) => a.borrowCount - b.borrowCount)
        .slice(0, 8),
    [books]
  );

  const damagedBooks = useMemo(
    () => books.filter((b) => b.status === "damaged" || b.status === "offline"),
    [books]
  );

  const categoryByGrade = useMemo(() => {
    const gradeMap: Record<string, Record<string, number>> = {};
    books.forEach((b) => {
      if (!gradeMap[b.suitableGrade]) gradeMap[b.suitableGrade] = {};
      gradeMap[b.suitableGrade][b.category] =
        (gradeMap[b.suitableGrade][b.category] || 0) + 1;
    });
    return Object.entries(gradeMap).map(([grade, cats]) => ({
      grade,
      ...cats,
    }));
  }, [books]);

  const overallCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    books.forEach((b) => {
      map[b.category] = (map[b.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [books]);

  const handleAction = (action: string, bookId: string, msg: string) => {
    if (action === "damaged") markBookDamaged(bookId);
    else if (action === "offline") markBookOffline(bookId);
    else if (action === "reinstate") reinstateBook(bookId);
    setToastMsg(msg);
    setShowToast(true);
  };

  const totalBorrowed = borrowRecords.filter(
    (r) => r.status !== "returned"
  ).length;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-forest-500" />
            管理员仪表盘
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            全局数据统计、热门冷门分析、图书状态管理
          </p>
        </div>
        <Link
          to="/admin/review"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all relative"
        >
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
          📋 捐书审核 {pendingCount > 0 && `(${pendingCount})`}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <BookOpen className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold font-serif">{books.length}</span>
          </div>
          <p className="text-primary-100 text-sm mt-2">藏书总量</p>
        </div>
        <div className="bg-gradient-to-br from-forest-500 to-forest-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <Layers className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold font-serif">{cabinets.length}</span>
          </div>
          <p className="text-forest-100 text-sm mt-2">柜格总数</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold font-serif">{totalBorrowed}</span>
          </div>
          <p className="text-amber-100 text-sm mt-2">漂流中</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold font-serif">
              {damagedBooks.length}
            </span>
          </div>
          <p className="text-red-100 text-sm mt-2">破损/下架</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-book border border-cream-200">
          <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            热门书籍 TOP 10
            <span className="text-xs font-normal text-gray-500 ml-auto">
              按借阅次数
            </span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hotBooks}
                layout="vertical"
                margin={{ left: 20, right: 10, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E3CC" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #F5E3CC",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="borrowCount" fill="#E87A3F" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-book border border-cream-200">
          <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-forest-500" />
            全馆图书类别分布
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#999", strokeWidth: 1 }}
                >
                  {overallCategoryData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #F5E3CC",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-book border border-cream-200 mb-6">
        <h3 className="font-serif font-bold text-gray-800 mb-4">
          📊 各年级最喜欢借阅的类别
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryByGrade} margin={{ top: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5E3CC" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #F5E3CC",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {[
                "儿童文学",
                "科普百科",
                "童话故事",
                "历史故事",
                "绘本漫画",
                "经典名著",
              ].map((cat, i) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-book border border-cream-200">
          <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-gray-500" />
            冷门占格图书
            <span className="text-xs font-normal text-gray-500 ml-auto">
              借阅 ≤ 1 次
            </span>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
            {coldBooks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                暂无冷门图书，漂流情况良好
              </p>
            ) : (
              coldBooks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200"
                >
                  <img
                    src={b.cover}
                    alt={b.title}
                    className="w-10 h-14 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {b.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.suitableGrade} · {b.category} · 借阅 {b.borrowCount} 次
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleAction(
                        "offline",
                        b.id,
                        "《" + b.title + "》已下架"
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <EyeOff className="w-3 h-3" />
                    下架
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-book border border-cream-200">
          <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            破损下架管理
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
            {damagedBooks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                暂无破损或下架图书 ✨
              </p>
            ) : (
              damagedBooks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{
                    background:
                      b.status === "damaged" ? "#FEF2F2" : "#F9FAFB",
                    borderColor:
                      b.status === "damaged" ? "#FECACA" : "#E5E7EB",
                  }}
                >
                  <img
                    src={b.cover}
                    alt={b.title}
                    className="w-10 h-14 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {b.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-gray-500">
                        {b.suitableGrade}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {b.status === "damaged" && (
                      <button
                        onClick={() =>
                          handleAction(
                            "offline",
                            b.id,
                            "《" + b.title + "》已下架"
                          )
                        }
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1"
                      >
                        <EyeOff className="w-3 h-3" />
                        下架
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleAction(
                          "reinstate",
                          b.id,
                          "《" + b.title + "》已重新上架"
                        )
                      }
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-forest-100 text-forest-700 hover:bg-forest-200 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      修复上架
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMsg}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
