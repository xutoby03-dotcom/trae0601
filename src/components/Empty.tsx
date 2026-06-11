import { FolderOpen } from "lucide-react";

interface EmptyProps {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function Empty({
  message = "暂无数据",
  description = "添加一些内容开始使用吧",
  icon,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon || <FolderOpen size={36} className="text-gray-400" />}
      </div>
      <p className="text-lg font-medium text-gray-700 mb-1">{message}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
