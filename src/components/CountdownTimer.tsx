import { useState, useEffect } from "react";
import { getCountdown } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: string;
  onOvertime?: () => void;
}

export default function CountdownTimer({ endTime, onOvertime }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState(getCountdown(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const cd = getCountdown(endTime);
      setCountdown(cd);
      if (cd.isOvertime && onOvertime) {
        onOvertime();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onOvertime]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className={cn(
        "flex items-center gap-1 font-mono font-bold",
        countdown.isOvertime ? "text-red-600" : "text-gray-700"
      )}
    >
      {countdown.isOvertime && <span className="text-sm mr-1">已超时</span>}
      <span className="bg-gray-100 px-2 py-1 rounded">
        {pad(countdown.hours)}
      </span>
      <span className="text-lg">:</span>
      <span className="bg-gray-100 px-2 py-1 rounded">
        {pad(countdown.minutes)}
      </span>
      <span className="text-lg">:</span>
      <span className="bg-gray-100 px-2 py-1 rounded">
        {pad(countdown.seconds)}
      </span>
    </div>
  );
}
