import type { BlindTest, WaterSample } from '@/types';
import { getScoreBySampleId, calculateAverageScore, getBlindCodeColor } from '@/utils/helpers';
import { RATING_DIMENSIONS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { cn } from '@/lib/utils';

interface ComparisonTableProps {
  blindTest: BlindTest;
  samples?: WaterSample[];
}

export function ComparisonTable({ blindTest, samples }: ComparisonTableProps) {
  const displaySamples = samples || blindTest.waterSamples;

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据对比表</CardTitle>
        <CardDescription>各水样在不同维度的详细评分对比</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-coffee-200">
              <th className="text-left py-3 px-2 font-semibold text-coffee-800 min-w-[100px]">
                维度
              </th>
              {displaySamples.map((sample) => (
                <th key={sample.id} className="text-center py-3 px-2 min-w-[100px]">
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: getBlindCodeColor(sample.blindCode) }}
                  >
                    {sample.blindCode}
                  </div>
                  <div className="text-xs font-semibold text-coffee-700">
                    {blindTest.isRevealed ? sample.realName : `水样 ${sample.blindCode}`}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-coffee-100">
              <td className="py-3 px-2 font-medium text-coffee-600">TDS</td>
              {displaySamples.map((sample) => (
                <td key={sample.id} className="text-center py-3 px-2 text-coffee-800 font-mono">
                  {sample.tds}
                </td>
              ))}
            </tr>
            <tr className="border-b border-coffee-100">
              <td className="py-3 px-2 font-medium text-coffee-600">硬度</td>
              {displaySamples.map((sample) => (
                <td key={sample.id} className="text-center py-3 px-2 text-coffee-800 font-mono">
                  {sample.hardness}
                </td>
              ))}
            </tr>
            <tr className="border-b border-coffee-100">
              <td className="py-3 px-2 font-medium text-coffee-600">pH</td>
              {displaySamples.map((sample) => (
                <td key={sample.id} className="text-center py-3 px-2 text-coffee-800 font-mono">
                  {sample.ph}
                </td>
              ))}
            </tr>
            {RATING_DIMENSIONS.map((dim) => (
              <tr key={dim.key} className="border-b border-coffee-100">
                <td className="py-3 px-2 font-medium text-coffee-600">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: dim.color }}
                  />
                  {dim.label}
                </td>
                {displaySamples.map((sample) => {
                  const score = getScoreBySampleId(blindTest, sample.id);
                  const value = score ? score[dim.key as keyof typeof score] : null;
                  return (
                    <td key={sample.id} className="text-center py-3 px-2">
                      <span className="font-bold text-coffee-800 font-mono">
                        {value !== null && typeof value === 'number' ? value.toFixed(1) : '-'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-b-2 border-coffee-200 bg-coffee-50">
              <td className="py-3 px-2 font-bold text-coffee-800">综合评分</td>
              {displaySamples.map((sample) => {
                const score = getScoreBySampleId(blindTest, sample.id);
                const avg = score ? calculateAverageScore(score) : 0;
                return (
                  <td key={sample.id} className="text-center py-3 px-2">
                    <span className="text-xl font-bold font-serif" style={{ color: getBlindCodeColor(sample.blindCode) }}>
                      {avg.toFixed(1)}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr className="bg-coffee-50">
              <td className="py-3 px-2 font-bold text-coffee-800">喜好排名</td>
              {displaySamples.map((sample) => {
                const score = getScoreBySampleId(blindTest, sample.id);
                const rank = score?.preferenceRank;
                return (
                  <td key={sample.id} className="text-center py-3 px-2">
                    {rank ? (
                      <span className={cn(
                        'inline-flex w-8 h-8 rounded-full items-center justify-center font-bold text-white',
                        rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
                      )}>
                        {rank}
                      </span>
                    ) : '-'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
