import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { DailyUsageRate } from '@/types';
import { Empty } from '@/components/ui';
import { format, subDays } from 'date-fns';

export interface UsageChartProps {
  data?: DailyUsageRate[];
  days?: number;
  height?: string | number;
}

export function UsageChart({ data, days = 7, height = '100%' }: UsageChartProps) {
  const option: EChartsOption = useMemo(() => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      dates.push(format(subDays(new Date(), i), 'MM-dd'));
    }

    const rates = dates.map((_, index) => {
      const item = data?.[index];
      return item ? item.rate : 0;
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>使用率: {c}%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
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
        boundaryGap: false,
        data: dates,
        axisLabel: { fontSize: 11, color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', fontSize: 11, color: '#6b7280' },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      series: [
        {
          name: '使用率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: rates,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(66, 112, 136, 0.25)' },
                { offset: 1, color: 'rgba(66, 112, 136, 0.02)' },
              ],
            },
          },
          lineStyle: { color: '#427088', width: 2 },
          itemStyle: { color: '#427088', borderColor: '#fff', borderWidth: 2 },
        },
      ],
    };
  }, [data, days]);

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
