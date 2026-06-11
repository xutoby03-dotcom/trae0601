import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { DailyWaterStats } from '@/types';
import { formatDateChinese, formatWeekday } from '@/utils/date';
import { getBarColor } from '@/utils/waterCalculator';

interface WaterChartProps {
  data: DailyWaterStats[];
  title?: string;
  showReference?: boolean;
  height?: number;
}

export default function WaterChart({ data, title = '最近七天饮水量', showReference = true, height = 280 }: WaterChartProps) {
  const chartData = data.map(item => ({
    ...item,
    dateLabel: formatDateChinese(item.date),
    weekday: formatWeekday(item.date),
    barColor: getBarColor(item.status),
  }));
  
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: DailyWaterStats & { dateLabel: string; weekday: string } }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-800">{item.dateLabel} {item.weekday}</p>
          <p className="text-sm text-gray-600 mt-1">
            饮水量：<span className="font-bold text-primary-500">{item.waterConsumed} ml</span>
          </p>
          <p className="text-sm text-gray-500">
            参考值：{item.referenceWater} ml
          </p>
          {item.bowlLocation && (
            <p className="text-xs text-gray-400 mt-1">
              位置：{item.bowlLocation}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="dateLabel" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }} />
            {showReference && chartData[0] && (
              <ReferenceLine 
                y={chartData[0].referenceWater} 
                stroke="#f97316" 
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ 
                  value: '参考值', 
                  position: 'right', 
                  fill: '#f97316', 
                  fontSize: 11 
                }}
              />
            )}
            <Bar 
              dataKey="waterConsumed" 
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.barColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
