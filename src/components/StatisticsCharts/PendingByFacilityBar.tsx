import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { Facility, Repair } from '@/types';
import { getPendingByFacility } from '@/utils/statistics';

export function PendingByFacilityBar({ facilities, repairs }: { facilities: Facility[]; repairs: Repair[] }) {
  const option = useMemo(() => {
    const top10 = getPendingByFacility(facilities, repairs, 10);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 11, color: '#666' },
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      },
      yAxis: {
        type: 'category',
        data: top10.map(d => d.facility.name),
        inverse: true,
        axisLabel: {
          fontSize: 11,
          color: '#666',
          formatter: (v: string) => (v.length > 8 ? v.slice(0, 7) + '...' : v),
        },
      },
      series: [
        {
          type: 'bar',
          data: top10.map(d => d.count),
          barWidth: 16,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#FFD770' },
                { offset: 1, color: '#FF6B35' },
              ],
            },
          },
          label: {
            show: true,
            position: 'right',
            fontSize: 12,
            fontWeight: 600,
            color: '#FF6B35',
          },
        },
      ],
    };
  }, [facilities, repairs]);

  return <ReactECharts option={option} style={{ width: '100%', height: 320 }} />;
}
