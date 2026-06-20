import { useDryingStore } from "@/store/dryingStore";
import { useMemberStore } from "@/store/memberStore";
import { getMemberStats } from "@/utils/stats";
import { Shirt, PackageCheck } from "lucide-react";

export default function MemberStats() {
  const { records } = useDryingStore();
  const { members } = useMemberStore();
  const stats = getMemberStats(records, members);

  const maxDry = Math.max(...stats.map((s) => s.dryCount), 1);
  const maxCollect = Math.max(...stats.map((s) => s.collectCount), 1);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl text-sky-800">家庭成员分工</h2>
          <p className="text-xs text-sky-500 mt-1">晾晒与收衣贡献统计</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-sun-400/15 flex items-center justify-center">
          <Shirt className="w-5 h-5 text-sun-500" />
        </div>
      </div>

      <div className="space-y-5">
        {stats.map((s) => (
          <div key={s.memberId}>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${s.color}20` }}
              >
                {s.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sky-800">{s.memberName}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-sky-600">
                      <Shirt className="w-3.5 h-3.5" style={{ color: s.color }} />
                      晾晒{s.dryCount}
                    </span>
                    <span className="flex items-center gap-1 text-warn-green">
                      <PackageCheck className="w-3.5 h-3.5" />
                      收衣{s.collectCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-12 space-y-2">
              <StatBar
                label="晾晒贡献"
                value={s.dryCount}
                max={maxDry}
                color={s.color}
                icon={<Shirt className="w-3 h-3" />}
              />
              <StatBar
                label="收衣贡献"
                value={s.collectCount}
                max={maxCollect}
                color="#1DD1A1"
                icon={<PackageCheck className="w-3 h-3" />}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-sky-100/60 grid grid-cols-3 gap-3 text-center">
        <SummaryBox
          icon={<Shirt className="w-4 h-4" />}
          value={stats.reduce((a, b) => a + b.dryCount, 0)}
          label="总晾晒次数"
          color="#4A90D9"
        />
        <SummaryBox
          icon={<PackageCheck className="w-4 h-4" />}
          value={stats.reduce((a, b) => a + b.collectCount, 0)}
          label="总收衣次数"
          color="#1DD1A1"
        />
        <SummaryBox
          icon="👨‍👩‍👧‍👦"
          value={members.length}
          label="家庭成员"
          color="#FF9F43"
        />
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ReactNode;
}) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1 text-sky-500">
        <span className="flex items-center gap-1">
          <span style={{ color }}>{icon}</span>
          {label}
        </span>
        <span className="font-medium" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-sky-100/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

function SummaryBox({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode | string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ backgroundColor: `${color}10` }}
    >
      <div className="text-lg mb-1" style={{ color }}>
        {typeof icon === "string" ? icon : icon}
      </div>
      <div className="text-xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: `${color}aa` }}>
        {label}
      </div>
    </div>
  );
}
