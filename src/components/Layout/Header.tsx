import { useEffect, useMemo } from 'react';
import { Bell, RefreshCw, User } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { generateAlerts } from '../../utils/alerts';
import { cn } from '../../lib/utils';

const Header = () => {
  const {
    members,
    litterBoxes,
    records,
    currentMemberId,
    setCurrentMemberId,
    alerts,
    setAlerts,
    resetData,
  } = useAppStore();

  const currentMember = members.find((m) => m.id === currentMemberId);

  const today = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, []);

  useEffect(() => {
    const newAlerts = generateAlerts(litterBoxes, records);
    setAlerts(newAlerts);
  }, [litterBoxes, records, setAlerts]);

  const dangerCount = alerts.filter((a) => a.severity === 'danger').length;

  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-[#F0E6D8] bg-white/70 backdrop-blur-sm">
      <div>
        <h2
          className="text-xl font-bold text-[#5C4A3A]"
          style={{ fontFamily: "'LXGW WenKai', system-ui, serif" }}
        >
          你好，{currentMember?.name || '朋友'}！
        </h2>
        <p className="text-xs text-[#8B7A6A] mt-0.5">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={resetData}
          className="p-2.5 rounded-xl text-[#8B7A6A] hover:bg-[#F5EBDC] hover:text-[#5C4A3A] transition-all"
          title="重置示例数据"
        >
          <RefreshCw size={18} />
        </button>

        <div className="relative">
          <div className="p-2.5 rounded-xl text-[#8B7A6A] hover:bg-[#F5EBDC] hover:text-[#5C4A3A] transition-all cursor-pointer">
            <Bell size={18} />
          </div>
          {dangerCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#D4896A] text-white text-xs font-bold flex items-center justify-center">
              {dangerCount}
            </span>
          )}
        </div>

        <div className="h-8 w-px bg-[#E8D8C4]" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B5A4A] font-medium mr-1">我是：</span>
          <div className="flex items-center gap-1">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setCurrentMemberId(m.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
                  currentMemberId === m.id
                    ? 'bg-[#F5EBDC] shadow-sm scale-105'
                    : 'hover:bg-[#FAF5EC]'
                )}
              >
                <span className="text-lg">{m.avatar}</span>
                <span
                  className={cn(
                    currentMemberId === m.id ? 'text-[#5C4A3A]' : 'text-[#8B7A6A]'
                  )}
                >
                  {m.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
