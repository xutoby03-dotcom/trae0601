import { useEffect, useRef, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useFridgeStore } from "@/store/useFridgeStore";
import { getDaysRemaining, getExpiryStatus } from "@/utils/expiry";

export default function ExpiryBanner() {
  const foodItems = useFridgeStore((s) => s.foodItems);
  const scrollRef = useRef<HTMLDivElement>(null);

  const expiringItems = useMemo(
    () =>
      foodItems.filter((f) => {
        if (f.consumed) return false;
        const status = getExpiryStatus(f.purchaseDate, f.shelfLifeDays);
        return status === "expired" || status === "expiring";
      }),
    [foodItems]
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5;

    const scroll = () => {
      scrollPos += speed;
      if (scrollPos >= container.scrollWidth - container.clientWidth) {
        scrollPos = 0;
      }
      container.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(scroll);
    };

    if (container.scrollWidth > container.clientWidth) {
      animationId = requestAnimationFrame(scroll);
    }

    return () => cancelAnimationFrame(animationId);
  }, [expiringItems]);

  if (expiringItems.length === 0) return null;

  return (
    <div
      className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3"
      style={{
        background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
      }}
    >
      <AlertTriangle className="w-5 h-5 text-white shrink-0" />
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {expiringItems.map((item) => {
          const days = getDaysRemaining(item.purchaseDate, item.shelfLifeDays);
          return (
            <span
              key={item.id}
              className="flex items-center gap-1.5 text-white text-sm font-medium whitespace-nowrap shrink-0"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
              <span className="bg-white/25 rounded-full px-2 py-0.5 text-xs">
                剩{days}天
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
