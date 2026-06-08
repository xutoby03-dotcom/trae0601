import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import type { Flavor } from '@/types'

interface FlavorRadarProps {
  flavor: Flavor
}

const FlavorRadar = ({ flavor }: FlavorRadarProps) => {
  const data = [
    { dimension: '酸度', value: flavor.acidity },
    { dimension: '甜度', value: flavor.sweetness },
    { dimension: '苦度', value: flavor.bitterness },
    { dimension: '醇厚度', value: flavor.body },
    { dimension: '香气', value: flavor.aroma },
  ]

  return (
    <div
      style={{
        background: '#FFFDF8',
        border: '1px solid #E8D5C0',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <RadarChart width={280} height={280} data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#D4A574" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#6F4E37', fontSize: 13, fontFamily: 'DM Sans' }}
          />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#6F4E37"
            fill="#6F4E37"
            fillOpacity={0.3}
          />
        </RadarChart>
    </div>
  )
}

export default FlavorRadar
