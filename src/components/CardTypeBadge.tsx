import { CardType } from "@/types";

interface CardTypeBadgeProps {
  type: CardType;
}

export default function CardTypeBadge({ type }: CardTypeBadgeProps) {
  if (type === "visitor") {
    return (
      <span className="status-badge bg-amber-50 text-amber-700 border border-amber-200">
        访客卡
      </span>
    );
  }

  return (
    <span className="status-badge bg-brand-50 text-brand-700 border border-brand-200">
      员工临时卡
    </span>
  );
}
