interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 rounded-md border text-sm text-slate-800 bg-white transition-colors ${
          error
            ? "border-danger-300 focus:border-danger-500 focus:ring-2 focus:ring-danger-100"
            : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        } outline-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({ label, options, error, className = "", ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 rounded-md border text-sm text-slate-800 bg-white transition-colors ${
          error
            ? "border-danger-300 focus:border-danger-500"
            : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        } outline-none ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        rows={3}
        className={`w-full px-3 py-2 rounded-md border text-sm text-slate-800 bg-white transition-colors resize-none ${
          error
            ? "border-danger-300 focus:border-danger-500"
            : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        } outline-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
