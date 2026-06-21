interface TouchScoreSliderProps {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  colorFrom?: string;
  colorTo?: string;
}

const colorMap: Record<string, { from: string; to: string }> = {
  softness: { from: '#F8F4ED', to: '#E8B4A0' },
  stiffness: { from: '#F8F4ED', to: '#8B5A3C' },
  roughness: { from: '#F8F4ED', to: '#A67C52' },
  coolness: { from: '#F8F4ED', to: '#3D5A45' },
};

export function TouchScoreSlider({
  label,
  value,
  onChange,
  readOnly = false,
  colorFrom,
  colorTo,
}: TouchScoreSliderProps) {
  const colors = colorMap[label.toLowerCase()] || { from: '#F8F4ED', to: '#8B5A3C' };
  const from = colorFrom || colors.from;
  const to = colorTo || colors.to;

  const percentage = Math.max(0, Math.min(100, value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!readOnly && onChange) {
      onChange(Number(e.target.value));
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-full h-28 rounded-lg overflow-hidden bg-gradient-to-t transition-all"
        style={{ background: `linear-gradient(to top, ${from} 0%, ${to} 100%)` }}
      >
        <div
          className="absolute left-0 right-0 bg-gradient-to-t from-black/10 to-transparent transition-all duration-300"
          style={{ bottom: 0, height: `${percentage}%` }}
        />
        
        <div
          className="absolute left-1/2 transform -translate-x-1/2 w-12 h-3 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          style={{ bottom: `calc(${percentage}% - 6px)` }}
        >
          <div className="w-8 h-1 bg-[#8B5A3C]/30 rounded-full" />
        </div>

        {readOnly ? (
          <div className="absolute inset-0" />
        ) : (
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ writingMode: 'vertical-lr' as never, direction: 'rtl' as never }}
          />
        )}
      </div>
      
      <div className="text-center">
        <span className="text-lg font-serif text-[#8B5A3C]">{percentage}</span>
        <p className="text-sm text-[#8B5A3C]/70">{label}</p>
      </div>
    </div>
  );
}
