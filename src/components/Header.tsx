import { MapPin, Eye, EyeOff } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { trip, showSensitive, toggleShowSensitive } = useTripStore();
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">证件互查</h1>
              <p className="text-xs text-slate-400">{trip.destination} · 出行准备</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleShowSensitive}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-sm"
            >
              {showSensitive ? (
                <>
                  <EyeOff size={16} />
                  <span>隐藏号码</span>
                </>
              ) : (
                <>
                  <Eye size={16} />
                  <span>显示号码</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/trip')}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              编辑行程
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
