import { Guest } from '../types';

interface GuestCardProps {
  guest: Guest;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
  onToggleConfirm: (id: string) => void;
}

const GROUP_LABELS: Record<string, string> = {
  bride: '女方',
  groom: '男方',
  friend: '朋友',
  colleague: '同事',
  other: '其他',
};

const GROUP_COLORS: Record<string, string> = {
  bride: 'bg-pink-100 text-pink-700',
  groom: 'bg-blue-100 text-blue-700',
  friend: 'bg-purple-100 text-purple-700',
  colleague: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function GuestCard({ guest, onEdit, onDelete, onToggleConfirm }: GuestCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-wedding-pink/40 flex items-center justify-center text-lg">
            {guest.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-wedding-dark">{guest.name}</h3>
            <p className="text-xs text-gray-500">{guest.relation}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs ${GROUP_COLORS[guest.group]}`}>
          {GROUP_LABELS[guest.group]}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span>👤</span>
          <span>{guest.headCount} 人</span>
          <span className="text-gray-300">|</span>
          <span>📱 {guest.contact}</span>
        </div>

        {guest.dietaryRestrictions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {guest.dietaryRestrictions.map((r, i) => (
              <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs">
                {r}
              </span>
            ))}
          </div>
        )}

        {guest.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {guest.allergens.map((a, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">
                ⚠️ {a}过敏
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {guest.isChild && (
            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs">
              👶 儿童
            </span>
          )}
          {guest.isElderly && (
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
              👴 老人
            </span>
          )}
        </div>
      </div>

      {guest.notes && (
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          备注: {guest.notes}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onToggleConfirm(guest.id)}
          className={`text-xs px-2 py-1 rounded ${
            guest.confirmed
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {guest.confirmed ? '✓ 已确认' : '待确认'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(guest)}
            className="text-sm text-wedding-gold hover:text-wedding-gold/80"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(guest.id)}
            className="text-sm text-red-400 hover:text-red-500"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
