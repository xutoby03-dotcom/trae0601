interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
}

const accentStyles = {
  primary: "from-primary-500 to-primary-700",
  success: "from-success-500 to-success-700",
  warning: "from-warning-500 to-warning-700",
  danger: "from-danger-500 to-danger-700",
};

export default function StatCard({ label, value, hint, accent = "primary", icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <div
            className={`w-11 h-11 rounded-lg bg-gradient-to-br ${accentStyles[accent]} text-white flex items-center justify-center shadow-md`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
