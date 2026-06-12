import { useEffect, useState } from "react";
import { TrendingUp, Package, Clock, Award, BarChart3, BookOpen, ArrowUpRight } from "lucide-react";
import { useBookStore } from "@/store/bookStore";

export default function Stats() {
  const { books, borrowRecords, boxes, getPopularCategories, getBoxTurnoverRate, checkAndUpdateOverdue } =
    useBookStore();
  const popularCategories = getPopularCategories();
  const boxTurnover = getBoxTurnoverRate();

  const [animatedCounts, setAnimatedCounts] = useState({ books: 0, borrows: 0 });

  useEffect(() => {
    checkAndUpdateOverdue();
    const targetBooks = books.length;
    const targetBorrows = borrowRecords.length;
    let step = 0;
    const maxSteps = 20;
    const timer = setInterval(() => {
      step++;
      setAnimatedCounts({
        books: Math.round((step / maxSteps) * targetBooks),
        borrows: Math.round((step / maxSteps) * targetBorrows),
      });
      if (step >= maxSteps) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [books.length, borrowRecords.length, checkAndUpdateOverdue]);

  const statusCounts = {
    in_box: books.filter((b) => b.status === "in_box").length,
    borrowed: books.filter((b) => b.status === "borrowed").length,
    overdue: books.filter((b) => b.status === "overdue").length,
    damaged: books.filter((b) => b.status === "damaged").length,
  };

  const maxCategoryCount = Math.max(...popularCategories.map((c) => c.count), 1);
  const maxBoxCount = Math.max(...boxTurnover.map((b) => b.borrowCount), 1);
  const fastestBox = boxTurnover.find((b) => b.borrowCount > 0);

  const statCards = [
    {
      label: "图书总量",
      value: animatedCounts.books,
      unit: "本",
      icon: <BookOpen className="w-6 h-6" />,
      gradient: "from-amber-400 to-amber-600",
      bg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      label: "累计借阅",
      value: animatedCounts.borrows,
      unit: "次",
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: "from-teal-400 to-teal-600",
      bg: "bg-teal-50",
      iconColor: "text-teal-500",
    },
    {
      label: "漂流箱数",
      value: boxes.length,
      unit: "个",
      icon: <Package className="w-6 h-6" />,
      gradient: "from-blue-400 to-blue-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "逾期提醒",
      value: statusCounts.overdue,
      unit: "本",
      icon: <Clock className="w-6 h-6" />,
      gradient: "from-red-400 to-red-600",
      bg: "bg-red-50",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-3xl text-gray-800">统计中心</h2>
        <p className="text-gray-500 mt-1">查看图书借阅数据和漂流箱流转情况</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={stat.label}
            className="card p-5 animate-slide-up overflow-hidden relative"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${stat.bg} opacity-60`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.iconColor}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </span>
                <span className="text-gray-400 text-sm">{stat.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              哪类书最受欢迎
            </h3>
            <span className="text-sm text-gray-400">按借阅次数排名</span>
          </div>

          {popularCategories.length === 0 ? (
            <div className="py-16 text-center text-gray-400">暂无借阅数据</div>
          ) : (
            <div className="space-y-4">
              {popularCategories.map((cat, idx) => {
                const percentage = (cat.count / maxCategoryCount) * 100;
                const rankColors = ["from-amber-400 to-amber-500", "from-teal-400 to-teal-500", "from-blue-400 to-blue-500"];
                const barColor = idx < 3 ? rankColors[idx] : "from-gray-300 to-gray-400";
                return (
                  <div key={cat.grade} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {idx < 3 && (
                          <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${rankColors[idx]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                            {idx + 1}
                          </span>
                        )}
                        {idx >= 3 && <span className="w-6 h-6 text-gray-400 text-sm text-center">{idx + 1}</span>}
                        <span className="font-medium text-gray-700">{cat.grade}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{cat.count} 次借阅</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700 ease-out group-hover:opacity-80`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-500" />
              箱子流转速度
            </h3>
            <span className="text-sm text-gray-400">借阅次数 · 平均周期</span>
          </div>

          <div className="space-y-4">
            {boxTurnover.map((item, idx) => {
              const percentage = (item.borrowCount / maxBoxCount) * 100;
              return (
                <div
                  key={item.box.id}
                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-teal-50/60 border border-amber-100 animate-slide-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-gray-800">{item.box.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.box.location}</p>
                    </div>
                    {fastestBox && item.box.id === fastestBox.box.id && (
                      <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        最快
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">累计借阅</p>
                      <p className="text-xl font-bold text-teal-600 mt-0.5">
                        {item.borrowCount}
                        <span className="text-sm font-normal text-gray-400 ml-1">次</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">平均周期</p>
                      <p className="text-xl font-bold text-amber-600 mt-0.5">
                        {item.avgDays || "—"}
                        <span className="text-sm font-normal text-gray-400 ml-1">天</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-teal-400 rounded-full transition-all duration-700"
                        style={{ width: `${percentage || 5}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          图书状态分布
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "in_box", label: "在箱", count: statusCounts.in_box, color: "teal" },
            { key: "borrowed", label: "借出", count: statusCounts.borrowed, color: "amber" },
            { key: "overdue", label: "逾期", count: statusCounts.overdue, color: "red" },
            { key: "damaged", label: "破损", count: statusCounts.damaged, color: "orange" },
          ].map((item) => {
            const total = books.length || 1;
            const percent = Math.round((item.count / total) * 100);
            const colorMap: Record<string, { bg: string; bar: string; text: string }> = {
              teal: { bg: "bg-teal-50", bar: "bg-teal-500", text: "text-teal-600" },
              amber: { bg: "bg-amber-50", bar: "bg-amber-500", text: "text-amber-600" },
              red: { bg: "bg-red-50", bar: "bg-red-500", text: "text-red-600" },
              orange: { bg: "bg-orange-50", bar: "bg-orange-500", text: "text-orange-600" },
            };
            const c = colorMap[item.color];
            return (
              <div key={item.key} className={`${c.bg} rounded-2xl p-5 text-center`}>
                <div className={`text-4xl font-bold ${c.text}`}>{item.count}</div>
                <p className="text-gray-600 mt-1">{item.label}</p>
                <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
                  <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${percent}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{percent}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
