import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  description?: string;
  action?: {
    label: string;
    to: string;
  };
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, action, children }: Props) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-800 mb-1">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          <Link to={action.to} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
