import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { Repair, Severity } from '@/types';
import { SEVERITY_CONFIG } from '@/types';
import { getSeverityDistribution } from '@/utils/statistics';

export function SeverityPieChart({ repairs }: { repairs: Repair[] }) {
  const option = useMemo(() => {
    const dist = getSeverityDistribution(repairs);
    const severities: Severity[] = ['low', 'medium', 'high', 'critical'];
    const data = severities.map(s => ({
      name: SEVERITY_CONFIG[s].label,
      value: dist[s],
      itemStyle: { color: SEVERITY_CONFIG[s].color },
    }));
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 12, color: '#666' },
      },
      title: {
        text: `总计 ${total}`,
        left: '30%',
        top: '45%',
        textAlign: 'center',
        textStyle: {
          fontSize: 20,
          fontWeight: 700,
          color: '#333',
        },
        subtext: '报修总数',
        subtextStyle: {
          fontSize: 12,
          color: '#999',
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '72%'],
          center: ['30%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontSize: 11,
            color: '#555',
          },
          labelLine: {
            length: 8,
            length2: 6,
          },
          data,
        },
      ],
    };
  }, [repairs]);

  return <ReactECharts option={option} style={{ width: '100%', height: 320 }} />;
}
