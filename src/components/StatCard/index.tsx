import { ReactNode, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  trend?: number;
  unit?: string;
  index?: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function StatCard({ title, value, icon, color, trend, unit, index = 0 }: StatCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      style={{
        borderRadius: 16,
        padding: 24,
        background: `linear-gradient(135deg, ${color} 0%, ${hexToRgba(color, 0.8)} 100%)`,
        boxShadow: `0 4px 20px ${hexToRgba(color, 0.25)}`,
        position: 'relative',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          transform: 'translate(40%, -40%)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            color: '#fff',
          }}
        >
          {icon}
        </div>
        <div style={{ marginBottom: 4 }}>
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && (
              <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 4, opacity: 0.9 }}>
                {unit}
              </span>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500,
            }}
          >
            {title}
          </span>
          {typeof trend === 'number' && trend !== 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                padding: '4px 10px',
                borderRadius: 20,
                background: trend > 0 ? 'rgba(42, 157, 143, 0.25)' : 'rgba(230, 57, 70, 0.25)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {trend > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
