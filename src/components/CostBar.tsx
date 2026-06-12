interface CostBarProps {
  totalCost: number;
  perPersonCost: number;
  participantCount: number;
}

export default function CostBar({ totalCost, perPersonCost, participantCount }: CostBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#2D2A26]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-xs text-white/60">总花费</div>
          <div className="text-lg font-bold text-white">¥{totalCost}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/60">人均</div>
          <div className="text-lg font-bold text-[#E8652E]">¥{perPersonCost.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/60">参与</div>
          <div className="text-lg font-bold text-white">{participantCount}人</div>
        </div>
      </div>
    </div>
  );
}
