import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { BuildingStat } from '@/types';

interface BuildingChartProps {
  data: BuildingStat[];
}

const COLORS = ['#4A90D9', '#5DA3E5', '#70B6F1', '#83C9FD', '#4ECDC4', '#45B7AA', '#FF8C42', '#FF6B6B'];

export const BuildingChart: React.FC<BuildingChartProps> = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    fullName: item.building,
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">各楼栋拾到数量</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="fullName"
              type="category"
              width={80}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [`${value} 把`, '拾到数量']}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {formattedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
