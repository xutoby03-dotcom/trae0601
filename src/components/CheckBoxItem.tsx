import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CheckItem } from "@/types";
import { cn } from "@/utils/helpers";

interface CheckBoxItemProps {
  item: CheckItem;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function CheckBoxItem({
  item,
  checked,
  onChange,
  disabled,
}: CheckBoxItemProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[item.icon];

  return (
    <div
      className={cn(
        "relative p-5 rounded-2xl border-2 transition-all duration-300",
        checked
          ? "border-primary-400 bg-primary-50 shadow-lg shadow-primary-100"
          : "border-gray-200 bg-white hover:border-primary-200",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <label
        className={cn(
          "flex items-start gap-4 cursor-pointer",
          disabled && "cursor-not-allowed"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="checkbox-large mt-1 flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                checked ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              {IconComponent && <IconComponent className="w-5 h-5" />}
            </div>
            <span
              className={cn(
                "text-lg font-semibold transition-colors duration-300",
                checked ? "text-primary-700" : "text-gray-800"
              )}
            >
              {item.label}
            </span>
            {checked && (
              <span className="ml-auto text-primary-500 animate-bounce-in">
                <LucideIcons.CheckCircle2 className="w-6 h-6" />
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 leading-relaxed pl-13">
            {item.description}
          </p>
        </div>
      </label>
    </div>
  );
}
