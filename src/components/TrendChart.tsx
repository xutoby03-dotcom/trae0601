import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface TrendData {
  date: string;
  count: number;
}

interface TrendChartProps {
  data: TrendData[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const formatXAxis = (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const totalIncidents = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-3xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            最近异常趋势
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            近7天共发生 <span className="font-semibold text-warning-600">{totalIncidents}</span> 起异常
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF7A45" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFF",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                padding: "12px",
              }}
              formatter={(value: number) => [`${value} 起`, "异常数"]}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ fill: "#FF7A45", strokeWidth: 2, r: 5 }}
              activeDot={{ fill: "#EA580C", r: 8, stroke: "#FFF", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
