import { FIELD_WIDTH, FIELD_HEIGHT, END_ZONE_DEPTH } from '@/types';

interface FieldProps {
  scale: number;
}

export default function Field({ scale }: FieldProps) {
  const width = FIELD_WIDTH * scale;
  const height = FIELD_HEIGHT * scale;
  const endZone = END_ZONE_DEPTH * scale;

  return (
    <g className="field-layer">
      <defs>
        <pattern
          id="grassPattern"
          width={2 * scale}
          height={2 * scale}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={2 * scale}
            height={2 * scale}
            fill="#1a472a"
          />
          <rect
            x={0}
            y={0}
            width={scale}
            height={scale}
            fill="#1d5230"
            opacity="0.5"
          />
          <rect
            x={scale}
            y={scale}
            width={scale}
            height={scale}
            fill="#1d5230"
            opacity="0.5"
          />
        </pattern>
        <linearGradient id="endZoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0d2818" />
          <stop offset="100%" stopColor="#1a472a" />
        </linearGradient>
      </defs>

      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#grassPattern)"
      />

      <rect
        x={0}
        y={0}
        width={endZone}
        height={height}
        fill="url(#endZoneGradient)"
        opacity="0.6"
      />
      <rect
        x={width - endZone}
        y={0}
        width={endZone}
        height={height}
        fill="url(#endZoneGradient)"
        opacity="0.6"
      />

      <line
        x1={endZone}
        y1={0}
        x2={endZone}
        y2={height}
        stroke="#ffffff"
        strokeWidth={2}
        opacity="0.8"
      />
      <line
        x1={width - endZone}
        y1={0}
        x2={width - endZone}
        y2={height}
        stroke="#ffffff"
        strokeWidth={2}
        opacity="0.8"
      />

      <line
        x1={0}
        y1={0}
        x2={width}
        y2={0}
        stroke="#ffffff"
        strokeWidth={2}
        opacity="0.9"
      />
      <line
        x1={0}
        y1={height}
        x2={width}
        y2={height}
        stroke="#ffffff"
        strokeWidth={2}
        opacity="0.9"
      />

      <line
        x1={width / 2}
        y1={0}
        x2={width / 2}
        y2={height}
        stroke="#ffffff"
        strokeWidth={1}
        strokeDasharray="8,8"
        opacity="0.4"
      />

      <text
        x={endZone / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={10 * scale}
        fontFamily="'Rajdhani', sans-serif"
        fontWeight="700"
        opacity="0.3"
        style={{ letterSpacing: '0.1em' }}
      >
        END ZONE
      </text>
      <text
        x={width - endZone / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={10 * scale}
        fontFamily="'Rajdhani', sans-serif"
        fontWeight="700"
        opacity="0.3"
        style={{ letterSpacing: '0.1em' }}
      >
        END ZONE
      </text>

      {[1, 2, 3, 4, 5].map((i) => {
        const x = endZone + i * ((width - 2 * endZone) / 6);
        return (
          <g key={i}>
            <line
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="#ffffff"
              strokeWidth={0.5}
              opacity="0.2"
            />
            <text
              x={x}
              y={height - 2}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={2 * scale}
              fontFamily="'Roboto Mono', monospace"
              opacity="0.3"
            >
              {i * 10}yd
            </text>
          </g>
        );
      })}
    </g>
  );
}
