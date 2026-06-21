import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { BlindTest, RadarDataPoint, WaterSample } from '@/types';
import { getScoreBySampleId, CHART_COLORS } from '@/utils/helpers';
import { RATING_DIMENSIONS } from '@/types';

interface RadarChartProps {
  blindTest: BlindTest;
  samples?: WaterSample[];
}

export function RadarChart({ blindTest, samples }: RadarChartProps) {
  const displaySamples = samples || blindTest.waterSamples;

  const data: RadarDataPoint[] = RATING_DIMENSIONS.map((dim) => {
    const point: RadarDataPoint = { dimension: dim.label };
    displaySamples.forEach((sample) => {
      const score = getScoreBySampleId(blindTest, sample.id);
      if (score) {
        point[sample.blindCode] = score[dim.key as keyof typeof score] as number;
      }
    });
    return point;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#D7CCC8" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fill: '#5D4037',
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            tick={{ fill: '#8D6E63', fontSize: 10 }}
            stroke="#BCAAA4"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFF8E1',
              border: '1px solid #D7CCC8',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(62, 39, 35, 0.1)',
            }}
            itemStyle={{ color: '#3E2723' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
            formatter={(value) => (
              <span className="text-sm font-medium text-coffee-800">
                水样 {value}
              </span>
            )}
          />
          {displaySamples.map((sample, index) => {
            const score = getScoreBySampleId(blindTest, sample.id);
            if (!score) return null;

            return (
              <Radar
                key={sample.id}
                name={sample.blindCode}
                dataKey={sample.blindCode}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            );
          })}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
