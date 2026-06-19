import { useEffect, useState } from "react";
import {
  ClipboardList,
  Trash2,
  AlertTriangle,
  Refrigerator,
  ChevronRight,
  Clock,
  AlertCircle,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";
import { dashboardApi } from "@/services/api";
import type { DashboardStats, Sample, Incident } from "../../shared/types";
import { CATEGORY_NAMES, INCIDENT_TYPE_NAMES } from "../../shared/types";
import { formatDateTime, getTimeRemaining } from "@/utils/date";

const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  to: string;
}) => (
  <Link
    to={to}
    className="card flex items-start gap-4 hover:translate-y-[-2px] transition-transform"
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={22} className="text-white" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800 font-serif">{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
    <ChevronRight size={20} className="text-gray-300" />
  </Link>
);

const CategoryCard = ({
  name,
  done,
  required,
  rate,
  color,
}: {
  name: string;
  done: number;
  required: number;
  rate: number;
  color: string;
}) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="font-medium text-gray-800">{name}</span>
      <span
        className={`text-sm font-bold ${
          rate >= 100
            ? "text-success-600"
            : rate >= 60
            ? "text-warning-500"
            : "text-danger-600"
        }`}
      >
        {rate}%
      </span>
    </div>
    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
        style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: color }}
      />
    </div>
    <p className="text-xs text-gray-500 mt-2">
      已完成 {done} / 应留样 {required}
    </p>
  </div>
);

const COLORS = ["#E85D04", "#2D6A4F", "#F48C06", "#9B5DE5"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiring, setExpiring] = useState<Sample[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, e, i] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getExpiringSamples(),
          dashboardApi.getRecentIncidents(),
        ]);
        setStats(s);
        setExpiring(e);
        setIncidents(i);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-28 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }

  const pieData = stats.categoryCompletion.map((c) => ({
    name: c.name,
    value: c.done,
  }));

  const barData = stats.categoryCompletion.map((c) => ({
    name: c.name,
    应留样: c.required,
    已完成: c.done,
  }));

  const occupancyRate = Math.round(
    (stats.fridgeOccupancy / stats.fridgeCapacity) * 100
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={ClipboardList}
          label="今日留样完成"
          value={`${stats.todaySamplesDone} / ${stats.todaySamplesRequired}`}
          subValue={`完成率 ${
            stats.todaySamplesRequired
              ? Math.round(
                  (stats.todaySamplesDone / stats.todaySamplesRequired) * 100
                )
              : 0
          }%`}
          color="bg-primary-500"
          to="/samples"
        />
        <StatCard
          icon={Trash2}
          label="待销毁样品"
          value={stats.pendingDestruction}
          subValue={stats.pendingDestruction > 0 ? "需及时处理" : "暂无待销毁"}
          color="bg-danger-500"
          to="/destruction"
        />
        <StatCard
          icon={AlertTriangle}
          label="未处理异常"
          value={stats.activeIncidents}
          subValue={stats.activeIncidents > 0 ? "需尽快调查" : "一切正常"}
          color="bg-warning-500"
          to="/incidents"
        />
        <StatCard
          icon={Refrigerator}
          label="冰箱占用率"
          value={`${occupancyRate}%`}
          subValue={`${stats.fridgeOccupancy} / ${stats.fridgeCapacity} 格`}
          color="bg-success-500"
          to="/samples"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-1">
          <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">
            品类完成率
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {pieData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {stats.categoryCompletion.map((c, idx) => (
              <div key={c.category} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-xs text-gray-600">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card xl:col-span-2">
          <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">
            各品类留样进度
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <Tooltip />
                <Bar
                  dataKey="应留样"
                  fill="#E5E7EB"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="已完成"
                  fill="#E85D04"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-danger-500" />
              临期销毁提醒
            </h3>
            <Link
              to="/destruction"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          {expiring.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Trash2 size={36} className="mx-auto mb-2 opacity-50" />
              <p>暂无临期样品</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiring.map((s) => (
                <Link
                  key={s.id}
                  to="/destruction"
                  className="flex items-center gap-4 p-3 rounded-lg border border-danger-100 bg-danger-50/50 hover:bg-danger-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {s.product?.photoUrl && (
                      <img
                        src={s.product.photoUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {s.product?.name || CATEGORY_NAMES[s.product?.category || "other"]}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      容器 {s.containerNo} · {s.fridgeSlot}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`badge ${
                        s.status === "expired" ? "badge-danger" : "badge-warning"
                      }`}
                    >
                      {s.status === "expired" ? "已到期" : getTimeRemaining(s.expireTime)}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(s.expireTime)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning-500" />
              近期异常事件
            </h3>
            <Link
              to="/incidents"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          {incidents.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <AlertCircle size={36} className="mx-auto mb-2 opacity-50" />
              <p>近期无异常事件</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((i) => (
                <Link
                  key={i.id}
                  to="/incidents"
                  className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      i.type === "complaint"
                        ? "bg-primary-100 text-primary-600"
                        : i.type === "odor"
                        ? "bg-warning-100 text-warning-500"
                        : i.type === "temperature"
                        ? "bg-danger-100 text-danger-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {i.type === "complaint" ? (
                      <User size={18} />
                    ) : i.type === "odor" ? (
                      <AlertTriangle size={18} />
                    ) : i.type === "temperature" ? (
                      <AlertCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          i.status === "pending"
                            ? "badge-danger"
                            : i.status === "investigating"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {INCIDENT_TYPE_NAMES[i.type]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(i.occurTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {i.description}
                    </p>
                    {i.sample?.product && (
                      <p className="text-xs text-primary-600 mt-1">
                        关联留样：{i.sample.product.name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.categoryCompletion.map((c, idx) => (
          <CategoryCard
            key={c.category}
            name={c.name}
            done={c.done}
            required={c.required}
            rate={c.completionRate}
            color={COLORS[idx % COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
}
