import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Scatter,
  Cell,
} from 'recharts';
import type { TemperatureRecord } from '@/types';
import { TEMP_MIN, TEMP_MAX } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface TemperatureChartProps {
  records: TemperatureRecord[];
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  value?: number;
  isAbnormal?: boolean;
  key?: string | number;
  payload?: { time?: string };
}

function CustomDot({ cx, cy, isAbnormal, payload }: CustomDotProps) {
  if (!isAbnormal || cx === undefined || cy === undefined) return null;
  return (
    <circle
      key={payload?.time || 'dot'}
      cx={cx}
      cy={cy}
      r={5}
      fill="#EF4444"
      stroke="white"
      strokeWidth={2}
    />
  );
}

export default function TemperatureChart({ records }: TemperatureChartProps) {
  const chartData = records.map((record) => ({
    ...record,
    formattedTime: formatTime(record.time),
  }));

  const abnormalRecords = chartData.filter((r) => r.isAbnormal);

  return (
    <div className="card animate-fadeInUp">
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">
        24小时温度趋势
      </h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="normalArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

            <XAxis
              dataKey="formattedTime"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#d1d5db"
            />

            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#d1d5db"
              domain={[0, 10]}
              tickFormatter={(value) => `${value}°C`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [`${value}°C`, '温度']}
              labelFormatter={(label) => `时间: ${label}`}
            />

            <ReferenceArea
              y1={TEMP_MIN}
              y2={TEMP_MAX}
              fill="url(#normalArea)"
              fillOpacity={1}
            />

            <ReferenceLine
              y={TEMP_MIN}
              stroke="#10B981"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{ value: `${TEMP_MIN}°C`, position: 'insideTopLeft', fill: '#10B981', fontSize: 11 }}
            />
            <ReferenceLine
              y={TEMP_MAX}
              stroke="#10B981"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{ value: `${TEMP_MAX}°C`, position: 'insideTopLeft', fill: '#10B981', fontSize: 11 }}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#0EA5E9"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                return <CustomDot cx={cx} cy={cy} isAbnormal={payload?.isAbnormal} />;
              }}
              activeDot={{ r: 6, fill: '#0EA5E9', stroke: 'white', strokeWidth: 2 }}
            />

            {abnormalRecords.length > 0 && (
              <Scatter data={abnormalRecords} dataKey="temperature">
                {abnormalRecords.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#EF4444" />
                ))}
              </Scatter>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cold-500"></div>
          <span className="text-sm text-gray-600">温度曲线</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-normal opacity-30"></div>
          <span className="text-sm text-gray-600">正常范围</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-status-danger"></div>
          <span className="text-sm text-gray-600">异常点</span>
        </div>
      </div>
    </div>
  );
}
