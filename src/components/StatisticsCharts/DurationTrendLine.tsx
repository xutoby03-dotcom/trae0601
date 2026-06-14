import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { Repair } from '@/types';
import { getDurationTrend } from '@/utils/statistics';

export function DurationTrendLine({ repairs, days = 30 }: { repairs: Repair[]; days?: number }) {
  const option = useMemo(() => {
    const trend = getDurationTrend(repairs, days);
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown[]) => {
          const p = params[0] as { axisValue: string; value: number };
          return `${p.axisValue}<br/>平均维修时长: <b>${p.value}h</b>`;
        },
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
        data: trend.map(d => d.date),
        axisLabel: {
          fontSize: 10,
          color: '#666',
          interval: Math.floor(days / 8),
        },
      },
      yAxis: {
        type: 'value',
        name: '小时',
        nameTextStyle: { fontSize: 11, color: '#999' },
        axisLabel: { fontSize: 11, color: '#666' },
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: trend.map(d => d.avgHours),
          lineStyle: {
            width: 3,
            color: '#219EBC',
          },
          itemStyle: {
            color: '#219EBC',
            borderColor: '#fff',
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(33, 158, 188, 0.35)' },
                { offset: 1, color: 'rgba(33, 158, 188, 0.02)' },
              ],
            },
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            color: '#219EBC',
            formatter: (p: { value: number }) => (p.value > 0 ? p.value : ''),
          },
        },
      ],
    };
  }, [repairs, days]);

  return <ReactECharts option={option} style={{ width: '100%', height: 320 }} />;
}
