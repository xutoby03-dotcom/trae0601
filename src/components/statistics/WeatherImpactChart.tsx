import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { WeatherImpact } from '@/types';
import { Empty } from '@/components/ui';

export interface WeatherImpactChartProps {
  data?: WeatherImpact[];
  height?: string | number;
}

const themeColors = ['#427088', '#FF8040', '#2ECC71', '#F39C12', '#E74C3C', '#8B5CF6', '#EC4899'];

export function WeatherImpactChart({ data, height = '100%' }: WeatherImpactChartProps) {
  const option: EChartsOption = useMemo(() => {
    const chartData = data || [];

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        textStyle: { fontSize: 12, color: '#374151' },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 12,
      },
      series: [
        {
          name: '天气影响',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['65%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#374151',
              formatter: '{b}\n{c}次',
            },
          },
          labelLine: {
            show: false,
          },
          data: chartData.map((d, i) => ({
            value: d.incidentCount,
            name: d.condition,
            itemStyle: { color: themeColors[i % themeColors.length] },
          })),
        },
      ],
    };
  }, [data]);

  if (!data?.length) {
    return <Empty description="暂无数据" />;
  }

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
      notMerge
      lazyUpdate
    />
  );
}
