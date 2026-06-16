import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { FrequentlyMissing } from '@/types';
import { Empty } from '@/components/ui';

export interface MissingChartProps {
  data?: FrequentlyMissing[];
  top?: number;
  height?: string | number;
}

export function MissingChart({ data, top = 10, height = '100%' }: MissingChartProps) {
  const option: EChartsOption = useMemo(() => {
    const chartData = data?.slice(0, top) || [];
    const reversedData = [...chartData].reverse();

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}<br/>丢失/损坏次数: {c}',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: '#6b7280' },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: reversedData.map((d) => d.code),
        axisLabel: { fontSize: 11, color: '#374151' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false },
      },
      series: [
        {
          name: '丢失次数',
          type: 'bar',
          data: reversedData.map((d) => d.count),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#FF8040' },
                { offset: 1, color: '#FFB38C' },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
          barWidth: 16,
          label: {
            show: true,
            position: 'right',
            fontSize: 11,
            color: '#6b7280',
            formatter: '{c}次',
          },
        },
      ],
    };
  }, [data, top]);

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
