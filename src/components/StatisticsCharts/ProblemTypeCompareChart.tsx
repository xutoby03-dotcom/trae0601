import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { Repair } from '@/types';
import { PROBLEM_TYPES } from '@/types';
import { getProblemTypeStats } from '@/utils/statistics';

export function ProblemTypeCompareChart({ repairs }: { repairs: Repair[] }) {
  const option = useMemo(() => {
    const stats = getProblemTypeStats(repairs, PROBLEM_TYPES);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['平均时长(小时)', '报修次数'],
        top: 0,
        textStyle: { fontSize: 12, color: '#666' },
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: stats.map(s => s.type),
          axisPointer: { type: 'shadow' },
          axisLabel: {
            fontSize: 10,
            color: '#666',
            interval: 0,
            rotate: 20,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: '时长(h)',
          nameTextStyle: { fontSize: 11, color: '#999' },
          axisLabel: { fontSize: 11, color: '#666' },
          splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
        },
        {
          type: 'value',
          name: '次数',
          nameTextStyle: { fontSize: 11, color: '#999' },
          axisLabel: { fontSize: 11, color: '#666' },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '平均时长(小时)',
          type: 'bar',
          barWidth: '35%',
          data: stats.map(s => s.avgHours),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: '#219EBC',
          },
        },
        {
          name: '报修次数',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: stats.map(s => s.count),
          lineStyle: { width: 3, color: '#FF6B35' },
          itemStyle: {
            color: '#FF6B35',
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      ],
    };
  }, [repairs]);

  return <ReactECharts option={option} style={{ width: '100%', height: 320 }} />;
}
