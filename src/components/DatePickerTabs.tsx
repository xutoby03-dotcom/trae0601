import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { genDateList } from "@/utils/format";

interface Props {
  value: string;
  onChange: (v: string) => void;
  days?: number;
}

export default function DatePickerTabs({ value, onChange, days = 7 }: Props) {
  const dates = genDateList(days);
  const currentIdx = dates.findIndex((d) => d.value === value);

  const scrollPrev = () => {
    if (currentIdx > 0) onChange(dates[currentIdx - 1].value);
  };
  const scrollNext = () => {
    if (currentIdx < dates.length - 1) onChange(dates[currentIdx + 1].value);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={scrollPrev}
        disabled={currentIdx <= 0}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-600 transition-all hover:bg-brand-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {dates.map((d) => {
          const isActive = d.value === value;
          return (
            <button
              key={d.value}
              onClick={() => onChange(d.value)}
              className={cn(
                "flex min-w-[72px] flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-center transition-all duration-200",
                isActive
                  ? "border-brand-500 bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-md shadow-brand-200"
                  : "border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-brand-50"
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-brand-50" : "text-brand-500"
                )}
              >
                {d.weekday}
              </span>
              <span className="text-sm font-semibold">{d.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={scrollNext}
        disabled={currentIdx >= dates.length - 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-600 transition-all hover:bg-brand-50 disabled:opacity-40"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
