import type { Member } from '@/types';

interface MemberAvatarProps {
  member?: Member;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showRole?: boolean;
}

const roleColors: Record<string, string> = {
  '伴郎': 'bg-blue-100 text-blue-700',
  '伴娘': 'bg-pink-100 text-pink-700',
  '总协调': 'bg-purple-100 text-purple-700',
  '摄影师': 'bg-orange-100 text-orange-700',
  '化妆师': 'bg-fuchsia-100 text-fuchsia-700',
  '司机': 'bg-green-100 text-green-700',
  '其他': 'bg-gray-100 text-gray-700',
};

export default function MemberAvatar({
  member,
  size = 'md',
  showName = false,
  showRole = false,
}: MemberAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  if (!member) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center text-gray-500`}>
          ?
        </div>
        {showName && <span className="text-gray-400">未分配</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <img
          src={member.avatar}
          alt={member.name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
        {showRole && (
          <span className={`absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full ${roleColors[member.role]}`}>
            {member.role}
          </span>
        )}
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 text-sm">{member.name}</span>
          {showRole && (
            <span className="text-xs text-gray-500">{member.role}</span>
          )}
        </div>
      )}
    </div>
  );
}
