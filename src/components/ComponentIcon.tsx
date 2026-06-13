import type { ComponentType } from "@/types";
import { Dices, BookOpen, LayoutGrid, Crown, CircleDot, Tag, Puzzle } from "lucide-react";

const iconMap: Record<ComponentType, React.ReactNode> = {
  卡牌: <LayoutGrid size={14} />,
  骰子: <Dices size={14} />,
  说明书: <BookOpen size={14} />,
  计分板: <Crown size={14} />,
  棋子: <CircleDot size={14} />,
  标记物: <Tag size={14} />,
  其他: <Puzzle size={14} />,
};

export function ComponentIcon({ type }: { type: ComponentType }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center text-[#D4A84B]/70">
      {iconMap[type]}
    </span>
  );
}
