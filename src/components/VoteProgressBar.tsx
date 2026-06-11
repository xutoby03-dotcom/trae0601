import { VoteResult } from '../types';

interface VoteProgressBarProps {
  result: VoteResult;
}

export default function VoteProgressBar({ result }: VoteProgressBarProps) {
  const { wantPercent, dontWantPercent, watchedPercent, total } = result;

  if (total === 0) {
    return (
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-0" />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${wantPercent}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500 ease-out"
          style={{ width: `${watchedPercent}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500 ease-out"
          style={{ width: `${dontWantPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-emerald-400">
          👍 {Math.round(wantPercent)}%
        </span>
        <span className="text-sky-400">
          👀 {Math.round(watchedPercent)}%
        </span>
        <span className="text-rose-400">
          👎 {Math.round(dontWantPercent)}%
        </span>
      </div>
    </div>
  );
}
