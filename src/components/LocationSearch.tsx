import { Search, MapPin } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';

export default function LocationSearch() {
  const { selectedLocation, locationNames, setLocation } = useFlightStore();

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md transition-all focus-within:border-[#00E5A0]/50 focus-within:shadow-[0_0_20px_rgba(0,229,160,0.12)]">
        <Search size={18} className="text-white/40" />
        <input
          type="text"
          value={selectedLocation}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="输入拍摄地点，如：杭州西湖"
          className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/25 outline-none font-mono"
        />
        <MapPin size={16} className="text-[#00E5A0]/60" />
      </div>

      {locationNames.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {locationNames.map((name) => (
            <button
              key={name}
              onClick={() => setLocation(name)}
              className={`rounded-md border px-3 py-1 text-xs font-mono transition-all ${
                selectedLocation === name
                  ? 'border-[#00E5A0]/40 bg-[#00E5A0]/10 text-[#00E5A0]'
                  : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/60'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
