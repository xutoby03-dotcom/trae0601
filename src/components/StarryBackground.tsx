import { useMemo } from 'react';

export default function StarryBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-stars opacity-60" />
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: s.opacity,
            boxShadow: s.size > 1.5 ? `0 0 ${s.size * 2}px rgba(255,255,255,0.5)` : 'none',
          }}
        />
      ))}
      <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-nebula-purple/10 blur-[120px] animate-float" style={{ animationDuration: '12s' }} />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-nebula-pink/5 blur-[140px] animate-float" style={{ animationDuration: '15s', animationDelay: '-3s' }} />
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nebula-cyan/5 blur-[160px]" />
    </div>
  );
}
