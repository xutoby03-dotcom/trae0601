import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { RepeatFaultItem } from '@/utils/statistics';

const THEME_COLORS = {
  primary: '#FF6B35',
  secondary: '#4ECDC4',
  warning: '#FFB703',
  danger: '#E63946',
  info: '#219EBC',
  success: '#2A9D8F',
};

export function RepeatFaultBarChart({ data }: { data: RepeatFaultItem[] }) {
  const option = useMemo(() => {
    const top5 = data.slice(0, 5);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: top5.map(d => d.facility.name.slice(0, 6) + (d.facility.name.length > 6 ? '...' : '')),
        axisLabel: {
          interval: 0,
          fontSize: 11,
          color: '#666',
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 11, color: '#666' },
      },
      series: [
        {
          type: 'bar',
          data: top5.map((d, idx) => ({
            value: d.count,
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: idx === 0 ? THEME_COLORS.danger : idx < 2 ? THEME_COLORS.primary : THEME_COLORS.warning },
                  { offset: 1, color: idx === 0 ? '#FF8A8A' : idx < 2 ? '#FFB088' : '#FFD770' },
                ],
              },
            },
          })),
          barWidth: '50%',
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            fontWeight: 600,
            color: THEME_COLORS.primary,
          },
        },
      ],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ width: '100%', height: 240 }} />;
}

export { THEME_COLORS };
