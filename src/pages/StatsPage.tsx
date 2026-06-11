import { useMemo } from "react";
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
import {
  BarChart3,
  Clock,
  AlertTriangle,
  Timer,
  Trophy,
  Monitor,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import Empty from "@/components/Empty";
import { cn } from "@/lib/utils";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336", "#00BCD4"];

export default function StatsPage() {
  const { rooms, bookings, faults, getRoomById } = useStore();

  const stats = useMemo(() => {
    const roomStats = rooms.map((room) => {
      const roomBookings = bookings.filter((b) => b.roomId === room.id);
      const roomFaults = faults.filter((f) => f.roomId === room.id);
      const overtimeBookings = roomBookings.filter((b) => b.status === "overtime");

      let totalDurationMinutes = 0;
      roomBookings.forEach((b) => {
        const start = new Date(b.startTime).getTime();
        const end = new Date(b.endTime).getTime();
        totalDurationMinutes += Math.round((end - start) / (1000 * 60));
      });

      return {
        id: room.id,
        name: room.name,
        bookingCount: roomBookings.length,
        totalDurationMinutes,
        totalDurationHours: Math.round(totalDurationMinutes / 60 * 10) / 10,
        faultCount: roomFaults.length,
        overtimeCount: overtimeBookings.length,
      };
    });

    const byUsage = [...roomStats].sort((a, b) => b.bookingCount - a.bookingCount);
    const byFaults = [...roomStats].sort((a, b) => b.faultCount - a.faultCount);
    const byOvertime = [...roomStats].sort((a, b) => b.overtimeCount - a.overtimeCount);
    const byDuration = [...roomStats].sort(
      (a, b) => b.totalDurationMinutes - a.totalDurationMinutes
    );

    const totalBookings = bookings.length;
    const totalFaults = faults.length;
    const totalOvertime = bookings.filter((b) => b.status === "overtime").length;
    const completedBookings = bookings.filter((b) => b.status === "completed").length;

    return {
      roomStats,
      byUsage,
      byFaults,
      byOvertime,
      byDuration,
      totalBookings,
      totalFaults,
      totalOvertime,
      completedBookings,
      hasData: bookings.length > 0 || faults.length > 0,
    };
  }, [rooms, bookings, faults]);

  const usageChartData = stats.byUsage.map((s) => ({
    name: s.name,
    预约次数: s.bookingCount,
    时长: s.totalDurationHours,
  }));

  const faultChartData = stats.byFaults.map((s) => ({
    name: s.name,
    故障次数: s.faultCount,
  }));

  const overtimeChartData = stats.byOvertime.map((s) => ({
    name: s.name,
    超时次数: s.overtimeCount,
  }));

  const pieData = stats.byUsage
    .filter((s) => s.bookingCount > 0)
    .map((s) => ({
      name: s.name,
      value: s.bookingCount,
    }));

  const RankingItem = ({
    rank,
    name,
    value,
    unit,
    icon,
    color = "primary",
  }: {
    rank: number;
    name: string;
    value: number;
    unit: string;
    icon?: React.ReactNode;
    color?: "primary" | "orange" | "red" | "blue";
  }) => {
    const rankColors = [
      "bg-yellow-400 text-yellow-900",
      "bg-gray-300 text-gray-700",
      "bg-amber-600 text-amber-50",
    ];

    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
            rank <= 3 ? rankColors[rank - 1] : "bg-gray-200 text-gray-600"
          )}
        >
          {rank}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{name}</p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "font-bold text-lg",
              color === "primary" && "text-primary-600",
              color === "orange" && "text-orange-600",
              color === "red" && "text-red-600",
              color === "blue" && "text-blue-600"
            )}
          >
            {value}
            <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
      </div>
    );
  };

  if (!stats.hasData && rooms.length === 0) {
    return (
      <div className="container py-8">
        <Empty
          message="暂无统计数据"
          description="添加会议室并开始使用后，数据统计将显示在这里"
          icon={<BarChart3 size={40} className="text-gray-400" />}
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">数据统计</h2>
        <p className="text-gray-500">会议室投屏使用情况汇总分析</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Monitor size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">会议室总数</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总预约数</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBookings}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">故障次数</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalFaults}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Timer size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">超时次数</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalOvertime}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <Trophy size={20} className="text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900">使用次数排行</h3>
          </div>
          {stats.byUsage.length > 0 ? (
            <div className="space-y-3">
              {stats.byUsage.slice(0, 5).map((room, index) => (
                <RankingItem
                  key={room.id}
                  rank={index + 1}
                  name={room.name}
                  value={room.bookingCount}
                  unit="次"
                  color="primary"
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">暂无数据</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">使用时长排行</h3>
          </div>
          {stats.byDuration.length > 0 ? (
            <div className="space-y-3">
              {stats.byDuration.slice(0, 5).map((room, index) => (
                <RankingItem
                  key={room.id}
                  rank={index + 1}
                  name={room.name}
                  value={room.totalDurationHours}
                  unit="小时"
                  color="blue"
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">暂无数据</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={20} className="text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">故障次数排行</h3>
          </div>
          {stats.byFaults.length > 0 ? (
            <div className="space-y-3">
              {stats.byFaults.slice(0, 5).map((room, index) => (
                <RankingItem
                  key={room.id}
                  rank={index + 1}
                  name={room.name}
                  value={room.faultCount}
                  unit="次"
                  color="orange"
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">暂无数据</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <Timer size={20} className="text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">超时次数排行</h3>
          </div>
          {stats.byOvertime.length > 0 ? (
            <div className="space-y-3">
              {stats.byOvertime.slice(0, 5).map((room, index) => (
                <RankingItem
                  key={room.id}
                  rank={index + 1}
                  name={room.name}
                  value={room.overtimeCount}
                  unit="次"
                  color="red"
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">暂无数据</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            各会议室预约次数
          </h3>
          {usageChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="预约次数" fill="#4CAF50" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              暂无数据
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            故障与超时对比
          </h3>
          {faultChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={faultChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12, fill: "#666" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="故障次数" fill="#FF9800" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              暂无数据
            </div>
          )}
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            会议室使用占比
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.value} 次
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
