import { AlertTriangle, Baby, Clock, Ghost } from 'lucide-react';

export default function SafetyBanner() {
  const warnings = [
    { icon: Baby, text: '孕妇不适合参与恐怖主题', color: 'text-wine-400' },
    { icon: Ghost, text: '胆小者慎选高恐怖等级本', color: 'text-gold-400' },
    { icon: Clock, text: '迟到将无法进场，请准时到达', color: 'text-gold-300' },
  ];

  return (
    <div className="card-dark p-4 mb-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-gold-400" />
        <span className="font-display text-gold-400 text-lg">参与须知</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {warnings.map((w, idx) => {
          const Icon = w.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-midnight-800/50 border border-gold-600/10"
            >
              <Icon className={`w-4 h-4 ${w.color} flex-shrink-0`} />
              <span className={`text-sm font-serif ${w.color}`}>{w.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
