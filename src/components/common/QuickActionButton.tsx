import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  gradient?: string;
  onClick?: () => void;
}

export default function QuickActionButton({
  icon: Icon,
  label,
  sublabel,
  gradient = "from-brand-700 to-water-600",
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl p-5 md:p-6 text-left bg-white/60 border border-white/60 backdrop-blur shadow-soft-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:bg-white/80"
    >
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br opacity-10 blur-xl group-hover:opacity-20 transition bg-white" />
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="font-display font-bold text-lg text-brand-900">{label}</div>
      {sublabel && (
        <div className="text-xs md:text-sm text-brand-600 mt-1">{sublabel}</div>
      )}
      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:gap-2 transition-all">
        立即操作 →
      </div>
    </button>
  );
}
