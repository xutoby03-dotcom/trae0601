import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatDurationChinese } from '@/utils/time';
import { Star } from 'lucide-react';

export interface ChartPoint {
  name: string;
  plannedDuration: number;
  actualDuration: number;
  isKeyPoint: boolean;
}

interface TimeBarChartProps {
  points: ChartPoint[];
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload: ChartPoint & { [key: string]: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isOvertime = data.actualDuration > data.plannedDuration;
  const diff = data.actualDuration - data.plannedDuration;

  return (
    <div className="glass-card px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-deep-900">{label}</span>
        {data.isKeyPoint && (
          <Star className="w-4 h-4 text-museum-500 fill-museum-500" />
        )}
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-6">
          <span className="text-deep-500">计划用时：</span>
          <span className="text-deep-900">
            {formatDurationChinese(data.plannedDuration)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-deep-500">实际用时：</span>
          <span className="text-deep-900">
            {formatDurationChinese(data.actualDuration)}
          </span>
        </div>
        <div className="flex justify-between gap-6 border-t border-museum-200 pt-1 mt-1">
          <span className="text-deep-500">差异：</span>
          <span className={isOvertime ? 'text-coral-500' : 'text-jade-500'}>
            {isOvertime ? '+' : ''}
            {formatDurationChinese(Math.abs(diff))}
            {isOvertime ? '（超时）' : '（节省）'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TimeBarChart({ points }: TimeBarChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0d5c2" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#5d8080', fontSize: 12 }}
            axisLine={{ stroke: '#c9b89a' }}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: '#5d8080', fontSize: 12 }}
            axisLine={{ stroke: '#c9b89a' }}
            tickLine={false}
            tickFormatter={(value) => `${Math.round(value)}s`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201, 184, 154, 0.1)' }} />
          <Legend
            wrapperStyle={{ paddingTop: 16 }}
            formatter={(value) => (
              <span className="text-deep-600 text-sm">{value}</span>
            )}
          />
          <Bar
            dataKey="plannedDuration"
            name="计划用时"
            fill="#b29a72"
            radius={[4, 4, 0, 0]}
            barSize={24}
          />
          <Bar
            dataKey="actualDuration"
            name="实际用时"
            radius={[4, 4, 0, 0]}
            barSize={24}
          >
            {points.map((entry, index) => {
              const isOvertime = entry.actualDuration > entry.plannedDuration;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isOvertime ? '#e07b5f' : '#2d7a4f'}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
